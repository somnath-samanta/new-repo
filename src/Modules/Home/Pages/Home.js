import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
    FlatList,
    Text,
    useColorScheme,
    View,
    TouchableOpacity,
    Image,
    Button,
    StyleSheet,
    ActivityIndicator,
    Linking,
    Dimensions,
    Platform,
    Animated,
    Easing,
    Alert,
    BackHandler,
    StatusBar
} from 'react-native';

const screen = Dimensions.get("window");
const screenWidth = screen.width;
const screenHeight = screen.height;
const isSmallDevice = screenHeight < 700;
const isLargeDevice = screenHeight > 800;

// Responsive height calculations
const welcomeLogoHeight = isSmallDevice ? screenHeight * 0.08 : screenHeight * 0.1;
const welcomeMSGHeight = isSmallDevice ? screenHeight * 0.05 : screenHeight * 0.06;
const viewButtonHeight = isSmallDevice ? screenHeight * 0.16 : screenHeight * 0.18;
const buttonSpacing = isSmallDevice ? 8 : 12;
const screenheight = screen.height;
const mydocumentheight = screenheight * (Platform.OS == 'ios' ? 0.22 : 0.26);

import { useSelector, useDispatch } from 'react-redux';
import Loader from '../../../Utility/Components/Loader';
import Config from '../../../Utility/Config';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EventEmitter from '../../../Contexts/EventEmitter';
import { LogOut } from '../../../Utility/Components/LogOut';
import { WebView } from 'react-native-webview';
import CustomHeader from '../../../Utility/Components/CustomHeader';
import { SafeAreaView } from 'react-native-safe-area-context';

function Home({ props }) {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const reduxAuthJson = useSelector((state) => state);
    const [pageLoading, setPageLoading] = useState(false);
    const [filterFlag, setFilterFlag] = useState(false);
    const [webViewFlag, setWebViewFlag] = useState(false);
    const [webViewData, setWebViewData] = useState('');
    const snapPoints = ['50%'];
    const { clearLocalStorage } = LogOut();

    useFocusEffect(
        useCallback(() => {
            return () => {
                hideBookAppointmentScreen();
            };
        }, [])
    );

    useEffect(() => {
        const handleBackButtonPress = () => {
            if (webViewFlag) {
                setWebViewFlag(false);
                return true;
            }
            return false;
        };
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            handleBackButtonPress,
        );
        return () => backHandler.remove();
    }, [webViewFlag]);

    const handleFilter = () => {
        setFilterFlag(!filterFlag);
    }

    const handleBackPress = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    }

    const appointmentLink = async () => {
        navigation.navigate('Appointment', { reload: true });
    }
    const questionnaireLink = async () => {
        navigation.navigate('Questionnaire', { questionnairereload: true });
    }
    const myDocumentLink = async () => {
        navigation.navigate('MyDocument');
    }
    const thirdPartyDocumentLink = async () => {
        navigation.navigate('ThirdPartyDocument');
    }
    const healthParameterLink = async () => {
        navigation.navigate('HealthParameter');
    }

    const goToAppointmentScreen = () => {
        let dataHash = {
            "refreshToken": reduxAuthJson.token.refreshToken,
            "accesToken": reduxAuthJson.token.accesToken,
            "tokenExpiryDate": reduxAuthJson.token.tokenExpiryDate,
            "PatientDetails": reduxAuthJson.currentUserDetails,
        }
        const data = JSON.stringify(dataHash);
        const encodedData = encodeURIComponent(data);
        setWebViewData(encodedData);
        setWebViewFlag(true);
    };

    const logoutApp = () => {
        Alert.alert(
            "Confirmation",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "OK", onPress: () => clearLocalStorage(true) },
            ],
            { cancelable: false }
        );
    };

    const handleMessage = (event) => {
        const data = JSON.parse(event.nativeEvent.data);
        setWebViewFlag(false);
        if (data.message === "save successfully") {
            navigation.navigate('Appointment', { reload: true });
        }
    };

    const hideBookAppointmentScreen = useCallback(() => {
        setWebViewFlag(false);
    }, []);

    const renderWebView = useCallback(() => (
        <>
            <CustomHeader
                pageName={"Book an Appointment"}
                hideBookAppointmentScreen={hideBookAppointmentScreen}
            />
            <WebView
                source={{ uri: `${Config.bookingUrl}?data=${webViewData}` }}
                mediaPlaybackRequiresUserAction={false}
                allowsInlineMediaPlayback={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                onMessage={handleMessage}
            />
        </>
    ), [webViewData, hideBookAppointmentScreen]);

    return (
        <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
            <Loader style={styles.loadingCss} loading={pageLoading} />
            {webViewFlag ? renderWebView() : (
                <View style={styles.container}>
                    <Image
                        source={require('../../../Utility/Public/images/oaktreeLogo.png')}
                        style={styles.oaktreeLogo}
                        resizeMode="contain" // FIX: safe scale
                    />
                    <TouchableOpacity
                        style={styles.signout}
                        onPress={logoutApp}
                    >
                        <Image
                            source={require('../../../Utility/Public/images/signout.png')}
                            style={{ width: 24, height: 24 }}
                            resizeMode="contain" // FIX
                        />
                    </TouchableOpacity>

                    <View style={styles.panel}>
                        <View style={styles.topPanelTaxtBox}>
                            <Text allowFontScaling={false} style={styles.topPanelTaxt}>
                                Welcome to Oaktree Connect
                            </Text>
                        </View>

                        <View style={styles.contentContainer}>
                            <TouchableOpacity style={[styles.panelBox, styles.panelBoxDocument]} onPress={appointmentLink}>
                                <View style={styles.innerPanelBoxDocument}>
                                    <Image
                                        source={require('../../../Utility/Public/images/clock.png')}
                                        style={[styles.calenderImage, styles.clockImagedocument]}
                                        resizeMode="contain" // FIX
                                    />
                                    <Image
                                        source={require('../../../Utility/Public/images/calender.png')}
                                        style={[styles.calenderImage, styles.calenderImagedocument]}
                                        resizeMode="contain" // FIX
                                    />
                                </View>
                                <View style={[styles.panelBoxRightMainTextDown, styles.panelBoxRightMainTextDownDocument]}>
                                    <Text
                                        allowFontScaling={false}
                                        style={[styles.panelBoxRightMainTextDownDocumentText]}
                                        // Text will wrap; no visual change
                                    >
                                        View & Start Appointment
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <View style={styles.middlePanelBoxes}>
                                <TouchableOpacity style={styles.middlePanelBox} onPress={thirdPartyDocumentLink}>
                                    <Image
                                        source={require('../../../Utility/Public/images/icon1.png')}
                                        style={[styles.calenderImage, styles.appointmentsIcon]}
                                        resizeMode="contain" // FIX
                                    />
                                    <Text allowFontScaling={false} style={styles.panelBoxRightMainTextDown}>
                                        View / Upload{'\n'}3rd Party Documents
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.middlePanelBox} onPress={myDocumentLink}>
                                    <Image
                                        source={require('../../../Utility/Public/images/icon2.png')}
                                        style={[styles.calenderImage, styles.appointmentsIcon]}
                                        resizeMode="contain" // FIX
                                    />
                                    <Text allowFontScaling={false} style={styles.panelBoxRightMainTextDown}>
                                        Upload ID
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.middlePanelBoxRight}>
                                <Text allowFontScaling={false} style={styles.myTherapyTasksText}>My Therapy Tasks</Text>
                                <View style={styles.myTherapyTasks}>
                                    <TouchableOpacity style={[styles.myTherapyTasksPanelBox]} onPress={healthParameterLink}>
                                        <View style={styles.roundiconBox}>
                                            <Image
                                                source={require('../Public/images/physicalParametersIcon.png')}
                                                style={styles.heartRatingImage}
                                                resizeMode="contain" // FIX
                                            />
                                        </View>
                                        <Text allowFontScaling={false} style={styles.panelBoxRightMainTextDown}>
                                            View / Add{'\n'}Physical Parameters
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.myTherapyTasksPanelBox]} onPress={questionnaireLink}>
                                        <View style={styles.roundiconBox}>
                                            <Image
                                                source={require('../Public/images/questionnairesIcon.png')}
                                                style={styles.calenderImage}
                                                resizeMode="contain" // FIX
                                            />
                                        </View>
                                        <Text allowFontScaling={false} style={styles.panelBoxRightMainTextDown}>
                                            View / Complete{'\n'}Questionnaires
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );

}

