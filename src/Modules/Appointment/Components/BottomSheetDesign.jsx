import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import moment from 'moment';
import { SafeAreaView } from 'react-native-safe-area-context';

const BottomSheetDesign = ({ handalContactUs, handalFeedback, handalPrescription, handalSupport, handalCancelAppointment, appointmentCancelObj }) => {

    const [appointmentStatus, setAppointmentStatus] = useState("");
    const [appointmentDate, setAppointmentDate] = useState("");
    const [today, setToday] = useState("");

    useEffect(() => {
        if (Object.keys(appointmentCancelObj).length > 0) {
            let mydate = new Date();
            var FDate = moment(mydate).format('DD-MM-YYYY');
            setAppointmentStatus(appointmentCancelObj?.appointmentStatus)
            setAppointmentDate(appointmentCancelObj?.appointmentDate.split("-"))
            setToday(FDate.split("-"))
        }
    }, [appointmentCancelObj])


    return (
        <SafeAreaView style={styles.Container}>
            {
                Object.keys(appointmentCancelObj).length > 0 && appointmentStatus === "Approved" && (new Date(appointmentDate[2], parseInt(appointmentDate[1]) - 1, appointmentDate[0]) >= new Date(today[2], parseInt(today[1]) - 1, today[0])) &&

                <TouchableOpacity style={styles.row} onPress={() => handalCancelAppointment()}>
                    <View style={styles.imgBox}>
                        <Image source={require('../Public/images/cancel.png')} style={[styles.img, styles.smallimg]} />
                    </View>

                    <Text style={styles.text}>Cancel Appointment</Text>
                </TouchableOpacity>
            }
            <TouchableOpacity style={styles.row} onPress={() => handalContactUs()}>
                <View style={styles.imgBox}>
                    <Image source={require('../Public/images/ContactUs.png')} style={[styles.img]} />
                </View>

                <Text style={styles.text}>Contact Us</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.row} onPress={() => handalFeedback()}>
                <View style={styles.imgBox}>
                    <Image source={require('../Public/images/feedback.png')} style={[styles.img, styles.smallimg]} />
                </View>
                <Text style={styles.text}>Feedback</Text>
            </TouchableOpacity>
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
        borderBottomWidth: 3,
        borderBottomColor: '#f3f3f3',
        paddingTop: 5,
        paddingBottom: 5,
    },
    imgBox: {
        marginLeft: Platform.OS == 'ios' ? 10 : 0,
        width: 35,
        height: 35,
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
        height: 28,
        width: 28,
    },
    text: {
        fontSize: 16,
        color: 'black',
        paddingLeft: 15,
        lineHeight: 22
    }
});
