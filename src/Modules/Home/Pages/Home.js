import React, { useState, useEffect, useCallback } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    BackHandler,
    Platform,
    Dimensions,
    ScrollView,
    StatusBar 
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Loader from '../../../Utility/Components/Loader';
import Config from '../../../Utility/Config';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import EventEmitter from '../../../Contexts/EventEmitter';
import { LogOut } from '../../../Utility/Components/LogOut';
import { WebView } from 'react-native-webview';
import CustomHeader from '../../../Utility/Components/CustomHeader';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

function Home() {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const reduxAuthJson = useSelector((state) => state);
    const [pageLoading, setPageLoading] = useState(false);
    const [webViewFlag, setWebViewFlag] = useState(false);
    const [webViewData, setWebViewData] = useState('');
    const { clearLocalStorage } = LogOut();

    useFocusEffect(
        useCallback(() => {
            return () => hideBookAppointmentScreen();
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

    const appointmentLink = () => navigation.navigate('Appointment', { reload: true });
    const questionnaireLink = () => navigation.navigate('Questionnaire', { questionnairereload: true });
    const myDocumentLink = () => navigation.navigate('MyDocument');
    const thirdPartyDocumentLink = () => navigation.navigate('ThirdPartyDocument');
    const healthParameterLink = () => navigation.navigate('HealthParameter');

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
        <SafeAreaView style={[styles.safeArea, { paddingTop: 0 }]} edges={['left', 'right', 'bottom']}>
    <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
            <Loader style={styles.loadingCss} loading={pageLoading} />
            {webViewFlag ? renderWebView() : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.container}>
                        <Image source={require('../../../Utility/Public/images/oaktreeLogo.png')} style={styles.oaktreeLogo} />
                        <TouchableOpacity style={styles.signout} onPress={logoutApp}>
                            <Image
                                source={require('../../../Utility/Public/images/signout.png')}
                                style={{ width: 24, height: 24 }}
                            />
                        </TouchableOpacity>

                        <View style={styles.panel}>
                            <View style={styles.topPanelTaxtBox}>
                                <Text style={styles.topPanelTaxt}>Welcome to Oaktree Connect</Text>
                            </View>

                            <TouchableOpacity style={styles.panelBoxDocument} onPress={appointmentLink}>
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
                                <View style={styles.panelBoxRightMainTextDownDocument}>
                                    <Text style={styles.panelBoxRightMainTextDownDocumentText}>
                                        View & Start Appointment
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <View style={styles.middlePanelBoxes}>
                                <TouchableOpacity style={styles.middlePanelBox} onPress={thirdPartyDocumentLink}>
                                    <Image
                                        source={require('../../../Utility/Public/images/icon1.png')}
                                        style={[styles.calenderImage, styles.appointmentsIcon]}
                                    />
                                    <Text style={styles.panelBoxRightMainTextDown}>
                                        View / Upload{'\n'}3rd Party Documents
                                    </Text>
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
                                    <TouchableOpacity style={styles.myTherapyTasksPanelBox} onPress={healthParameterLink}>
                                        <View style={styles.roundiconBox}>
                                            <Image
                                                source={require('../Public/images/physicalParametersIcon.png')}
                                                style={styles.heartRatingImage}
                                            />
                                        </View>
                                        <Text style={styles.panelBoxRightMainTextDown}>
                                            View / Add{'\n'}Physical Parameters
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.myTherapyTasksPanelBox} onPress={questionnaireLink}>
                                        <View style={styles.roundiconBox}>
                                            <Image
                                                source={require('../Public/images/questionnairesIcon.png')}
                                                style={styles.calenderImage}
                                            />
                                        </View>
                                        <Text style={styles.panelBoxRightMainTextDown}>
                                            View / Complete{'\n'}Questionnaires
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

export default Home;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#dff7f8',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 30,
    },
    container: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 18,
        paddingTop: 10,
    },
    loadingCss: {
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    oaktreeLogo: {
        height: 90,
        width: 90,
        position: 'absolute',
        left: -10,
        top: 0,
        resizeMode: 'contain',
    },
    signout: {
        height: 40,
        width: 40,
        position: 'absolute',
        right: 10,
        top: 10,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9,
    },
    panel: {
        flex: 1,
        marginTop: 100,
    },
    topPanelTaxtBox: {
        alignItems: 'center',
        marginBottom: 15,
    },
    topPanelTaxt: {
        fontSize: 18,
        color: '#000',
        fontFamily: 'Montserrat-Medium',
        textAlign: 'center',
    },
    panelBoxDocument: {
        backgroundColor: '#219980',
        borderRadius: 10,
        padding: 15,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    innerPanelBoxDocument: {
        backgroundColor: '#def6f7',
        padding: 10,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    calenderImagedocument: {
        marginLeft: 15,
        width: width * 0.22,
        height: width * 0.22,
        resizeMode: 'contain',
    },
    clockImagedocument: {
        width: width * 0.2,
        height: width * 0.2,
        resizeMode: 'contain',
    },
    panelBoxRightMainTextDownDocument: {
        backgroundColor: '#fff',
        padding: 12,
        alignItems: 'center',
        borderRadius: 10,
        marginTop: 10,
    },
    panelBoxRightMainTextDownDocumentText: {
        fontSize: 15,
        color: '#000',
        fontWeight: '700',
    },
    middlePanelBoxes: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    middlePanelBox: {
        width: '48%',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
        minHeight: 140,
    },
    appointmentsIcon: {
        width: width * 0.18,
        height: width * 0.18,
        resizeMode: 'contain',
    },
    panelBoxRightMainTextDown: {
        fontSize: 13.5,
        color: '#000',
        fontFamily: 'Arimo-Bold',
        textAlign: 'center',
        marginTop: 10,
        fontWeight: '700',
    },
    middlePanelBoxRight: {
        backgroundColor: '#007b80',
        padding: 10,
        borderRadius: 10,
        marginTop: 10,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
    },
    myTherapyTasksText: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        fontWeight: '700',
        marginBottom: 8,
    },
    myTherapyTasks: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    myTherapyTasksPanelBox: {
        width: '48%',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
        minHeight: 140,
    },
    roundiconBox: {
        width: 70,
        height: 70,
        backgroundColor: '#007b80',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heartRatingImage: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
    },
    calenderImage: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },
});
