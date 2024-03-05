import {StyleSheet} from 'react-native';
import {useColorScheme} from 'react-native';

const Colors = {
  primary: '#1292B4',
  white: '#FFF',
  // lighter: '#FFF',
  lighter: '#F3F3F3',
  light: '#DAE1E7',
  dark: '#444',
  darker: '#222',
  black: '#000',
};

export const useStyles = () => {
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
    labelInverted: {
      color: secondaryColor,
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
    buttonInverted: {
      backgroundColor: primaryColor,
      borderColor: secondaryColor,
      borderWidth: 1,
      borderRadius: 10,
      padding: 15,
    },
    buttonTitleInverted: {color: secondaryColor},
    buttonContainer: {paddingVertical: 10},
  });

  return {isDarkMode, primaryColor, secondaryColor, styles, colors: Colors};
};
