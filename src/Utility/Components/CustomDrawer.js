import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StatusBar, Platform, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../Contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EventEmitter from '../../Contexts/EventEmitter';
import { useDispatch, useSelector } from 'react-redux';
import DrawerStyle from '../Public/css/DrawerStyle';
import { useIsFocused } from '@react-navigation/native';
import Colors from '../Colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import DeviceInfo from 'react-native-device-info';
import { LogOut } from './LogOut';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

function CustomDrawerContent(props) {
  const { isDarkTheme, toggleTheme } = useTheme();
  const theme = DrawerStyle(isDarkTheme);
  const [profilePicture, setProfilePicture] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userContact, setUserContact] = useState("");
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight : 0;
  const reduxAuthJson = useSelector((state) => state);
  const [isDocumentsExpanded, setDocumentsExpanded] = useState(false);
  const [isTherapyTasksExpanded, setTherapyTasksExpanded] = useState(false);
  const appVersion = DeviceInfo.getVersion();
  const { clearLocalStorage } = LogOut();
  // const DrawerItemWithIcon = ({ label, icon, onPress, isActive }) => (
  //   <TouchableOpacity
  //     style={[theme.drawerItem, isActive && theme.activeDrawerItem, { borderBottomWidth: 1, borderBottomColor: '#eee', }]}
  //     onPress={onPress}
  //   >
  //     <Icon name={icon} size={24} color={Colors.green01} />
  //     <Text style={[theme.drawerItemText]}>
  //       {label}
  //     </Text>
  //   </TouchableOpacity>
  // );

  const DrawerItemWithIcon = ({ label, icon, onPress, isActive, isDropdown, isExpanded }) => (
    <TouchableOpacity
      style={[
        theme.drawerItem,
        isActive && theme.activeDrawerItem,
        { borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
      ]}
      onPress={onPress}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Icon name={icon} size={24} color={Colors.green01} />
        <Text allowFontScaling={false} style={[theme.drawerItemText, { marginLeft: 10 }]}>{label}</Text>
      </View>

      {isDropdown && (
        <MaterialIcons
          name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={24}
          color={Colors.green01}
        />
      )}
    </TouchableOpacity>
  );

  const DrawerItemWithIconForSubItem = ({ label, icon, onPress, isActive }) => (
    <TouchableOpacity
      style={[theme.drawerItem, theme.drawerSubItem, isActive && theme.activeDrawerItem, { borderBottomWidth: 1, borderBottomColor: '#eee', }]}
      onPress={onPress}
    >
      {icon == 'pulse' ?
        <Ionicons name={icon} size={24} color={Colors.green01} /> : icon == 'clipboard-list' ?
          <FontAwesome5 name={icon} size={24} color={Colors.green01} /> :
          <Ionicons name={icon} size={24} color={Colors.green01} />}
      <Text allowFontScaling={false} style={[theme.drawerItemText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // useEffect(() => {
  //   setDocumentsExpanded(false);
  //   setTherapyTasksExpanded(false);       
  // }, [isDocumentsExpanded, isTherapyTasksExpanded]);

  const drawerItems = [
    { label: 'Home', icon: 'home', route: 'Home' },
    { label: 'Appointments', icon: 'calendar', route: 'Appointment' },
    { label: 'Documents', icon: 'book', route: 'Document', isDropdown: true, dropdownType: 'documents' },
    { label: 'My Therapy Tasks', icon: 'new-message', route: 'Therapy', isDropdown: true, dropdownType: 'therapyTasks' },
    { label: 'Profile ', icon: 'user', route: 'Profile' },
  ];

  const documentSubItems = [
    { label: '3rd Party Documents', icon: 'book', route: 'ThirdPartyDocument' },
    { label: 'My Documents', icon: 'book', route: 'MyDocument' },
  ];
  const therapyTaskSubItems = [
    { label: 'Physical Parameters', icon: 'pulse', route: 'HealthParameter' },
    { label: 'Questionnaires', icon: 'clipboard-list', route: 'Questionnaire' },
  ];

  const logoutApp = () => {
    Alert.alert(
      "Confirmation", // Title
      "Are you sure you want to logout?", // Message
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel", // Styles the button (optional: 'default', 'cancel', 'destructive')
        },
        {
          text: "OK",
          onPress: () => clearLocalStorage(true),
        },
      ],
      { cancelable: false } // Prevent closing by tapping outside the popup
    );
  };

  // const clearLocalStorage = async () => {
  //   await AsyncStorage.multiRemove([
  //     'finalIdToken', 'i18nextLng', 'accessToken', 'refreshToken',
  //     'loginCredentials', 'loginTime', 'attachOrganization', 'chooseOrganization'
  //   ]);
  //   EventEmitter.emit("broadcustMessage", { "logoutSuccess": true });
  //   dispatch({ type: 'SET_TOKEN', payload: "" });
  // }

  const getProfilePictureValue = async () => {
    let profileImage = "";
    const profileData = JSON.parse(await AsyncStorage.getItem('loginCredentials'));
    if (profileData?.user_details?.profile_img_url) {
      const parsedImage = JSON.parse(profileData.user_details.profile_img_url);
      profileImage = parsedImage?.img_url || profileImage;
    }
    setProfilePicture(profileImage);
  };

  useEffect(() => {
    getProfilePictureValue();
    getUserFullName();
    getUserEmail();
    getUserPhone();
  }, [isFocused]);

  const getUserFullName = async () => {
    const userData = JSON.parse(await AsyncStorage.getItem('loginCredentials'));
    if (userData?.user_details) {
      const { first_name, last_name } = userData.user_details;
      setUserName(`${first_name || ''} ${last_name || ''}`);
    }
  };

  const getUserEmail = async () => {
    const userData = JSON.parse(await AsyncStorage.getItem('loginCredentials'));
    setUserEmail(userData?.user_details?.user_email || "");
  };

  const getUserPhone = async () => {
    const userData = JSON.parse(await AsyncStorage.getItem('loginCredentials'));
    setUserContact(userData?.user_details?.contact_number || "");
  };



  // const handleDrawerItemPress = (item) => {
  //   console.log("item>>>>>>>>>>>>>>>>>>", item)
  //   if (item.isDropdown) {
  //     console.log("yes>>>>>>>>>>>>>>>>>>")
  //     if (item.dropdownType === 'therapyTasks') {
  //       console.log("yes>>>>>>>>>yes>>>>>>>>>")
  //       setTherapyTasksExpanded(!isTherapyTasksExpanded);
  //       //setDocumentsExpanded(false);
  //     } 
  //     if (item.dropdownType === 'documents') {
  //       console.log("yes>>>>>>>>>no>>>>>>>>>")
  //       setDocumentsExpanded(!isDocumentsExpanded);
  //       //setTherapyTasksExpanded(false);
  //     }
  //   } else {
  //     console.log("no>>>>>>>>>>>>>>>>>>")
  //     props.navigation.navigate(item.route);
  //     setDocumentsExpanded(false);
  //     setTherapyTasksExpanded(false);
  //   }
  // };

  const handleDrawerItemPress = (item) => {
    if (item.isDropdown) {
      if (item.dropdownType === 'therapyTasks') {
        setTherapyTasksExpanded((prev) => !prev);
        setDocumentsExpanded(false);
      } else if (item.dropdownType === 'documents') {
        setDocumentsExpanded((prev) => !prev);
        setTherapyTasksExpanded(false);
      }
    } else {
      props.navigation.navigate(item.route);
      setDocumentsExpanded(false);
      setTherapyTasksExpanded(false);
    }
  };
  useEffect(() => {
    let currentRoute = props.state?.routeNames[props.state.index] || '';
    console.log(">>>>>>>>>>>>>>>>>>>", currentRoute)
    if (["Home", "Appointment", "Profile",].includes(currentRoute)) {
      setDocumentsExpanded(false);
      setTherapyTasksExpanded(false);
    }
  }, [props.state]);

  const currentRoute = props.state?.routeNames[props.state.index] || '';



  return (
    <View style={[theme.drawerContainer, { paddingTop: Platform.OS == 'ios' ? 0 : 0 }]}>
      <TouchableOpacity onPress={() => {
        props.navigation.closeDrawer();
        setDocumentsExpanded(false);
        setTherapyTasksExpanded(false);
      }} style={[theme.closeDrawerButton, { marginTop: Platform.OS == 'ios' ? 10 : 10 }]}>
        <MaterialIcons name="close" size={20} color={isDarkTheme ? Colors.white : Colors.white} />
      </TouchableOpacity>
      <View style={theme.leftHeader}>
        <Image
          source={profilePicture ? { uri: profilePicture } : require('../Public/images/usericon.png')}
          style={theme.leftLogo}
        />
        <Text allowFontScaling={false} style={theme.leftHeaderText}>
          {reduxAuthJson.currentUserDetails.firstName} {reduxAuthJson.currentUserDetails.lastName}
        </Text>
      </View>
      <FlatList
        data={drawerItems}
        keyExtractor={(item) => item.label}
        renderItem={({ item }) => (
          <>
            {/* <DrawerItemWithIcon
              label={item.label}
              icon={item.icon}
              onPress={() => handleDrawerItemPress(item)}
              isActive={item.route === currentRoute}
            /> */}
            <DrawerItemWithIcon
              label={item.label}
              icon={item.icon}
              onPress={() => handleDrawerItemPress(item)}
              isActive={item.route === currentRoute}
              isDropdown={item.isDropdown}
              isExpanded={
                (item.dropdownType === 'therapyTasks' && isTherapyTasksExpanded) ||
                (item.dropdownType === 'documents' && isDocumentsExpanded)
              }
            />
            {item.isDropdown && item.dropdownType === 'documents' && isDocumentsExpanded && (
              <FlatList
                data={documentSubItems}
                keyExtractor={(subItem) => subItem.label}
                renderItem={({ item: subItem }) => (
                  <DrawerItemWithIconForSubItem
                    label={subItem.label}
                    icon={subItem.icon}
                    onPress={() => props.navigation.navigate(subItem.route)}
                    isActive={subItem.route === currentRoute}
                  />
                )}
              />
            )}
            {item.isDropdown && item.dropdownType === 'therapyTasks' && isTherapyTasksExpanded && (
              <FlatList
                data={therapyTaskSubItems}
                keyExtractor={(subItem) => subItem.label}
                renderItem={({ item: subItem }) => (
                  <DrawerItemWithIconForSubItem
                    label={subItem.label}
                    icon={subItem.icon}
                    onPress={() => props.navigation.navigate(subItem.route)}
                    isActive={subItem.route === currentRoute}
                  />
                )}
              />
            )}
          </>
        )}
        contentContainerStyle={theme.drawerItems}
      />
      <TouchableOpacity style={[theme.drawerItem, theme.logoutBtn, { borderBottomWidth: 1, borderBottomColor: '#eee', borderTopWidth: 1, borderTopColor: '#eee', }]} onPress={logoutApp}>
        <AntDesign name="logout" size={24} color={Colors.green03} />
        <Text allowFontScaling={false} style={[theme.drawerItemText]}>
          Logout
        </Text>
      </TouchableOpacity>
      <Text allowFontScaling={false} style={Platform.OS === 'ios' ? [theme.versionColor, { borderBottomWidth: 1, borderBottomColor: '#eee', height: 50 }] : [theme.versionColor, { borderBottomWidth: 1, borderBottomColor: '#eee' }]}>App Version: {appVersion}</Text>
      {/* <View style={{ marginBottom: 30 }}></View> */}
    </View>
  );
}

export default CustomDrawerContent;
