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
import { resetPassword } from '../Controller/LoginController'
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
import GlobalModal from '../../../Utility/Components/GlobalModal';

function ResetPassword(props) {
    const authContext = useContext(AuthContext);
    const navigation = useNavigation();
    const dispatch = useDispatch();
    //console.log("navigation==", navigation)
    //rbladmin@yopmail.com

    //#GHb5lt3
    const chooseEnv = useSelector((state) => state.environment);
    const State = useSelector((state) => state);

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isReenterPasswordVisible, setIsReenterPasswordVisible] = useState(false);
    const [activationCode, setActivationCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmpassword, setConfirmpassword] = useState("");
    const [activationCodeError, setActivationCodeError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmpasswordError, setConfirmpasswordError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isconnected, setIsconnected] = useState(false);
    const [passwordHintFlag, setPasswordHintFlag] = useState(false);
    const specialChars = "= + - ^ $ * . [ ] ( ) ? ! @ # % & / , > < ' : ; | _ ~";


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

        if(activationCode.trim() === ""){
            valid = false;
            setActivationCodeError("Please enter activation code");
        }else if (password.trim() === "") {
            valid = false;
            setPasswordError("Please enter password")
        } else if (password.length < 6) {
            valid = false;
            setPasswordError("Password must be at least 6 characters.")
        } else {
            setPasswordError("")
        }
        // Validate Confirm Password
        if (confirmpassword.trim() === "") {
            setConfirmpasswordError("Please confirm your password");
            valid = false;
        } else if (confirmpassword.length < 6) {
            setConfirmpasswordError("Password must be at least 6 characters.");
            valid = false;
        } else if (password !== confirmpassword) {
            console.log(password," !== ",confirmpassword);
            setConfirmpasswordError("Passwords do not match");
            valid = false;
        } else {
            setConfirmpasswordError("");
        }
        return valid;
    }

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };
    const togglePasswordVisibilityReEnter = () => {
        setIsReenterPasswordVisible(!isReenterPasswordVisible);
    };

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


    const changePasswordFn = () => {
        let flag = validation();
        if(flag){
            if(isconnected){
                setLoading(true);
                let data = {
                    email: props.route.params.patientEmail,
                    verificationCode: activationCode,
                    newPassword: confirmpassword
                }
                resetPassword(data).then(async (response) => {
                    // console.log("----------response---------", response);
                    if(response.ResetPassword.status === 1){
                        Toast.show("Password updated Sucessfully");
                        navigation.navigate("Login")
                    }else{
                        Toast.show(response.ResetPassword.message);
                    }
                    setLoading(false);
                })
            }else{
                Toast.show("No internet connection");
            }
        }
    }


    const PasswordHint = () => {
        setPasswordHintFlag(true);
    };



    return (

        <KeyboardAwareScrollView
            style={LoginStyle.container}
        >
            <>
                {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
                <View
                    style={LoginStyle.logincontainer}
                >
                    <Image source={require('../../../Utility/Public/images/oaktreeLogo.png')} style={LoginStyle.oaktreeLogo} />

                    <View>
                        <Loader loading={loading} /> 
                        <View style={LoginStyle.loginBox}>
                            <Text style={LoginStyle.loginTxt}>Reset Password</Text>
                            <View style={LoginStyle.inputContainerBoxes}>
                                <View style={LoginStyle.inputContainer}>
                                    <TextInput
                                        style={LoginStyle.input}
                                        placeholder="Enter Your Activation Code"
                                        placeholderTextColor={Colors.gray99}
                                        value={activationCode}
                                        onChangeText={(text) => { setActivationCode(text); setActivationCodeError("") }}
                                        returnKeyLabel='Done'
                                        returnKeyType='done'
                                        //onSubmitEditing={() => { loginSubmit() }}
                                        autoCapitalize="none"
                                    />
                                    {activationCodeError != "" ? <Text style={LoginStyle.errorMsg}>{activationCodeError}</Text> : null}
                                </View>
                                <View style={[LoginStyle.forgetYourPasswordBox, LoginStyle.PasswordHintBox]}>
                                    <TouchableOpacity style={[LoginStyle.ForgetYourPassword, LoginStyle.HintPassword]} onPress={PasswordHint}>
                                        <Text style={[LoginStyle.ForgetYourPasswordText, LoginStyle.PasswordHint]}>Password Hints</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={LoginStyle.inputContainer}>
                                    <TextInput
                                        style={[LoginStyle.input, { flex: 1 }]}
                                        placeholder="Password"
                                        placeholderTextColor={Colors.gray99}
                                        secureTextEntry={!isPasswordVisible}
                                        value={password}
                                        onChangeText={(text) => { setPassword(text); setPasswordError(""); }}
                                        returnKeyLabel='Done'
                                        returnKeyType='done'
                                    //onSubmitEditing={() => { loginSubmit() }}
                                    />
                                    <TouchableOpacity onPress={togglePasswordVisibility}>
                                        <Feather
                                            name={isPasswordVisible ? 'eye' : 'eye-off'}
                                            size={22}
                                            color={Colors.secondary}
                                        />
                                    </TouchableOpacity>
                                    {passwordError != "" ? <Text style={LoginStyle.errorMsg}>{passwordError}</Text> : null}
                                </View>
                                <View style={LoginStyle.inputContainer}>
                                    <TextInput
                                        style={[LoginStyle.input, { flex: 1 }]}
                                        placeholder="Confirm Password"
                                        placeholderTextColor={Colors.gray99}
                                        secureTextEntry={!isReenterPasswordVisible}
                                        value={confirmpassword}
                                       onChangeText={(text) => { setConfirmpassword(text); setConfirmpasswordError(""); }}
                                        returnKeyLabel='Done'
                                        returnKeyType='done'
                                    //onSubmitEditing={() => { loginSubmit() }}
                                    />
                                    <TouchableOpacity onPress={togglePasswordVisibilityReEnter}>
                                        <Feather
                                            name={isReenterPasswordVisible ? 'eye' : 'eye-off'}
                                            size={22}
                                            color={Colors.secondary}
                                        />
                                    </TouchableOpacity>
                                    {confirmpasswordError != "" ? <Text style={LoginStyle.errorMsg}>{confirmpasswordError}</Text> : null}
                                </View>
                            </View>
                            <View style={[LoginStyle.loginBtnInner, LoginStyle.sendLink]}>
                                <TouchableOpacity style={[LoginStyle.loginButton, LoginStyle.gotologinButton]} onPress={changePasswordFn}>
                                    <Text style={[LoginStyle.loginButtonText, LoginStyle.gotologinButtonText]}>Change Password</Text>
                                </TouchableOpacity>

                            </View>
                        </View >
                    </View >
                </View>

                <GlobalModal
                    visible={passwordHintFlag}
                    animationType="fade"
                    onCancel={() => setPasswordHintFlag(false)}
                    footer={false}
                    header={true}
                    headerTitle='Password Hints'
                    body={
                        <View style={LoginStyle.passwordHintContainer}>
                            <Text style={LoginStyle.hintTextInn}>* Minimum length, which must be at least 6 characters</Text>
                            <Text style={LoginStyle.hintTextInn}>* Requires numbers</Text>
                            <Text style={LoginStyle.hintTextInn}>
                                * Requires a special character from this set: {specialChars}
                            </Text>
                            <Text style={LoginStyle.hintTextInn}>* Requires uppercase letters</Text>
                            <Text style={LoginStyle.hintTextInn}>* Requires lowercase letters</Text>
                        </View>
                    }

                />
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
export default connect(mapStateToProps, { setToken, setUserDetails })(ResetPassword);