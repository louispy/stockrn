import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import _ from 'lodash';
import {useStyles} from '../hooks/useStyles';

type DataType = any;

const startCaseIgnoreParentheses = (str: string): string => {
  return str
    .replace(/\(([^)]+)\)/g, word => word)
    .replace(/\b\w+\b/g, word => _.startCase(word));
};

const renderObjectProperties = (
  obj: Record<string, DataType>,
): JSX.Element[] => {
  const {primaryColor, secondaryColor, styles: commonStyles} = useStyles();

  const styles = StyleSheet.create({
    ...commonStyles,
    value: {
      color: primaryColor,
      fontSize: 16,
    },
    label: {
      color: primaryColor,
      fontWeight: 'bold',
      fontSize: 15,
    },
  });

  return Object.entries(obj).map(([key, value]) => {
    if (Array.isArray(value)) {
      return (
        <View key={key}>
          <Text style={styles.label}>{_.startCase(key)}:</Text>
          {value.map((item, index) => (
            <View key={`${key}-${index}`}>
              {typeof item === 'object' ? (
                renderObjectProperties(item)
              ) : (
                <Text style={styles.value}>{item}</Text>
              )}
            </View>
          ))}
        </View>
      );
    } else if (typeof value === 'object') {
      return (
        <View key={key}>
          <Text style={styles.label}>{_.startCase(key)}:</Text>
          {renderObjectProperties(value)}
        </View>
      );
    } else {
      return (
        <View
          style={{
            // flexGrow: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            paddingVertical: 5,
            // backgroundColor: 'red',
            // borderWidth: 1,
            borderColor: primaryColor,
          }}
          key={key}>
          <Text style={styles.label}>{startCaseIgnoreParentheses(key)}: </Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      );
    }
  });
};

const ObjectRenderer: React.FC<{data: Record<string, DataType>}> = ({data}) => {
  return (
    <ScrollView style={{marginHorizontal: 0}}>
      {renderObjectProperties(data)}
    </ScrollView>
  );
};

export default ObjectRenderer;
