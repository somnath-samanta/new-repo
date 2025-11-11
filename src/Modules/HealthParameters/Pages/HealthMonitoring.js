import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  BackHandler,
  Image,
  Platform,
  PixelRatio,
} from 'react-native';
import CustomHeader from '../../../Utility/Components/CustomHeader';
import Loader from '../../../Utility/Components/Loader';
import Colors from '../../../Utility/Colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useSelector } from 'react-redux';
import { getPatientHealthProfile } from '../Controller/HealthParametersController';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Fontisto from 'react-native-vector-icons/Fontisto';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-simple-toast';
import Entypo from 'react-native-vector-icons/Entypo';

/* ------------------ Responsive helpers (PixelRatio + Dimensions) ------------------ */
const BASE_WIDTH = 375;    // design width (e.g., iPhone 11)
const BASE_HEIGHT = 812;   // design height
const { width: W, height: H } = Dimensions.get('window');

const scale  = (size) => (W / BASE_WIDTH) * size;      // horizontal/general scaling
const vScale = (size) => (H / BASE_HEIGHT) * size;     // vertical scaling
const font   = (size) => Math.round(PixelRatio.roundToNearestPixel(size));
/* ---------------------------------------------------------------------------------- */

const screen = Dimensions.get('window');
const screenWidth = screen.width;

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - i);
const MONTHS = ['Jan','Feb','Mar','Apr','May','June','July','Aug','Sept','Oct','Nov','Dec'];

const ICONS = {
  pulse:  { image: require('../../../Utility/Public/images/healthIcon5.png'), tint: '#204b86' },
  bp:     { image: require('../../../Utility/Public/images/healthIcon6.png'), tint: '#204b86' },
  height: { image: require('../../../Utility/Public/images/healthIcon1.png'), tint: '#0f988a' },
  weight: { image: require('../../../Utility/Public/images/healthIcon2.png'), tint: '#0f988a' },
  bmi:    { image: require('../../../Utility/Public/images/healthIcon7.png'), tint: '#56c3c1' },
  waist:  { image: require('../../../Utility/Public/images/healthIcon8.png'), tint: '#56c3c1' },
};

