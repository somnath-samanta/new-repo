import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, BackHandler, FlatList, TouchableOpacity, Image, Platform } from 'react-native';
import CustomHeader from '../../../Utility/Components/CustomHeader';
import Loader from '../../../Utility/Components/Loader';
import Colors from '../../../Utility/Colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getPatientHealthProfile } from '../Controller/HealthParametersController';
import { useSelector } from 'react-redux';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';

const screen = Dimensions.get("window");
const screenWidth = screen.width;
const screenHeight = screen.height;
const cardHeight = screenHeight * 0.23;
const cardBoxesHeight = screenHeight * .75;
function HealthParameter() {
    const [webViewFlag, setWebViewFlag] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const navigation = useNavigation();
    const hasFetchedVitalsRef = useRef(false);
    const userId = useSelector((s) => s?.token?.loginUserId);
    const [refreshing, setRefreshing] = useState(false);
    // Static demo data (replace with API data later)
    const [metrics, setMetrics] = useState([
        {
            key: 'height',
            title: 'Height',
            value: '-',
            unit: '',
            lastUpdate: '22.04.2024, 9.30 am',
            icon: require('../../../Utility/Public/images/healthIcon1.png'),
        },
        {
            key: 'weight',
            title: 'Weight',
            value: '-',
            unit: '',
            lastUpdate: '22.04.2024, 9.30 am',
            icon: require('../../../Utility/Public/images/healthIcon2.png'),
        },
        {
            key: 'bmi',
            title: 'BMI',
            value: '-',
            unit: '',
            lastUpdate: '22.04.2024, 9.30 am',
            icon: require('../../../Utility/Public/images/healthIcon3.png'),
        },
        {
            key: 'waist',
            title: 'Waist Circumference',
            value: '-',
            unit: '',
            lastUpdate: '22.04.2024, 9.30 am',
            icon: require('../../../Utility/Public/images/healthIcon4.png'),
        },
        {
            key: 'pulse',
            title: 'Pulse Rate',
            value: '-',
            unit: '',
            lastUpdate: '22.04.2024, 9.30 am',
            icon: require('../../../Utility/Public/images/healthIcon5.png'),
        },
        {
            key: 'bp',
            title: 'Blood Pressure',
            value: '00/00',
            unit: '',
            lastUpdate: '22.04.2024, 9.30 am',
            icon: require('../../../Utility/Public/images/healthIcon6.png'),
        },
        {
            key: 'pulse1',
            title: 'Pulse Rate1',
            value: '-',
            unit: '',
            lastUpdate: '22.04.2024, 9.30 am',
            icon: require('../../../Utility/Public/images/healthIcon5.png'),
        },
        {
            key: 'bp1',
            title: 'Blood Pressure1',
            value: '00/00',
            unit: '',
            lastUpdate: '22.04.2024, 9.30 am',
            icon: require('../../../Utility/Public/images/healthIcon6.png'),
        },
    ]);

    // Helpers to transform vitals into metrics
    const intToKey = {
        1: 'height',
        2: 'weight',
        3: 'bmi',
        4: 'waist',
        5: 'bp',
        6: 'pulse',
    };
    const keyToInt = Object.entries(intToKey).reduce((acc, [i, k]) => { acc[k] = Number(i); return acc; }, {});
    const fmtDateTime = (iso) => {
        if (!iso) return '';
        const d = new Date(iso);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        let hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12; if (hours === 0) hours = 12;
        return `${dd}.${mm}.${yyyy}, ${hours}.${minutes} ${ampm}`;
    };

    const updateMetricsFromVitals = (vitalsList) => {
        const latestByInt = vitalsList.reduce((acc, v) => {
            if (v?.valueInteger == null || v?.effectiveDateTime == null) return acc;
            const vi = v.valueInteger;
            if (!intToKey[vi]) return acc;
            const ts = new Date(v.effectiveDateTime).getTime();
            const prev = acc[vi];
            if (!prev || ts > prev.ts) {
                acc[vi] = { ts, item: v };
            }
            return acc;
        }, {});

        setMetrics((prev) => prev.map((m) => {
            const vi = keyToInt[m.key];
            const latest = latestByInt[vi]?.item;
            if (!latest) return m;
            return {
                ...m,
                value: latest.valueString || m.value,
                lastUpdate: fmtDateTime(latest.effectiveDateTime),
            };
        }));
    };

    const fetchVitals = async (force = false) => {
        if (!userId) return;
        if (hasFetchedVitalsRef.current && !force) return;
        // If user pulled to refresh, show refreshing spinner; otherwise full-page loader
        const isManual = force;
        if (isManual) setRefreshing(true); else setPageLoading(true);
        try {
            const res = await getPatientHealthProfile({ id: userId });
            const vitalsList = res?.Patient?.healthProfile?.vitals || [];
            updateMetricsFromVitals(vitalsList);
            hasFetchedVitalsRef.current = true;
        } catch (e) {
            // no-op
        } finally {
            if (isManual) setRefreshing(false); else
                setTimeout(() => {
                    setPageLoading(false);
                }, 500);
        }
    };

    // Initial fetch (per user)
    useEffect(() => {
        hasFetchedVitalsRef.current = false; // reset cache when user changes
        fetchVitals(false);
    }, [userId]);

    // Refresh data when screen comes into focus (e.g., after saving from AddHealthRecord)
    useFocusEffect(
        React.useCallback(() => {
            // Reset the ref and fetch vitals when screen is focused
            hasFetchedVitalsRef.current = false;
            fetchVitals(false);
        }, [])
    );

    const hideBookAppointmentScreen = () => {
        // setWebViewFlag(false);
    };

    const renderMetric = ({ item }) => (
        <View style={styles.card}>

            <Image
                source={item.icon}
                style={styles.iconCircle}
            />
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardValue}>
                <Text style={styles.cardValueNumber}>{item.value}</Text>
                {item.unit ? <Text style={styles.cardValueUnit}>{item.unit}</Text> : null}
            </Text>
            <Text style={styles.lastUpdateLabel}>Last Update:</Text>
            <Text style={styles.lastUpdateText}>{item.lastUpdate}</Text>
        </View>
    );

    const onViewMonitoring = () => {
        navigation.navigate('HealthMonitoring');
    };

    const onAddNewRecord = () => {
        navigation.navigate('AddHealthRecord');
    };

    const handleGoBack = () => {
        // Check if navigation can go back to avoid errors
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            // Optional fallback if this is the first screen
            console.log("No screen to go back to");
        }
    };

    const refreshBtnFn = () => {
        hasFetchedVitalsRef.current = false; // reset cache when user changes
        fetchVitals(false);
    }



    return (
        // <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>

            <Loader style={styles.loadingCss} loading={pageLoading} />
            <CustomHeader
                pageName="Physical Parameters"
                hideBookAppointmentScreen={hideBookAppointmentScreen}
            />

            <View style={styles.content}>
                <View style={styles.topContent}>
                    <TouchableOpacity style={styles.backbtnTop} onPress={handleGoBack}>
                        <FontAwesome6 name="arrow-left-long" size={26} color={Colors.black} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.refreshBtn}
                        onPress={() => refreshBtnFn()}
                    >
                        <FontAwesome name="refresh" size={26} color="#000" />
                    </TouchableOpacity>
                </View>
                <View style={styles.flatListContent}>
                    <FlatList
                        contentContainerStyle={styles.gridContent}
                        data={metrics}
                        renderItem={renderMetric}
                        keyExtractor={(it) => it.key}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                        showsVerticalScrollIndicator={false}
                        refreshing={refreshing}
                        onRefresh={() => fetchVitals(true)}
                    />
                </View>
                <View style={styles.footerBtns}>
                    <TouchableOpacity style={[styles.ctaBtn, styles.ctaPrimary]} onPress={onViewMonitoring}>
                        <Text style={styles.ctaText}>View Health Monitoring</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.ctaBtn, styles.ctaSecondary]} onPress={onAddNewRecord}>
                        <Text style={styles.ctaText}>Add New Record</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>

    );
}

