/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import 'react-native-get-random-values';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RealmProvider} from '@realm/react';
import React from 'react';
import {StyleSheet, Text, useColorScheme, View} from 'react-native';
import Toast from 'react-native-toast-message';
import {Colors} from 'react-native/Libraries/NewAppScreen';

import OrderSchema, {OrderItemSchema} from './schemas/order.schema';
import ProductSchema from './schemas/product.schema';
import PurchaseSchema, {PurchaseItemSchema} from './schemas/purchase.schema';
import HomeScreen from './screens/HomeScreen';
import OrderFormScreen from './screens/OrderFormScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import PurchaseFormScreen from './screens/PurchaseFormScreen';
import {RootStackParamList} from './types/stack.type';

import type {PropsWithChildren} from 'react';
type SectionProps = PropsWithChildren<{
  title: string;
}>;

const Stack = createNativeStackNavigator<RootStackParamList>();

function Section({children, title}: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): React.JSX.Element {
  return (
    <RealmProvider
      schema={[
        ProductSchema,
        PurchaseItemSchema,
        PurchaseSchema,
        OrderItemSchema,
        OrderSchema,
      ]}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{title: 'StockRN'}}
          />
          <Stack.Screen name="Purchase Form" component={PurchaseFormScreen} />
          <Stack.Screen name="Product Detail" component={ProductDetailScreen} />
          <Stack.Screen name="Order Form" component={OrderFormScreen} />
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
    </RealmProvider>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
