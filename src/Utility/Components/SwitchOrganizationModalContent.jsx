import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../Colors'
import { getCurrentUser } from '../../Controller/CommonController'
import CommonStyle from '../Public/css/CommonStyle';
import Loader from './Loader';

const SwitchOrganizationModalContent = ({ organizationChangeSuccess }) => {
    const [selectedOrganization, setSelectedOrganization] = useState("");
    const [organizationList, setorganizationList] = useState([]);
    const [loading, setLoading] = useState(false);

    const getorganizationList = async () => {
        try {
            let attachOrganization = JSON.parse(await AsyncStorage.getItem('attachOrganization'));
            let chooseOrganization = JSON.parse(await AsyncStorage.getItem('chooseOrganization'));
            //console.log("chooseOrganization=====", chooseOrganization)
            //console.log("attachOrganization=====", attachOrganization)
            setSelectedOrganization(chooseOrganization)
            setorganizationList(attachOrganization)
        } catch (error) {
            console.error('Error retrieving token:', error);
        }
    };

    useEffect(() => {
        getorganizationList();
    }, [])

    const orginzationSelected = async (org) => {
        setSelectedOrganization(org)
        await AsyncStorage.setItem('chooseOrganization', JSON.stringify(org));
        let finalIdToken = await AsyncStorage.getItem('finalIdToken');
        await getCurrentUserFunction(finalIdToken);
    }

    getCurrentUserFunction = async (finalIdToken) => {
        let header = {
            "Authorization": finalIdToken
        }
        setLoading(true);
        getCurrentUser(header).then(async (userResponse) => {
            if (userResponse.success) {

                // console.log("userResponse=======", userResponse)

                await AsyncStorage.setItem('loginCredentials', JSON.stringify(userResponse.data));
            //dispatch({ type: 'SET_TOKEN', payload: finalIdToken });

                setLoading(false);
                organizationChangeSuccess(true)
            }
        }).catch(err => {
            //console.log("LoginController.getCurrentUser err .....", err)
            setLoading(false);
        })
    }


    const DEFAULT_IMAGE = require('../Public/images/organization.png');
    const organizationImage = (data) => {
        try {
            if (data.logo) {
                const logoData = JSON.parse(data.logo);
                if (logoData && logoData.file_obj) {
                    return { uri: logoData.file_obj };
                }
            }
        } catch (error) {
            console.error("Error parsing logo data:", error);
        }
        return DEFAULT_IMAGE;
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Loader loading={loading} />
            <View style={CommonStyle.organizationContainer}>
                {/* <View style={{alignItems: 'center'}}>
                    <Text style={{fontSize: 20, color:Colors.primary,fontFamily:'Roboto-Medium'}}>Switch Organization</Text>
                </View> */}
                {organizationList && organizationList.length > 0 ? (
                    organizationList.map((hotel, index) => (
                        <TouchableOpacity
                            key={hotel.hotel_id}
                            style={[CommonStyle.organizationListRow, hotel.user_type == 'agent' ? CommonStyle.disabledRow : ""]}
                            onPress={() => orginzationSelected(hotel)}
                            disabled={hotel.user_type == 'agent' ? true : false}
                        >
                            <View style={CommonStyle.orgLeftSection}>
                                <View style={CommonStyle.orgImageContainer}>
                                    <Image
                                        source={organizationImage(hotel)}
                                        style={CommonStyle.orgImg}
                                        resizeMode="contain"
                                    />
                                </View>
                                <View style={CommonStyle.orgTextContainer}>
                                    <Text style={CommonStyle.orgNameText}>{hotel.hotel_name}</Text>
                                    <View style={CommonStyle.orgLocationContainer}>
                                        <Icon name="map-pin" size={14} color={Colors.gray99} />
                                        <Text style={CommonStyle.orgLocation}>
                                            {`${hotel.address1 || ''}${hotel.address1 && hotel.address2 ? ', ' : ''}${hotel.address2 || ''}`}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            {hotel.user_type != 'agent' &&
                                <View style={CommonStyle.orgRightSection}>
                                    {selectedOrganization.hotel_id === hotel.hotel_id ? (
                                        <Icon name="check-circle" size={20} color={Colors.green} />
                                    ) : (
                                        <Icon name="circle" size={20} color={Colors.grayB1} />
                                    )}
                                </View>
                            }
                        </TouchableOpacity>
                    ))) : null}
            </View>
        </SafeAreaView>
    );
};

export default SwitchOrganizationModalContent;

