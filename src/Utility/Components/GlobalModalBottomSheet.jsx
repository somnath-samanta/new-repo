import React from 'react';
import {
    SafeAreaView,
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    TouchableHighlight,
    ScrollView,
    Dimensions,
    Image,
    Modal,
    TouchableWithoutFeedback
} from 'react-native';
import { ModalView } from 'react-native-multiple-modals';
import CommonStyle from '../Public/css/CommonStyle';

const GlobalModalBottomSheet = ({
    contentBody = "",
    onRequestClose,
    visible,
    footer = true,
    cancelBtnShow = true,
    saveBtnShow = true,
    saveBtnLabel = "Save",
    cancelBtnLabel = "Cancel",
    onCancel,
    header = true,
    headerTitle = "",
    showHeaderTitle = true,
    showHeaderCrossBtn = true,
    onSave,
    modalHeight = "50%",
    outsideClickClose = true,
    headerFontSize = 20,
    headerFontLineHeight = 25,
    showIcon = false,
    headerTextAlign = "left",
    modalOverlayColor = "rgba(0, 0, 0, 0.5)"
}) => {
    return (
        <View>
            {visible && (
    <ModalView
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onRequestClose}
    >
        <TouchableWithoutFeedback onPress={outsideClickClose ? onRequestClose : null}>
            <View style={[CommonStyle.modalOverlay, style = { backgroundColor: modalOverlayColor }]}>
                <TouchableWithoutFeedback>
                    <View style={[CommonStyle.modalContentContainer, style = { height: modalHeight }]}>
                        {showIcon &&
                            <View style={CommonStyle.iconImageContainer}>
                                <Image source={require('../Public/images/shield.png')} style={CommonStyle.iconDimension} />
                            </View>
                        }
                        {header &&
                            <View style={CommonStyle.bottomSheetHeaderContainer}>
                                <Text allowFontScaling={false} style={[CommonStyle.bottomSheetHeaderText, style = { fontSize: headerFontSize, lineHeight: headerFontLineHeight, textAlign: headerTextAlign }]}>{headerTitle}</Text>
                            </View>
                        }
                        {contentBody}
                    </View>
                </TouchableWithoutFeedback>
            </View>
        </TouchableWithoutFeedback>
    </ModalView >
            )}
        </View>
    );
};
export default GlobalModalBottomSheet;