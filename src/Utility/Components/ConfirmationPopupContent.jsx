import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import CommonStyle from '../Public/css/CommonStyle'

const ConfirmationPopupContent = ({ title = "", content = "", confirmButtonTitle = "Confirm", cancelButtonTitle = "Cancel", confirm, cancel }) => {
    return (
        <View style={CommonStyle.confirmationPopupContainer}>
            <View style={CommonStyle.confirmationPopupTextContainer}>
                <Text style={CommonStyle.confirmationPopupTitle}>{title}</Text>
                <Text style={CommonStyle.confirmationPopupContent}>{content}</Text>
            </View>
            <View style={CommonStyle.confirmationPopupButtonContainer}>
                <TouchableOpacity style={CommonStyle.confirmationPopupConfirmButton} onPress={confirm}>
                    <Text style={CommonStyle.confirmationPopupConfirmButtonText}>{confirmButtonTitle}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={CommonStyle.confirmationPopupCancelButton} onPress={cancel}>
                    <Text style={CommonStyle.confirmationPopupCancelButtonText}>{cancelButtonTitle}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ConfirmationPopupContent;
