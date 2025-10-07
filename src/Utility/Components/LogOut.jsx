//LogOut.jsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import EventEmitter from '../../Contexts/EventEmitter';
import { store } from '../../Store/configureStore';
import Toast from 'react-native-simple-toast';

export const LogOut = (props) => {
  return {
    clearLocalStorage: async (logout=false) => {
      await AsyncStorage.multiRemove([
        'finalIdToken', 'i18nextLng', 'accessToken', 'refreshToken',
        'loginCredentials', 'loginTime', 'attachOrganization', 'chooseOrganization',
      ]);
      EventEmitter.emit("broadcustMessage", { "logoutSuccess": true });
      store.dispatch({ type: 'SET_TOKEN', payload: "" });
      if(!logout){
        Toast.show("Session has expired. Please log in again.");
      }
    },
  };
};
