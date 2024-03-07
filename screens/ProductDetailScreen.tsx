import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {Button} from '@rneui/base';
import moment from 'moment-timezone';
import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text, useColorScheme, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import Realm from 'realm';

import ProductSchema from '../schemas/product.schema';
import PurchaseSchema, {PurchaseItemSchema} from '../schemas/purchase.schema';
import {Product} from '../types/product.type';
import {Purchase} from '../types/purchase.type';
import {ProductDetailStackProps} from '../types/stack.type';
import {useRealm} from '@realm/react';
import {Order} from '../types/order.type';

const ProductDetailScreen: React.FC<ProductDetailStackProps> = (
  props: ProductDetailStackProps,
): React.JSX.Element => {
  const isDarkMode = useColorScheme() === 'dark';
  const primaryColor = isDarkMode ? Colors.lighter : Colors.darker;
  const secondaryColor = isDarkMode ? Colors.darker : Colors.lighter;
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
    title: {
      color: primaryColor,
      fontWeight: 'bold',
      fontSize: 40,
      marginLeft: 12,
      marginTop: 12,
    },
    subtitle: {
      color: primaryColor,
      fontWeight: 'bold',
      fontSize: 24,
      marginLeft: 12,
      marginTop: 12,
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
    row: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      width: '100%',
      padding: 2,
      backgroundColor: secondaryColor,
      color: primaryColor,
      borderWidth: 0.2,
      borderColor: primaryColor,
    },
    purchases: {
      marginTop: 20,
    },
  });
  const [product, setProduct] = useState<Product>({
    _id: '',
    productCode: '',
    stock: 0,
    updatedAt: new Date(),
  });

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const isFocused = useIsFocused();
  const realm = useRealm();

  const fetchData = async () => {
    const id = new Realm.BSON.ObjectID(props.route.params._id);
    try {
      const productRes = realm.objectForPrimaryKey<Product>(
        'Product',
        id as unknown as string,
      );
      if (!productRes) {
        Toast.show({text1: 'Product not found: ' + id});
        return;
      }
      setProduct({
        _id: productRes._id.toString(),
        updatedAt: productRes.updatedAt,
        stock: productRes.stock,
        productCode: productRes.productCode,
      });
      const purchasesRes = realm
        .objects<Purchase>('Purchase')
        .filtered('ANY items.productCode = $0', productRes?.productCode)
        .sorted('createdAt', true);
      if (purchasesRes && purchasesRes.length) {
        const p: Purchase[] = [];
        purchasesRes.forEach(purchase =>
          p.push({...purchase.toJSON()} as unknown as Purchase),
        );
        setPurchases(p);
      }
      const ordersRes = realm
        .objects<Purchase>('Order')
        .filtered('ANY items.productCode = $0', productRes?.productCode)
        .sorted('createdAt', true);
      if (ordersRes && ordersRes.length) {
        const o: Order[] = [];
        ordersRes.forEach(order =>
          o.push({...order.toJSON()} as unknown as Order),
        );
        setOrders(o);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [props, isFocused]);

  const renderPurchaseListItem = ({item}: {item: Purchase}) => (
    <View style={styles.row}>
      <View>
        <Text style={styles.label}>
          {moment.utc(item.createdAt).local().format('YYYY-MM-DD HH:mm')}
        </Text>
        <Text style={styles.label}>
          {item.items
            .map(
              item =>
                `${item.productCode}: IDR ${item.price.toLocaleString(
                  'id-ID',
                )} (x${item.quantity})`,
            )
            .join('\n')}
        </Text>
      </View>
      <View>
        <Text>{item.purchaser}</Text>
        <Text>{item.notes}</Text>
      </View>
    </View>
  );
  const renderOrderListItem = ({item}: {item: Order}) => (
    <View style={styles.row}>
      <View>
        <Text style={styles.label}>
          {moment.utc(item.createdAt).local().format('YYYY-MM-DD HH:mm')}
        </Text>
        <Text style={styles.label}>
          {item.items
            .map(
              item =>
                `${item.productCode}: IDR ${item.price.toLocaleString(
                  'id-ID',
                )} (x${item.quantity})`,
            )
            .join('\n')}
        </Text>
      </View>
      <View>
        <Text>{item.admin}</Text>
        <Text>{item.buyer}</Text>
        <Text>{item.notes}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>{product.productCode}</Text>
      <Text style={styles.label}>Stock: {product.stock}</Text>
      <View style={{flex: 0.5}}>
        <Text style={styles.subtitle}>Purchase History</Text>
        <FlatList
          data={purchases}
          renderItem={renderPurchaseListItem}
          keyExtractor={(item: Purchase) => item._id}
          style={styles.purchases}
        />
      </View>
      <View style={{flex: 0.5}}>
        <Text style={styles.subtitle}>Order History</Text>
        {orders && orders.length ? (
          <FlatList
            data={orders}
            renderItem={renderOrderListItem}
            keyExtractor={(item: Order) => item._id}
            style={styles.purchases}
          />
        ) : (
          <Text style={styles.label}>No Data</Text>
        )}
      </View>
      <Button
        icon={{
          name: 'plus-square',
          type: 'font-awesome',
          size: 20,
          color: primaryColor,
        }}
        buttonStyle={styles.button}
        titleStyle={styles.buttonTitle}
        containerStyle={styles.buttonContainer}
        type="clear"
        title="Create Purchase"
        onPress={() =>
          props.navigation.navigate('Purchase Form', {
            productCode: product.productCode,
          })
        }
      />
    </SafeAreaView>
  );
};

export default ProductDetailScreen;