export default Home;

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#dff7f8',
        flex: 1,
        paddingTop: 0,
        paddingBottom: 0,
    },
    container: {
        flex: 1,
        width: '100%',
    },
    panel: {
        flex: 1,
        width: '100%',
        paddingHorizontal: isSmallDevice ? 15 : 20,
        paddingTop: isSmallDevice ? welcomeLogoHeight * 1.5 : welcomeLogoHeight * 1.2,
    },
    contentContainer: {
        flex: 1,
        width: '100%',
        paddingBottom: isSmallDevice ? 10 : 20,
    },
    loadingCss: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        left: 0,
        top: 0
    },
    oaktreeLogo: {
        height: 110,
        width: 110,
        position: 'absolute',
        left: -20,
        top: -10,
        // objectFit removed; using resizeMode on Image
    },
    signout: {
        height: isSmallDevice ? 36 : 40,
        width: isSmallDevice ? 36 : 40,
        position: 'absolute',
        right: isSmallDevice ? 10 : 15,
        top: isSmallDevice ? 10 : 15,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9,
    },
    signoutimg: {
        height: 40,
        width: 40,
        // objectFit removed
    },

    topPanelTaxtBox: {
        margin: 0,
        padding: 0,
        width: "100%",
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: Platform.OS == 'ios' ? 20 : 5,
        paddingBottom: Platform.OS == 'ios' ? 15 : 5,
    },
    topPanelTaxt: {
        fontSize: 19,
        color: '#000',
        fontFamily: 'Montserrat-Medium',
        width: "100%",
        textAlign: 'center',
    },
    panelBox: {
        backgroundColor: '#fff',
        padding: 0,
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#f3f3f3',
        borderRadius: 0,
        marginVertical: 10,
    },
    panelBoxDocument: {
        flexDirection: 'column',
        padding: 15,
        paddingLeft: 30,
        paddingRight: 30,
        borderWidth: 1,
        borderColor: '#219980',
        borderRadius: 0,
        // height: mydocumentheight,                // ❌ fixed height
        minHeight: mydocumentheight,                // ✅ allow growth when text wraps
        justifyContent: 'center',
        backgroundColor: '#219980',
        borderRadius: 10,
        shadowColor: Platform.OS == 'ios' ? '#666' : '#000',
        shadowOffset: { width: Platform.OS == 'ios' ? .8 : 1 },
        shadowOpacity: Platform.OS == 'ios' ? 0.3 : 0.5,
        shadowRadius: 5,
        elevation: Platform.OS == 'ios' ? 3 : 5,
        textAlign: 'center'
    },
    innerPanelBoxDocument: {
        backgroundColor: '#def6f7',
        padding: 10,
        width: "100%",
        borderRadius: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    appointmentBox: {
        borderColor: '#333',
        justifyContent: 'center',
        padding: 20,
        paddingHorizontal: 55,
        textAlign: 'center',
        borderRadius: 5,
        shadowColor: Platform.OS == 'ios' ? '#666' : '#000',
        shadowOffset: { width: Platform.OS == 'ios' ? .8 : 1 },
        shadowOpacity: Platform.OS == 'ios' ? 0.3 : 0.5,
        shadowRadius: 5,
        elevation: Platform.OS == 'ios' ? 3 : 5,
    },
    panelBoxText: {
        fontSize: 20,
        color: '#333',
        fontFamily: 'Montserrat-SemiBold',
        textAlign: 'center',
        lineHeight: 30,
    },

    calenderImagedocument: {
        marginVertical: 10,
        width: 93,
        height: 88,
        marginLeft: 20,
    },
    clockImagedocument: {
        width: 87,
        height: 80,
        marginTop: 10,
    },
    appointmentsIcon: {
        width: 70,
        height: 70,
    },
    panelBoxRightMainTextDown: {
        fontSize: Platform.OS == 'ios' ? 13 : 13,
        color: '#000',
        fontFamily: 'Arimo-Bold',
        textAlign: 'center',
        width: "100%",
        lineHeight: Platform.OS == 'ios' ? 16 : 16, // FIX: taller lines avoid cramping
        marginTop: 15,
        fontWeight: '700',
        paddingHorizontal: 6,      // FIX: gives breathing room on minis
        flexShrink: 1,             // FIX: allow text to wrap instead of overflow
    },
    panelBoxRightMainTextDownSec: {
        marginTop: 0,
        textAlign: 'left',
    },

    panelBoxRightMainTextDownDocument: {
        backgroundColor: '#fff',
        padding: 12,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginTop: 10,
    },
    panelBoxRightMainTextDownDocumentText: {
        fontSize: 16,
        color: '#000',
        lineHeight: 18,           // FIX to match above
        fontFamily: 'Arimo-Bold',
        fontWeight: '700',
        textAlign: 'center',
        paddingHorizontal: 6,
        flexShrink: 1,
    },
    middlePanelBoxes: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 5,
    },
    middlePanelBox: {
        width: '48%',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: isSmallDevice ? 8 : 5,
        borderRadius: 10,
        shadowColor: Platform.OS === 'ios' ? '#666' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        // height: viewButtonHeight,              // ❌
        minHeight: viewButtonHeight,              // ✅
        borderWidth: 1,
        borderColor: '#3d3f3f',
    },
    middlePanelBoxRight: {
        backgroundColor: '#007b80',
        padding: 6,
        borderRadius: 10,
        shadowColor: Platform.OS == 'ios' ? '#666' : '#000',
        shadowOffset: { width: Platform.OS == 'ios' ? .8 : 1 },
        shadowOpacity: Platform.OS == 'ios' ? 0.3 : 0.5,
        shadowRadius: 5,
        elevation: Platform.OS == 'ios' ? 3 : 5,
        borderColor: '#007b80',
        borderWidth: 2,
        marginTop: 10,
    },
    myTherapyTasks: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    roundiconBox: {
        width: 70,
        height: 70,
        backgroundColor: '#007b80',
        borderRadius: 100,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    calenderImage: {
        width: 40,
        height: 40,
    },
    heartRatingImage: {
        width: 50,
        height: 50,
    },

    myTherapyTasksPanelBox: {
        width: '48%',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: isSmallDevice ? 8 : 5,
        borderRadius: 10,
        shadowColor: Platform.OS === 'ios' ? '#666' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        // height: viewButtonHeight,              // ❌
        minHeight: viewButtonHeight,              // ✅
        borderWidth: 2,
        borderColor: '#fff',
        marginBottom: buttonSpacing,
    },
    myTherapyTasksText: {
        fontSize: 16,
        color: '#fff',
        lineHeight: 16,
        fontFamily: 'Montserrat-Bold',
        textAlign: 'center',
        padding: 5,
        marginBottom: 8,
        fontWeight: '700'
    }
});
