import { Dimensions } from "react-native";
import { StyleSheet } from "react-native";
import Colors from "../../../../Utility/Colors";
  // Roboto-Black
  // Roboto-Light
  // Roboto-Medium
  // Roboto-Regular
  // Roboto-Thin
  // Roboto-Bold
const lightTheme = {
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.grayF5,
        color: Colors.white,
    },
    listBoxContainer: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    collapsibleContainer: {
        //marginTop: 10,
    },
    accordionItem: {
        marginBottom: 8,
        backgroundColor: Colors.white,
        borderRadius: 8,
        borderColor: Colors.grayE7,
        borderWidth: 1,

    },
    collapsibleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderColor: Colors.secondary,
        borderWidth: 2,
        borderRadius: 6,
        marginBottom: 8
    },
    removeRadius: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        marginBottom: 0,
        backgroundColor: Colors.white
    },
    removeBodyRadius: {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderTopWidth: 0
    },
    collapsibleBodyContainer: {
        paddingHorizontal: 10,
        borderColor: Colors.secondary,
        borderWidth: 2,
        borderRadius: 6,
        marginBottom: 8,
        backgroundColor: Colors.white
    },
    groupInputLabel: {
        fontSize: 13,
        fontFamily: 'Roboto-Medium',
        color: Colors.secondary
    },
    inputRequire: {
        color: Colors.red
    },
    collapsibleTitle: {
        fontSize: 14,
        fontFamily: 'Roboto-Medium',
        color: Colors.secondary
    },
    collapsibleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
        backgroundColor: Colors.white,
        borderBottomColor: Colors.secondary,
        borderBottomWidth: 2,
        borderRadius: 0,
        paddingRight: 10,
        paddingLeft: 0,
        position: 'relative'
    },
    collapsibleInput: {
        flex: 1,
        height: 45,
        fontSize: 13,
        color: Colors.secondary,
        paddingLeft: 5,
        fontFamily: 'Roboto-Regular',
        paddingVertical: 0
    },
    natClearValue: {
        position: 'absolute',
        right: 40,
        top: 30,
    },
    diffClearValue: {
        top: 40,
    },
    guestDropDownContainer: {
        marginBottom: 20,
        backgroundColor: Colors.white,
        borderBottomColor: Colors.secondary,
        borderBottomWidth: 2,
        marginBottom: 20,
        position: 'relative'
    },
    chooseFileContainer: {
        paddingTop: 30,
        flexDirection: "row",
        justifyContent: 'center'
    },
    chooseFileBtn: {
        borderColor: Colors.secondary,
        borderWidth: 1,
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingTop: 10,
        paddingBottom: 4,
        backgroundColor: Colors.secondary,
        borderRadius: 6,
        minWidth: 80
    },
    chooseFileText: {
        fontSize: 14,
        color: Colors.white,
        fontFamily: 'Roboto-Regular',
        paddingTop: 2
    },
    uploadImagesContainer: {
        marginTop: 15,
        flexDirection: 'row',
        marginBottom: 10
    },
    uploadImageBox: {
        marginRight: 10,
        position: 'relative'
    },
    uploadImages: {
        width: 52,
        height: 52,
        borderRadius: 6,
        borderColor: Colors.gray,
        borderWidth: 1,
    },
    removeUploadImage: {
        position: 'absolute',
        right: -3,
        top: -5
    },
    uploadSubmitBtn: {
        backgroundColor: Colors.secondary,
        width: '100%',
        alignItems: 'center',
        padding: 15,
        borderRadius: 6
    },
    guestDetailsBtnContainer: {
        alignItems: 'center',
        paddingVertical: 10
    },
    uploadSubmitText: {
        fontSize: 17,
        color: Colors.white
    },
    uploadBtnContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: Colors.secondary,
        borderWidth: 1,
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingTop: 12,
        backgroundColor: Colors.white,
        borderRadius: 6,
        paddingBottom: 8
    },
    uploadBtnText: {
        fontSize: 14,
        color: Colors.secondary,
        fontFamily: 'Roboto-Medium',
        paddingTop: 3,
        paddingLeft: 6
    },
    uploadPopupOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    uploadPopupContentContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        height: '32%',
        paddingTop: 15
    },
    actionContainer: {
        alignItems: 'center',
        paddingBottom: 5
    },
    actionText: {
        paddingTop: 10,
        fontFamily: 'Roboto-Medium',
        fontSize: 22,
        color: Colors.primary
    },
    inputGroupBox: {
        position: 'relative'
    },
    errorMsgBox: {
        position: 'absolute',
        fontSize: 13,
        fontFamily: 'Roboto-Regular',
        left: 0,
        zIndex: 9,
        bottom: -5,
        color: Colors.red
    },
    uploadMsg: {
        bottom: -19
    },
    disabledInput: {
        backgroundColor: Colors.gray
    },
    //Image Popup box================
    imageModalOverlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center'
    },
    imageModalBody: {
        backgroundColor: 'white',
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        padding: 12,
        width: '90%',
        borderRadius: 6,
        height: 300,
        position: 'relative'
    },
    imageModalCloseBtnContainer: {
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    imageModalCloseBtn: {
        backgroundColor: Colors.secondary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginTop: 10,
        width: 35,
        height: 35,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: -17,
        bottom: 0
    },
    imageModalImage: {
        height: '100%',
        width: '100%',
        borderRadius: 0,
        borderColor: Colors.grayB1,
        borderWidth: 1
    }

};

