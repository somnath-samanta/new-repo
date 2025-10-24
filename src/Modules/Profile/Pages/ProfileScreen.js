import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Linking 
} from 'react-native';
import Colors from '../../../Utility/Colors';
import Icon from 'react-native-vector-icons/Feather';
import ProfileStyle from '../Public/css/ProfileStyle';
import { useTheme } from '../../../Contexts/ThemeContext';
import Loader from '../../../Utility/Components/Loader';
import { deactivatePatient } from '../Controller/ProfileController';
import { LogOut } from '../../../Utility/Components/LogOut';
import { useSelector } from 'react-redux';
import Toast from 'react-native-simple-toast';

const ProfileScreen = () => {
  const { isDarkTheme } = useTheme();
  const theme = ProfileStyle(isDarkTheme);

  const [profilePicture, setProfilePicture] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const reduxAuthJson = useSelector((state) => state);
  const patientId = reduxAuthJson?.token?.loginUserId;
  const { clearLocalStorage } = LogOut();

  const handleDeleteAccount = () => {
    setShowModal(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      setShowModal(false);
      setLoading(true);
      const response = await deactivatePatient({
        variables: { id: patientId, fetchingFrom: 'APP' },
      });
      console.log('response:', response);
      Toast.show('Your account has been deactivated successfully.');
      clearLocalStorage(true);
    } catch (error) {
      console.error('Deactivate account error:', error);
      Toast.show('Failed to deactivate account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#dff7f8' }}>
      <Loader loading={loading} />
      <ScrollView>
        <View style={theme.contentContainer}>
          <View style={theme.imageContainer}>
            <Image
              source={
                profilePicture
                  ? { uri: profilePicture }
                  : require('../../../Utility/Public/images/usericon.png')
              }
              style={theme.userImage}
            />
          </View>

          <View style={theme.contentContainerBox}>
            <View style={theme.contentContainerRow}>
              <Icon
                name="user"
                size={18}
                color={Colors.primary}
                style={theme.userIcon}
              />
              <Text style={theme.userNameRow}>
                {reduxAuthJson.currentUserDetails.firstName}{' '}
                {reduxAuthJson.currentUserDetails.lastName}
              </Text>
            </View>
            <View style={theme.contentContainerRow}>
              <Icon name="mail" size={20} color={Colors.primary} />
              <Text style={theme.otherDetailsRow}>
                {reduxAuthJson.currentUserDetails.email}
              </Text>
            </View>
            <View style={theme.contentContainerRow}>
              <Icon name="phone-call" size={20} color={Colors.primary} />
              <Text style={theme.otherDetailsRow}>
                {reduxAuthJson.currentUserDetails.phoneNumber}
              </Text>
            </View>
          </View>

          {/* Delete Button */}
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
            <Text
              style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: 'bold',
              }}
            >
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 🔻 Custom Modal */}
      <Modal
        transparent={true}
        visible={showModal}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              width: '90%',
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 25,
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: 10,
                color: '#ff4444',
              }}
            >
              WARNING
            </Text>
            <Text
              style={{
                fontSize: 12,
                textAlign: 'justify',
                color: '#666',
                lineHeight: 14,
                marginBottom: 5,
              }}
            >
              Please note that deleting your account will deactivate your profile across the entire Oaktree Connect platform. You will lose access to your documents and appointments from any device.
            </Text>
            <Text
              style={{
                fontSize: 12,
                textAlign: 'justify',
                color: '#666',
                lineHeight: 14,
                marginBottom: 25,
              }}
            >
              Once deactivated you will be required to submit a request to{' '}
              <Text
                style={{ color: '#1e90ff' }}
                onPress={() => Linking.openURL('mailto:clinicadmin@oaktreeconnect.co.uk')}
              >
                clinicadmin@oaktreeconnect.co.uk
              </Text>{' '}
              if you wish to reactivate your account.{' '}
              <Text style={{ fontWeight: 'bold' }}>
                Processing your reactivation may require a minimum of five working days.
              </Text>
            </Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#e0e0e0',
                  paddingVertical: 10,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginRight: 10,
                }}
                onPress={() => setShowModal(false)}
              >
                <Text
                  style={{
                    color: '#333',
                    fontSize: 15,
                    fontWeight: '600',
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#ff4444',
                  paddingVertical: 10,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginLeft: 10,
                }}
                onPress={confirmDeleteAccount}
              >
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: '600',
                  }}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileScreen;