function Chip({ label, active, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}>
      <Text allowFontScaling={false} style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function IconCell({ iconKey }) {
  const { image, tint } = ICONS[iconKey] || {};
  return (
    <View style={[styles.iconCircle]}>
      {image ? (
        <Image source={image} style={{ width: scale(34), height: scale(34), resizeMode: 'contain', borderRadius:50, }} />
      ) : (
        <MaterialCommunityIcons name="heart-pulse" size={font(20)} color={Colors.white} />
      )}
    </View>
  );
}

export default function HealthMonitoring() {
  const insets = useSafeAreaInsets();
  // robust bottom padding: device safe inset + small Android fallback
  const bottomPad = (insets.bottom || 0) + (Platform.OS === 'android' ? vScale(20) : 0);

  const [pageLoading, setPageLoading] = useState(false);
  const [activeYear, setActiveYear] = useState(currentYear);
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth());
  const [vitals, setVitals] = useState([]);
  const [dates, setDates] = useState([]);
  const [rows, setRows] = useState([]);
  const userId = useSelector((s) => s?.token?.loginUserId);
  const navigation = useNavigation();
  const hasFetchedVitalsRef = useRef(false);
  const [refreshing, setRefreshing] = useState(false);
  const [rowHeights, setRowHeights] = useState({});
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('HealthParameter');
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [navigation])
  );

  const fetchVitals = async (force = false) => {
    if (!userId) return;
    if (hasFetchedVitalsRef.current && !force) return;
    const isManual = force;
    if (isManual) setRefreshing(true); else setPageLoading(true);
    try {
      const res = await getPatientHealthProfile({ id: userId });
      const vitalsList = res?.Patient?.healthProfile?.vitals || [];
      if (vitalsList.length === 0) {
        setTimeout(() => setPageLoading(false), 500);
        return;
      }
      const last = vitalsList[vitalsList.length - 1];
      setActiveMonth(last?.effectiveDateTime ? new Date(last.effectiveDateTime).getMonth() : new Date().getMonth());
      setActiveYear(last?.effectiveDateTime ? new Date(last.effectiveDateTime).getFullYear() : currentYear);
      setVitals(vitalsList);
      hasFetchedVitalsRef.current = true;
    } catch (e) {
      // no-op
    } finally {
      if (isManual) setRefreshing(false);
      else setTimeout(() => setPageLoading(false), 500);
    }
  };

  useEffect(() => {
    hasFetchedVitalsRef.current = false;
    fetchVitals(false);
  }, [userId]);

  useFocusEffect(
    React.useCallback(() => {
      hasFetchedVitalsRef.current = false;
      fetchVitals(false);
    }, [])
  );

  const fmtDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  };

  useEffect(() => {
    if (!vitals?.length) {
      setDates([]);
      setRows([
        { key: 'pulse',  label: 'Pulse Rate',      values: [] },
        { key: 'bp',     label: 'Blood Pressure',  values: [] },
        { key: 'height', label: 'Height',          values: [] },
        { key: 'weight', label: 'Weight',          values: [] },
        { key: 'bmi',    label: 'BMI',             values: [] },
        { key: 'waist',  label: 'Waist',           values: [] },
      ]);
      return;
    }

    const filtered = vitals.filter((v) => {
      if (!v.effectiveDateTime) return false;
      const d = new Date(v.effectiveDateTime);
      return d.getFullYear() === activeYear && d.getMonth() === activeMonth;
    });

    const idWiseDate = filtered.reduce((acc, v) => {
      const date = fmtDate(v.effectiveDateTime);
      if (!acc[v.id]) acc[v.id] = { formattedDate: date, effectiveDateTime: v.effectiveDateTime };
      return acc;
    }, {});

    const sortedIdWiseDate = Object.keys(idWiseDate)
      .sort((a, b) => new Date(idWiseDate[b].effectiveDateTime) - new Date(idWiseDate[a].effectiveDateTime))
      .reduce((acc, key) => { acc[key] = idWiseDate[key].formattedDate; return acc; }, {});

    const labelByInt = {
      1: { key: 'height', label: 'Height' },
      2: { key: 'weight', label: 'Weight' },
      3: { key: 'bmi',    label: 'BMI' },
      4: { key: 'waist',  label: 'Waist' },
      5: { key: 'bp',     label: 'Blood Pressure' },
      6: { key: 'pulse',  label: 'Pulse Rate' },
    };

    const rowsBuilt = [6, 5, 1, 2, 3, 4].map((vi) => {
      const meta = labelByInt[vi];
      const values = Object.keys(sortedIdWiseDate).map((dstr) => {
        const matches = filtered.filter((v) => v.id.toString() === dstr.toString() && v.valueInteger === vi);
        if (!matches.length) return '';
        const latest = matches.reduce((a, c) =>
          new Date(a.effectiveDateTime) > new Date(c.effectiveDateTime) ? a : c
        );
        return latest.valueString || '';
      });
      return { key: meta.key, label: meta.label, values };
    });

    setDates(sortedIdWiseDate || {});
    setRows(rowsBuilt);
  }, [vitals, activeYear, activeMonth]);

  const navigationBack = () => navigation.navigate('HealthParameter');

  const refreshBtnFn = async () => {
    try {
      setActiveYear(new Date().getFullYear());
      setActiveMonth(new Date().getMonth());
      setPageLoading(true);
      hasFetchedVitalsRef.current = false;
      await fetchVitals(true);
      Toast.show('Refreshed successfully');
    } catch (error) {
      Toast.show('Failed to refresh data');
    } finally {
      setTimeout(() => setPageLoading(false), 500);
    }
  };

  const scrollRef = useRef(null);
  const handleNext = () =>
    scrollRef.current?.scrollTo({ x: (scrollRef.current.scrollX || 0) + scale(200), animated: true });
  const handlePrevious = () =>
    scrollRef.current?.scrollTo({ x: Math.max(0, (scrollRef.current.scrollX || 0) - scale(200)), animated: true });

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollX = 0; }, []);
  const onScroll = (e) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    if (scrollRef.current) scrollRef.current.scrollX = contentOffset.x;
    setIsAtStart(contentOffset.x <= 0);
    setIsAtEnd(contentOffset.x + layoutMeasurement.width >= contentSize.width - scale(10));
  };
  const onRowLayout = (index, e) => {
    const h = e.nativeEvent.layout.height;
    setRowHeights((prev) => (prev[index] === h ? prev : { ...prev, [index]: h }));
  };

  return (
    <SafeAreaView
      style={[styles.safeArea]}
      edges={['left', 'right', 'bottom']}
    >
      <View style={styles.container}>
        <Loader style={styles.loadingCss} loading={pageLoading} />
        <CustomHeader pageName={'Physical Parameters'} />

        <View style={styles.subHeaderRow}>
          <View style={styles.subHeaderRowLeft}>
            <TouchableOpacity style={styles.subHeaderBackBtn} onPress={navigationBack}>
              <FontAwesome6 name="arrow-left-long" size={font(20)} color={Colors.black} />
            </TouchableOpacity>
            <Text allowFontScaling={false} style={styles.subHeaderTitle}>Previous Records</Text>
          </View>
          <TouchableOpacity style={styles.refreshBtn} onPress={refreshBtnFn}>
            <FontAwesome name="refresh" size={font(24)} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshBtnFn} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Filters */}
          <View style={styles.filters}>
            <Text allowFontScaling={false} style={styles.filterLabel}>Year</Text>
            <View style={styles.filterRow}>
              {YEARS.map((y) => (
                <Chip key={y} label={String(y)} active={y === activeYear} onPress={() => setActiveYear(y)} />
              ))}
            </View>

            <Text allowFontScaling={false} style={[styles.filterLabel, { marginTop: vScale(10) }]}>Month</Text>
            <View style={styles.filterRow}>
              {MONTHS.map((m, index) => (
                <Chip key={m} label={m} active={index === activeMonth} onPress={() => setActiveMonth(index)} />
              ))}
            </View>

            <Text allowFontScaling={false} style={styles.helperText}>
              Only the months for which you entered readings are displayed here.
            </Text>
          </View>

          {/* Table */}
          <View style={styles.tableWrapper}>
            {/* Fixed left column */}
            <View style={styles.fixedColumn}>
              <View style={[styles.headerCell, styles.fixedHeader]}>
                <Text allowFontScaling={false} style={[styles.headerText, styles.headerTextStart]}>Date</Text>
              </View>
              {rows.map((r, idx) => (
                <View
                  key={r.key}
                  style={[
                    styles.cellMetric,
                    { height: rowHeights[idx] || 'auto' },
                    idx % 2 === 0 ? styles.rowEven : styles.rowOdd,
                  ]}
                >
                  <View style={styles.metricCellInner}>
                    <IconCell iconKey={r.key} />
                    <Text allowFontScaling={false} style={styles.metricLabel}>{r.label}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Scrollable right section */}
            <View style={{ flex: 1 }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                ref={scrollRef}
                onScroll={onScroll}
                scrollEventThrottle={16}
              >
                <View>
                  {/* Header row */}
                  <View style={[styles.tableRow, styles.headerRow]}>
                    {Object.keys(dates).length > 0 &&
                      Object.values(dates).map((d, index) => (
                        <View key={index} style={[styles.cellDate, styles.headerCell]}>
                          <Text allowFontScaling={false} style={styles.headerText}>{d}</Text>
                        </View>
                      ))}
                  </View>

                  {/* Data rows */}
                  {rows.map((r, idx) => (
                    <View
                      key={r.key}
                      onLayout={(e) => onRowLayout(idx, e)}
                      style={[
                        styles.tableRow,
                        idx % 2 === 0 ? styles.rowEven : styles.rowOdd,
                      ]}
                    >
                      {r.values.map((v, i) => (
                        <View key={i} style={[styles.cellDate, styles.valueCell]}>
                          <Text allowFontScaling={false} style={styles.valueText}>{v}</Text>
                        </View>
                      ))}
                    </View>
                  ))}

                  {Object.keys(dates).length === 0 && (
                    <View style={styles.noDataContainer}>
                      <Text allowFontScaling={false} style={styles.noDataText}>No data available for selected month</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>

            {/* Next / Previous Buttons */}
            <View style={styles.scrollButtonsContainer}>
              <TouchableOpacity
                onPress={handlePrevious}
                disabled={isAtStart}
                style={[styles.scrollBtn, styles.prevBtn, isAtStart && { opacity: 0.4 }]}
              >
                <Entypo name="chevron-with-circle-left" size={scale(30)} color={isAtStart ? "#999" : "#000"} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleNext}
                disabled={isAtEnd}
                style={[styles.scrollBtn, isAtEnd && { opacity: 0.4 }]}
              >
                <Entypo name="chevron-with-circle-right" size={scale(30)} color={isAtEnd ? "#999" : "#000"} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const BORDER = '#000';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#dff7f8',
  },
  container: {
    flex: 1, // let it grow; no fixed height so safe-area padding isn't hidden
    backgroundColor: '#dff7f8',
    width: screenWidth,
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
    paddingHorizontal: scale(12),
    paddingTop: vScale(8),
    // paddingBottom is added inline with bottomPad
  },
  filters: {
    marginBottom: vScale(12),
  },
  filterLabel: {
    color: '#000',
    fontFamily: 'Arimo-Bold',
    fontSize: font(14),
    marginBottom: vScale(6),
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    gap: scale(5),
    flexWrap: 'wrap',
  },
  chip: {
    paddingVertical: vScale(6),
    paddingHorizontal: scale(12),
    borderRadius: scale(10),
    borderWidth: 1,
  },
  chipActive: {
    borderColor: '#2aa394',
    backgroundColor: '#fff',
  },
  chipInactive: {
    borderColor: '#e1e1e1',
    backgroundColor: '#e1e1e1',
  },
  chipText: {
    fontFamily: 'Arimo-Regular',
    fontSize: font(13),
  },
  chipTextActive: { color: '#2aa394' },
  chipTextInactive: { color: '#333' },
  helperText: {
    color: '#333',
    fontFamily: 'Arimo-Regular',
    fontSize: font(13),
    marginTop: vScale(10),
  },

  tableWrapper: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderColor: BORDER,
    borderWidth: 1,
    marginTop: vScale(10),
  },
  fixedColumn: {
    backgroundColor: '#eaf8f6',
    zIndex: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  tableRow: {
    flexDirection: 'row',
  },
  headerRow: {
    backgroundColor: '#2aa394',
  },
  headerCell: {
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: vScale(10),
    paddingHorizontal: scale(10),
  },
  headerText: {
    color: '#fff',
    fontFamily: 'Montserrat-Bold',
    fontSize: font(12),
    fontWeight: '700',
    minWidth: scale(130),
    maxWidth: scale(130),
    textAlign: 'center',
  },
  headerTextStart: {
    paddingLeft: scale(10),
    fontWeight: '700',
  },

  cellMetric: {
    width: scale(150),
   // backgroundColor: '#eaf8f6',
    borderWidth: 1,
    borderColor: BORDER,
    padding: scale(10),
  },
  metricCellInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  metricLabel: {
    color: '#000',
    fontFamily: 'Arimo-Bold',
    fontSize: font(13),
    width: scale(90),
    fontWeight: '700',
  },

  cellDate: {
    minWidth: scale(130),
    maxWidth: scale(130),
    borderWidth: 1,
    borderColor: BORDER,
    padding: scale(10),
    alignItems: 'center',
    justifyContent: 'center',
  },

  rowEven: { backgroundColor: '#fff' },
  rowOdd: { backgroundColor: '#f7fcfb' },

  valueCell: {},
  valueText: {
    color: '#000',
    fontFamily: 'Montserrat-Medium',
    fontSize: font(12),
    paddingVertical: Platform.OS === 'ios' ? vScale(10) : vScale(8),
  },

  subHeaderRow: {
    gap: scale(10),
    paddingHorizontal: scale(12),
    paddingTop: vScale(8),
    marginBottom: vScale(6),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subHeaderRowLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  subHeaderBackBtn: {
    padding: scale(6),
  },
  subHeaderTitle: {
    color: '#000',
    fontFamily: 'Montserrat-Bold',
    fontSize: font(16),
    fontWeight: '700',
    marginLeft: scale(6),
  },

  fixedHeader: {
    backgroundColor: '#2aa394',
    borderRightWidth: 1,
    borderColor: BORDER,
    fontWeight: '700',
    paddingHorizontal: scale(9),
  },

  noDataContainer: {
    padding: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    color: '#666',
    fontFamily: 'Arimo-Regular',
    fontSize: font(14),
    textAlign: 'center',
  },

  scrollButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    right: 0,
    top: -vScale(35),
  },
  scrollBtn: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: 100,
  },
  prevBtn: {
    marginRight: scale(3),
  },
  iconCircle:{
    borderRadius:50,
  }
});
