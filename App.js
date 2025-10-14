// App.js
import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import 'react-native-gesture-handler';
import {
  StatusBar, AppState, LogBox, BackHandler, ToastAndroid, Alert
  } from 'react-native';
import { ThemeProvider } from './src/Contexts/ThemeContext';
import { MenuProvider } from 'react-native-popup-menu';
// import HomeScreen from './src/Modules/Booking/Pages/HomeScreen';
import ProfileScreen from './src/Modules/Profile/Pages/ProfileScreen';
import LoginScreen from './src/Modules/Login/Pages/LoginScreen';
import SignupScreen from './src/Modules/Login/Pages/SignupScreen';
import { enableScreens } from 'react-native-screens';
import CustomDrawerContent from './src/Utility/Components/CustomDrawer';
import ScreenWrapper from './src/Utility/Components/Wrapper';
import Colors from './src/Utility/Colors';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EventEmitter from './src/Contexts/EventEmitter';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { refershToken } from './src/Utility/Http';
import { getCurrentUser } from './src/Controller/CommonController'
import NetInfo from "@react-native-community/netinfo";
import { showMessage, hideMessage } from "react-native-flash-message";

import { navigationRef } from './src/Utility/Components/navigationService';

import AppointmentScreen from './src/Modules/Appointment/Pages/AppointmentScreen';
import QuestionnaireScreen from './src/Modules/Questionnaire/Pages/QuestionnaireScreen';
import MyDocument from './src/Modules/DocumentManagement/Pages/MyDocument';
import ThirdPartyDocument from './src/Modules/DocumentManagement/Pages/ThirdPartyDocument';
import Home from './src/Modules/Home/Pages/Home';
import { Provider } from 'react-redux';
import { store } from "./src/Store/configureStore"
import GeneralStatusBarColor from './src/Utility/Components/GeneralStatusBarColor';
import SwipeWrapper from './src/Utility/Components/SwipeWrapper';
import Verification from './src/Modules/Login/Pages/Verification';
import ForgotPassword from './src/Modules/Login/Pages/ForgotPassword';
import ResetPassword from './src/Modules/Login/Pages/ResetPassword';

enableScreens();
const Drawer = createDrawerNavigator();
const DefaultLayout = createStackNavigator();
LogBox.ignoreAllLogs();

//export const navigationRef = createNavigationContainerRef(+++++++++++++++++);

const DefaultLayoutScreen = ({ navigation }) => (
  <DefaultLayout.Navigator>
    <DefaultLayout.Screen
      name="Login"
      component={LoginScreen}
      options={{
        headerShown: false
      }}
    />
    <DefaultLayout.Screen
      name="Signup"
      component={SignupScreen}
      options={{
        headerShown: false
      }}
    />
    <DefaultLayout.Screen
      name="Verification"
      component={Verification}
      options={{
        headerShown: false
      }}
    /> 
    <DefaultLayout.Screen
      name="ForgotPassword"
      component={ForgotPassword}
      options={{
        headerShown: false
      }}
    />
    <DefaultLayout.Screen
      name="ResetPassword"
      component={ResetPassword}
      options={{
        headerShown: false
      }}
    />

  </DefaultLayout.Navigator>
);

