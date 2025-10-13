const screen = Dimensions.get("window");

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
    ScrollView,
    Alert,
    BackHandler
} from 'react-native';
const screenWidth = screen.width;
const screenheight = screen.height;
const welcomeLogoheight = screenheight * (Platform.OS == 'ios' ? 0.09 : 0.15);
const welcomeMSGheight = screenheight * 0.1;
const bookAppointmentheight = screenheight * 0.15;
const viewbuttonheight = screenheight * 0.20;
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
    // console.log("reduxAuthJson", reduxAuthJson);
    const [pageLoading, setPageLoading] = useState(false);
    const [filterFlag, setFilterFlag] = useState(false);
    const snapPoints = ['50%'];
    const { clearLocalStorage } = LogOut();
    const [webViewFlag, setWebViewFlag] = useState(false);
    const [webViewData, setWebViewData] = useState("");

    useFocusEffect(
        useCallback(() => {
            return () => {
                hideBookAppointmentScreen();
            };
        }, [])
    );

    /*useEffect(() => {
        const handleBackButtonPress = () => {
            if (webViewFlag) {
                // Go back to Component One
                setWebViewFlag(false);
                return true; // Prevent default back button behavior
            }
            return false; // Allow default behavior if already on Component One
        };

        // Add event listener
        BackHandler.addEventListener("hardwareBackPress", handleBackButtonPress);

        // Clean up event listener on component unmount
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", handleBackButtonPress);
        };
    }, [webViewFlag]);*/

    useEffect(() => {
        const handleBackButtonPress = () => {
            if (webViewFlag) {
                // Go back to Component One
                setWebViewFlag(false);
                return true; // Prevent default back button behavior
            }
            return false; // Allow default behavior
        };

        // Subscribe to back press
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            handleBackButtonPress,
        );

        // Cleanup subscription on unmount
        return () => backHandler.remove();
    }, [webViewFlag]);

    const handleFilter = () => {
        setFilterFlag(!filterFlag);
    }

    const handleBackPress = () => {
        console.log("handleBackPress");
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            console.log("No previous screen to go back to.");
        }
    }

    const appointmentLink = async () => {
        navigation.navigate('Appointment', { reload: true });
    }
    const questionnaireLink = async () => {
        console.log("questionnaireLink");
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
            // "videoDetails": videoDetailsObj
        }

        const data = JSON.stringify(dataHash);
        const encodedData = encodeURIComponent(data);
        setWebViewData(encodedData);

        setWebViewFlag(true);

        // Alert.alert(
        //     "Confirmation", // Title
        //     "Please note that you will be redirected to our website or the OC Patient Portal to complete this task", // Message
        //     [
        //         {
        //             text: "Cancel",
        //             style: "cancel",
        //         },
        //         {
        //             text: "Yes",
        //             onPress: () => {
        //                 Linking.openURL(Config.bookingUrl)
        //                     .catch(err => console.error("Failed to open URL:", err));
        //             },
        //         },
        //     ]
        // );
    };


    // const clearLocalStorage = async () => {
    //     await AsyncStorage.multiRemove([
    //         'finalIdToken', 'i18nextLng', 'accessToken', 'refreshToken',
    //         'loginCredentials', 'loginTime', 'attachOrganization', 'chooseOrganization'
    //     ]);
    //     EventEmitter.emit("broadcustMessage", { "logoutSuccess": true });
    //     dispatch({ type: 'SET_TOKEN', payload: "" });
    // }

    const logoutApp = () => {
        Alert.alert(
            "Confirmation", // Title
            "Are you sure you want to logout?", // Message
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel", // Styles the button (optional: 'default', 'cancel', 'destructive')
                },
                {
                    text: "OK",
                    onPress: () => clearLocalStorage(true),
                },
            ],
            { cancelable: false } // Prevent closing by tapping outside the popup
        );
    };

    const handleMessage = (event) => {
        const data = JSON.parse(event.nativeEvent.data);
        setWebViewFlag(false);
        if (data.message === "save successfully") {
            navigation.navigate('Appointment', { reload: true });
        }
        console.log("Received from WebView:--------------------------------------------", data.message);
    };

    const hideBookAppointmentScreen = () => {
        setWebViewFlag(false);
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
            <View style={styles.container}>
                <Loader style={styles.loadingCss} loading={pageLoading} />
                {
                    webViewFlag ?
                        <>
                            <CustomHeader
                                pageName={"Book an Appointment"}
                                hideBookAppointmentScreen={hideBookAppointmentScreen}
                            />
                            <WebView
                                source={{ uri: `${Config.bookingUrl}?data=${webViewData}`  }}
                                mediaPlaybackRequiresUserAction={false}
                                allowsInlineMediaPlayback={true}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                                onMessage={handleMessage}
                                style={{ flex: 1 }}
                            />
                        </> :
                        <>
                            <Image source={require('../../../Utility/Public/images/oaktreeLogo.png')} style={styles.oaktreeLogo} />
                            <TouchableOpacity
                                style={[styles.signout]} // Temporary background for testing
                                onPress={() => logoutApp()}
                            >
                                <Image
                                    source={require('../../../Utility/Public/images/signout.png')}
                                    style={{ width: 24, height: 24 }}
                                />
                            </TouchableOpacity>
                            <View style={[styles.panel]}>
                                <View style={styles.topPanelTaxtBox}>
                                    <Text style={styles.topPanelTaxt}>Welcome to Oaktree Connect</Text>
                                </View>
                                <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
                                    {/* <TouchableOpacity style={[styles.panelBox, styles.appointmentBox]} onPress={openWebsite}>
                                    <Text style={styles.panelBoxText}>Book an {'\n'} Appointment </Text>
                                </TouchableOpacity> */}
                                    {/* <TouchableOpacity style={[styles.panelBox, styles.panelBoxDocument]} onPress={myDocumentLink}>
                                    <Text style={[styles.panelBoxRightMainTextDown, styles.panelBoxRightMainTextDownDocument]}>My Documents</Text>
                                    <Image
                                        source={require('../../../Utility/Public/images/idCard.png')}
                                        style={[styles.calenderImage, styles.calenderImagedocument]}
                                    />
                                    <Text style={[styles.panelBoxRightMainTextDown, styles.panelBoxRightMainTextDownDocument]}>Upload Your Photo ID</Text>
                                </TouchableOpacity> */}
                                    <TouchableOpacity style={[styles.panelBox, styles.panelBoxDocument]} onPress={appointmentLink}>
                                        {/* <Text style={[styles.panelBoxRightMainTextDown, styles.panelBoxRightMainTextDownDocument]}>My Documents</Text> */}
                                        <View style={styles.innerPanelBoxDocument}>
                                            <Image
                                                source={require('../../../Utility/Public/images/clock.png')}
                                                style={[styles.calenderImage, styles.clockImagedocument]}
                                            />
                                            <Image
                                                source={require('../../../Utility/Public/images/calender.png')}
                                                style={[styles.calenderImage, styles.calenderImagedocument]}
                                            />
                                        </View>
                                        <View style={[styles.panelBoxRightMainTextDown, styles.panelBoxRightMainTextDownDocument]}>
                                            <Text style={[styles.panelBoxRightMainTextDownDocumentText]}>
                                                View & Start Appointment</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <View style={styles.middlePanelBoxes}>
                                        <TouchableOpacity style={styles.middlePanelBox} onPress={thirdPartyDocumentLink}>
                                            <Image
                                                source={require('../../../Utility/Public/images/icon1.png')}
                                                style={[styles.calenderImage, styles.appointmentsIcon]}
                                            />
                                            <Text style={styles.panelBoxRightMainTextDown}>View / Upload{'\n'}3rd Party Documents</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.middlePanelBox} onPress={myDocumentLink}>

                                            <Image
                                                source={require('../../../Utility/Public/images/icon2.png')}
                                                style={[styles.calenderImage, styles.appointmentsIcon]}
                                            />
                                            <Text style={styles.panelBoxRightMainTextDown}>Upload ID</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.middlePanelBoxRight}>
                                        <Text style={styles.myTherapyTasksText}>My Therapy Tasks</Text>
                                        <View style={styles.myTherapyTasks}>
                                            <TouchableOpacity style={[styles.myTherapyTasksPanelBox]} onPress={healthParameterLink}>
                                                <View style={styles.roundiconBox}>
                                                    <Image
                                                        source={require('../Public/images/physicalParametersIcon.png')}
                                                        style={styles.heartRatingImage}
                                                    />
                                                </View>
                                                <Text style={styles.panelBoxRightMainTextDown}>View / Add{'\n'}Physical Parameters</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={[styles.myTherapyTasksPanelBox]} onPress={questionnaireLink}>
                                                <View style={styles.roundiconBox}>
                                                    <Image
                                                        source={require('../Public/images/questionnairesIcon.png')}
                                                        style={styles.calenderImage}
                                                    />
                                                </View>
                                                <Text style={styles.panelBoxRightMainTextDown}> View / Complete{'\n'}Questionnaires</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    {/* <TouchableOpacity style={[styles.panelBox, styles.appointmentBox]} onPress={goToAppointmentScreen}>
                                    <Text style={styles.panelBoxText}>Book an {'\n'} Appointment </Text>
                                </TouchableOpacity> */}

                                </ScrollView>
                            </View>
                        </>
                }
            </View >
        </SafeAreaView>
    );
}

