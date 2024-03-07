import 'react-native-get-random-values';

import {useNavigation} from '@react-navigation/native';
import {useRealm} from '@realm/react';
import {Button} from '@rneui/base';
import _ from 'lodash';
import React, {SetStateAction, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import Realm from 'realm';
import * as z from 'zod';

import SubmitConfirmationModal from '../components/SubmitConfirmationModal';
import {useStyles} from '../hooks/useStyles';
import {OrderItem} from '../types/order.type';
import {Product} from '../types/product.type';
import {OrderFormStackProps} from '../types/stack.type';
import {Picker} from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  addItem,
  deleteItem,
  getDuplicateIndices,
  setItem,
} from '../utils/utils';

const emptyOrderItem: OrderItem = {
  productCode: '',
  quantity: 0,
  price: 0,
};

const getEmptyOrderItem = (products: Product[]): OrderItem => ({
  productCode: products.length ? products[0].productCode : '',
  quantity: 1,
  price: 0,
});

const OrderFormScreen: React.FC<OrderFormStackProps> = (
  props: OrderFormStackProps,
): React.JSX.Element => {
  const navigation = useNavigation();
  const [stock, setStock] = React.useState(0);
  const [admin, setAdmin] = React.useState('');
  const [buyer, setBuyer] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [productCodeWarnings, setproductCodeWarnings] = React.useState(['']);
  const [priceWarnings, setPriceWarnings] = React.useState(['']);
  const [modalVisible, setModalVisible] = React.useState(false);
  const {primaryColor, styles} = useStyles();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [orderItems, setOrderItems] = React.useState<OrderItem[]>([]);

  const realm = useRealm();

  useEffect(() => {
    (async () => {
      const res = realm.objects<Product[]>('Product');
      if (res && res.length) {
        const p: Product[] = res as unknown as Product[];
        setProducts(p.map(item => ({...item})));
        setOrderItems([getEmptyOrderItem(p)]);
        setStock(p[0].stock);
      }
    })();
  }, []);

  const orderSchema = z.object({
    items: z.array(
      z.object({
        productCode: z.string().min(1, 'Product code may not be empty'),
        quantity: z.coerce.number().min(1, 'Minimum purchase qty is 1'),
        price: z.coerce.number().min(1, 'Minimum price is IDR 1'),
      }),
    ),
  });

  const handleNumberInput =
    (callback: (text: string) => void) => (text: string) => {
      if (/^-?(?!0\d)\d*$/.test(text)) {
        callback(text);
      }
    };

  const getFormData = () => {
    return {
      items: orderItems,
      notes,
      admin,
      buyer,
    };
  };

  const getFormattedFormData = () => {
    return {
      items: orderItems.map(item => ({
        productCode: item.productCode,
        'Price (IDR)': `${(item.price * 1).toLocaleString('id-ID')} (x${
          item.quantity
        })`,
        'Subtotal (IDR)': (item.price * item.quantity).toLocaleString('id-ID'),
      })),
      notes,
      admin,
      buyer,
      'Total (IDR)': orderItems
        .reduce((sum, current) => sum + current.price * current.quantity, 0)
        .toLocaleString('id-ID'),
    };
    // productCode,
    // quantity: stock,
    // 'Price (IDR)': _.parseInt(price).toLocaleString('id-ID'),
    // notes,
    // purchaser: admin,
    // 'Sub Total (IDR)': (_.parseInt(price) * stock).toLocaleString('id-ID'),
  };

  const validateForm = () => {
    const res = orderSchema.safeParse(getFormData());

    if (!res.success) {
      const {error} = res;
      console.log('error', error);
      error.issues.forEach(issue => {
        if (!issue.path || issue.path.length < 2) return;
        setItem(
          priceWarnings,
          setPriceWarnings,
          issue.path[1] as number,
          null,
          issue.message,
        );
      });
      return false;
    }

    const duplicates = getDuplicateIndices(orderItems, 'productCode');
    if (duplicates.length) {
      const warnings = [...productCodeWarnings];
      duplicates.forEach(i => {
        warnings[i] = 'Duplicate product code';
      });
      setproductCodeWarnings(warnings);
      return false;
    }

    return true;
  };

  const handleConfirm = async () => {
    const success = validateForm();
    if (!success) return;

    try {
      realm.write(() => {
        console.log('1111');
        if (!realm) return;
        console.log('222');
        const now = new Date();
        console.log(
          '333',
          JSON.stringify(
            {
              _id: new Realm.BSON.ObjectId(),
              items: orderItems.map(item => ({
                productCode: item.productCode,
                quantity: item.quantity,
                price: parseInt(item.price.toString()),
              })),
              admin,
              buyer,
              notes,
              createdAt: now,
              updatedAt: now,
            },
            null,
            2,
          ),
        );
        realm.create('Order', {
          _id: new Realm.BSON.ObjectId(),
          items: orderItems.map(item => ({
            productCode: item.productCode,
            quantity: item.quantity,
            price: parseInt(item.price.toString()),
          })),
          admin,
          buyer,
          notes,
          createdAt: now,
          updatedAt: now,
        });
        console.log('4444');
        orderItems.forEach(item => {
          console.log('555', JSON.stringify(item, null, 2));
          const products = realm
            .objects('Product')
            .filtered(
              'productCode = $0',
              item.productCode,
            ) as unknown as Product[];
          if (products && products.length) {
            const product = products[0];
            product.stock -= item.quantity;
            product.updatedAt = now;
          }
        });
        console.log('666');
      });
      Toast.show({text1: 'Succesfully created order'});
    } catch (err) {
      console.error(err);
      Toast.show({text1: 'ERROR: ' + err});
    } finally {
      // if (realm !== null && !realm.isClosed) {
      //   realm.close();
      // }
      navigation.goBack();
    }
  };

  const handleSubmit = () => {
    const success = validateForm();
    if (!success) return;
    setModalVisible(true);
  };

  const renderOrderItem = (item: OrderItem, i: number) => (
    <View
      key={i}
      style={{
        borderBottomWidth: 2,
        borderStyle: 'dashed',
        borderBottomColor: primaryColor,
        paddingVertical: 20,
      }}>
      <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
        <View>
          <Text style={styles.label}>Product Code</Text>
          <View style={styles.picker}>
            <Picker
              style={{color: primaryColor}}
              onValueChange={(val: string, idx: number) => {
                setItem(orderItems, setOrderItems, i, 'productCode', val);
                setItem(
                  orderItems,
                  setOrderItems,
                  i,
                  'quantity',
                  _.min([products[idx].stock, item.quantity]),
                );
                setStock(products[idx].stock);
              }}
              selectedValue={item.productCode}>
              {products.map((product, j) => (
                <Picker.Item
                  key={j}
                  label={`${product.productCode} (${product.stock})`}
                  value={product.productCode}
                />
              ))}
            </Picker>
          </View>
          {productCodeWarnings[i] && (
            <Text style={styles.warning}>{productCodeWarnings[i]}</Text>
          )}
        </View>
        <View>
          <Text style={styles.label}>Quantity</Text>
          <View style={styles.picker}>
            <Picker
              style={{color: primaryColor}}
              onValueChange={(val: number) =>
                setItem(orderItems, setOrderItems, i, 'quantity', val)
              }
              selectedValue={item.quantity}>
              {_.times(stock).map(j => (
                <Picker.Item key={j} label={`${j + 1}`} value={j + 1} />
              ))}
            </Picker>
          </View>
        </View>
      </View>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={{width: '100%'}}>
          <Text style={styles.label}>Price (IDR)</Text>
          <TextInput
            style={{...styles.picker, paddingLeft: 20, width: 'auto'}}
            onChangeText={handleNumberInput(text =>
              setItem(orderItems, setOrderItems, i, 'price', text),
            )}
            value={item.price.toString()}
            placeholder=""
            keyboardType="numeric"
            selectTextOnFocus
          />
          {priceWarnings[i] && (
            <Text style={styles.warning}>{priceWarnings[i]}</Text>
          )}
        </View>
      </View>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View>
          <Text style={styles.label}>{`Subtotal: Rp ${(
            item.quantity * item.price
          ).toLocaleString('id-ID')}`}</Text>
        </View>
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            style={{marginTop: 10}}
            onPress={() => {
              addItem(
                orderItems,
                setOrderItems,
                i,
                getEmptyOrderItem(products),
              );
              addItem(priceWarnings, setPriceWarnings, i, '');
              addItem(productCodeWarnings, setproductCodeWarnings, i, '');
            }}>
            <Icon name="add" size={30} color={primaryColor} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{marginTop: 10}}
            onPress={() => {
              deleteItem(orderItems, setOrderItems, i);
              deleteItem(priceWarnings, setPriceWarnings, i);
              deleteItem(productCodeWarnings, setproductCodeWarnings, i);
            }}>
            <Icon name="trash" size={30} color={primaryColor} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <SafeAreaView style={styles.root}>
        {/* <Text>
          {JSON.stringify(orderItems, null, 2)} {stock}
        </Text> */}
        <ScrollView>
          {orderItems.map(renderOrderItem)}
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={styles.inputMulti}
            onChangeText={setNotes}
            value={notes}
            placeholder=""
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.label}>Admin</Text>
          <TextInput
            style={styles.input}
            onChangeText={setAdmin}
            value={admin}
            placeholder=""
          />
          <Text style={styles.label}>Buyer</Text>
          <TextInput
            style={styles.input}
            onChangeText={setBuyer}
            value={buyer}
            placeholder=""
          />
        </ScrollView>
        <Button
          icon={{
            name: 'shopping-bag',
            type: 'font-awesome',
            size: 20,
            color: primaryColor,
          }}
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitle}
          containerStyle={styles.buttonContainer}
          type="clear"
          title="Order"
          onPress={handleSubmit}
        />
        <SubmitConfirmationModal
          data={getFormattedFormData()}
          onClose={() => setModalVisible(false)}
          onSubmit={handleConfirm}
          visible={modalVisible}
        />
      </SafeAreaView>
    </>
  );
};

export default OrderFormScreen;
