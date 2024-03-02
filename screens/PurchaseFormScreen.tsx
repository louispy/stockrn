import 'react-native-get-random-values';
import Realm from 'realm';

import {useNavigation} from '@react-navigation/native';
import {Button} from '@rneui/base';
import React, {useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import * as z from 'zod';

import ProductSchema from '../schemas/product.schema';
import PurchaseSchema, {PurchaseItemSchema} from '../schemas/purchase.schema';
import {Product} from '../types/product.type';
import {PurchaseFormStackProps} from '../types/stack.type';

const PurchaseFormScreen: React.FC<PurchaseFormStackProps> = (
  props: PurchaseFormStackProps,
): React.JSX.Element => {
  const isDarkMode = useColorScheme() === 'dark';
  const navigation = useNavigation();
  const [productCode, setProductCode] = React.useState('');
  const [quantity, setQuantity] = React.useState('0');
  const [price, setPrice] = React.useState('0');
  const [purchaser, setPurchaser] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [productCodeWarning, setProductCodeWarning] = React.useState('');
  const [quantityWarning, setQuantityWarning] = React.useState('');
  const [priceWarning, setPriceWarning] = React.useState('');
  const [productCodeDisabled, setProductCodeDisabled] = React.useState(false);
  const primaryColor = isDarkMode ? Colors.lighter : Colors.darker;
  const secondaryColor = isDarkMode ? Colors.darker : Colors.lighter;

  useEffect(() => {
    (async () => {
      if (props.route.params.productCode) {
        setProductCode(props.route.params.productCode);
        setProductCodeDisabled(true);
      }
    })();
  }, []);

  const styles = StyleSheet.create({
    root: {
      backgroundColor: secondaryColor,
      padding: 10,
      flex: 1,
    },
    label: {
      color: primaryColor,
      fontWeight: 'bold',
      fontSize: 15,
      marginLeft: 12,
      marginTop: 12,
    },
    warning: {
      color: '#f00',
      fontSize: 15,
      marginLeft: 12,
    },
    input: {
      height: 40,
      marginHorizontal: 12,
      marginTop: 12,
      borderWidth: 1,
      borderColor: primaryColor,
      padding: 10,
      color: primaryColor,
    },
    inputMulti: {
      height: 80,
      margin: 12,
      borderWidth: 1,
      borderColor: primaryColor,
      padding: 10,
    },
    button: {
      backgroundColor: secondaryColor,
      borderColor: primaryColor,
      borderWidth: 1,
      borderRadius: 10,
      padding: 15,
    },
    buttonTitle: {color: primaryColor},
    buttonContainer: {paddingVertical: 30},
  });

  const purchaseSchema = z.object({
    productCode: z.string().min(1, 'Product code may not be empty'),
    quantity: z.coerce.number().min(1, 'Minimum purchase qty is 1'),
    price: z.coerce.number().min(1, 'Minimum price is IDR 1'),
  });

  const handleNumberInput =
    (dispatch: React.Dispatch<any>) => (text: string) => {
      if (/^-?(?!0\d)\d*$/.test(text)) {
        dispatch(text);
      }
    };

  const handleSubmit = async () => {
    const res = purchaseSchema.safeParse({
      productCode,
      quantity,
      price,
      notes,
      purchaser,
    });

    if (!res.success) {
      const {error} = res;
      const err = error.flatten().fieldErrors;
      if (err.productCode) {
        setProductCodeWarning(err.productCode.join(';'));
      }
      if (err.quantity) {
        setQuantityWarning(err.quantity.join(';'));
      }
      if (err.price) {
        setPriceWarning(err.price.join(';'));
      }
      return;
    }

    let realm: Realm | null = null;

    try {
      realm = await Realm.open({
        schema: [ProductSchema, PurchaseItemSchema, PurchaseSchema],
      });
      realm.write(() => {
        if (!realm) return;
        const now = new Date();
        realm.create('Purchase', {
          _id: new Realm.BSON.ObjectId(),
          items: [
            {productCode, quantity: parseInt(quantity), price: parseInt(price)},
          ],
          purchaser,
          notes,
          createdAt: now,
          updatedAt: now,
        });
        const products = realm
          .objects('Product')
          .filtered('productCode = $0', productCode) as unknown as Product[];
        const qty = parseInt(quantity);
        if (products && products.length) {
          const product = products[0];
          product.stock += qty;
          product.updatedAt = now;
          Toast.show({text1: 'Success updating stock'});
        } else {
          realm.create('Product', {
            _id: new Realm.BSON.ObjectId(),
            productCode,
            stock: qty,
            createdAt: now,
            updatedAt: now,
          });
          Toast.show({text1: 'Success creating new product'});
        }
      });
    } catch (err) {
      console.error(err);
      Toast.show({text1: 'ERROR: ' + err});
    } finally {
      if (realm !== null && !realm.isClosed) {
        realm.close();
      }
      navigation.goBack();
    }
  };

  return (
    <>
      <SafeAreaView style={styles.root}>
        <ScrollView>
          <Text style={styles.label}>Product Code</Text>
          <TextInput
            style={styles.input}
            onChangeText={text => setProductCode(text.toUpperCase())}
            placeholder="<ABC123>"
            autoCapitalize="characters"
            value={productCode}
            editable={!productCodeDisabled}
          />
          {productCodeWarning && (
            <Text style={styles.warning}>{productCodeWarning}</Text>
          )}
          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            onChangeText={handleNumberInput(setQuantity)}
            value={quantity}
            placeholder=""
            keyboardType="numeric"
            selectTextOnFocus
          />
          {quantityWarning && (
            <Text style={styles.warning}>{quantityWarning}</Text>
          )}
          <Text style={styles.label}>Price (IDR)</Text>
          <TextInput
            style={styles.input}
            onChangeText={handleNumberInput(setPrice)}
            value={price}
            placeholder=""
            keyboardType="numeric"
            selectTextOnFocus
          />
          {priceWarning && <Text style={styles.warning}>{priceWarning}</Text>}
          <Text style={styles.label}>
            Sub Total: {parseInt(quantity) * parseInt(price)}
          </Text>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={styles.inputMulti}
            onChangeText={setNotes}
            value={notes}
            placeholder=""
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.label}>Purchaser</Text>
          <TextInput
            style={styles.input}
            onChangeText={setPurchaser}
            value={purchaser}
            placeholder=""
          />
        </ScrollView>
        <Button
          icon={{
            name: 'send',
            type: 'font-awesome',
            size: 20,
            color: primaryColor,
          }}
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitle}
          containerStyle={styles.buttonContainer}
          type="clear"
          title="Purchase"
          onPress={handleSubmit}
        />
      </SafeAreaView>
    </>
  );
};

export default PurchaseFormScreen;
