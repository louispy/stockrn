import {Button, SearchBar} from '@rneui/themed';
import _ from 'lodash';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableHighlight,
  useColorScheme,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import Realm from 'realm';

import ProductSchema from '../schemas/product.schema';
import {Product} from '../types/product.type';
import {HomeStackProps} from '../types/stack.type';

const HomeScreen: React.FC<HomeStackProps> = ({
  navigation,
}: HomeStackProps): React.JSX.Element => {
  const isDarkMode = useColorScheme() === 'dark';
  const primaryColor = isDarkMode ? Colors.lighter : Colors.darker;
  const secondaryColor = isDarkMode ? Colors.darker : Colors.lighter;
  const styles = StyleSheet.create({
    root: {backgroundColor: secondaryColor, flex: 1},
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
      padding: 15,
      backgroundColor: secondaryColor,
      color: primaryColor,
      borderWidth: 0.2,
      borderColor: primaryColor,
    },
    query: {
      color: primaryColor,
      fontSize: 20,
    },
    productCode: {
      color: primaryColor,
      fontWeight: 'bold',
      fontSize: 24,
    },
    stock: {
      color: primaryColor,
      fontWeight: 'normal',
      fontSize: 16,
    },
  });

  const [query, setQuery] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);

  const handleSearch = (q: string) => {
    if (q.length < 3) return;
    (async () => {
      let realm = null;
      try {
        realm = await Realm.open({
          schema: [ProductSchema],
        });
        const res = realm
          .objects<Product>('Product')
          .filtered('productCode BEGINSWITH[c] $0', q)// as unknown as Product[];

        if (res && res.length) {
          const p: Product[] = [];
          res.forEach(item => p.push({
            _id: item._id.toString(),
            productCode: item.productCode,
            updatedAt: item.updatedAt,
            stock: item.stock,
          }));
          setProducts(p);
        }
        console.log('res', res);
      } catch (e) {
        console.error(e);
      } finally {
        if (realm !== null && !realm.isClosed) {
          realm.close();
        }
      }
    })();
  };
  const handleSearchChange = (text: string) => {
    setQuery(text);
    // debouncedSearch(text);
  };

  const DEBOUNCE_TIMEOUT = 500;
  const debouncedSearch = useCallback(
    _.debounce(handleSearch, DEBOUNCE_TIMEOUT),
    [],
  );

  useEffect(() => {
    if (query.length >= 3) {
      debouncedSearch(query);
    } else {
      setProducts([]);
    }
  }, [query]);

  const renderListItem = ({item}: {item: Product}) => (
    <TouchableHighlight
      onPress={() => {
        console.log('navigate', item.productCode, typeof item._id);
        navigation.navigate('Product Detail', {_id: item._id});
      }}>
      <View style={styles.row}>
        <View>
          <Text style={styles.productCode}>{item.productCode}</Text>
          <Text style={styles.stock}>Stock: {item.stock}</Text>
        </View>
        <View>
          <Icon name="arrow-forward" size={30} color={primaryColor} />
          <Text></Text>
        </View>
      </View>
    </TouchableHighlight>
  );
  return (
    <>
      <SafeAreaView
        // contentInsetAdjustmentBehavior="automatic"
        style={styles.root}>
        <SearchBar
          placeholder="Search Product Code..."
          onChangeText={handleSearchChange}
          value={query}
          lightTheme={!isDarkMode}
          inputStyle={styles.query}
          round
          containerStyle={{width: '100%'}}
        />
        <FlatList
          data={products}
          renderItem={renderListItem}
          keyExtractor={(item: Product) => item._id}
          nestedScrollEnabled
        />
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
            navigation.navigate('Purchase Form', {productCode: ''})
          }
        />
      </SafeAreaView>
    </>
  );
};

export default HomeScreen;
