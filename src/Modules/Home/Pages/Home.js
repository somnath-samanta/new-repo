import React, { useState, useEffect, useCallback } from 'react';
import {
  FlatList,
  Text,
  TextInput,
  useColorScheme,
  View,
  TouchableOpacity,
  Image,
  Button,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Dimensions,
  Platform,
  Animated,
  Easing,
  Alert,
  BackHandler,
  StatusBar,
  PixelRatio,
} from 'react-native';

import { useSelector, useDispatch } from 'react-redux';
import Loader from '../../../Utility/Components/Loader';
import Config from '../../../Utility/Config';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EventEmitter from '../../../Contexts/EventEmitter';
import { LogOut } from '../../../Utility/Components/LogOut';
import { WebView } from 'react-native-webview';
import CustomHeader from '../../../Utility/Components/CustomHeader';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

/* ------------------ Responsive helpers (PixelRatio + Dimensions) ------------------ */
// Base device you designed for
const BASE_WIDTH = 375; // iPhone 11 width
const BASE_HEIGHT = 812; // iPhone 11 height

const { width: W, height: H } = Dimensions.get('window');

const scale = (size) => (W / BASE_WIDTH) * size; // horizontal / general
const vScale = (size) => (H / BASE_HEIGHT) * size; // vertical
const mScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// Keep fonts visually consistent even if user bumps system font size
const font = (size) =>
  Math.round(PixelRatio.roundToNearestPixel(size / PixelRatio.getFontScale()));
/* ---------------------------------------------------------------------------------- */

// disable font scaling globally for Text / TextInput
if (Text.defaultProps == null) Text.defaultProps = {};
Text.defaultProps.allowFontScaling = false;
if (TextInput.defaultProps == null) TextInput.defaultProps = {};
TextInput.defaultProps.allowFontScaling = false;

/* ------------------ Dimension-driven flags ------------------ */
const screen = Dimensions.get('window');
const screenWidth = screen.width;
const screenHeight = screen.height;
const isSmallDevice = screenHeight < 700;
const isLargeDevice = screenHeight > 800;

// Responsive height calculations
const welcomeLogoHeight = isSmallDevice ? screenHeight * 0.08 : screenHeight * 0.1;
const welcomeMSGHeight = isSmallDevice ? screenHeight * 0.05 : screenHeight * 0.06;
const viewButtonHeight = isSmallDevice ? screenHeight * 0.17 : screenHeight * 0.18;
const buttonSpacing = isSmallDevice ? 8 : 8;
const mydocumentheight = screenHeight * (Platform.OS === 'ios' ? 0.22 : 0.26);
/* -------------------------------------------------------------------------- */

