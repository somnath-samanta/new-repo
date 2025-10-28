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
  SafeAreaView
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
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <WebView
          source={webViewSourceUrl}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback
          javaScriptEnabled
          domStorageEnabled
          onMessage={handleMessageReciveFromWebsite}
        />
      </SafeAreaView>
    );
  }

  // ✅ Main login layout
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
      <KeyboardAwareScrollView
        style={LoginStyle.container}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: responsiveWidth(6),
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Loader loading={loading} />
        <View style={[LoginStyle.loginBox, { width: '100%' }]}>
          <Image
            source={require('../../../Utility/Public/images/oaktreeLogo.png')}
            style={{
              height: responsiveHeight(15),
              width: responsiveWidth(60),
              resizeMode: 'contain',
              alignSelf: 'center',
              marginBottom: responsiveHeight(4),
            }}
          />

          <Text
            style={{
              fontSize: responsiveFontSize(2.6),
              fontWeight: '700',
              color: Colors.black,
              textAlign: 'center',
              marginBottom: responsiveHeight(2),
            }}
          >
            Login
          </Text>

          {/* Email Input */}
          <View style={{ marginBottom: responsiveHeight(2), width: '100%' }}>
            <TextInput
              style={[
                LoginStyle.input,
                {
                  height: responsiveHeight(6),
                  fontSize: responsiveFontSize(2),
                  paddingHorizontal: responsiveWidth(4),
                },
              ]}
              placeholder="Username"
              placeholderTextColor={Colors.gray99}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError('');
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="done"
            />
            {emailError ? (
              <Text style={LoginStyle.errorMsg}>{emailError}</Text>
            ) : null}
          </View>

          {/* Password Input */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: Colors.white,
              borderWidth: 1,
              borderColor: Colors.grayE3,
              borderRadius: 8,
              paddingHorizontal: responsiveWidth(3),
              height: responsiveHeight(6),
            }}
          >
            <TextInput
              style={{
                flex: 1,
                fontSize: responsiveFontSize(2),
                color: Colors.black,
              }}
              placeholder="Password"
              placeholderTextColor={Colors.gray99}
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError('');
              }}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={togglePasswordVisibility}>
              <Feather
                name={isPasswordVisible ? 'eye' : 'eye-off'}
                size={22}
                color={Colors.secondary}
              />
            </TouchableOpacity>
          </View>
          {passwordError ? (
            <Text style={LoginStyle.errorMsg}>{passwordError}</Text>
          ) : null}

          {/* Forgot password */}
          <TouchableOpacity
            style={{ marginTop: responsiveHeight(1.5), alignSelf: 'flex-end' }}
            onPress={ForgetYourPassword}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(1.8),
                color: Colors.secondary,
              }}
            >
              Forgot your password?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              LoginStyle.loginButton,
              {
                marginTop: responsiveHeight(3),
                height: responsiveHeight(6),
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: Colors.secondary,
              },
            ]}
            onPress={loginSubmit}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(2.2),
                color: Colors.white,
                fontWeight: '600',
              }}
            >
              Log In
            </Text>
          </TouchableOpacity>

          {/* Signup */}
          <View
            style={{
              marginTop: responsiveHeight(3),
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(1.9),
                color: Colors.black,
              }}
            >
              Don't have an account?{' '}
            </Text>
            <Text
              onPress={gotoSignUpPage}
              style={{
                fontSize: responsiveFontSize(1.9),
                color: Colors.secondary,
                fontWeight: 'bold',
              }}
            >
              Sign up
            </Text>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const mapStateToProps = (globalState) => ({});
export default connect(mapStateToProps, { setToken, setUserDetails })(LoginScreen);