export default HealthParameter;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#E6F6F3',
        marginTop: 0,
        paddingTop: 0,
    },
    container: {
        backgroundColor: '#dff7f8',
        // backgroundColor: 'red',
        position: 'relative',
        width: screenWidth,
        height: screenHeight,
    },
    loadingCss: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        left: 0,
        top: 0,
    },
    content: {
        flex: 1,
        paddingHorizontal: 15,
        paddingTop: 0,
        paddingBottom: 0,
        //backgroundColor: 'blue',
        //height: screenHeight - 170
    },
    topContent: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row'
    },
    flatListContent:{
       // backgroundColor:'blue',
        height:cardBoxesHeight,
        overflow:'hidden'
       // display:'flex',
       // justifyContent:'space-between',
   
    },
    gridContent: {
        paddingTop: 10,
        paddingBottom: 100, // Space for bottom buttons
        flexGrow: 1,
    },
    row: {
        justifyContent: 'space-between',
       // marginBottom: 12,
    },
    card: {
        backgroundColor: '#fff',
        width: (screenWidth - 30 - 12) / 2, // 30 = horizontal padding * 2, 12 = gap between cards
        borderRadius: 10,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
        justifyContent: 'center',
        //aspectRatio: .95, // Makes cards square
        height:cardHeight,
        marginBottom: 12,

    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        color: '#222',
        fontSize: 13,
        fontFamily: 'Arimo-Bold',
        textAlign: 'center',
        marginBottom: 4,
        fontWeight: '700',
        paddingHorizontal: 2,
    },
    cardValue: {
        marginBottom: 8,
    },
    cardValueNumber: {
        color: '#0a978b',
        fontSize: 15,
        fontFamily: 'Arimo-Bold',
        textAlign: 'center',
        fontWeight: '700',
    },
    cardValueUnit: {
        color: '#0a978b',
        fontSize: 13,
        fontFamily: 'Arimo-Bold',
    },
    lastUpdateLabel: {
        color: '#000',
        fontSize: 11,
        fontFamily: 'Arimo-Bold',
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 2,
    },
    lastUpdateText: {
        color: '#000',
        fontSize: 11,
        fontFamily: 'Arimo-Regular',
        textAlign: 'center',
    },
    // footerBtns: {
    //     position: 'absolute',
    //     left: 15,
    //     right: 15,
    //     bottom: 15,
    //     flexDirection: 'row',
    //     justifyContent: 'space-between',
    //     gap: 12,
    //     backgroundColor: 'red'
    // },
    footerBtns: {
        // position: 'absolute',
        // left: 15,
        // right: 15,
        // bottom: Platform.OS === 'ios' ? 15 : 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        zIndex: 999,
        gap: 12,
        margin:0,
    },

    ctaBtn: {
        flex: 1, // 👈 ensures equal width for both buttons
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        //paddingHorizontal:5,
    },

    ctaSecondary: {
        backgroundColor: '#229980',
        marginRight: 6, // 👈 gives a small gap on the right side
    },

    ctaPrimary: {
        backgroundColor: '#007b80',
    },

    ctaText: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Arimo-Bold',
        fontWeight: 700
    },
    backbtnTop: {
        width: 40,
        height: 35,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        //backgroundColor: "#24ad91",

    }
});