const darkTheme = {
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.primary,
        color: Colors.white,
    },
    listBoxContainer: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    collapsibleContainer: {
        //marginTop: 10,
    },
    accordionItem: {
        marginBottom: 8,
        backgroundColor: Colors.white,
        borderRadius: 8,
        borderColor: Colors.grayE7,
        borderWidth: 1,

    },
    collapsibleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderColor: Colors.secondary,
        borderWidth: 2,
        borderRadius: 6,
        marginBottom: 8
    },
    removeRadius: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        marginBottom: 0,
        backgroundColor: Colors.white
    },
    removeBodyRadius: {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderTopWidth: 0
    },
    collapsibleBodyContainer: {
        paddingHorizontal: 10,
        borderColor: Colors.secondary,
        borderWidth: 2,
        borderRadius: 6,
        marginBottom: 8,
        backgroundColor: Colors.white
    },
    groupInputLabel: {
        fontSize: 13,
        fontFamily: 'Roboto-Medium',
        color: Colors.secondary
    },
    inputRequire: {
        color: Colors.red
    },
    collapsibleTitle: {
        fontSize: 14,
        fontFamily: 'Roboto-Medium',
        color: Colors.secondary
    },
    collapsibleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
        backgroundColor: Colors.white,
        borderBottomColor: Colors.secondary,
        borderBottomWidth: 2,
        borderRadius: 0,
        paddingRight: 10,
        paddingLeft: 0,
        position: 'relative'
    },
    collapsibleInput: {
        flex: 1,
        height: 45,
        fontSize: 13,
        color: Colors.secondary,
        paddingLeft: 5,
        fontFamily: 'Roboto-Regular',
        paddingVertical: 0
    },
    natClearValue: {
        position: 'absolute',
        right: 40,
        top: 30
    },
    diffClearValue: {
        top: 35,
    },
    guestDropDownContainer: {
        marginBottom: 20,
        backgroundColor: Colors.white,
        borderBottomColor: Colors.secondary,
        borderBottomWidth: 2,
        marginBottom: 20,
        position: 'relative'
    },
    chooseFileContainer: {
        paddingTop: 30,
        flexDirection: "row",
        justifyContent: 'center'
    },
    chooseFileBtn: {
        borderColor: Colors.secondary,
        borderWidth: 1,
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingTop: 10,
        paddingBottom: 4,
        backgroundColor: Colors.secondary,
        borderRadius: 6,
        minWidth: 80
    },
    chooseFileText: {
        fontSize: 14,
        color: Colors.white,
        fontFamily: 'Roboto-Regular',
        paddingTop: 2
    },
    uploadImagesContainer: {
        marginTop: 15,
        flexDirection: 'row',
        marginBottom: 10
    },
    uploadImageBox: {
        marginRight: 10,
        position: 'relative'
    },
    uploadImages: {
        width: 52,
        height: 52,
        borderRadius: 6,
        borderColor: Colors.gray,
        borderWidth: 1,
    },
    removeUploadImage: {
        position: 'absolute',
        right: -3,
        top: -5
    },
    uploadSubmitBtn: {
        backgroundColor: Colors.secondary,
        width: '100%',
        alignItems: 'center',
        padding: 15,
        borderRadius: 6
    },
    guestDetailsBtnContainer: {
        alignItems: 'center',
        paddingVertical: 10
    },
    uploadSubmitText: {
        fontSize: 17,
        color: Colors.white
    },
    uploadBtnContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: Colors.secondary,
        borderWidth: 1,
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingTop: 12,
        backgroundColor: Colors.white,
        borderRadius: 6,
        paddingBottom: 8
    },
    uploadBtnText: {
        fontSize: 14,
        color: Colors.secondary,
        fontFamily: 'Roboto-Medium',
        paddingTop: 3,
        paddingLeft: 6
    },
    uploadPopupOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    uploadPopupContentContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        height: '32%',
        paddingTop: 15
    },
    actionContainer: {
        alignItems: 'center',
        paddingBottom: 5
    },
    actionText: {
        paddingTop: 10,
        fontFamily: 'Roboto-Medium',
        fontSize: 22,
        color: Colors.primary
    },
    inputGroupBox: {
        position: 'relative'
    },
    errorMsgBox: {
        position: 'absolute',
        fontSize: 13,
        fontFamily: 'Roboto-Regular',
        left: 0,
        zIndex: 9,
        bottom: -5,
        color: Colors.red
    },
    uploadMsg: {
        bottom: -19
    },
    disabledInput: {
        backgroundColor: Colors.gray
    },
    //Image Popup box================
    imageModalOverlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center'
    },
    imageModalBody: {
        backgroundColor: 'white',
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        padding: 12,
        width: '90%',
        borderRadius: 6,
        height: 300,
        position: 'relative'
    },
    imageModalCloseBtnContainer: {
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    imageModalCloseBtn: {
        backgroundColor: Colors.secondary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginTop: 10,
        width: 35,
        height: 35,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: -17,
        bottom: 0
    },
    imageModalImage: {
        height: '100%',
        width: '100%',
        borderRadius: 0,
        borderColor: Colors.grayB1,
        borderWidth: 1
    }
};

const GuestDetailsStyle = (isDarkMode) => {
    return StyleSheet.create(isDarkMode ? darkTheme : lightTheme);
};

export default GuestDetailsStyle