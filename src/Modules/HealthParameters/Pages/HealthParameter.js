import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, BackHandler, FlatList, TouchableOpacity } from 'react-native';
import CustomHeader from '../../../Utility/Components/CustomHeader';
import Loader from '../../../Utility/Components/Loader';
import Colors from '../../../Utility/Colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { getPatientHealthProfile } from '../Controller/HealthParametersController';
import { useSelector } from 'react-redux';
const screen = Dimensions.get("window");
const screenWidth = screen.width;
const screenHeight = screen.height;

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
            iconLib: 'MaterialCommunityIcons',
            icon: 'human-male-height-variant',
            iconBg: '#0f988a',
        },
        {
            key: 'weight',
            title: 'Weight',
            value: '-',
            unit: '',
            lastUpdate: '22.04.2024, 9.30 am',
            iconLib: 'MaterialCommunityIcons',
            icon: 'scale-bathroom',
            iconBg: '#0f988a',
        },
        {
            key: 'bmi',
            title: 'BMI',
            value: '-',
            unit: '',
            lastUpdate: '22.04.2024, 9.30 am',
            iconLib: 'MaterialCommunityIcons',
            icon: 'speedometer',
            iconBg: '#56c3c1',
        },
        {
            key: 'waist',
            title: 'Waist Circumference',
            value: '-',
            unit: '',
            lastUpdate: '22.04.2024, 9.30 am',
            iconLib: 'MaterialCommunityIcons',
            icon: 'tape-measure',
            iconBg: '#56c3c1',
        },
        {
            key: 'pulse',
            title: 'Pulse Rate',
            value: '-',
            unit: '',
            lastUpdate: '22.04.2024, 9.30 am',
            iconLib: 'FontAwesome5',
            icon: 'heartbeat',
            iconBg: '#204b86',
        },
        {
            key: 'bp',
            title: 'Blood Pressure',
            value: '00/00',
            unit: '',
            lastUpdate: '22.04.2024, 9.30 am',
            iconLib: 'MaterialCommunityIcons',
            icon: 'stethoscope',
            iconBg: '#204b86',
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
            if (isManual) setRefreshing(false); else setPageLoading(false);
        }
    };

    // Initial fetch (per user)
    useEffect(() => {
        hasFetchedVitalsRef.current = false; // reset cache when user changes
        fetchVitals(false);
    }, [userId]);

    const hideBookAppointmentScreen = () => {
        // setWebViewFlag(false);
    };

    const renderIcon = (item) => {
        const wrapperStyle = [styles.iconCircle, { backgroundColor: item.iconBg }];
        if (item.iconLib === 'FontAwesome5') {
            return (
                <View style={wrapperStyle}>
                    <FontAwesome5 name={item.icon} size={28} color={Colors.white} />
                </View>
            );
        }
        return (
            <View style={wrapperStyle}>
                <MaterialCommunityIcons name={item.icon} size={30} color={Colors.white} />
            </View>
        );
    };

    const renderMetric = ({ item }) => (
        <View style={styles.card}>
            {renderIcon(item)}
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardValue}>
                <Text style={styles.cardValueNumber}>{item.value}</Text>
                {item.unit ? <Text style={styles.cardValueUnit}> {item.unit}</Text> : null}
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

    return (
        <View style={styles.container}>
            <Loader style={styles.loadingCss} loading={pageLoading} />
            <CustomHeader
                pageName="Health Parameters"
                hideBookAppointmentScreen={hideBookAppointmentScreen}
            />
            <View style={styles.content}>
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
                <TouchableOpacity style={[styles.ctaBtn, styles.ctaSecondary]} onPress={onViewMonitoring}>
                    <Text style={styles.ctaText}>View Health Monitoring</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.ctaBtn, styles.ctaPrimary]} onPress={onAddNewRecord}>
                    <Text style={styles.ctaText}>Add New Record</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default HealthParameter;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#dff7f8',
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
        paddingTop: 10,
        paddingBottom: 80,
    },
    gridContent: {
        paddingBottom: 10,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#fff',
        width: (screenWidth - 15 * 2 - 12) / 2,
        borderRadius: 10,
        paddingVertical: 16,
        paddingHorizontal: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        color: '#222',
        fontSize: 14,
        fontFamily: 'Montserrat-Bold',
        marginBottom: 4,
        textAlign: 'center',
    },
    cardValue: {
        marginBottom: 10,
    },
    cardValueNumber: {
        color: '#0a978b',
        fontSize: 16,
        fontFamily: 'Montserrat-Bold',
        textAlign: 'center',
    },
    cardValueUnit: {
        color: '#0a978b',
        fontSize: 14,
        fontFamily: 'Montserrat-Medium',
    },
    lastUpdateLabel: {
        color: '#000',
        fontSize: 12,
        fontFamily: 'Montserrat-Bold',
    },
    lastUpdateText: {
        color: '#000',
        fontSize: 12,
        fontFamily: 'Montserrat-Regular',
    },
    footerBtns: {
        position: 'absolute',
        left: 15,
        right: 15,
        bottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    ctaBtn: {
        flex: 1,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    ctaSecondary: {
        backgroundColor: '#0a978b',
    },
    ctaPrimary: {
        backgroundColor: '#178f86',
    },
    ctaText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Montserrat-Bold',
    },
});
