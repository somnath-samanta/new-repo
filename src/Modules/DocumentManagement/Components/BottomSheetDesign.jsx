import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const BottomSheetDesign = ({ handalContactUs, handalFeedback, handalPrescription, handalSupport }) => {

    return (
        <SafeAreaView style={styles.Container}>
            <TouchableOpacity style={styles.row} onPress={() => handalContactUs()}>
                <View style={styles.imgBox}>
                    <Image source={require('../Public/images/ContactUs.png')} style={[styles.img]} />
                </View>

                <Text style={styles.text}>Contact Us</Text>
            </TouchableOpacity>
            {/* <View style={styles.blankBorder}></View> */}
            <TouchableOpacity style={styles.row} onPress={() => handalFeedback()}>
                <View style={styles.imgBox}>
                    <Image source={require('../Public/images/feedback.png')} style={[styles.img, styles.smallimg]} />
                </View>
                <Text style={styles.text}>Feedback</Text>
            </TouchableOpacity>
            {/* <View style={styles.blankBorder}></View> */}
            <TouchableOpacity style={styles.row} onPress={() => handalPrescription()}>
                <View style={styles.imgBox}>
                    <Image source={require('../Public/images/prescription.png')} style={[styles.img, styles.smallimg]} />
                </View>
                <Text style={styles.text}>Prescription</Text>
            </TouchableOpacity>
            {/* <View style={styles.blankBorder}></View> */}
            <TouchableOpacity style={styles.row} onPress={() => handalSupport()}>
                <View style={styles.imgBox}>
                    <Image source={require('../Public/images/support.png')} style={[styles.img, styles.smallimg]} />
                </View>
                <Text style={styles.text}>Support</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};


export default BottomSheetDesign;

const styles = StyleSheet.create({
    Container: {
        paddingLeft: 20,
        paddingRight: 20,
    },
    row: {
        flexDirection: 'row', // Align children in a row
        alignItems: 'center',  // Center items vertically
        backgroundColor: '#fff',
        borderBottomWidth:3,
        borderBottomColor:'#f3f3f3',
        paddingTop:7,
        paddingBottom:7,
       
        
    },
    imgBox: {
        width: 40,
        height: 40,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
       // backgroundColor: 'red',
        objectFit: 'contain'

    },
    img: {
        width: 35,
        height: 35,

    },
    smallimg: {
        height: 32,
        width: 32
    },
    text: {
        fontSize: 18,
        color: 'black',
        paddingLeft: 20,
        lineHeight: 22
    }
});
