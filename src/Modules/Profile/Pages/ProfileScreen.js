import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Linking, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import Colors from '../../../Utility/Colors';
import Icon from 'react-native-vector-icons/Feather';
import ProfileStyle from '../Public/css/ProfileStyle';
import { useTheme } from '../../../Contexts/ThemeContext';
import Loader from '../../../Utility/Components/Loader'
import { deactivatePatient } from '../Controller/ProfileController';
import { LogOut } from '../../../Utility/Components/LogOut';
import { useSelector, useDispatch } from 'react-redux';
import Toast from 'react-native-simple-toast';
// import { useMutation } from '@apollo/client';
// import { DEACTIVATE_PATIENT } from '../../../GraphQL/Mutation';

const ProfileScreen = ({ }) => {
  const { isDarkTheme, toggleTheme } = useTheme();
  const theme = ProfileStyle(isDarkTheme);

  const [profilePicture, setprofilePicture] = useState("");
  const [loading, setLoading] = useState(false);

  const reduxAuthJson = useSelector((state) => state);

  const patientId = reduxAuthJson?.token?.loginUserId;
  const { clearLocalStorage } = LogOut();

  // const [deactivatePatient] = useMutation(DEACTIVATE_PATIENT);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your Account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await deactivatePatient({
                variables: {
                  id: patientId,
                },
              });
              console.log("response------------", response);
              setLoading(false);
              // Clear local storage and logout (this will navigate away)
              Toast.show('Your account has been deactivated successfully.');
              clearLocalStorage(true);
            } catch (error) {
              setLoading(false);
              Alert.alert('Error', 'Failed to deactivate account. Please try again.');
              console.error('Deactivate account error:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    // <SafeAreaView style={theme.profileContainer}>
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#dff7f8', }}
    >
      <Loader loading={loading} />
      <ScrollView>
        <View style={theme.contentContainer}>
          <View style={theme.imageContainer}>
            <Image
              source={profilePicture ? { uri: profilePicture } : require('../../../Utility/Public/images/usericon.png')}
              style={theme.userImage}
            />
          </View>
          <View style={theme.contentContainerBox}>
            <View style={theme.contentContainerRow}>
              <Icon name="user" size={18} color={Colors.primary} style={theme.userIcon} />
              <Text style={theme.userNameRow}>{reduxAuthJson.currentUserDetails.firstName} {reduxAuthJson.currentUserDetails.lastName}</Text>
            </View>
            <View style={theme.contentContainerRow}>
              <Icon name="mail" size={20} color={Colors.primary} />
              <Text style={theme.otherDetailsRow}>{reduxAuthJson.currentUserDetails.email}</Text>
            </View>
            <View style={theme.contentContainerRow}>
              <Icon name="phone-call" size={20} color={Colors.primary} />
              <Text style={theme.otherDetailsRow}>{reduxAuthJson.currentUserDetails.phoneNumber}</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={{
              backgroundColor: '#ff4444',
              paddingVertical: 12,
              paddingHorizontal: 30,
              borderRadius: 8,
              marginTop: 30,
              marginHorizontal: 20,
              alignItems: 'center',
            }}
            onPress={handleDeleteAccount}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>


    </SafeAreaView>
  );
};

export default ProfileScreen;





