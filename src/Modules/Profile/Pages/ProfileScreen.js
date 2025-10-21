import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Linking } from 'react-native';
import Colors from '../../../Utility/Colors';
import Icon from 'react-native-vector-icons/Feather';
import ProfileStyle from '../Public/css/ProfileStyle';
import { useTheme } from '../../../Contexts/ThemeContext';
import Loader from '../../../Utility/Components/Loader'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';


const ProfileScreen = ({ }) => {
  const { isDarkTheme, toggleTheme } = useTheme();
  const theme = ProfileStyle(isDarkTheme);

  const [profilePicture, setprofilePicture] = useState("");
  const [loading, setLoading] = useState(false);

  const reduxAuthJson = useSelector((state) => state);

  return (
    <SafeAreaView style={theme.profileContainer}>
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
        </View>
      </ScrollView>

      
    </SafeAreaView>
  );
};

export default ProfileScreen;





