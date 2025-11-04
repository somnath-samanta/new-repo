import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ToastAndroid, Modal, TouchableWithoutFeedback } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Colors from '../Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-simple-toast';
import ProfileStyle from '../../Modules/Profile/Public/css/ProfileStyle';
import { useTheme } from '../../Contexts/ThemeContext';
import CustomPopup from '../Components/CustomPopup';
import CommonStyle from '../Public/css/CommonStyle';


const QRCodeGenerator = ({ secretCode, accountName, setotpParent, verifySoftwareTokenFunction }) => {
    const { isDarkTheme, toggleTheme } = useTheme();
    const theme = ProfileStyle(isDarkTheme);
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(accountName)}?secret=${secretCode}&issuer=Oaktree`;
    const [otp, setOtp] = useState(new Array(6).fill(''));
    const inputRefs = useRef([]);
    const [isCopied, setIsCopied] = useState(false);
    const [authenticatorPopupFlag, setAuthenticatorPopupFlag] = useState(false);

    const handleChange = (value, index) => {
        if (isNaN(value)) return;
        const updatedOtp = [...otp];
        updatedOtp[index] = value;
        setOtp(updatedOtp);
        setotpParent(updatedOtp);

        if (value && index < otp.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyPress = ({ nativeEvent }, index) => {
        if (nativeEvent.key === 'Backspace' && otp[index] === '') {
            if (index > 0) {
                inputRefs.current[index - 1].focus();
            }
        }
    };

    const copySecretCode = () => {
        Clipboard.setString(secretCode);
        setIsCopied(true);
        //Toast.show("Text copied")
        ToastAndroid.show('Text copied!', ToastAndroid.SHORT);
        setTimeout(() => {
            setIsCopied(false);
        }, 1000);
    };

    //console.log("isCopied============", isCopied)

    const authenticatorDetailsFn = () => {
        setAuthenticatorPopupFlag(true)
    }
    const closeAuthenticatorPopup = () => {
        setAuthenticatorPopupFlag(false)
    }

    return (
        <View style={CommonStyle.qrContainer}>
            <View style={CommonStyle.containerTopSection}>
                {/* <Text style={CommonStyle.qrTitle}>Scan the QR Code with your Authenticator App </Text> */}
                <View>
                    <Text allowFontScaling={false} style={CommonStyle.qrTitle}>Scan the QR code using
                        <View style={CommonStyle.touchableWrapper}>
                            <TouchableOpacity onPress={() => authenticatorDetailsFn()}><Text allowFontScaling={false} style={CommonStyle.authenticatorHighlighterText}>authenticator app</Text>
                            </TouchableOpacity>
                        </View>
                        to generate a one-time passcode (TOTP). Once generated, enter the code in the input box below to complete the setup</Text>
                </View>
                <QRCode value={otpauthUrl} size={150} />

                <View style={CommonStyle.qrInputGroup}>
                    {otp.map((data, index) => (
                        <TextInput
                            key={index}
                            ref={(input) => (inputRefs.current[index] = input)}
                            style={CommonStyle.qrInputBox}
                            allowFontScaling={false}
                            value={data}
                            onChangeText={(value) => handleChange(value, index)}
                            onKeyPress={(event) => handleKeyPress(event, index)}
                            maxLength={1}
                            keyboardType="numeric"
                            returnKeyLabel='Done'
                            returnKeyType='done'
                            onSubmitEditing={() => { verifySoftwareTokenFunction() }}
                        />
                    ))}
                </View>
                <View style={CommonStyle.copyTopContainer}>
                    <Text allowFontScaling={false} style={CommonStyle.authenticatorText}>If you are using the same device, manually enter the secret key into your authenticator app: </Text>
                    <View style={{ position: 'relative' }}>
                        <Text allowFontScaling={false} selectable style={CommonStyle.secretText}>{secretCode}</Text>
                        <TouchableOpacity onPress={() => copySecretCode()} style={CommonStyle.copySecretCodeBtn}>
                            <Ionicons name="copy-outline" size={25} color={Colors.secondary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <View style={CommonStyle.qrSubmitBtnContainer}>
                <TouchableOpacity style={CommonStyle.qrSubmitBtn} onPress={() => verifySoftwareTokenFunction()}>
                    <Text allowFontScaling={false} style={CommonStyle.qrSubBtnText}>Submit</Text>
                </TouchableOpacity>
            </View>
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
        </View>
    );
};

export default QRCodeGenerator;
