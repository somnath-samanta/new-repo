const screen = Dimensions.get("window");
const screenWidth = screen.width;
const screenheight = screen.height;
const scrollBoxHeight = screenheight * 0.55;
import { Dimensions, Platform } from "react-native";
import { StyleSheet } from "react-native";
import Colors from "../../../../Utility/Colors";

// Montserrat-Black
// Montserrat-Light
// Montserrat-Medium
// Montserrat-Regular
// Montserrat-Thin
// Montserrat-Bold

const LoginStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#dff7f8',
        // justifyContent: 'center',
        position: 'relative',
        width: screenWidth,
        height: screenheight,
    },
    logincontainer: {
        flex: 1,
        justifyContent: 'center',
        // alignItems: 'center',
        //backgroundColor:'blue',
        width: screenWidth,
        height: screenheight - (Platform.OS == 'ios' ? 50 : 0),
        marginTop: 0,
    },
    // oaktreeCircleImage2: {
    //     position: 'absolute',
    //     right: 35,  // Aligns the image to the right edge
    //     top: -220,    // Aligns the image to the top, can adjust depending on where you want it vertically
    //     width: '50%', // Makes the image take up 50% of the screen width
    //     height: undefined, // Automatically scales height to maintain the aspect ratio
    //     aspectRatio: 1,  // Ensures the image maintains its aspect ratio
    //     resizeMode: 'contain',
    // },
    // oaktreeCircleImage: {
    //     position: 'absolute',
    //     right: -120,  // Aligns the image to the right edge
    //     top: -200,    // Aligns the image to the top, can adjust depending on where you want it vertically
    //     width: '70%', // Makes the image take up 50% of the screen width
    //     height: undefined, // Automatically scales height to maintain the aspect ratio
    //     aspectRatio: 1,  // Ensures the image maintains its aspect ratio
    //     resizeMode: 'contain',
    //     transform: [{ rotate: '90deg' }]
    // },
    loginBox: {
        width: '100%',
        //height: '100%',
        marginTop: 60,
        //paddingBottom: 10,
        paddingLeft: 15,
        paddingRight: 15,
        // backgroundColor: 'red',
        alignItems: 'center',

        // backgroundColor:'red',

    },
    loginTxt: {
        fontSize: 30,
        color: '#000',
        fontFamily: 'Montserrat-Bold',
        //fontFamily:'Poppins-Bold'
    },
    verificationTxt: {
        fontSize: 16,
        textAlign: 'center'
    },
    logoPosition: {
        marginBottom: 30,

    },
    loginText: {
        fontSize: 18,
        color: '#676666',
        lineHeight: 20,
    },
    logoHeight: {
        height: 100,
        width: 178
    },
    authenticationLogoHeight: {
        width: 105,
        height: 115
    },
    mailIconPosition: {
        lineHeight: 22,
        position: 'relative',
        height: 25,
        width: 25
    },
    angelImage: {
        flex: 1
    },
    inputContainerBoxes: {
        // backgroundColor:'red',
        width: "100%",
        marginTop: 35,
        paddingLeft: 20,
        paddingRight: 20,
    },
    inputContainerBoxesForVerification: {
        marginTop: 20,
    },
    topSpace: {
        marginTop: 20,
    },
    inputContainerBoxesSignUpDown: {
        width: "100%",
        marginTop: 0,
        //backgroundColor:'red'
    },
    inputContainerBoxesSignUp: {
        width: "100%",
        margin: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        // backgroundColor: Colors.white,
        // borderBottomColor: Colors.borderGray,
        // borderBottomWidth: 1,
        borderRadius: 0,
        paddingRight: 10,
        paddingLeft: 0,
        position: 'relative',
        backgroundColor: "#fff",
        borderRadius: 10,
    },
    inputContainerSignUp: {
        marginBottom: 20,
        width: '48.5%'
    },
    dateFieldBox: {
        // backgroundColor: 'red',
        position: 'relative',
    },
    dateFieldSec: {
        //backgroundColor: 'red',
        color: '#333'
    },
    dateField: { position: 'absolute', left: 10, },
    dateFieldicon: { position: 'absolute', right: 10 },
    dateClear: { position: 'absolute', right: -20, top: Platform.OS == 'ios' ? 0 : 2 },
    input: {
        flex: 1,
        height: 50,
        fontSize: 13,
        color: Colors.secondary,
        paddingHorizontal: 10,
        fontFamily: 'Arimo-Regular',
        paddingVertical: 0,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    errorMsg: {
        position: 'absolute',
        fontSize: 13,
        fontFamily: 'Arimo-Regular',
        left: 0,
        zIndex: 9,
        bottom: Platform.OS == 'ios' ? -18 : -20,
        color: Colors.red
    },
    loginBtnInner: {
        flexDirection: 'row', // Change column to row for horizontal alignment
        width: '100%',
        justifyContent: 'center',
        marginTop: 40,
    },
    sendLink: {
        marginTop: 10,
    },
    varifyBtnInner: {
        marginTop: 15,
    },
    loginBtnInnerSignup: {
        marginTop: 10,
    },
    forgetYourPasswordBox: {
        width: '100%',
        //backgroundColor:'red',
        paddingLeft: 20,
    },
    ForgetYourPassword: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingRight: 5,

    },
    HintPassword: {
        justifyContent: 'flex-end',
        padding: 0,
        paddingBottom: 5,
    },
    ForgetYourPasswordText: {
        fontSize: 16,
        fontFamily: 'Arimo-Regular',
        color: Colors.green01,
    },
    PasswordHint: {
        fontSize: 12,
        fontFamily: 'Arimo-Regular',
        color: Colors.green01,
    },
    PasswordHintBox: {
        justifyContent: 'flex-end',
        textAlign: 'right',
        //backgroundColor:'#ccc'

    },
    signUpRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: 'blue',
        position: 'relative',
        width: '100%',
        paddingVertical: 20,
        // padding: 20,
        //     //top:60,
        marginTop: 20,
    },
    signUpRowForSignUp: {
        marginTop: 0,
    },
    signUpText: {
        // position: 'absolute',
        //bottom: 190,
        color: Colors.black,
        fontSize: 15,
        fontFamily: 'Arimo-Regular',
    },
    signUpTouchableOpacity: {
        marginTop: 10
    },
    signUpLink: {
        color: Colors.green01,
        fontWeight: 'bold',

    },
    signUpUnderline: {
        position: 'absolute',
        bottom: 10,
        width: 93, // Adjust the width
        height: 3, // Adjust the thickness
        backgroundColor: Colors.green01,
    },
    blankSpace: {
        width: '40%',
    },
    loginBtnWidth: {
        width: '100%',
        flexDirection: 'column'
    },
    rememberContainer: {
        flexDirection: 'row',
        // justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginBottom: 2,
    },
    checkbox: {
        margin: 0,
        padding: 0,
        position: 'relative',
        left: -5,
        alignSelf: 'flex-start',
    },
    rememberText: {
        color: Colors.secondary,
    },
    loginButton: {
        width: '40%',
        height: 50,
        backgroundColor: '#229980',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        borderColor: '#229980',
        borderWidth: 2,
    },
    gotologinButton: {
        // width: '60%',
        width: 'auto',
        paddingHorizontal: 15,
    },
    loginButtonText: {
        color: Colors.white,
        fontSize: 20,
        fontFamily: 'Arimo-Bold',
    },
    gotologinButtonText: {
        fontSize: 16,
    },
    forgotBox: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        paddingTop: 20
    },
    backToBox: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 10,
        marginBottom: 20
    },
    resendBox: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 10
    },
    forgotPassword: {
        width: '100%',
        color: Colors.secondary,
        fontSize: 15,
        fontFamily: 'Arimo-Regular',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        textDecorationLine: 'underline',
    },
    rememberText: {
        fontSize: 16,
        color: Colors.secondary,
        fontFamily: 'Arimo-Regular',
        paddingTop: 5
    },
    emailLineHeight: {
        lineHeight: 22
    },
    verifiedLineHeight: {
        lineHeight: 22
    },
    passwordLineHeight: {
        lineHeight: 28
    },
    infoIcon: {
        paddingTop: 2,
        paddingLeft: 6
    },
    oaktreeLogo: {
        // lineHeight: 22,
        // position: 'relative',
        height: 120,
        width: 120,
        position: 'absolute',
        left: -20,
        top: -10,
        objectFit: 'contain',
    },

    //Otp Verification===========
    otpVerificationLabel: {
        textAlign: 'center',
        fontSize: 16,
        fontFamily: 'Arimo-Regular',
        color: Colors.secondary,
        marginBottom: 20,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    otpInput: {
        width: 45,
        height: 45,
        backgroundColor: Colors.white,
        borderBottomColor: Colors.secondary,
        borderBottomWidth: 2,
        borderRadius: 0,
        textAlign: 'center',
        fontSize: 18,
        color: Colors.secondary,
        marginHorizontal: 5,
    },
    //=================
    customizeModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 200,
        flex: 1
    },
    modalHeaderTitle: {
        color: Colors.secondary,
        fontFamily: 'Arimo-Regular',
        fontSize: 18,
        textAlign: 'left',
        alignSelf: 'center'
    },
    infoIconPosition: {
        position: 'relative',
        top: -3
    },

    //Force password hints==========
    forceModalOverlay: {
        flex: 1,
        justifyContent: 'flex-end', // Position the modal at the bottom
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
        fontSize: 16,
        fontFamily: 'Arimo-Regular',
        marginBottom: 6,
        color: Colors.secondary,
    },
    forceHintText: {
        fontSize: 14,
        color: Colors.secondary,
        marginBottom: 6,
        fontFamily: 'Arimo-Regular',
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

    //password hints design
    infoIcon: {
        paddingTop: 2,
        paddingLeft: 6
    },
    hintsContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: Colors.white,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    },
    hintsHeaderText: {
        fontSize: 16,
        fontFamily: 'Arimo-Regular',
        marginBottom: 6,
        color: Colors.secondary,
    },
    passwordHintContainer: {
        padding: 15,
        paddingTop: 0,
    },
    hintText: {
        fontSize: 14,
        color: Colors.secondary,
        marginBottom: 6,
        fontFamily: 'Arimo-Regular',
    },
    hintTextInn: {
        fontSize: 13,
        color: Colors.secondary,
        marginBottom: 0,
        fontFamily: 'Arimo-Regular',
    },
    hintContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 0,
    },
    bullet: {
        fontSize: 35,
        color: Colors.secondary,
        marginRight: 6,
        lineHeight: 33
    },

    //Change Password Content
    changePassModalContent: {
        width: '100%',
        justifyContent: "center",
        alignItems: "center",
        padding: 25,
        paddingTop: 0,
        borderRadius: 15,
        flexWrap: 'wrap',
        flexDirection: 'column',
    },

    changeInputInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        backgroundColor: Colors.white,
        borderBottomColor: Colors.secondary,
        borderBottomWidth: 2,
        borderRadius: 0,
        paddingRight: 10,
        paddingLeft: 0,
        position: 'relative'
    },
    changeInput: {
        flex: 1,
        height: 45,
        fontSize: 14,
        color: Colors.secondary,
        paddingLeft: 5,
        fontFamily: 'Arimo-Regular',
        paddingVertical: 0
    },
    errorMsg: {
        position: 'absolute',
        fontSize: 13,
        fontFamily: 'Arimo-Regular',
        left: 0,
        zIndex: 9,
        bottom: Platform.OS == 'ios' ? -18 : -20,
        color: Colors.red
    },
    changePassButtonInner: {
        marginTop: 15,
        height: 45,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        width: '100%',
    },
    changePassButton: {
        width: '100%',
        height: 50,
        backgroundColor: Colors.secondary,
        borderRadius: 3,
        textAlign: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    changeElevation: {
        elevation: 20,
        shadowColor: Colors.primary,
    },
    changeButtonText: {
        color: Colors.white,
        textAlign: 'center',
        fontSize: 16,
        fontFamily: 'Arimo-Regular',
    },
    changeError: {
        width: '100%',
        color: 'red',
        fontSize: 10,
        textAlign: 'center',
        fontFamily: 'Arimo-Regular',
    },
    passwordLineHeight: {
        lineHeight: 28
    },

    //Url type work===============
    urlTpeModalOverlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center'
    },
    urlTpeModalBody: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 10,
        shadowColor: Colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%'
    },
    urlTypeModalContainer: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center'
    },
    authenticatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 8,
        borderRadius: 6,
    },
    radioButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
        fontFamily: 'Arimo-Regular',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 5,
        width: '100%',

        paddingHorizontal: 20,
        paddingRight: 30,


    },
    checkbox: {
        height: 24,
        width: 24,
        borderWidth: 1,
        borderColor: '#666',  // Border color
        backgroundColor: '#fff',  // Background color
        borderRadius: 0, // Rounded corners
        padding: Platform.OS == "android" ? 0 : 5,
        paddingLeft: 5,
        color: '#fff'
    },
    checkboxDisabled: {
        pointerEvents: 'none',
    },
    label: {
        marginLeft: 8,
        color: '#333', fontSize: 14,
        fontFamily: 'Arimo-Regular',
        flexWrap: 'wrap',
    },
    checkboxlabel: {
        fontSize: 13,
        marginLeft: 8,
        color: '#333',
    },
    checkmark: {
        color: '#333',
        fontFamily: 'Arimo-Bold',
    },
    pickerContainer: {
        color: '#666',
        fontSize: 13,
        fontFamily: 'Arimo-Regular',
    },
    scrollBox: {
        height: scrollBoxHeight,
        width: '100%',
        marginBottom: 5,
    },
    additionalInfo: {
        //backgroundColor:'red'
        paddingBottom: 15,
    },
    additionalheadingTxt: {
        color: '#666',
        fontSize: 14,
        fontFamily: 'Arimo-Regular',
        marginBottom: 5,
    },
    resetSubTxt: {
        color: '#666',
        fontSize: 15,
        fontFamily: 'Arimo-Regular',
        textAlign: 'center',
    }

})

export default LoginStyle