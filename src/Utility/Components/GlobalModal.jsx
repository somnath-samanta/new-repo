import React from 'react';
import { Modal, Text, View, TouchableOpacity, Dimensions } from "react-native";
import AntDesign from 'react-native-vector-icons/AntDesign';
import CommonStyle from '../Public/css/CommonStyle';
import Colors from '../Colors';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
const GlobalModal = ({
    body = "",
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
    modalContentWidth = '90%'
}) => {
    console.log("modal visibility", visible)
    return (
        <View>
            {visible && (
            <Modal
                key={visible ? "visible" : "hidden"}
                animationType="slide"
                transparent={true}
                visible={visible}
                onRequestClose={onCancel}
            >
                <View style={CommonStyle.modalDialog}>
                    <View style={[CommonStyle.modalContent, { width: modalContentWidth }]}>
                        {header ? (
                            <View style={CommonStyle.modalHeader}>
                                {showHeaderTitle && (
                                    typeof headerTitle === 'string' ? (
                                        <Text style={CommonStyle.modalHeading}>{headerTitle}</Text>
                                    ) : (
                                        <View style={CommonStyle.modalHeading}>{headerTitle}</View>
                                    )
                                )}
                                {showHeaderCrossBtn && (
                                    <TouchableOpacity activeOpacity={1} style={CommonStyle.modalCancelCrossBtn} onPress={onCancel}>
                                        <AntDesign name="close" size={16} color={Colors.white} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ) : null}

                        <View style={CommonStyle.modalBodyContent}>
                            {body}
                        </View>

                        {footer ? (
                            <View style={CommonStyle.modalFooter}>
                                {cancelBtnShow && (
                                    <TouchableOpacity activeOpacity={1} style={CommonStyle.modalCancelBox} onPress={onCancel}>
                                        <Text style={CommonStyle.modalCancelBtn}>{cancelBtnLabel}</Text>
                                    </TouchableOpacity>
                                )}
                                {saveBtnShow && (
                                    <TouchableOpacity activeOpacity={1} style={CommonStyle.modalSaveBox} onPress={onSave}>
                                        <Text style={CommonStyle.modalOkBtn}>{saveBtnLabel}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ) : null}
                    </View>
                </View>
            </Modal>)}
        </View>
    );
};

export default GlobalModal;
