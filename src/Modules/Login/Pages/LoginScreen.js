import React, { useState, useEffect, useContext, useRef } from 'react';
import * as Keychain from 'react-native-keychain';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  BackHandler,
  Dimensions,
  KeyboardAvoidingView,
  Platform, // ✅ you were using Platform but not importing it
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
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';

// 🔑 Single Keychain service name for storing last-used email + password
// const LAST_LOGIN_SERVICE = 'last-login';

function LoginScreen(props) {
  const authContext = useContext(AuthContext);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const chooseEnv = useSelector((state) => state.environment);

  // ✅ proper ref (avoid `this.passwordInput` in function components)
  const passwordRef = useRef(null);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isconnected, setIsconnected] = useState(false);

  const [webViewFlagForSignUp, setWebViewFlagForSignUp] = useState(false);
  const [webViewFlagForUserVerification, setWebViewFlagForUserVerification] = useState(false);
  const [webViewFlagForForgotPassword, setWebViewFlagForForgotPassword] = useState(false);
  const [webViewSourceUrl, setWebViewSourceUrl] = useState({});

  // ✅ Load last-used email + password from Keychain on mount
  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const creds = await Keychain.getGenericPassword({ service: LAST_LOGIN_SERVICE });
  //       if (creds) {
  //         // We store email as "username" and password as "password"
  //         setEmail(creds.username || '');
  //         setPassword(creds.password || '');
  //       }
  //     } catch {
  //       // ignore (don't block UI)
  //     }
  //   })();
  // }, []);

  // ✅ Store last-used email + password after successful login
  // const saveLastLogin = async (emailValue, passwordValue) => {
  //   try {
  //     await Keychain.setGenericPassword(emailValue, passwordValue, {
  //       service: LAST_LOGIN_SERVICE,
  //       accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED, // iOS option
  //     });
  //   } catch {
  //     // ignore
  //   }
  // };

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
      if (webViewFlagForSignUp || webViewFlagForUserVerification || webViewFlagForForgotPassword) {
        setWebViewFlagForSignUp(false);
        setWebViewFlagForUserVerification(false);
        setWebViewFlagForForgotPassword(false);
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackButtonPress);
    return () => backHandler.remove();
  }, [webViewFlagForSignUp, webViewFlagForUserVerification, webViewFlagForForgotPassword]);

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
        if (response?.data?.loginUserDetails?.accountStatus === 0) {
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

          // 🔑 Save last-used login (email + password) to Keychain
        //  await saveLastLogin(email, password);
        } else if (response.status === 0) {
          if (response.code === 'NotAuthorizedException') {
            Toast.show('The email or password you entered do not match with those provided at sign up.');
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
      .catch(() => {
        setLoading(false);
        Toast.show('Something went wrong');
      });
  };
  
    // const loginSubmit = () => {
    //     if (isconnected) {
    //         try {
    //             let valid = validation();
    //             if (valid) {
    //                 let data = {}
    //                 data["email"] = email
    //                 data["password"] = password
    //                 //data["userEnd"] = "customerEnd"
    //                 // data["userEnd"] = "backOffice"
    //                 setLoading(true);
    //                 loginGetApi(data).then(async (response) => {
    //                     console.log("response>>>>>>>>>>", response)
    //                     console.log("response>>>>>>>>>>", response.data.loginUserDetails)
    //                     setLoading(false);
    //                     if(response.data.loginUserDetails.accountStatus === 0){
    //                         Toast.show("Your Account is Deactivated. Please contact Administrator");
    //                         return;
    //                     }
    //                     if (response.status === 1) {
    //                         // setLoginAnimationFlag(true)
    //                         // setTimeout(async() => {
    //                         const tokenHash = {
    //                             refreshToken: response.data.refreshToken,
    //                             accesToken: response.data.accessToken,
    //                             tokenExpiryDate: response.data.expiresIn,
    //                             loginUserId: response.data.loginUserDetails.identificationKey
    //                         };

    //                         dispatch(setToken(tokenHash));
    //                         // dispatch({ type: 'SET_TOKEN', payload: tokenHash });
    //                         let userRowData = response.data.loginUserDetails;
    //                         // dispatch({ type: 'SET_USER_DETAILS', payload: userRowData});
    //                         //console.log("userRowData", userRowData);
    //                         dispatch(setUserDetails(userRowData));
    //                         Toast.show("You are logged in");
    //                         await _storeData(response)
    //                         //  navigation.navigate("Appointment");
    //                         // setLoginAnimationFlag(false)
    //                         // }, 300);
    //                     } else if (response.status === 0) {
    //                         if (response.code == "NotAuthorizedException") {
    //                             Toast.show("The email or password you have entered do not match with those provided at sign up.");
    //                         } else if (response.code == "UserNotConfirmedException") {
    //                             setWebViewSourceUrl({ uri: `${Config.verificationUrl}?data=${email}` })
    //                             setWebViewFlagForUserVerification(true);
    //                             //  navigation.navigate("Verification")
    //                             // Linking.openURL(Config.verificationUrl + "?data=" + email).catch((err) => console.error("Couldn't load page", err));
    //                         } else {
    //                             Toast.show(response.message);
    //                         }
    //                     }
    //                 }).catch((error) => {
    //                     //console.log("===error: " + error.response.data);

    //                     setLoading(false);
    //                     //Toast.show(`Session expired please login again`);
    //                 });

    //             } else {
    //                 setLoading(false);
    //             }
    //         } catch (error) {
    //             console.error("Error fetching questionnaire list:", error);
    //             setLoading(false);
    //             // Handle error here (e.g., show a toast or alert)
    //         }
    //     } else {
    //         Toast.show("No internet connection");
    //     }
    // }

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
  if (webViewFlagForSignUp || webViewFlagForUserVerification || webViewFlagForForgotPassword) {
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
          <Text allowFontScaling={false} style={LoginStyle.loginTxt}>
            Login
          </Text>
          <View style={LoginStyle.inputContainerBoxes}>
            <View style={LoginStyle.inputContainer}>
              <TextInput
                style={LoginStyle.input}
                allowFontScaling={false}
                placeholder="Email"
                placeholderTextColor={Colors.gray99}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailError('');
                }}
                returnKeyLabel="Next"
                returnKeyType="next"
                autoCapitalize="none"
                autoComplete="email"
                // 🔑 iOS prefers 'username' to pair with password for AutoFill
                textContentType="username"
                autoCorrect={false}
                spellCheck={false}
                keyboardType="email-address"
                blurOnSubmit={false}
                onSubmitEditing={() => {
                  passwordRef.current?.focus();
                }}
              />
              {emailError !== '' ? (
                <Text allowFontScaling={false} style={LoginStyle.errorMsg}>
                  {emailError}
                </Text>
              ) : null}
            </View>

            <View style={LoginStyle.inputContainer}>
              <TextInput
                ref={passwordRef}
                style={[LoginStyle.input, { flex: 1 }]}
                allowFontScaling={false}
                placeholder="Password"
                placeholderTextColor={Colors.gray99}
                secureTextEntry={!isPasswordVisible}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError('');
                }}
                returnKeyLabel="Go"
                returnKeyType="go"
                autoComplete="password"
                textContentType="password"
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                onSubmitEditing={loginSubmit}
                enablesReturnKeyAutomatically
                contextMenuHidden
                importantForAutofill="yes"
              />
              <TouchableOpacity onPress={togglePasswordVisibility}>
                <Feather
                  name={isPasswordVisible ? 'eye' : 'eye-off'}
                  size={22}
                  color={Colors.secondary}
                />
              </TouchableOpacity>
              {passwordError !== '' ? (
                <Text allowFontScaling={false} style={LoginStyle.errorMsg}>
                  {passwordError}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Forgot password */}
          <View style={LoginStyle.forgetYourPasswordBox}>
            <TouchableOpacity style={LoginStyle.ForgetYourPassword} onPress={ForgetYourPassword}>
              <Text allowFontScaling={false} style={LoginStyle.ForgetYourPasswordText}>
                Forgot your password ?
              </Text>
            </TouchableOpacity>
          </View>

          <View style={LoginStyle.loginBtnInner}>
            <TouchableOpacity style={LoginStyle.loginButton} onPress={loginSubmit}>
              <Text allowFontScaling={false} style={LoginStyle.loginButtonText}>
                Log In
              </Text>
            </TouchableOpacity>
          </View>

          <View style={LoginStyle.signUpRow}>
            <Text allowFontScaling={false} style={LoginStyle.signUpText}>
              Don't have an account ?{' '}
              <Text allowFontScaling={false} style={LoginStyle.signUpLink} onPress={gotoSignUpPage}>
                Sign up
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const mapStateToProps = (globalState) => ({});
export default connect(mapStateToProps, { setToken, setUserDetails })(LoginScreen);