function Home({ props }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const reduxAuthJson = useSelector((state) => state);

  const [pageLoading, setPageLoading] = useState(false);
  const [filterFlag, setFilterFlag] = useState(false);
  const [webViewFlag, setWebViewFlag] = useState(false);
  const [webViewData, setWebViewData] = useState('');
  const snapPoints = ['50%'];
  const { clearLocalStorage } = LogOut();

  const hideBookAppointmentScreen = useCallback(() => {
    setWebViewFlag(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        hideBookAppointmentScreen();
      };
    }, [hideBookAppointmentScreen])
  );

  useEffect(() => {
    const handleBackButtonPress = () => {
      if (webViewFlag) {
        setWebViewFlag(false);
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButtonPress
    );
    return () => backHandler.remove();
  }, [webViewFlag]);

  const handleFilter = () => setFilterFlag(!filterFlag);

  const handleBackPress = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  const appointmentLink = async () => {
    navigation.navigate('Appointment', { reload: true });
  };
  const questionnaireLink = async () => {
    navigation.navigate('Questionnaire', { questionnairereload: true });
  };
  const myDocumentLink = async () => {
    navigation.navigate('MyDocument');
  };
  const thirdPartyDocumentLink = async () => {
    navigation.navigate('ThirdPartyDocument');
  };
  const healthParameterLink = async () => {
    navigation.navigate('HealthParameter');
  };

  const goToAppointmentScreen = () => {
    let dataHash = {
      refreshToken: reduxAuthJson.token.refreshToken,
      accesToken: reduxAuthJson.token.accesToken,
      tokenExpiryDate: reduxAuthJson.token.tokenExpiryDate,
      PatientDetails: reduxAuthJson.currentUserDetails,
    };
    const data = JSON.stringify(dataHash);
    const encodedData = encodeURIComponent(data);
    setWebViewData(encodedData);
    setWebViewFlag(true);
  };

  const logoutApp = () => {
    Alert.alert(
      'Confirmation',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => clearLocalStorage(true) },
      ],
      { cancelable: false }
    );
  };

  const handleMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    setWebViewFlag(false);
    if (data.message === 'save successfully') {
      navigation.navigate('Appointment', { reload: true });
    }
  };

  const renderWebView = useCallback(
    () => (
      <>
        <CustomHeader
          pageName={'Book an Appointment'}
          hideBookAppointmentScreen={hideBookAppointmentScreen}
        />
        <View style={{ flex: 1 }}>
          <WebView
            style={{ flex: 1 }}
            source={{ uri: `${Config.bookingUrl}?data=${webViewData}` }}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback
            javaScriptEnabled
            domStorageEnabled
            onMessage={handleMessage}
          />
        </View>
      </>
    ),
    [webViewData, hideBookAppointmentScreen]
  );

  return (
    <SafeAreaView
      style={styles.safeArea}
      // we only protect bottom / sides to keep same top look as image B
      edges={['bottom', 'left', 'right']}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#dff7f8" />
      <Loader style={styles.loadingCss} loading={pageLoading} />

      {webViewFlag ? (
        renderWebView()
      ) : (
        <View
          style={[
            styles.container,
            // bottom adjusts automatically for nav bar / home indicator
            { paddingBottom: insets.bottom || vScale(12) },
          ]}
        >
          {/* Logo (same position as your previous layout) */}
          <Image
            source={require('../../../Utility/Public/images/oaktreeLogo.png')}
            style={styles.oaktreeLogo}
            resizeMode="contain"
          />

          {/* Signout icon (same position as your previous layout) */}
          <TouchableOpacity
            style={styles.signout}
            onPress={logoutApp}
          >
            <Image
              source={require('../../../Utility/Public/images/signout.png')}
              style={{ width: scale(24), height: vScale(24) }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <View style={styles.panel}>
            <View style={styles.topPanelTaxtBox}>
              <Text style={styles.topPanelTaxt}>
                Welcome to Oaktree Connect
              </Text>
            </View>

            <View style={styles.contentContainer}>
              <TouchableOpacity
                style={[styles.panelBox, styles.panelBoxDocument]}
                onPress={appointmentLink}
              >
                <View style={styles.innerPanelBoxDocument}>
                  <Image
                    source={require('../../../Utility/Public/images/clock.png')}
                    style={[styles.calenderImage, styles.clockImagedocument]}
                    resizeMode="contain"
                  />
                  <Image
                    source={require('../../../Utility/Public/images/calender.png')}
                    style={[
                      styles.calenderImage,
                      styles.calenderImagedocument,
                    ]}
                    resizeMode="contain"
                  />
                </View>
                <View
                  style={[
                    styles.panelBoxRightMainTextDown,
                    styles.panelBoxRightMainTextDownDocument,
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.9}
                    style={styles.panelBoxRightMainTextDownDocumentText}
                  >
                    View & Start Appointment
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.middlePanelBoxes}>
                <TouchableOpacity
                  style={styles.middlePanelBox}
                  onPress={thirdPartyDocumentLink}
                >
                  <Image
                    source={require('../../../Utility/Public/images/icon1.png')}
                    style={[styles.calenderImage, styles.appointmentsIcon]}
                    resizeMode="contain"
                  />
                  <Text
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    minimumFontScale={0.9}
                    style={styles.panelBoxRightMainTextDown}
                  >
                    View / Upload{'\n'}3rd Party Documents
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.middlePanelBox}
                  onPress={myDocumentLink}
                >
                  <Image
                    source={require('../../../Utility/Public/images/icon2.png')}
                    style={[styles.calenderImage, styles.appointmentsIcon]}
                    resizeMode="contain"
                  />
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.9}
                    style={styles.panelBoxRightMainTextDown}
                  >
                    Upload ID
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.middlePanelBoxRight}>
                <Text style={styles.myTherapyTasksText}>My Therapy Tasks</Text>
                <View style={styles.myTherapyTasks}>
                  <TouchableOpacity
                    style={styles.myTherapyTasksPanelBox}
                    onPress={healthParameterLink}
                  >
                    <View style={styles.roundiconBox}>
                      <Image
                        source={require('../Public/images/physicalParametersIcon.png')}
                        style={styles.heartRatingImage}
                        resizeMode="contain"
                      />
                    </View>
                    <Text
                      numberOfLines={2}
                      adjustsFontSizeToFit
                      minimumFontScale={0.9}
                      style={styles.panelBoxRightMainTextDown}
                    >
                      View / Add{'\n'}Physical Parameters
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.myTherapyTasksPanelBox}
                    onPress={questionnaireLink}
                  >
                    <View style={styles.roundiconBox}>
                      <Image
                        source={require('../Public/images/questionnairesIcon.png')}
                        style={styles.calenderImage}
                        resizeMode="contain"
                      />
                    </View>
                    <Text
                      numberOfLines={2}
                      adjustsFontSizeToFit
                      minimumFontScale={0.9}
                      style={styles.panelBoxRightMainTextDown}
                    >
                      View / Complete{'\n'}Questionnaires
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

