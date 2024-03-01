import {NativeStackScreenProps} from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  'Purchase Form': {productCode: string};
  Feed: {sort: 'latest' | 'top'} | undefined;
};

export type HomeStackProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type PurchaseFormStackProps = NativeStackScreenProps<RootStackParamList, 'Purchase Form'>;
