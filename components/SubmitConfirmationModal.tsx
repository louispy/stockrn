import {Button, Text} from '@rneui/base';
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {useStyles} from '../hooks/useStyles';
import ObjectRenderer from './ObjectRenderer';

interface SubmitConfirmationModalProps {
  data: Record<string, any>;
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const SubmitConfirmationModal: React.FC<SubmitConfirmationModalProps> = (
  props: SubmitConfirmationModalProps,
): React.JSX.Element => {
  const {
    primaryColor,
    secondaryColor,
    styles: commonStyles,
    colors,
  } = useStyles();
  const styles = StyleSheet.create({
    ...commonStyles,
    modal: {
      backgroundColor: secondaryColor,
      padding: 20,
      width: '80%',
      borderColor: primaryColor,
      borderRadius: 20,
      borderWidth: 2,
      flex: 0.5,
      justifyContent: 'space-between',
      flexDirection: 'column',
    },
    modalContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    title: {
      color: primaryColor,
      fontSize: 30,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
  });
  return (
    <Modal
      visible={props.visible}
      animationType="fade"
      transparent={true}
      onRequestClose={props.onClose}>
      <TouchableOpacity
        style={styles.modalContainer}
        activeOpacity={1}
        onPressOut={props.onClose}>
        <TouchableWithoutFeedback style={styles.modalContainer}>
          <View style={styles.modal}>
            <Text style={styles.title}>Confirmation</Text>
            <ObjectRenderer data={props.data} />
            <Button
              icon={{
                name: 'check',
                type: 'font-awesome',
                size: 20,
                color: secondaryColor,
              }}
              buttonStyle={styles.buttonInverted}
              titleStyle={styles.buttonTitleInverted}
              containerStyle={styles.buttonContainer}
              type="clear"
              title="Confirm"
              onPress={props.onSubmit}
            />
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

export default SubmitConfirmationModal;