export default Home;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#dff7f8',
    flex: 1,
  },
  container: {
    flex: 1,
    width: '100%',
  },
  panel: {
    flex: 1,
    width: '100%',
    paddingHorizontal: scale(isSmallDevice ? 15 : 20),
    paddingTop: isSmallDevice
      ? welcomeLogoHeight * 1.5
      : welcomeLogoHeight * 1.2,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    paddingBottom: vScale((isSmallDevice ? 10 : 20) + 8),
  },
  loadingCss: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  oaktreeLogo: {
    height: vScale(110),
    width: scale(110),
    position: 'absolute',
    left: scale(-20),
    top: vScale(-10), // same as your original (image B)
  },
  signout: {
    height: vScale(isSmallDevice ? 36 : 40),
    width: scale(isSmallDevice ? 36 : 40),
    position: 'absolute',
    right: scale(isSmallDevice ? 10 : 15),
    top: vScale(isSmallDevice ? 10 : 15), // same as your original (image B)
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9,
  },

  topPanelTaxtBox: {
    margin: 0,
    padding: 0,
    width: '100%',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? vScale(20) : vScale(2),
    paddingBottom: Platform.OS === 'ios' ? vScale(15) : vScale(2),
  },
  topPanelTaxt: {
    fontSize: font(19),
    color: '#000',
    fontFamily: 'Montserrat-Medium',
    width: '100%',
    textAlign: 'center',
    fontWeight: '600',
  },

  panelBox: {
    backgroundColor: '#fff',
    padding: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#f3f3f3',
    borderRadius: scale(0),
    marginVertical: vScale(10),
    marginTop:Platform.OS === 'ios' ? 0 : 10,
  },
  panelBoxDocument: {
    flexDirection: 'column',
    padding: scale(15),
    paddingLeft: scale(30),
    paddingRight: scale(30),
    borderWidth: 1,
    borderColor: '#219980',
    minHeight: mydocumentheight,
    justifyContent: 'center',
    backgroundColor: '#219980',
    borderRadius: scale(10),
    shadowColor: Platform.OS === 'ios' ? '#666' : '#000',
    shadowOffset: { width: Platform.OS === 'ios' ? 0.8 : 1, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0.5,
    shadowRadius: scale(5),
    elevation: Platform.OS === 'ios' ? 3 : 5,
    textAlign: 'center',
  },
  innerPanelBoxDocument: {
    backgroundColor: '#def6f7',
    padding: scale(10),
    width: '100%',
    borderRadius: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  appointmentBox: {
    borderColor: '#333',
    justifyContent: 'center',
    padding: scale(20),
    paddingHorizontal: scale(55),
    textAlign: 'center',
    borderRadius: scale(5),
    shadowColor: Platform.OS === 'ios' ? '#666' : '#000',
    shadowOffset: { width: Platform.OS === 'ios' ? 0.8 : 1, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0.5,
    shadowRadius: scale(5),
    elevation: Platform.OS === 'ios' ? 3 : 5,
  },
  panelBoxText: {
    fontSize: font(20),
    color: '#333',
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
    lineHeight: font(30),
  },

  calenderImagedocument: {
    marginVertical: vScale(10),
    width: scale(93),
    height: vScale(88),
    marginLeft: scale(20),
  },
  clockImagedocument: {
    width: scale(87),
    height: vScale(80),
    marginTop: vScale(10),
  },
  appointmentsIcon: {
    width: scale(70),
    height: vScale(70),
  },

  panelBoxRightMainTextDown: {
    fontSize: font(13),
    color: '#000',
    fontFamily: 'Arimo-Bold',
    textAlign: 'center',
    width: '100%',
    lineHeight: font(16),
    marginTop: vScale(15),
    fontWeight: '700',
    paddingHorizontal: scale(0),
    flexShrink: 1,
  },
  panelBoxRightMainTextDownSec: {
    marginTop: vScale(0),
    textAlign: 'left',
  },

  panelBoxRightMainTextDownDocument: {
    backgroundColor: '#fff',
    padding: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(6),
    marginTop: vScale(10),
  },
  panelBoxRightMainTextDownDocumentText: {
    fontSize: font(15),
    color: '#000',
    lineHeight: font(18),
    fontFamily: 'Arimo-Bold',
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: scale(6),
    flexShrink: 1,
  },

  middlePanelBoxes: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: vScale(5),
  },
  middlePanelBox: {
    width: '48%',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(isSmallDevice ? 8 : 5),
    borderRadius: scale(10),
    shadowColor: Platform.OS === 'ios' ? '#666' : '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: scale(3.84),
    elevation: 5,
    minHeight: viewButtonHeight,
    borderWidth: 1,
    borderColor: '#3d3f3f',
  },
  middlePanelBoxRight: {
    backgroundColor: '#007b80',
    padding: scale(6),
    borderRadius: scale(10),
    shadowColor: Platform.OS === 'ios' ? '#666' : '#000',
    shadowOffset: { width: Platform.OS === 'ios' ? 0.8 : 1, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0.5,
    shadowRadius: scale(5),
    elevation: Platform.OS === 'ios' ? 3 : 5,
    borderColor: '#007b80',
    borderWidth: 2,
    marginTop: vScale(10),
  },
  myTherapyTasks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roundiconBox: {
    width: scale(70),
    height: vScale(70),
    backgroundColor: '#007b80',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calenderImage: {
    width: scale(40),
    height: vScale(40),
  },
  heartRatingImage: {
    width: scale(50),
    height: vScale(50),
  },
  myTherapyTasksPanelBox: {
    width: '48%',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(isSmallDevice ? 8 : 5),
    borderRadius: scale(10),
    shadowColor: Platform.OS === 'ios' ? '#666' : '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: scale(3.84),
    elevation: 5,
    minHeight: viewButtonHeight,
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: vScale(buttonSpacing),
  },
  myTherapyTasksText: {
    fontSize: font(15),
    color: '#fff',
    lineHeight: font(16),
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    padding: scale(5),
    marginBottom: vScale(6),
    fontWeight: '700',
  },
});
