import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import Colors from '../Colors';
import Entypo from 'react-native-vector-icons/Entypo';
import CommonStyle from '../Public/css/CommonStyle';
import QRCodeGenerator from './QRCodeGenerator'
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from './Loader';
import GlobalModalBottomSheet from './GlobalModalBottomSheet';
import { associateSoftwareToken, verifySoftwareToken, usrMfaAssign } from '../../Modules/Profile/Controller/ProfileController'
import { getCurrentUser } from '../../Modules/Login/Controller/LoginController'
import Toast from 'react-native-simple-toast';
import { showMessage, hideMessage } from "react-native-flash-message";
import EventEmitter from '../../Contexts/EventEmitter';
import { Image } from 'react-native-animatable';
import CustomPopup from '../Components/CustomPopup';


const MFAModalContent = ({ enablePopupFlag, accountName, userIsSubscribe, mfaActionSuccessFn, mfaActionType, userActionMfaType, isMfaRequiredFlag, onRequestCloseModal, skipMfaFnParent }) => {
    const navigation = useNavigation();
    const [secretCode, setSecretCode] = useState("");
    const [otpParent, setotpParent] = useState("");
    const [selectedValue, setSelectedValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [authenticatorPopupFlag, setAuthenticatorPopupFlag] = useState(false);

    const enableMFAOptions = [
        {
            label: 'Text Message (SMS)',
            value: 'SMS',
            description1: '(Standard message rates apply)',
            description2: 'Receive a text message to your mobile device when signing in.',
            image: require('../Public/images/phone1.png'),
        },
        {
            label: 'Authenticator App ',
            value: 'Software',
            description1: '(Microsoft Authenticator, Twilio Authy etc.)',
            description2: 'Retrieve codes from an Authentication app on your device.',
            image: require('../Public/images/phone2.png'),
        },
    ];
    const verifySoftwareTokenFunction = async () => {
        //alert();
        if (otpParent != "" && otpParent.length == 6) {
            setLoading(true);
            let headers = {};
            headers['AccessToken'] = await AsyncStorage.getItem('accessToken');
            headers["Authorization"] = await AsyncStorage.getItem('finalIdToken');
            let data = {
                "mfaCode": otpParent.join("")
            }
            // console.log("headers===", headers, data)
            // console.log("headers===", headers, data)
            verifySoftwareToken(data, headers).then(async (response) => {
                // console.log("verifySoftwareToken=========0", response);
                if (response.success) {
                    // console.log("verifySoftwareToken=========1", response);

                    await usrMfaAssignFunction();

                }

            }).catch((error) => {
                setLoading(false);
            });

        } else {
            showMessage({
                message: "Please enter your verification code.",
                type: "warning",
                style: { marginTop: StatusBar.currentHeight, fontSize: 16 }
            });
        }
    }

    useEffect(() => {
        if (userActionMfaType == "disable") {
            usrMfaAssignFunction()
        }
    }, [userActionMfaType])

    const usrMfaAssignFunction = async () => {
        //alert();
        setLoading(true);
        let headers = {};
        headers['AccessToken'] = await AsyncStorage.getItem('accessToken');
        headers["Authorization"] = await AsyncStorage.getItem('finalIdToken');
        let data = {};
        if (userActionMfaType == "") {
            if (selectedValue == "Software") {
                data['mfa_type'] = "authenticator_app"
            } else {
                data['mfa_type'] = "sms"
            }
        } else {
            data['mfa_type'] = "disable"
        }
        data['user_name'] = accountName
        //return false;
        usrMfaAssign(data, headers).then(async (response) => {
            //console.log("usrMfaAssign=========2.0", response);

            if (response.success) {
                mfaActionSuccessFn(true)
                //setEnablePopupFlag(false);
                if (userActionMfaType == "disable") {
                    setSelectedValue("")
                    setSecretCode("")
                }
                // console.log("usrMfaAssign=========2", response);
                await getCurrentUserFunction(userActionMfaType);


            }

        }).catch((error) => {
            setLoading(false);
        });
    }

    getCurrentUserFunction = async () => {
        let header = {
            "Authorization": await AsyncStorage.getItem('finalIdToken')
        }
        setLoading(true);
        getCurrentUser(header).then(async (userResponse) => {
            setLoading(false);
            if (userResponse.success) {
                if (userActionMfaType == "") {
                    showMessage({
                        message: "MFA is enabled",
                        type: "info",
                        style: { marginTop: StatusBar.currentHeight, fontSize: 16 }
                    });
                } else {
                    showMessage({
                        message: "MFA is disabled",
                        type: "info",
                        style: { marginTop: StatusBar.currentHeight, fontSize: 16 }
                    });
                }

                await AsyncStorage.setItem('loginCredentials', JSON.stringify(userResponse.data));

                if (!userIsSubscribe) {
                    navigation.navigate("NoSubscription")
                }
            }
        }).catch(err => {
            setLoading(false);
        })
    }

    const submitMfa = async () => {
        if (selectedValue != "") {
            // console.log("mfaActionType===========", mfaActionType)
            // console.log("selectedValue===========", selectedValue)
            if (selectedValue == "Software") {
                // console.log("entry================Software")
                EventEmitter.emit("broadcustMessage", {
                    "updateMfaActionType": true
                })
                await associateSoftwareTokenFunction();
            }

            if (selectedValue == "SMS") {
                // console.log("Entry for sms")
                await usrMfaAssignFunction();
            }
        } else {
            Toast.show("Please Select one Mfa type")
        }

    }

    const associateSoftwareTokenFunction = async () => {
        //alert();
        setLoading(true);
        let headers = {};
        headers['AccessToken'] = await AsyncStorage.getItem('accessToken');
        headers["Authorization"] = await AsyncStorage.getItem('finalIdToken');

        associateSoftwareToken(headers).then((response) => {
            // console.log("response=======", response)
            if (response.success) {
                if (response.success) {
                    //setEnablePopupFlag(false)
                    let SecretCode = response.data.SecretCode;
                    setSecretCode(SecretCode);
                    // console.log("SecretCode======", SecretCode)
                }

            }
            setLoading(false);
        }).catch((error) => {
            setLoading(false);
        });
    }

    useEffect(() => {
        getProfilePictureValue();
    }, [])

    const getProfilePictureValue = async () => {
        let profilePictureValue = JSON.parse(await AsyncStorage.getItem('loginCredentials'));
        let getMfa = profilePictureValue.user_details.mfa;
        if (getMfa != null) {
            if (getMfa == "SOFTWARE_TOKEN_MFA") {
                setSelectedValue("Software")
            } else {
                setSelectedValue("SMS")
            }
        }
    };

    const authenticatorDetailsFn = () => {
        setAuthenticatorPopupFlag(true)
    }

    const skipMfaFn = () => {
        onRequestCloseModal()
    }

    return (
        <>
            <Loader loading={loading} />
            <GlobalModalBottomSheet
                visible={enablePopupFlag}
                onRequestClose={isMfaRequiredFlag ? false : onRequestCloseModal}
                header={(mfaActionType === "enable_mfa" && isMfaRequiredFlag && (!secretCode || secretCode === "")) ? true : false}
                modalHeight={mfaActionType == "enable_mfa" && isMfaRequiredFlag ? 610 : secretCode && secretCode != "" ? 540 : 480}
                headerTitle={mfaActionType == "enable_mfa" && isMfaRequiredFlag ? "Your organization requires MFA for enhanced security. Please enable MFA to proceed further by selecting one of the following options:" : ""}
                outsideClickClose={isMfaRequiredFlag ? false : onRequestCloseModal}
                headerFontSize={16}
                headerFontLineHeight={28}
                showIcon={secretCode && secretCode != "" && mfaActionType == "enable_mfa" ? false : true}
                headerTextAlign="center"
                modalOverlayColor={isMfaRequiredFlag ? "rgba(0, 0, 0, 0.9)" : "rgba(0, 0, 0, 0.5)"}
                contentBody={
                    <>
                        {secretCode && secretCode != "" && mfaActionType == "enable_mfa" ?
                            <QRCodeGenerator secretCode={secretCode} accountName={accountName} setotpParent={setotpParent} verifySoftwareTokenFunction={verifySoftwareTokenFunction} />
                            :
                            <>
                                <View style={CommonStyle.enableMFAModaLBody}>
                                    <View style={CommonStyle.enableMFAModaLContent}>
                                        {enableMFAOptions.map((option) => {
                                            const isSelected = option.value === selectedValue;
                                            //console.log("option==========", option)
                                            return (
                                                <TouchableOpacity
                                                    key={option.value}
                                                    onPress={() => setSelectedValue(option.value)}
                                                    style={CommonStyle.radioButtonContainer}
                                                >
                                                    <View style={CommonStyle.authenticatorContainer}>
                                                        <View style={[CommonStyle.radioCircle, isSelected && CommonStyle.selected]}>
                                                            {isSelected && <Entypo name="check" size={14} color="white" />}
                                                        </View>
                                                        <View style={{ marginRight: 8 }}>
                                                            <Image source={option.image} style={CommonStyle.authenticatorImgBox} />
                                                        </View>
                                                        <View style={CommonStyle.authenticatorTextContainer}>
                                                            <Text style={CommonStyle.radioLabel}>{option.label}</Text>
                                                            <TouchableOpacity onPress={() => option.value == "Software" ? authenticatorDetailsFn() : null}>
                                                                <Text style={[CommonStyle.authenticatorTextBox, option.value == "Software" ? CommonStyle.textHighlighter : null]}>{option.description1}</Text>
                                                            </TouchableOpacity>
                                                            <Text style={CommonStyle.authenticatorTextBox}>{option.description2}</Text>
                                                        </View>
                                                    </View>
                                                    <View></View>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                    <View style={{
                                        flexDirection: 'row', 
                                        justifyContent: 'space-between',
                                        borderColor: Colors.secondary,
                                        borderTopWidth: 2,
                                        borderLeftWidth: 2,
                                        borderRightWidth: 2
                                    }}>
                                        {!isMfaRequiredFlag &&
                                            <TouchableOpacity onPress={() => skipMfaFn()} style={[CommonStyle.enableSkipMfaBtn, style = { width: '50%' }]}>
                                                <Text style={CommonStyle.enableSkipMfaBtnText}>Skip</Text>
                                            </TouchableOpacity>
                                        }
                                        <TouchableOpacity style={[CommonStyle.enableSubmitMfaBtn, style = { width: isMfaRequiredFlag ? '100%' : '50%' }]} onPress={() => submitMfa()}>
                                            <Text style={CommonStyle.enableSubmitMfaBtnText}>Submit</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </>
                        }
                    </>
                }
            />
            <CustomPopup
                visible={authenticatorPopupFlag}
                onRequestClose={() => {
                    setAuthenticatorPopupFlag(!authenticatorPopupFlag);
                }}
                firstContentBody="The following authenticator apps support TOTP and can be configured by scanning the QR code: "
                secondContentBody="Twilio Authy Authenticator, Duo Mobile, Microsoft Authenticator, Google Authenticator, Symantec VIP"
                popupDimensions="90%"
                secondContentShow={true}
            />
        </>
    );
};

export default MFAModalContent;
