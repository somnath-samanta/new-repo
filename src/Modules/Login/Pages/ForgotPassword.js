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
import { forgotPassword } from '../Controller/LoginController'
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

function ForgotPassword(props) {
    const authContext = useContext(AuthContext);
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isconnected, setIsconnected] = useState(false);


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


    const validation = () => {
        let valid = true;

        if (email == "") {
            valid = false;
            setEmailError("Please enter a valid email");
        } else {
            var expr = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
            if (!expr.test(email)) {
                setEmailError("Please enter a valid email");
                valid = false;
            } else {
                setEmailError("");
            }
        }

        return valid;
    }
    useEffect(() => {
        const listener = EventEmitter.addListener("broadcustMessage", async (message) => {
            if (message.passwordExpire === true) {
                navigation.navigate('Forgot', { email: email });
            }
        })
        return () => {
            listener.remove();
        }
    }, []);

    
    const resetPassword = () => {
        let valid = validation();
        if(valid){
            if(isconnected){
                // forgotPassword
                setLoading(true);
                let data = {
                    email: email
                }
                forgotPassword(data).then(async (response) => {
                    // console.log("----------response---------", response);
                    if(response.ForgotPassword.status === 1){
                        navigation.navigate("ResetPassword", {patientEmail: email})
                    }
                    if(response.ForgotPassword.status === 0){
                        setEmailError(response.ForgotPassword.message);
                    }
                    setLoading(false);
                })
            }else{
                Toast.show("No internet connection");
            }
        }
    };

    return (

        <KeyboardAwareScrollView
            style={LoginStyle.container}
        >
            <>
                <View
                    style={LoginStyle.logincontainer}
                >
                    <Image source={require('../../../Utility/Public/images/oaktreeLogo.png')} style={LoginStyle.oaktreeLogo} />

                    <View>
                        <Loader loading={loading} />
                        <View style={LoginStyle.loginBox}>
                            <Text allowFontScaling={false} style={[LoginStyle.loginTxt, LoginStyle.verificationTxt]}>Are you having trouble signing in ?</Text>
                            <Text allowFontScaling={false} style={LoginStyle.resetSubTxt}>Enter your registered Email and we will send you a link to reset the password.</Text>
                            <View style={LoginStyle.inputContainerBoxes}>
                                <View style={LoginStyle.inputContainer}>
                                    <TextInput
                                        style={LoginStyle.input}
                                        allowFontScaling={false}
                                        placeholder="Registered email"
                                        placeholderTextColor={Colors.gray99}
                                        value={email}
                                        onChangeText={(text) => { setEmail(text); setEmailError("") }}
                                        returnKeyLabel='Done'
                                        returnKeyType='done'
                                        //onSubmitEditing={() => { loginSubmit() }}
                                        autoCapitalize="none"
                                    />
                                    {emailError != "" ? <Text allowFontScaling={false} style={LoginStyle.errorMsg}>{emailError}</Text> : null}
                                </View>
                            </View>
                            <View style={[LoginStyle.loginBtnInner, LoginStyle.sendLink]}>
                                <TouchableOpacity style={LoginStyle.loginButton} onPress={resetPassword}>
                                    <Text allowFontScaling={false} style={LoginStyle.loginButtonText}>Send Link</Text>
                                </TouchableOpacity>
                            </View>
                        </View >
                    </View >
                </View>
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
export default connect(mapStateToProps, { setToken, setUserDetails })(ForgotPassword);