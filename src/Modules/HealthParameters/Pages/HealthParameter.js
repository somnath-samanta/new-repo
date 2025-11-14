import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  BackHandler,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
  PixelRatio,
} from 'react-native';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

/* ------------------ Responsive helpers (PixelRatio + Dimensions) ------------------ */
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;
const { width: W, height: H } = Dimensions.get('window');

const scale = (size) => (W / BASE_WIDTH) * size;
const vScale = (size) => (H / BASE_HEIGHT) * size;
const font = (size) => Math.round(PixelRatio.roundToNearestPixel(size));
/* ---------------------------------------------------------------------------------- */

const screen = Dimensions.get('window');
const screenWidth = screen.width;
const screenHeight = screen.height;

// Card height stays proportional
const cardHeight = H * 0.23;
// ❌ Remove cardBoxesHeight fixed height – it causes overlap on devices with gesture bars
// const cardBoxesHeight = H * 0.734;

function HealthParameter() {
  const insets = useSafeAreaInsets();

  // Extra padding to clear Android’s gesture/nav bar (insets.bottom is often 0 there)
  const bottomPad =
    (insets.bottom || 0) + (Platform.OS === 'android' ? vScale(20) : 0);

  const [webViewFlag, setWebViewFlag] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const navigation = useNavigation();
  const hasFetchedVitalsRef = useRef(false);
  const userId = useSelector((s) => s?.token?.loginUserId);
  const [refreshing, setRefreshing] = useState(false);

  const [metrics, setMetrics] = useState([
    { key: 'height', title: 'Height', value: '-', unit: '', lastUpdate: '22.04.2024, 9.30 am', icon: require('../../../Utility/Public/images/healthIcon1.png') },
    { key: 'weight', title: 'Weight', value: '-', unit: '', lastUpdate: '22.04.2024, 9.30 am', icon: require('../../../Utility/Public/images/healthIcon2.png') },
    { key: 'bmi', title: 'BMI', value: '-', unit: '', lastUpdate: '22.04.2024, 9.30 am', icon: require('../../../Utility/Public/images/healthIcon3.png') },
    { key: 'waist', title: 'Waist Circumference', value: '-', unit: '', lastUpdate: '22.04.2024, 9.30 am', icon: require('../../../Utility/Public/images/healthIcon4.png') },
    { key: 'pulse', title: 'Pulse Rate', value: '-', unit: '', lastUpdate: '22.04.2024, 9.30 am', icon: require('../../../Utility/Public/images/healthIcon5.png') },
    { key: 'bp', title: 'Blood Pressure', value: '00/00', unit: '', lastUpdate: '22.04.2024, 9.30 am', icon: require('../../../Utility/Public/images/healthIcon6.png') },
  ]);

  const intToKey = { 1: 'height', 2: 'weight', 3: 'bmi', 4: 'waist', 5: 'bp', 6: 'pulse' };
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
      if (!prev || ts > prev.ts) acc[vi] = { ts, item: v };
      return acc;
    }, {});
    setMetrics((prev) => prev.map((m) => {
      const vi = keyToInt[m.key];
      const latest = latestByInt[vi]?.item;
      if (!latest) return m;
      return { ...m, value: latest.valueString || m.value, lastUpdate: fmtDateTime(latest.effectiveDateTime) };
    }));
  };

  const fetchVitals = async (force = false) => {
    if (!userId) return;
    if (hasFetchedVitalsRef.current && !force) return;
    const isManual = force;
    if (isManual) setRefreshing(true); else setPageLoading(true);
    try {
      const res = await getPatientHealthProfile({ id: userId });
      const vitalsList = res?.Patient?.healthProfile?.vitals || [];
      updateMetricsFromVitals(vitalsList);
      hasFetchedVitalsRef.current = true;
    } catch (e) {
    } finally {
      if (isManual) setRefreshing(false);
      else setTimeout(() => setPageLoading(false), 500);
    }
  };

  useEffect(() => { hasFetchedVitalsRef.current = false; fetchVitals(false); }, [userId]);
  useFocusEffect(React.useCallback(() => { hasFetchedVitalsRef.current = false; fetchVitals(false); }, []));

  const hideBookAppointmentScreen = () => {};
  const renderMetric = ({ item }) => (
    <View style={styles.card}>
      <Image source={item.icon} style={styles.iconCircle} />
      <Text allowFontScaling={false} style={styles.cardTitle}>{item.title}</Text>
      <Text allowFontScaling={false} style={styles.cardValue}>
        <Text allowFontScaling={false} style={styles.cardValueNumber}>{item.value}</Text>
        {item.unit ? <Text allowFontScaling={false} style={styles.cardValueUnit}>{item.unit}</Text> : null}
      </Text>
      <Text allowFontScaling={false} style={styles.lastUpdateLabel}>Last Update:</Text>
      <Text allowFontScaling={false} style={styles.lastUpdateText}>{item.lastUpdate}</Text>
    </View>
  );

  const onViewMonitoring = () => navigation.navigate('HealthMonitoring');
  const onAddNewRecord = () => navigation.navigate('AddHealthRecord');
  const handleGoBack = () => { if (navigation.canGoBack()) navigation.goBack(); };
  const refreshBtnFn = () => { hasFetchedVitalsRef.current = false; fetchVitals(false); };

  return (
    <SafeAreaView
          style={[styles.safeArea]}
          edges={['left', 'right', 'bottom']} // 👈 protects bottom nav/gesture area
        >
      <Loader style={styles.loadingCss} loading={pageLoading} />
      <CustomHeader pageName="Physical Parameters" hideBookAppointmentScreen={hideBookAppointmentScreen} />

      <View style={styles.content}>
        <View style={styles.topContent}>
          <TouchableOpacity style={styles.backbtnTop} onPress={handleGoBack}>
            <FontAwesome6 name="arrow-left-long" size={scale(26)} color={Colors.black} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.refreshBtn} onPress={refreshBtnFn}>
            <FontAwesome name="refresh" size={scale(26)} color="#000" />
          </TouchableOpacity>
        </View>

        {/* 👇 make the list area flexible instead of a fixed height */}
        <View style={styles.flatListContent}>
          <FlatList
            contentContainerStyle={[styles.gridContent]} // keep last row above nav bar
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

        {/* Footer always clears the gesture area */}
        <View style={[styles.footerBtns]}>
          <TouchableOpacity style={[styles.ctaBtn, styles.ctaPrimary]} onPress={onViewMonitoring}>
            <Text allowFontScaling={false} style={styles.ctaText}>View Health Monitoring</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.ctaBtn, styles.ctaSecondary]} onPress={onAddNewRecord}>
            <Text allowFontScaling={false} style={styles.ctaText}>Add New Record</Text>
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
    paddingHorizontal: scale(15),
    paddingTop: 0,
    paddingBottom: 0,

  },
  topContent: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingTop: vScale(6),
  },

  // ⛳️ IMPORTANT: make list container flexible
  flatListContent: {
    flex: 1,
    overflow: 'hidden',
  },

  gridContent: {
    paddingTop: vScale(10),
    flexGrow: 1,
  },
  row: { justifyContent: 'space-between' },

  card: {
    backgroundColor: '#fff',
    width: (W - scale(30) - scale(12)) / 2,
    borderRadius: scale(10),
    padding: scale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: vScale(2) },
    shadowOpacity: 0.15,
    shadowRadius: scale(4),
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    height: cardHeight,
    marginBottom: vScale(12),
  },
  iconCircle: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vScale(8),
    resizeMode: 'contain',
  },
  cardTitle: {
    color: '#222',
    fontSize: font(12.4),
    fontFamily: 'Arimo-Bold',
    textAlign: 'center',
    marginBottom: vScale(4),
    fontWeight: '700',
    paddingHorizontal: scale(0),
  },
  cardValue: { marginBottom: vScale(8) },
  cardValueNumber: {
    color: '#0a978b',
    fontSize: font(15),
    fontFamily: 'Arimo-Bold',
    textAlign: 'center',
    fontWeight: '700',
  },
  cardValueUnit: { color: '#0a978b', fontSize: font(13), fontFamily: 'Arimo-Bold' },
  lastUpdateLabel: {
    color: '#000',
    fontSize: font(11),
    fontFamily: 'Arimo-Bold',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: vScale(2),
  },
  lastUpdateText: { color: '#000', fontSize: font(11), fontFamily: 'Arimo-Regular', textAlign: 'center' },

  footerBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vScale(10),
    zIndex: 999,
    gap: scale(12),
    margin: 0,
  },
  ctaBtn: {
    flex: 1,
    borderRadius: scale(10),
    paddingVertical: vScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: vScale(1) },
    shadowOpacity: 0.1,
    shadowRadius: scale(2),
    elevation: 2,
  },
  ctaSecondary: { backgroundColor: '#229980', marginRight: scale(6) },
  ctaPrimary: { backgroundColor: '#007b80' },
  ctaText: { color: '#fff', fontSize: font(12.5), fontFamily: 'Arimo-Bold', fontWeight: '700' },
  backbtnTop: { width: scale(40), height: vScale(35), justifyContent: 'center', alignItems: 'center' },
});
