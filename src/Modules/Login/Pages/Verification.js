const screen = Dimensions.get("window");
const screenWidth = screen.width;
const screenheight = screen.height;

import React, { useState, useEffect, useRef, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ImageBackground,
    Modal,
    Pressable,
    TouchableWithoutFeedback,
    Linking,
    KeyboardAvoidingView,
    Keyboard,
    Alert,
    Dimensions
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LoginStyle from '../Public/css/LoginStyle';
import Colors from '../../../Utility/Colors';
import Config from '../../../Utility/Config';
import Feather from 'react-native-vector-icons/Feather';
import Cookies from 'js-cookie';
import { confirmUser, resendVerifyCode } from '../Controller/LoginController'
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../../../Utility/Components/Loader';
import { AuthContext } from '../../../Contexts/context';
import { useNavigation } from '@react-navigation/native';
import EventEmitter from '../../../Contexts/EventEmitter';
import { useDispatch, useSelector } from 'react-redux';
import { setToken, setUserDetails } from '../Actions/LoginAction'
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from "@react-native-community/netinfo";

function Verification(props) {
    const authContext = useContext(AuthContext);
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const chooseEnv = useSelector((state) => state.environment);
    const State = useSelector((state) => state);
    const reduxAuthJson = useSelector((state) => state);
    const [verificationCode, setVerificationCode] = useState("");
    const [verificationCodeError, setVerificationCodeError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isconnected, setIsconnected] = useState(false);
    const [isverified, setIsverified] = useState(false);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsconnected(state.isConnected)
            if (!state.isConnected) {
                setLoading(false);
            }
        });
        return () => {
            unsubscribe();
        };
    }, []);

    const varificationCode = () => {
        let validationFlag = true;
        if (verificationCode === "") {
            validationFlag = false;
            setVerificationCodeError("Please enter Activation Code");
        } else if (verificationCode.length < 6) {
            validationFlag = false;
            setVerificationCodeError("Activation Code needs to be atleast 6 characters");
        } else {
            setVerificationCodeError("");
        }
        if (validationFlag) {
            setLoading(true);
            let data = {
                email: reduxAuthJson.signUpEmail,
                confirmation_code: verificationCode
            }
            confirmUser(data).then(async (response) => {
                setLoading(false);
                // console.log("response: ========", response);
                if (response.status === 1) {
                    //localStorage.removeItem("storageKey");
                    //history.push("/verificationSuccess");
                    Toast.show("Your email has been verified! You can now login to Oaktree Connect.");
                    navigation.navigate("Login")
                }

                if (response.status === 0) {
                    Toast.show(response.message);
                }

            }).catch((error) => {
                setLoading(false);
            });
        }
    }

    const resendVerifyCodeFn = () => {
        setLoading(true);
        let data = {
            email: reduxAuthJson.signUpEmail
        }
        resendVerifyCode(data).then(async (response) => {
            setLoading(false);
            console.log("response: ========", response);
            if (response.status === 1) {
                Toast.show("Verification Code Send Successfully");
            } else {
                Toast.show("Error sending the verification code. Please try again.");
            }
        }).catch((error) => {
            setLoading(false);
        });
    }


    return (

        <KeyboardAwareScrollView
            style={LoginStyle.container}
        >
            <>
                {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
                <Loader loading={loading} /> 
                <View
                    style={LoginStyle.logincontainer}
                >
                    <Image source={require('../../../Utility/Public/images/oaktreeLogo.png')} style={LoginStyle.oaktreeLogo} />

                    <View>
                        {isverified == false ?
                            <View style={LoginStyle.loginBox}>
                                <Text allowFontScaling={false} style={[LoginStyle.loginTxt, LoginStyle.verificationTxt]}>Thank you for Registering with us. A verification code has been sent to the email you provided.</Text>
                                <View allowFontScaling={false} style={[LoginStyle.inputContainerBoxes, LoginStyle.inputContainerBoxesForVerification]}>
                                    <View style={LoginStyle.inputContainer}>
                                        <TextInput
                                            style={LoginStyle.input}
                                            allowFontScaling={false}
                                            placeholder="Enter the verification code here"
                                            placeholderTextColor={Colors.gray99}
                                            value={verificationCode}
                                            onChangeText={(text) => {
                                                setVerificationCode(text);
                                                if (text.length < 6) {
                                                    setVerificationCodeError("Activation Code needs to be atleast 6 characters");
                                                } else {
                                                    setVerificationCodeError("");
                                                }
                                            }}
                                            returnKeyLabel='Done'
                                            returnKeyType='done'
                                            //onSubmitEditing={() => { loginSubmit() }}
                                            autoCapitalize="none"
                                        />
                                        {verificationCodeError != "" ? <Text allowFontScaling={false} style={LoginStyle.errorMsg}>{verificationCodeError}</Text> : null}
                                    </View>
                                </View>
                                <View style={[LoginStyle.loginBtnInner, LoginStyle.varifyBtnInner]}>
                                    <TouchableOpacity style={LoginStyle.loginButton} onPress={varificationCode}>
                                        <Text allowFontScaling={false} style={LoginStyle.loginButtonText}>Varify</Text>
                                    </TouchableOpacity>

                                </View>
                                <View style={LoginStyle.signUpRow}>

                                    <Text allowFontScaling={false} style={LoginStyle.signUpText}> Are you want to {' '}
                                        <Text allowFontScaling={false} style={LoginStyle.signUpLink} onPress={resendVerifyCodeFn}>
                                            Resend Varification ?
                                        </Text>
                                    </Text>
                                    <View style={LoginStyle.signUpUnderline}></View>

                                </View>
                            </View > :
                            <View style={LoginStyle.loginBox}>
                                <Text allowFontScaling={false} style={[LoginStyle.loginTxt, LoginStyle.verificationTxt]}>Your email has been verified! You can now login to Oaktree Connect.</Text>
                                <View style={[LoginStyle.loginBtnInner, LoginStyle.varifyBtnInner]}>
                                    <TouchableOpacity style={[LoginStyle.loginButton, LoginStyle.gotologinButton]} onPress={loginSubmit}>
                                        <Text allowFontScaling={false} style={[LoginStyle.loginButtonText, LoginStyle.gotologinButtonText]}>Go To Login</Text>
                                    </TouchableOpacity>
                                </View>
                            </View >
                        }
                    </View >

                </View>
                {/* </TouchableWithoutFeedback> */}
            </>
        </KeyboardAwareScrollView>

    );
}

const mapStateToProps = (globalState) => {
    return {
        //token: globalState.token

    };
}

// export default LoginScreen;
export default connect(mapStateToProps, { setToken, setUserDetails })(Verification);