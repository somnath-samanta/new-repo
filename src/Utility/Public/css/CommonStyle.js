import { Dimensions } from "react-native";
import { StyleSheet } from "react-native";
import Colors from "../../Colors";
import {Platform } from 'react-native';
// Montserrat-Black
// Montserrat-Light
// Montserrat-Medium
// Montserrat-Regular
// Montserrat-Thin
// Montserrat-Bold
const CommonStyle = StyleSheet.create({
    //Global Modal Content
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    },
    modalDialog: {
        flex: 1,
        zIndex: 1000,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(52, 52, 52, 0.6)',
        flexDirection: 'column',
    },
    modalContent: {
        backgroundColor: Colors.white,
        borderRadius: 4,
        flexDirection: 'column',
        padding: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalHeader: {
        width: '100%',
        textAlign: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 0,
        height: 50,
        position: 'relative',
        zIndex: 9,
        // backgroundColor:'red'
    },
    modalBodyContent: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 0,
    },
    modalFooter: {
        height: 60,
        paddingLeft: 20,
        paddingRight: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        backgroundColor: Colors.white,
        paddingBottom: 20,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        marginTop: 15,
    },
    modalCancelBox: {
        width: '50%',
        paddingRight: 5,
    },
    modalCancelBtn: {
        borderWidth: 1,
        borderColor: Colors.secondary,
        color: Colors.secondary,
        fontSize: 14,
        fontFamily: 'Montserrat-Bold',
        borderRadius: 0,
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        lineHeight: 40,
    },
    modalSaveBox: {
        width: '50%',
        paddingLeft: 5,
    },
    modalOkBtn: {
        fontSize: 14,
        fontFamily: 'Montserrat-Bold',
        borderRadius: 0,
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#24ad91',
        color: Colors.white,
        flex: 1,
        lineHeight: 40,
    },
    modalCancelCrossBtn: {
        width: 25,
        height: 25,
        alignSelf: 'center',
        alignItems: 'center',
        textAlign: 'center',
        flexDirection: 'row',
        justifyContent: "center",
        marginTop: 0,
        marginRight: 0,
        backgroundColor: '#24ad91',
        borderRadius: 50,
        position: 'absolute',
        right: -10,
        top: -10,
        zIndex: 9,
    },
    modalHeading: {
        color: Colors.secondary,
        fontFamily: 'Montserrat-Bold',
        fontSize: 16,
        textAlign: 'center',
        alignSelf: 'center',
        width: '100%',
        paddingLeft: 10,

    },

    //Bottom sheet===========
    bottomSheetBackground: {
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        backgroundColor: '#fff',
    },
    bottomSheetHandle: {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },

    //Search============
    headerSearchBox: {
        width: '75%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.grayF5,
        borderRadius: 30,
        paddingRight: 10,
        paddingLeft: 10,
    },
    headerSearchIcon: {
        lineHeight: 24
    },
    searchInput: {
        flex: 1,
        height: 45,
        fontSize: 14,
        color: Colors.secondary,
        paddingLeft: 5,
        fontFamily: 'Montserrat-Regular',
        paddingVertical: 0
    },
    //Header==========
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        //padding: 10,
        paddingHorizontal: 15,
        backgroundColor: '#24ad91',
        //backgroundColor: 'blue',
        justifyContent: 'space-between',
        height: 55,
        // borderBottomColor: '#eee',
        // borderBottomWidth: .6,
        alignItems: 'center',
       // paddingLeft: 0,
    },
    pageHeaderLogoBox: {
        backgroundColor: '#dff7f8',
        width: 60,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        // paddingLeft: 5,
    },
    oaktreeLogos: {
        width: 55,
        height: 55,
        objectFit: 'contain',
        //backgroundColor:'blue'
    },
    sidebarNavigationIcon: {
        height: 28,
        width: 22
    },
    // pageTitleHeader: {
    //     width: '80%'
    // },
    pageTitle: {
        fontSize: 16,
        fontFamily: 'Montserrat-Bold',
        color: Colors.white,
        //backgroundColor:'yellow',
        //paddingLeft: Platform.OS == "ios" ? 5 : 15,
        //width:250
        //paddingLeft: 6
    },
    menuBar: {
        marginTop: -5,
        // position: 'absolute',
        // right: 10,
        // top: 10,
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    userImage: {
        height: 42,
        width: 42,
        borderWidth: 1,
        borderColor: Colors.grayDD,
        borderRadius: 50,
        backgroundColor: 'transparent',
    },
    popupMenuOption: {
        paddingHorizontal: 4,
        paddingVertical: 6,
    },
    popupMenuOptionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    popupMenuOptionText: {
        color: Colors.black7C,
        fontSize: 14,
        fontFamily: 'Montserrat-Regular',
        paddingLeft: 5
    },
    backbtn: {
        //paddingLeft: 10,
        marginTop: -1,
        backgroundColor:'#23a389',
        width: 45,
        height: 45,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius:4,
        borderWidth:.5,
        borderColor:'#219880',
    },


    //Footer==========
    /*footer: {
        padding: 15,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        paddingTop: 8,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    footerRow: {
        paddingHorizontal: 40,
        position: 'relative',
    },
    footerBox: {
        alignItems: 'center',
        padding: 0,
    },
    footerText: {
        fontSize: 12,
        fontFamily: 'Montserrat-Medium',
        color: Colors.white,
        paddingTop: 0
    },
    footerActiveText: {
        color: Colors.white
    },
    footerActiveItem: {
        borderBottomWidth: 2,
        borderBottomColor: Colors.white,
    },
    footerInactiveItem: {
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },*/
    footer: {
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    footerRow: {
        position: 'relative',
        backgroundColor: Colors.green01,
        width: '100%',
        paddingTop: 8,
        paddingBottom: 8,
        alignItems: 'center',
        // borderTopLeftRadius: 20,
        // borderTopRightRadius: 20
    },
    footerBox: {
        padding: 0,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // backgroundColor:'red',
        width: "95%",
    },
    footerBoxSingle: {
        // borderColor: '#fff',
        // borderStyle: 'dashed',
        // borderWidth: 1,
        // width:'95%',
        textAlign: 'center',
        // borderRadius:5,
        // backgroundColor:'#fff',
    },
    footerBoxSingleTxt: {
        padding: 5,
        paddingHorizontal: 10,
        fontSize: 14,
        fontFamily: 'Montserrat-Bold',
        //color: Colors.white,
        width: '100%',
        textAlign: 'center',
        color: "#219197",


    },
    footerBoxSinglesTxt: {
        textAlign: 'center',
        color: "#fff",
    },
    footerBoxMultiple: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 2,
    },
    footerBoxMultipleBox: {


        display: 'flex',
        justifyContent: "center",
        flexDirection: 'row',
        alignItems: 'center',
        textAlign: 'center',
        padding: 0,
        //backgroundColor:'blue'
    },
    footerBoxMultipleBoxText: {
        // backgroundColor:"blue",
        marginHorizontal: 5,
        padding: 0,
        paddingVertical: 5,
        fontSize: 14,
        fontFamily: 'Montserrat-Medium',
        color: Colors.white,
    },
    footerText: {
        fontSize: 12,
        fontFamily: 'Montserrat-Medium',
        color: Colors.white,
        paddingTop: 0
    },
    footerActiveText: {
        color: Colors.white
    },
    footerActiveItem: {
        borderBottomWidth: 1,
        borderBottomColor: 'transparent',
    },
    footerInactiveItem: {
        borderBottomWidth: 1,
        borderBottomColor: 'transparent',
    },
    footerRowActive: {

    },
    footerRowInactive: {
        backgroundColor: Colors.green03
    },
    //Force password hints==========
    forceModalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    forceModalView: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        shadowColor: Colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    forceModalIcon: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    forceHintsContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: Colors.white,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    },
    forceHintsHeaderText: {
        fontSize: 14,
        fontFamily: 'Montserrat-Medium',
        marginBottom: 6,
        color: Colors.secondary,
    },
    forceHintText: {
        fontSize: 14,
        color: Colors.secondary,
        marginBottom: 6,
        fontFamily: 'Montserrat-Regular',
    },
    forceHintContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 0,
    },
    forceBullet: {
        fontSize: 35,
        color: Colors.secondary,
        marginRight: 6,
        lineHeight: 33
    },

    //Confirmation popup==============
    confirmationPopupContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    confirmationPopupTextContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmationPopupTitle: {
        fontSize: 18,
        fontFamily: 'Montserrat-Medium',
        marginBottom: 6,
        color: Colors.secondary,
        paddingVertical: 8,
        paddingHorizontal: 15,
    },
    confirmationPopupContent: {
        fontSize: 14,
        fontFamily: 'Montserrat-Regular',
        marginBottom: 6,
        color: Colors.secondary,
        textAlign: 'center',
        paddingHorizontal: 15,
    },
    confirmationPopupButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderColor: Colors.secondary,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderRightWidth: 2,
    },
    confirmationPopupConfirmButton: {
        paddingHorizontal: 10,
        width: '50%',
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: Colors.secondary,
    },
    confirmationPopupConfirmButtonText: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 16,
        color: Colors.white
    },
    confirmationPopupCancelButton: {
        paddingHorizontal: 10,
        width: '50%',
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: Colors.white,
    },
    confirmationPopupCancelButtonText: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 16,
        color: Colors.primary
    },

    //Switch Organization
    organizationContainer: {
        flex: 1,
        backgroundColor: Colors.white,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    },
    organizationListRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.grayE7,
        minHeight: 70
    },
    orgLeftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
        paddingRight: '12%',
    },
    orgImageContainer: {
        // width: 40,
        // height: 40,
        // borderRadius: 20,
        // backgroundColor: Colors.grayDD,
        justifyContent: 'center',
        alignItems: 'center',
    },
    orgTextContainer: {
        marginLeft: 6,
    },
    orgNameText: {
        fontSize: 14,
        fontFamily: 'Montserrat-Medium',
        color: Colors.secondary,
    },
    orgLocationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    orgLocation: {
        width: "93%",
        fontSize: 12,
        color: Colors.gray99,
        marginLeft: 5,
        fontFamily: 'Montserrat-Regular',
    },
    orgRightSection: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollViewContent: {
        paddingBottom: 20,
    },
    orgImg: {
        width: 40,
        height: 40,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: Colors.grayDD,
    },

    disabledRow: {
        backgroundColor: Colors.lightGray,
        borderBottomColor: Colors.grayB1
    },
    //Loader
    loadingOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    //ScreenWrapper
    screenWrapperContainer: {
        flex: 1,
        justifyContent: 'space-between',
        // backgroundColor: "red"
    },
    //Custom global bottom sheet modal
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        //backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContentContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        paddingTop: 15
    },
    iconImageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15
    },
    iconDimension: {
        width: 105,
        height: 115
    },
    bottomSheetHeaderContainer: {
        alignItems: 'center',
        paddingBottom: 5,
        paddingHorizontal: 10
    },
    bottomSheetHeaderText: {
        paddingTop: 10,
        fontFamily: 'Montserrat-Medium',
        color: Colors.primary,
        textAlign: 'center'
    },
    //Custom popup============
    customPopupOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(52, 52, 52, 0.7)',
        flexDirection: 'column',
    },
    customPopupBody: {
        height: 'auto',
        backgroundColor: Colors.white,
        borderRadius: 6
    },
    customPopupContainer: {
        paddingHorizontal: 10,
        paddingVertical: 10
    },
    customPopupContentText: {
        color: Colors.secondary,
        fontFamily: 'Montserrat-Medium',
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        marginBottom: 10
    },
    customPopupSecondContentText: {
        color: Colors.secondary,
        fontFamily: 'Montserrat-Regular',
        fontSize: 13,
        lineHeight: 20,
        textAlign: 'center'
    },

    //QR Code/MFA================
    authenticatorContainer: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        borderColor: Colors.grayB1,
        borderWidth: 1.5,
        paddingHorizontal: 6,
        paddingVertical: 8,
        borderRadius: 6,
    },
    authenticatorTextContainer: {
        flexDirection: 'column',
        width: '82%'
    },
    authenticatorTextBox: {
        flexWrap: 'wrap',
        fontSize: 13,
        color: Colors.secondary,
        fontFamily: 'Montserrat-Regular'
    },
    textHighlighter: {
        color: Colors.lightBlue,
    },
    authenticatorImgBox: {
        width: 30,
        height: 55
    },
    enableMFAModaLBody: {
        flex: 1,
        justifyContent: 'space-between',
        //paddingBottom: 10,
        paddingTop: 30,
    },
    enableMFAModaLContent: {
        flexDirection: 'column',
        paddingHorizontal: 15,
        justifyContent: 'center',
        paddingTop: 0,
    },

    radioButtonContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    radioCircle: {
        height: 22,
        width: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: Colors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 4
    },
    selected: {
        backgroundColor: Colors.secondary,
    },
    radioLabel: {
        marginLeft: 4,
        fontSize: 14,
        color: Colors.secondary,
        fontFamily: 'Montserrat-Medium',
    },
    enableSubmitMfaBtn: {
        backgroundColor: Colors.secondary,
        lineHeight: 16,
        paddingHorizontal: 10,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    enableSkipMfaBtn: {
        backgroundColor: Colors.white,
        lineHeight: 16,
        paddingHorizontal: 10,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    enableSkipMfaBtnText: {
        fontSize: 15,
        fontFamily: 'Montserrat-Medium',
        color: Colors.secondary,
    },
    enableSubmitMfaBtnText: {
        fontSize: 15,
        fontFamily: 'Montserrat-Medium',
        color: Colors.white,
    },
    //QR Generator===========
    qrContainer: {
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
    },
    containerTopSection: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    qrTitle: {
        fontSize: 14,
        paddingHorizontal: 15,
        marginTop: 10,
        marginBottom: 15,
        color: Colors.secondary,
        fontFamily: 'Montserrat-Regular',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
    },
    touchableWrapper: {
        alignItems: 'center',
        position: 'relative',
        top: 0
    },
    authenticatorHighlighterText: {
        color: Colors.lightBlue,
        fontFamily: 'Montserrat-Medium',
        textDecorationLine: 'underline',
        position: 'relative',
        top: 9,
        paddingHorizontal: 6
    },
    qrInputBox: {
        width: 45,
        height: 45,
        backgroundColor: Colors.white,
        borderColor: Colors.secondary,
        borderWidth: 1.5,
        borderRadius: 0,
        textAlign: 'center',
        fontSize: 18,
        color: Colors.secondary,
        marginHorizontal: 5,
    },
    qrInputGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 25,
        marginBottom: 0,
    },
    qrSubmitBtnContainer: {
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        width: '100%',
    },
    qrSubmitBtn: {
        backgroundColor: Colors.secondary,
        borderColor: Colors.secondary,
        borderWidth: 1.5,
        lineHeight: 16,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 0,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    },
    qrSubBtnText: {
        fontSize: 14,
        fontFamily: 'Montserrat-Medium',
        color: Colors.white,
        alignItems: 'center',
    },
    authenticatorText: {
        paddingTop: 0,
        fontSize: 13,
        color: Colors.gray99,
        fontFamily: 'Montserrat-Regular',
        borderRadius: 5,
    },
    secretText: {
        marginTop: 10,
        paddingTop: 6,
        paddingBottom: 3,
        paddingRight: 40,
        fontSize: 13,
        color: Colors.black,
        fontFamily: 'Montserrat-Medium',
        borderRadius: 5,
        backgroundColor: 'rgb(242, 242, 242)',
        paddingHorizontal: 4,
        textDecorationLine: 'underline'

    },
    copyTopContainer: {
        paddingHorizontal: 15,
        paddingTop: 12
    },
    copySecretCodeBtn: {
        position: 'absolute',
        right: 6,
        top: 15
    },
    iconBox: {
        width: 30,
        height: 30,
        backgroundColor: '#fff',
        borderRadius: 50,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: 5,
    },
    oaktreeLogo: { width: 30, objectFit: 'contain' },
    emailiconBox: {
        padding: 0,
    },
    helpDesk: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        flexDirection: 'row',
    },
    safeArea: {
        flex: 1,
        paddingBottom: 0, // Prevent extra padding
    },
    refreshBtn: {
        //backgroundColor:'red',
        width: 35,
        height: 35,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 0,
        position: 'absolute',
        right: 55,
        top: 9,
    }
})

export default CommonStyle