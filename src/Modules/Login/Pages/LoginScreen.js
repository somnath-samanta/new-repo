import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    BackHandler,
    Dimensions,
    KeyboardAvoidingView
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Feather from 'react-native-vector-icons/Feather';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector, connect } from 'react-redux';
import { WebView } from 'react-native-webview';

import LoginStyle from '../Public/css/LoginStyle';
import Colors from '../../../Utility/Colors';
import Config from '../../../Utility/Config';
import Loader from '../../../Utility/Components/Loader';
import { AuthContext } from '../../../Contexts/context';
import EventEmitter from '../../../Contexts/EventEmitter';
import { useNavigation } from '@react-navigation/native';
import { setToken, setUserDetails } from '../Actions/LoginAction';
import { loginGetApi } from '../Controller/LoginController';
import { SafeAreaView } from 'react-native-safe-area-context';
// ✅ For responsive scaling
import {
    responsiveHeight,
    responsiveWidth,
    responsiveFontSize,
} from 'react-native-responsive-dimensions';

function LoginScreen(props) {
    const authContext = useContext(AuthContext);
    const navigation = useNavigation();
    const dispatch = useDispatch();

    const chooseEnv = useSelector((state) => state.environment);

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [email, setEmail] = useState(__DEV__ ? 'ankita.das@yopmail.com' : '');
    const [password, setPassword] = useState(__DEV__ ? 'Mettle1!2' : '');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isconnected, setIsconnected] = useState(false);

    const [webViewFlagForSignUp, setWebViewFlagForSignUp] = useState(false);
    const [webViewFlagForUserVerification, setWebViewFlagForUserVerification] =
        useState(false);
    const [webViewFlagForForgotPassword, setWebViewFlagForForgotPassword] =
        useState(false);
    const [webViewSourceUrl, setWebViewSourceUrl] = useState({});

    // ✅ Network monitoring
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsconnected(state.isConnected);
            if (!state.isConnected) setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // ✅ Back handler for WebView screens
    useEffect(() => {
        const handleBackButtonPress = () => {
            if (
                webViewFlagForSignUp ||
                webViewFlagForUserVerification ||
                webViewFlagForForgotPassword
            ) {
                setWebViewFlagForSignUp(false);
                setWebViewFlagForUserVerification(false);
                setWebViewFlagForForgotPassword(false);
                return true;
            }
            return false;
        };
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            handleBackButtonPress
        );
        return () => backHandler.remove();
    }, [
        webViewFlagForSignUp,
        webViewFlagForUserVerification,
        webViewFlagForForgotPassword,
    ]);

    // ✅ Validation
    const validation = () => {
        let valid = true;
        const emailRegex =
            /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;

        if (!email || !emailRegex.test(email)) {
            setEmailError('Please enter a valid email');
            valid = false;
        } else {
            setEmailError('');
        }

        if (!password.trim()) {
            setPasswordError('Please enter password');
            valid = false;
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters.');
            valid = false;
        } else {
            setPasswordError('');
        }
        return valid;
    };

    // ✅ Login Submit
    const loginSubmit = () => {
        if (!isconnected) {
            Toast.show('No internet connection');
            return;
        }

        if (!validation()) return;

        setLoading(true);
        const data = { email, password };

        loginGetApi(data)
            .then(async (response) => {
                setLoading(false);
                if (response.data.loginUserDetails.accountStatus === 0) {
                    Toast.show('Your Account is Deactivated. Please contact Administrator');
                    return;
                }

                if (response.status === 1) {
                    const tokenHash = {
                        refreshToken: response.data.refreshToken,
                        accesToken: response.data.accessToken,
                        tokenExpiryDate: response.data.expiresIn,
                        loginUserId: response.data.loginUserDetails.identificationKey,
                    };
                    dispatch(setToken(tokenHash));
                    dispatch(setUserDetails(response.data.loginUserDetails));
                    Toast.show('You are logged in');
                    await AsyncStorage.setItem('token', response.data.accessToken);
                } else if (response.status === 0) {
                    if (response.code === 'NotAuthorizedException') {
                        Toast.show(
                            'The email or password you entered do not match with those provided at sign up.'
                        );
                    } else if (response.code === 'UserNotConfirmedException') {
                        setWebViewSourceUrl({
                            uri: `${Config.verificationUrl}?data=${email}`,
                        });
                        setWebViewFlagForUserVerification(true);
                    } else {
                        Toast.show(response.message);
                    }
                }
            })
            .catch((error) => {
                setLoading(false);
                Toast.show('Something went wrong');
            });
    };

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const ForgetYourPassword = () => {
        setWebViewSourceUrl({
            uri: `${Config.forgotPasswordLink}?data=forgotPasswordUsingMobileApp`,
        });
        setWebViewFlagForForgotPassword(true);
    };

    const gotoSignUpPage = () => {
        setWebViewSourceUrl({
            uri: `${Config.signUp}?data=signupUsingMobileApp`,
        });
        setWebViewFlagForSignUp(true);
    };

    const handleMessageReciveFromWebsite = (event) => {
        const data = JSON.parse(event.nativeEvent.data);
        setWebViewFlagForSignUp(false);
        setWebViewFlagForUserVerification(false);
        setWebViewFlagForForgotPassword(false);
        if (data.message === 'sucessfully') {
            Toast.show('Action completed successfully');
        }
    };

    // ✅ WebView handler
    if (
        webViewFlagForSignUp ||
        webViewFlagForUserVerification ||
        webViewFlagForForgotPassword
    ) {
        return (

            <WebView
                source={webViewSourceUrl}
                mediaPlaybackRequiresUserAction={false}
                allowsInlineMediaPlayback
                javaScriptEnabled
                domStorageEnabled
                onMessage={handleMessageReciveFromWebsite}
            />

        );
    }

    // ✅ Main login layout
    return (

        <KeyboardAvoidingView
            style={LoginStyle.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Loader loading={loading} />
            <View style={LoginStyle.logincontainer}>
                <Image
                    source={require('../../../Utility/Public/images/oaktreeLogo.png')}
                    style={[LoginStyle.oaktreeLogo]}
                />
                <View style={LoginStyle.loginBox}>
                    <Text style={LoginStyle.loginTxt}>Login</Text>
                    <View style={LoginStyle.inputContainerBoxes}>
                        <View style={LoginStyle.inputContainer}>
                            <TextInput
                                style={LoginStyle.input}
                                placeholder="Username"
                                placeholderTextColor={Colors.gray99}
                                value={email}
                                onChangeText={(text) => { setEmail(text); setEmailError("") }}
                                returnKeyLabel='Done'
                                returnKeyType='done'
                                //onSubmitEditing={() => { loginSubmit() }}
                                autoCapitalize="none"
                            />
                            {emailError != "" ? <Text style={LoginStyle.errorMsg}>{emailError}</Text> : null}
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
                    </View>
                    {/* Forgot password */}
                    <View style={LoginStyle.forgetYourPasswordBox}>
                        <TouchableOpacity style={LoginStyle.ForgetYourPassword} onPress={ForgetYourPassword}>
                            <Text style={LoginStyle.ForgetYourPasswordText}>Forgot your password ?</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={LoginStyle.loginBtnInner}>
                        <TouchableOpacity style={LoginStyle.loginButton} onPress={loginSubmit}>
                            <Text style={LoginStyle.loginButtonText}>Log In</Text>
                        </TouchableOpacity>

                    </View>
                    <View style={LoginStyle.signUpRow}>
                        <Text style={LoginStyle.signUpText}>
                            Don't have an account ?{' '}
                            <Text style={LoginStyle.signUpLink} onPress={gotoSignUpPage}>
                                Sign up
                            </Text>
                        </Text>
                        {/* <View style={LoginStyle.signUpUnderline}></View> */}
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>

    );
}

const mapStateToProps = (globalState) => ({});
export default connect(mapStateToProps, { setToken, setUserDetails })(LoginScreen);