export default Home;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#dff7f8',
    },
    container: {
        flex: 1,
        backgroundColor: '#dff7f8',
        position: 'relative',
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
        objectFit: 'contain',
    },
    signout: {
        height: 40,
        width: 40,
        position: 'absolute',
        right: 15,
        top: 15,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9
        //backgroundColor:'red',
    },
    signoutimg: {
        height: 40,
        width: 40,
        objectFit: 'contain',
    },
    panel: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 25,
        paddingVertical: 0,
        paddingTop: welcomeLogoheight,
        // backgroundColor:'blue'
    },
    topPanelTaxtBox: {
        margin: 0,
        padding: 0,
        width: "100%",
        textAlign: 'center',
        //backgroundColor:"red",
        //height: welcomeMSGheight,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        //paddingVertical:10,
        paddingTop: Platform.OS == 'ios' ? 20 : 0,
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
        height: mydocumentheight,
        justifyContent: 'center',
        // backgroundColor:'red',
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
        //backgroundColor:'blue',
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
        // backgroundColor: 'red',
        marginLeft: 20,
    },
    clockImagedocument: {
        width: 87,
        height: 80,
        objectFit: 'contain',
        marginTop: 10,
    },
    appointmentsIcon: {
        width: 70,
        height: 70,
        objectFit: 'contain',
    },
    panelBoxRightMainTextDown: {
        fontSize: Platform.OS == 'ios' ? 14 : 14,
        color: '#000',
        fontFamily: 'Arimo-Bold',
        textAlign: 'center',
        // backgroundColor:'red',
        width: "100%",
        lineHeight: 16,
        marginTop: 15,
    },
    panelBoxRightMainTextDownSec: {
        marginTop: 0,
        textAlign: 'left',
    },

    panelBoxRightMainTextDownDocument: {
        // fontSize: 18,
        // color: '#999',
        // fontFamily: 'Montserrat-Bold',
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
        lineHeight: 16,
        fontFamily: 'Arimo-Bold',
    },
    middlePanelBoxes: {
        width: screenWidth - 50,
        padding: 0,
        //backgroundColor: 'blue',
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',

    },
    middlePanelBox: {
        width: screenWidth / 2 - 30,
        padding: 5,
        paddingVertical: 10,
        backgroundColor: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        borderRadius: 0,
        textAlign: 'center',
        height: viewbuttonheight,
        borderRadius: 10,
        shadowColor: Platform.OS == 'ios' ? '#666' : '#000',
        shadowOffset: { width: Platform.OS == 'ios' ? .8 : 1 },
        shadowOpacity: Platform.OS == 'ios' ? 0.3 : 0.5,
        shadowRadius: 5,
        elevation: Platform.OS == 'ios' ? 3 : 5,
        borderColor: '#3d3f3f',
        borderWidth: 1,
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
        objectFit: 'contain',
        marginTop: 0,
        // backgroundColor:'red'
    },
    heartRatingImage: {
        width: 50,
        height: 50,
        objectFit: 'contain',
        marginTop: 0,
        // backgroundColor:'red'
    },

    myTherapyTasksPanelBox: {
        width: screenWidth / 2 - 36,
        padding: 5,
        paddingVertical: 10,
        backgroundColor: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        borderRadius: 0,
        textAlign: 'center',
        height: viewbuttonheight,
        borderRadius: 10,
        shadowColor: Platform.OS == 'ios' ? '#666' : '#000',
        shadowOffset: { width: Platform.OS == 'ios' ? .8 : 1 },
        shadowOpacity: Platform.OS == 'ios' ? 0.3 : 0.5,
        shadowRadius: 5,
        elevation: Platform.OS == 'ios' ? 3 : 5,
        borderColor: '#fff',
        borderWidth: 2,
    },
    myTherapyTasksText: {
        fontSize: 16,
        color: '#fff',
        lineHeight: 16,
        fontFamily: 'Montserrat-Bold',
        textAlign: 'center',
        padding: 5,
        marginBottom: 5,
    }
});

