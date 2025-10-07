import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import CommonStyle from '../Public/css/CommonStyle';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Colors from '../Colors';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';

const footerItems = [
  { label: 'Home', icon: 'home', route: 'Home' },
  { label: 'Appointment', icon: 'calendar', route: 'Appointment' },

];

const CustomFooter = ({ pageName, onHelpPress}) => {

  let navigation = useNavigation();
  let currentRouteName = useNavigationState(state => state.routeNames[state.index]);

  const onHelpPressClick = () => {
    onHelpPress()
  }

  return (
    <View style={CommonStyle.footer}>
      {footerItems.map((item, index) => {
        let isActive =
          currentRouteName === item.route ||
          (currentRouteName === 'GuestDetails' && item.route === 'Home');
        return (
          <View
            key={index}
            style={[
              CommonStyle.footerRow
            ]}
          >
            <View style={CommonStyle.footerBox}>
              <View style={CommonStyle.footerBoxMultipleBox}>
                <View style={CommonStyle.iconBox}>
                  <Image
                    source={require('../Public/images/oaktreeLogo.png')}
                    style={CommonStyle.oaktreeLogo}
                  />
                </View>
                <Text style={CommonStyle.footerBoxMultipleBoxText}>© Oaktree Connect Ltd.</Text>
              </View>
              <TouchableOpacity style={CommonStyle.footerBoxMultipleBox} onPress={onHelpPressClick}>
                <View style={CommonStyle.iconBox}><AntDesign name="customerservice" size={16} color="#219197" /></View>
                <Text style={CommonStyle.footerBoxMultipleBoxText}>Help</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default CustomFooter;
