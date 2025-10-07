import React from 'react';
import { View, Modal, StyleSheet, Image } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import CommonStyle from '../Public/css/CommonStyle';
import Colors from '../Colors';

const Loader = ({ loading }) => {
  return (
    <Modal
      transparent={true}
      animationType="none"
      visible={loading}
    >
      <View style={CommonStyle.loadingOverlay}>
        <Spinner
          visible={loading}
          animation="fade"
          color={Colors.white}
        />
      </View>
    </Modal>
  );
}


export default Loader;