function App() {
  const dispatch = useDispatch();
  let [token, setToken] = useState("");
  const [isConnected, setIsConnected] = useState(true);
  const [appState, setAppState] = useState(AppState.currentState);
  const [screens, setScreens] = useState([]);
  const [hasAdditionalView, setHasAdditionalView] = useState(false);
  const [exitApp, setExitApp] = useState(false);
  const tokenData = useSelector((state) => {
    // console.log("===========",state);
    return state.token?.accesToken || "";
  });
  
  /*useEffect(() => {
    const backAction = () => {
      // Prevent back action if we are on the root screen
      if (navigationRef.canGoBack()) {
        navigationRef.goBack();
        return true; // Prevent default behavior (exit app)
      }

      // Optionally show a confirmation dialog if the user tries to exit
      Alert.alert('Exit App', 'Are you sure you want to exit?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => BackHandler.exitApp(), // Exit the app
        },
      ]);
      return true; // Prevent default exit behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    // Cleanup event listener on unmount
    return () => backHandler.remove();
  }, []);*/

  useEffect(() => {
    const backAction = () => {
      if (navigationRef.current?.canGoBack()) {
        navigationRef.current.goBack();
        return true; // handled, prevent default
      }
  
      // Show confirmation dialog before exiting
      Alert.alert("Exit App", "Are you sure you want to exit?", [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => BackHandler.exitApp(),
        },
      ]);
  
      return true; // prevent default exit
    };
  
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
  
    return () => backHandler.remove(); // cleanup
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);

      if (!state.isConnected) {
        showMessage({
          message: "You are offline",
          autoHide: false,
          type: 'danger',
          style: { marginTop: StatusBar.currentHeight }
        });
      } else {
        showMessage({
          message: "You are online",
          type: "info",
          style: { marginTop: StatusBar.currentHeight }
        });
      }
    });

    // Clean up the subscription when the component is unmounted
    return () => {
      unsubscribe();
    };
  }, []);

  const loginWithRefreshToken = async () => {
    if (appState == 'active') {
      let loginTime = await AsyncStorage.getItem('loginTime') != "" ? JSON.parse(await AsyncStorage.getItem('loginTime')) : "";
      //console.log("loginTime==========", loginTime)
      if (loginTime && loginTime != "") {
        let logingExpireTime = moment(loginTime.expiryTime);
        let currentDateTime = moment();
        //console.log("logingExpireTime======", logingExpireTime)
        //console.log("currentDateTime======", currentDateTime)
        if (currentDateTime.isAfter(logingExpireTime)) {
          refershToken();
          await getCurrentUserFunction(await AsyncStorage.getItem('finalIdToken'))
        } else {
          //console.log("The date and time have not expired yet.");
        }
      } else {
        //console.log("Login time blank")
      }
    }
  }
  const removeElementsBeforeHome = (screens) => {
    const homeIndex = screens.indexOf("Home"); // Find the index of "Home"

    // Check if "Home" exists in the array
    if (homeIndex !== -1) {
      return screens.slice(homeIndex); // Return a new array starting from "Home"
    }

    return screens; // If "Home" isn't found, return the original array
  };

  
  const getNextScreen = (currentScreen) => {
    const updatedScreens = [...screens];
    const currentIndex = updatedScreens.indexOf(currentScreen);
    if (currentIndex >= 0 && currentIndex < updatedScreens.length - 1) {
      return updatedScreens[currentIndex + 1];
    }
    return null; // No forward navigation possible
  };

  const onSwipeLeft = (gestureState) => {
    const currentScreen = navigationRef.getCurrentRoute()?.name;
    const nextScreen = getNextScreen(currentScreen);

    if (nextScreen && ["Home"].includes(currentScreen)) {
      navigationRef.navigate(nextScreen);
    } else {
      console.log('No forward navigation possible');
    }
  };
  const onSwipeRight = (gestureState)=> {
    const currentScreen = navigationRef.getCurrentRoute()?.name;
    if (navigationRef.canGoBack() && !hasAdditionalView) {
      navigationRef.goBack();
    }else{
      setHasAdditionalView(false)
      EventEmitter.emit("broadcustMessage", { "close_additional_view": true });
    }
  }
  const swipe_config = {
    velocityThreshold: 0.9,
    directionalOffsetThreshold: 120
  };

  getCurrentUserFunction = async (finalIdToken) => {
    let header = {
      "Authorization": finalIdToken
    }
    setLoading(true);
    getCurrentUser(header).then(async (userResponse) => {
      setLoading(false);
      if (userResponse.success) {
        await AsyncStorage.setItem('loginCredentials', JSON.stringify(userResponse.data));
      }
    }).catch(err => {
      setLoading(false);
    })
  }

  useEffect(() => {
    loginWithRefreshToken();
  }, [])

  useEffect(() => {
    console.log("hasAdditionalView..... useEffect", hasAdditionalView)
  }, [hasAdditionalView]);

  useEffect(() => {
    const listener = EventEmitter.addListener("broadcustMessage", async (message) => {
      console.log("EventEmitter message===", message);
      if (message.has_additional_view){
        setHasAdditionalView(true);
      }
      if (message.loginSuccess === true) {
        //getTokenValue()
        //let idToken = await AsyncStorage.getItem('finalIdToken');
        //dispatch({ type: 'SET_TOKEN', payload: idToken });
      }
      if (message.logoutSuccess === true) {
        setScreens([])
        //console.log("Logout successful")
        // dispatch({ type: 'SET_TOKEN', payload: "" });
        // navigationRef.navigate({
        //   index: 0,
        //   routes: [{ name: 'Login' }], // Redirects to the login page after logout
        // });

        navigationRef.resetRoot({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }

    })
    return () => {
      listener.remove();
    }

  }, []);

  //console.log("token=======", token)

  return (
    // <Provider store={store}>
    // <SafeAreaProvider>
    //   <MenuProvider>
    //     <ThemeProvider>
    //       <StatusBar
    //         barStyle="light-content"
    //         backgroundColor={Colors.primary}
    //         hidden={false}
    //         translucent={true}
    //       />
    //       <NavigationContainer ref={navigationRef}>
    //         {tokenData == null || tokenData == "" ?
    //           <DefaultLayoutScreen /> :

    //           <Drawer.Navigator
    //             initialRouteName="Appointment"
    //             drawerContent={(props) => <CustomDrawerContent {...props} />}
    //             screenOptions={{ headerShown: false }} // Hide default header
    //           >
    //             <Drawer.Screen name="Appointment">
    //               {(props) => (
    //                 <ScreenWrapper>
    //                   <AppointmentScreen {...props} />
    //                 </ScreenWrapper>
    //               )}
    //             </Drawer.Screen>
    //             <Drawer.Screen name="Profile">
    //               {(props) => (
    //                 <ScreenWrapper>
    //                   <ProfileScreen {...props} />
    //                 </ScreenWrapper>
    //               )}
    //             </Drawer.Screen>
    //             <Drawer.Screen name="Questionnaire">
    //               {(props) => (
    //                 <ScreenWrapper>
    //                   <QuestionnaireScreen {...props} />
    //                 </ScreenWrapper>
    //               )}
    //             </Drawer.Screen>
    //           </Drawer.Navigator>}
    //       </NavigationContainer>
    //     </ThemeProvider>
    //   </MenuProvider>
    // </SafeAreaProvider>
    // </Provider>
    <SafeAreaProvider>
        {/* <GestureRecognizerView
          detectSwipeUp={false}
          detectSwipeDown={false}
          onSwipeLeft={onSwipeLeft}
          onSwipeRight={onSwipeRight}
          config={swipe_config}
          style={{
            flex: 1,
          }}
        > */}
          <SwipeWrapper
            onSwipeLeft={onSwipeLeft}
            onSwipeRight={onSwipeRight}
            >
    <MenuProvider>
      <ThemeProvider>
        {/* <StatusBar
          barStyle='default'
          backgroundColor={Colors.primary}
          hidden={false}
          translucent={true}
        /> */}
            <GeneralStatusBarColor backgroundColor="#000"
              barStyle="light-content" />
        <NavigationContainer 
              // onStateChange={() => {
              //    const route = navigationRef.getCurrentRoute();
              //     const currentIndex = screens.indexOf(route?.name);
              //     console.log("screens........", screens)
              //   if (currentIndex < 0 && !["Login"].includes(route?.name)) {
              //       setScreens([
              //         ...screens,
              //         route?.name,
              //       ]);
              //     }
              // }}
                onStateChange={() => {
                  const route = navigationRef.getCurrentRoute();
                  const currentScreen = route?.name;

                  if (!currentScreen || currentScreen === "Login") {
                    return; // Do nothing if the current screen is invalid or "Login"
                  }

                  setScreens((prev) => {
                    // Always keep "Home" and the current screen
                    if (currentScreen === "Home") {
                      return prev; // If "Home" is the current screen, only keep "Home"
                    }
                    return ["Home", currentScreen]; // Otherwise, keep "Home" and the current screen
                  });
                }}

        ref={navigationRef}>
          {tokenData == null || tokenData === "" ? (
            <DefaultLayoutScreen />
          ) : (
            <Drawer.Navigator
              initialRouteName="Home"
              drawerContent={(props) => <CustomDrawerContent {...props} />}
              screenOptions={{
                headerShown: false, // Hide default header
                swipeEnabled: true, // Disable swipe gesture for drawer
                drawerPosition: "right",
                edgeWidth: 100,
                gestureEnabled: true
              }}
            >
              <Drawer.Screen name="Home">
                {(props) => (
                  <ScreenWrapper>
                    <Home {...props} />
                  </ScreenWrapper>
                )}
              </Drawer.Screen>
              <Drawer.Screen name="Appointment">
                {(props) => (
                    <AppointmentScreen {...props} />
                )}
              </Drawer.Screen>
              <Drawer.Screen name="Profile">
                {(props) => (
                  <ScreenWrapper>
                    <ProfileScreen {...props} />
                  </ScreenWrapper>
                )}
              </Drawer.Screen>
              <Drawer.Screen name="Questionnaire">
                {(props) => (
                    <QuestionnaireScreen {...props} />
                )}
              </Drawer.Screen>
              <Drawer.Screen name="MyDocument">
                {(props) => (
                  // <ScreenWrapper>
                    <MyDocument {...props} />
                  // </ScreenWrapper>
                )}
              </Drawer.Screen>
              <Drawer.Screen name="ThirdPartyDocument">
                {(props) => (
                  // <ScreenWrapper>
                    <ThirdPartyDocument {...props} />
                  // </ScreenWrapper>
                )}
              </Drawer.Screen>
            </Drawer.Navigator>
            
          )}
        </NavigationContainer>
      </ThemeProvider>
    </MenuProvider>
        {/* </GestureRecognizerView> */}
      </SwipeWrapper>
    </SafeAreaProvider>
  );
}

export default App;
