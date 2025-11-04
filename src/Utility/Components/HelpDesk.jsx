const screen = Dimensions.get("window");
const screenWidth = screen.width;
const screenheight = screen.height;

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Dimensions, Alert, Linking } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import Ionicons from 'react-native-vector-icons/Ionicons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
const HelpDesk = ({ hidesearchSheet, useFor, setSelectedTimeLine, setSelectedPaymentStatus, setSelectedPaymentMode, applyFilters, selectOptionForSendBy, setSelectedSendBy }) => {
    const openWhatsApp = () => {
        const whatsappUrl = 'https://wa.me/447511546374';
        Linking.openURL(whatsappUrl).catch(() => {
          alert('Make sure WhatsApp is installed on your device');
        });
      };

    return (
        <SafeAreaView style={styles.Container}>
            <View style={styles.footerRow}>
                <View style={styles.footerBox}>
                    <View style={styles.footerBoxSingle}><Text allowFontScaling={false} style={styles.footerBoxSingleTxt}>Admin Contact</Text></View>
                    <View style={styles.footerBoxMultiple}>
                        <TouchableOpacity
                            style={styles.footerBoxMultipleBox}
                            onPress={() => Linking.openURL('tel:+442039277699')}
                        >
                            <View style={styles.iconBox}><Ionicons name="call" size={16} color="#fff" /></View>
                            <Text allowFontScaling={false} style={styles.footerBoxMultipleBoxText}> +44 20 3927 7699</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.footerBoxMultipleBox}
                            onPress={openWhatsApp}
                        >
                            <View style={styles.iconBox}><Ionicons name="logo-whatsapp" size={18} color="#fff" /></View>
                            <Text allowFontScaling={false} style={styles.footerBoxMultipleBoxText}> +44 75115 46374</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.footerBoxSingles}>
                        <TouchableOpacity
                            style={styles.footerBoxMultipleBox}
                            onPress={() => Linking.openURL('mailto:clinicadmin@oaktreeconnect.co.uk')}
                        >
                            <View style={[styles.iconBox, styles.emailiconBox]}><EvilIcons name="envelope" size={24} color="#fff" /></View>
                            <Text allowFontScaling={false} style={styles.footerBoxMultipleBoxText}>clinicadmin@oaktreeconnect.co.uk</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};


export default HelpDesk;

const styles = StyleSheet.create({
    Container: {
        paddingLeft: 10,
        paddingRight: 10,
        width: screenWidth,
        height: screenheight,
    },
    footerRow: {
        position: 'relative',
        backgroundColor: "#fff",
        width: '100%',
        paddingTop: 8,
        paddingBottom: 8,
        alignItems: 'center',
        // borderTopLeftRadius: 20,
        // borderTopRightRadius: 20
    },
    footerBox: {
        padding: 0,
        display: 'flex',
        flexDirection: "column",
        justifyContent: 'space-between',
        alignItems: 'center',
        // backgroundColor:'red',
        width: "95%",
    },
    footerBoxSingle: {
        // borderColor: '#fff',
        // borderStyle: 'dashed',
        // borderWidth: 1,
        width: '95%',
        textAlign: 'center',
        borderRadius: 5,
        backgroundColor: '#007667',
    },
    footerBoxSingleTxt: {
        padding: 5,
        paddingHorizontal: 10,
        fontSize: 18,
        fontFamily: 'Montserrat-Bold',
        //color: Colors.white,
        width: '100%',
        textAlign: 'center',
        color: "#fff",
        // backgroundColor:"#007667"


    },
    footerBoxSinglesTxt: {
        textAlign: 'center',
        color: "#007667",
    },
    footerBoxMultiple: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
    },
    footerBoxMultipleBox: {


        display: 'flex',
        justifyContent: "center",
        flexDirection: 'row',
        alignItems: 'center',
        textAlign: 'center',
        padding: 0,
        paddingHorizontal: 5,
        //backgroundColor:'blue'
    },
    footerBoxMultipleBoxText: {
        // backgroundColor:"blue",
        marginHorizontal: 5,
        padding: 0,
        paddingVertical: 5,
        fontSize: 15,
        fontFamily: 'Montserrat-Medium',
        color: "#333",
    },
    iconBox: {
        width: 30,
        height: 30,
        backgroundColor: '#007667',
        borderRadius: 50,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: 5,
    },
    emailiconBox: {
        padding: 0,
    },



});
