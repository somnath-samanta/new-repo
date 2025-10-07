import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, ActivityIndicator, Modal, Platform } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import Colors from '../Colors';
import CommonStyle from '../Public/css/CommonStyle';
import EventEmitter from '../../Contexts/EventEmitter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import { useDispatch } from 'react-redux';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { DevSettings } from "react-native";
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

const CustomHeader = ({ pageName, switchOrganizationSheet, refreshBtnFn, viewDocumentFlag, openQuestionList, callbackhandler, hideBookAppointmentScreen, hideAllWebView }) => {
  const navigation = useNavigation();
  const [searchbookingId, setsearchbookingId] = useState("");
  const [profilePicture, setprofilePicture] = useState("");
  const [loading, setLoading] = useState(false);
  // const dispatch = useDispatch();
  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  useEffect(() => {
    const listener = EventEmitter.addListener("broadcustMessage", async (message) => {
      if (message.organizationSwitch === true) {
        setsearchbookingId("");
      }
    });
    return () => {
      listener.remove();
    };
  }, []);

  const searchBookingSubmit = () => {
    EventEmitter.emit("broadcustMessage", {
      "bookingSearchId": searchbookingId,
    });
  };

  const getProfilePictureValue = async () => {
    const profileData = JSON.parse(await AsyncStorage.getItem('loginCredentials'));
    if (profileData?.user_details?.profile_img_url) {
      const parsedImage = JSON.parse(profileData.user_details.profile_img_url);
      setprofilePicture(parsedImage?.img_url || "");
    }
  };

  useEffect(() => {
    getProfilePictureValue();
  }, []);

  const formatPageName = (name) => {
    return name.replace(/([a-z])([A-Z])/g, '$1 $2');
  };

  // const logoutApp = async () => {
  //   await AsyncStorage.multiRemove([
  //     'finalIdToken', 'i18nextLng', 'accessToken', 'refreshToken',
  //     'loginCredentials', 'loginTime', 'attachOrganization', 'chooseOrganization'
  //   ]);

  //   EventEmitter.emit("broadcustMessage", { "logoutSuccess": true });
  //   dispatch({ type: 'SET_TOKEN', payload: "" });
  // };
  const myProfileLink = async () => {
    navigation.navigate('Profile');
  };
  const moveDashboardLink = () => {
    setLoading(true); // Show full-screen loader
    setTimeout(() => {
      setLoading(false); // Hide loader
      navigation.navigate('Home');
    }, 2000); // 10 seconds delay
  };
  // const refreshBtnFn = () => {
  //   console.log("refreshBtnFn>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
  //  // DevSettings.reload();


  // };


  const handleGoBack = () => {
    console.log("handleGoBack: ", pageName);
    if (pageName == 'MyDocument'){
      // console.log("----------my document----viewDocumentFlag--------",viewDocumentFlag)
      if (viewDocumentFlag){
        callbackhandler(viewDocumentFlag);
      }else{
        navigation.goBack();
      }
    } else if (pageName == 'Questionnaire'){
      //console.log("----------Questionnaire-----openQuestionList--", openQuestionList)
      if (openQuestionList) {
        callbackhandler(openQuestionList);
      } else if(pageName == 'Home'){
        setLoading(true); // Show full-screen loader
        setTimeout(() => {
          setLoading(false); // Hide loader
          navigation.navigate('Home');
        }, 2000); // 10 seconds delay
      }else{
        navigation.goBack();
      }
    }else if(pageName == 'Book an Appointment'){
      hideBookAppointmentScreen();
    }else if(["Video Consultation", "Book Follow-up"].includes(pageName)){
      hideAllWebView()
    }else{
      navigation.goBack();
    }
    
  };

  const handleGoHome = () => {
     navigation.navigate('Home');
  }


  return (
    <View style={CommonStyle.headerContainer}>

      {/* <TouchableOpacity style={CommonStyle.pageHeaderLogoBox} onPress={moveDashboardLink}>
        <Image source={require('../Public/images/oaktreeLogo.png')} style={CommonStyle.oaktreeLogos} />
      </TouchableOpacity> */}

      
      {/* {Platform.OS == "ios" &&  */}
      
      <TouchableOpacity style={CommonStyle.backbtn} onPress={handleGoHome}>
        <Entypo name="home" size={26} color={Colors.white} />
      </TouchableOpacity>
      {/* <TouchableOpacity style={[CommonStyle.backbtn, CommonStyle.backbtnTop]} onPress={handleGoBack}>
        <FontAwesome6 name="arrow-left-long" size={26} color={Colors.black} />
      </TouchableOpacity> */}
      {loading && (
        <Modal transparent={true} animationType="none" visible={loading}>
          <View style={CommonStyle.loaderContainer}>
            <ActivityIndicator size="large" color="#ccc" />
          </View>
        </Modal>
      )}
      {/* }  */}
      <Text style={CommonStyle.pageTitle}>
        {formatPageName(pageName) === "Appointment"
          ? "My Appointments"
          : formatPageName(pageName) === "Third Party Document"
            ? "3rd Party Docs and Reports"
            : formatPageName(pageName)}
      </Text>
      {/* {formatPageName(pageName) === "Appointment" || formatPageName(pageName) === "Third Party Document" || formatPageName(pageName) === "Questionnaire" || formatPageName(pageName) === "My Document" ? 
      <TouchableOpacity style={CommonStyle.refreshBtn} 
      onPress={refreshBtnFn}
      >
        <FontAwesome name="refresh" size={26} color="#fff" />
      </TouchableOpacity> : null
      }  */}
      <TouchableOpacity onPress={openDrawer} style={CommonStyle.menuBar}>
        <Feather name="menu" size={40} color={Colors.white} />
      </TouchableOpacity>

      {/* {(pageName === "BookingDetails" || pageName === "GuestDetails" || pageName === "Profile") && (
        <View style={CommonStyle.pageTitleHeader}>
          <Text style={CommonStyle.pageTitle}>{formatPageName(pageName)}</Text>
        </View>
      )} */}

    </View>
  );
};

// CustomHeader.defaultProps={
//   // callbackhandler:()=>{}
// }
export default CustomHeader;
