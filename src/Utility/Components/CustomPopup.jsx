import React from 'react';
import {
    Text,
    View,
    Modal,
    TouchableWithoutFeedback
} from 'react-native';
import CommonStyle from '../Public/css/CommonStyle';
import Colors from '../Colors';

const CustomPopup = ({
    firstContentBody = "",
    onRequestClose,
    visible,
    popupDimensions = "90%",
    secondContentBody = "",
    secondContentShow = false

}) => (
    <Modal
        visible={visible}
        transparent={true}
        onRequestClose={onRequestClose}
    >
        <TouchableWithoutFeedback onPress={onRequestClose}>
            <View style={CommonStyle.customPopupOverlay}>
                <View style={[CommonStyle.customPopupBody, style = { width: popupDimensions }]}>
                    <TouchableWithoutFeedback>
                        <View style={CommonStyle.customPopupContainer}>
                            <Text style={CommonStyle.customPopupContentText}>{firstContentBody}</Text>
                            {secondContentShow &&
                                <Text style={CommonStyle.customPopupSecondContentText}>{secondContentBody}</Text>
                            }
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </View>
        </TouchableWithoutFeedback>
    </Modal>
);

export default CustomPopup;