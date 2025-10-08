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
    Dimensions,
    BackHandler
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LoginStyle from '../Public/css/LoginStyle';
import Colors from '../../../Utility/Colors';
import Config from '../../../Utility/Config';
import Feather from 'react-native-vector-icons/Feather';
import Cookies from 'js-cookie';
import { loginGetApi, getCurrentUser, userOrganisationGet } from '../Controller/LoginController'
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
import { WebView } from 'react-native-webview';
// import LoginAnimation from '../../../Utility/Components/LoginAnimation'

function LoginScreen(props) {
    const authContext = useContext(AuthContext);
    const navigation = useNavigation();
    const dispatch = useDispatch();
    //console.log("navigation==", navigation)
    //rbladmin@yopmail.com

    //#GHb5lt3
    const chooseEnv = useSelector((state) => state.environment);
    const State = useSelector((state) => state);

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    //const [email, setEmail] = useState(__DEV__ ? "app.admin@hotelmanage.com" : "");
    //const [password, setPassword] = useState(__DEV__ ? "Admin@123!" : "");
    const [email, setEmail] = useState(__DEV__ ? "ankita.das@yopmail.com" : "");
    const [password, setPassword] = useState(__DEV__ ? "Mettle1!2" : "");

    const [isRemember, setIsRemember] = useState(Cookies.get('rememberMe') == 'true' ? true : false);
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isconnected, setIsconnected] = useState(false);
    const [loginAnimationFlag, setLoginAnimationFlag] = useState(false);
    const [webViewFlagForSignUp, setWebViewFlagForSignUp] = useState(false);
    const [webViewFlagForUserVerification, setWebViewFlagForUserVerification] = useState(false);
    const [webViewFlagForForgotPassword, setWebViewFlagForForgotPassword] = useState(false);
    const [webViewSourceUrl, setWebViewSourceUrl] = useState({});


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

    useEffect(() => {
        const handleBackButtonPress = () => {
            if (webViewFlagForSignUp || webViewFlagForUserVerification || webViewFlagForForgotPassword) {
                // Go back to Component One
                setWebViewFlagForSignUp(false);
                setWebViewFlagForUserVerification(false);
                setWebViewFlagForForgotPassword(false);
                return true; // Prevent default back button behavior
            }
            return false; // Allow default behavior if already on Component One
        };

        // Add event listener
        /* BackHandler.addEventListener("hardwareBackPress", handleBackButtonPress);
 
         // Clean up event listener on component unmount
         return () => {
             BackHandler.removeEventListener("hardwareBackPress", handleBackButtonPress);
         };*/
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            handleBackButtonPress
        );

        return () => backHandler.remove(); // cleanup listener
    }, [webViewFlagForSignUp, webViewFlagForUserVerification, webViewFlagForForgotPassword]);


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

        if (password.trim() === "") {
            valid = false;
            setPasswordError("Please enter password")
        } else if (password.length < 6) {
            valid = false;
            setPasswordError("Password must be at least 6 characters.")
        } else {
            setPasswordError("")
        }
        return valid;
    }




    loginSubmit = () => {
        if (isconnected) {
            try {
                let valid = validation();
                if (valid) {
                    let data = {}
                    data["email"] = email
                    data["password"] = password
                    //data["userEnd"] = "customerEnd"
                    // data["userEnd"] = "backOffice"
                    setLoading(true);
                    loginGetApi(data).then(async (response) => {
                        console.log("response>>>>>>>>>>", response)
                        setLoading(false);
                        if (response.status === 1) {
                            // setLoginAnimationFlag(true)
                            // setTimeout(async() => {
                            const tokenHash = {
                                refreshToken: response.data.refreshToken,
                                accesToken: response.data.accessToken,
                                tokenExpiryDate: response.data.expiresIn,
                                loginUserId: response.data.loginUserDetails.identificationKey
                            };

                            dispatch(setToken(tokenHash));
                            // dispatch({ type: 'SET_TOKEN', payload: tokenHash });
                            let userRowData = response.data.loginUserDetails;
                            // dispatch({ type: 'SET_USER_DETAILS', payload: userRowData});
                            //console.log("userRowData", userRowData);
                            dispatch(setUserDetails(userRowData));
                            Toast.show("You are logged in");
                            await _storeData(response)
                            //  navigation.navigate("Appointment");
                            // setLoginAnimationFlag(false)
                            // }, 300);
                        } else if (response.status === 0) {
                            if (response.code == "NotAuthorizedException") {
                                Toast.show("The email or password you have entered do not match with those provided at sign up.");
                            } else if (response.code == "UserNotConfirmedException") {
                                setWebViewSourceUrl({ uri: `${Config.verificationUrl}?data=${email}` })
                                setWebViewFlagForUserVerification(true);
                                //  navigation.navigate("Verification")
                                // Linking.openURL(Config.verificationUrl + "?data=" + email).catch((err) => console.error("Couldn't load page", err));
                            } else {
                                Toast.show(response.message);
                            }
                        }
                    }).catch((error) => {
                        //console.log("===error: " + error.response.data);

                        setLoading(false);
                        //Toast.show(`Session expired please login again`);
                    });

                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching questionnaire list:", error);
                setLoading(false);
                // Handle error here (e.g., show a toast or alert)
            }
        } else {
            Toast.show("No internet connection");
        }
    }

    _storeData = async (response) => {
        try {
            const tokenHash = {
                refreshToken: response.data.refreshToken,
                accesToken: response.data.accessToken,
                tokenExpiryDate: response.data.expiresIn,
                loginUserId: response.data.loginUserDetails.identificationKey
            };
            // const finalIdToken = "Bearer " + response.data.idToken;
            // await AsyncStorage.setItem('finalIdToken', finalIdToken);
            // await AsyncStorage.setItem('i18nextLng', "en");
            await AsyncStorage.setItem('token', response.data.accessToken);
            // await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
            // const expiresIn = await getExpiryDetails(response.data.expiresIn)
            // await AsyncStorage.setItem('loginTime', JSON.stringify(expiresIn));
            // await getuserOrginazationFunction(finalIdToken);

        } catch (error) {
            // Error saving data
        }
    };

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
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



    // useEffect(() => {
    //     console.log("SelectedValue=========", selectedValue)
    // }, [selectedValue])

    // const ForgetYourPassword = () => {
    //     Linking.openURL(Config.forgotPasswordLink).catch((err) => console.error("Couldn't load page", err));
    // }
    const ForgetYourPassword = () => {
        setWebViewSourceUrl({ uri: `${Config.forgotPasswordLink}?data=forgotPasswordUsingMobileApp` })
        setWebViewFlagForUserVerification(true);
        /* Alert.alert(
             "Confirmation",
             "Are you sure you want to proceed to the Forgot Password page?",
             [
                 {
                     text: "Cancel",
                     style: "cancel",
                 },
                 {
                     text: "Yes",
                     onPress: () => {
                         // Linking.openURL(Config.forgotPasswordLink).catch((err) =>
                         //     console.error("Couldn't load page", err)
                         // );
                         navigation.navigate("ForgotPassword")
                     },
                 },
             ],
             { cancelable: true } // Allow dismissal by tapping outside the alert
         );*/

        // navigation.navigate("ForgotPassword")
    };

    // const gotoSignUpPage = () => {
    //     Linking.openURL(Config.signUp).catch((err) => console.error("Couldn't load page", err));
    // }
    const gotoSignUpPage = () => {
        console.log(`${Config.signUp}?data=signupUsingMobileApp`);
        setWebViewSourceUrl({ uri: `${Config.signUp}?data=signupUsingMobileApp` })
        setWebViewFlagForSignUp(true);

        // navigation.navigate("Signup")
    };
    const gotoVerificationPage = () => {
        navigation.navigate("Verification")
    };

    const handleMessageReciveFromWebsite = (event) => {
        const data = JSON.parse(event.nativeEvent.data);
        setWebViewFlagForSignUp(false);
        setWebViewFlagForUserVerification(false);
        setWebViewFlagForForgotPassword(false);
        console.log("==============================================", data.message);
        if (data.message === "sucessfully") {
            let successMessage = ""
            if (webViewFlagForSignUp) {
                successMessage = "Sign up successfully"
            } else if (webViewFlagForForgotPassword) {
                successMessage = "Password updated successfully"
            } else {
                successMessage = "Verification code validated successfully"
            }
            Toast.show(successMessage);
        } else if (data.message === "backToLoginScreen") {
            // When the website's back button is pressed.
            // setWebViewFlagForSignUp(false);
            // setWebViewFlagForUserVerification(false);
            // setWebViewFlagForForgotPassword(false);
        }
    }

    return (
        <>
            {
                webViewFlagForSignUp || webViewFlagForUserVerification || webViewFlagForForgotPassword ?

                    <WebView
                        source={webViewSourceUrl}
                        mediaPlaybackRequiresUserAction={false}
                        allowsInlineMediaPlayback={true}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        onMessage={handleMessageReciveFromWebsite}
                    />
                    :
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
                                        <Text style={LoginStyle.loginTxt}>Login</Text>
                                        <View style={LoginStyle.inputContainerBoxes}>
                                            <View style={LoginStyle.inputContainer}>
                                                <TextInput
                                                    style={LoginStyle.input}
                                                    placeholder="Email"
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
                                        {/*  //////////////Verification button/////////////////////////*/}
                                        {/* <View style={LoginStyle.signUpRow}>
                                    <Text style={LoginStyle.signUpText}>
                                        <Text style={LoginStyle.signUpLink} onPress={gotoVerificationPage}>
                                        Verification
                                        </Text>
                                    </Text>
                                </View>  */}
                                    </View >
                                </View >

                            </View>
                            {/* </TouchableWithoutFeedback> */}
                        </>
                    </KeyboardAwareScrollView>
            }
        </>

    );
}

const mapStateToProps = (globalState) => {
    return {
        //token: globalState.token

    };
}

// export default LoginScreen;
export default connect(mapStateToProps, { setToken, setUserDetails })(LoginScreen);