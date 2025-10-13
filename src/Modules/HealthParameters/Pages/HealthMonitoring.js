import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, RefreshControl, BackHandler, Image } from 'react-native';
import CustomHeader from '../../../Utility/Components/CustomHeader';
import Loader from '../../../Utility/Components/Loader';
import Colors from '../../../Utility/Colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useSelector } from 'react-redux';
import { getPatientHealthProfile } from '../Controller/HealthParametersController';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Fontisto from 'react-native-vector-icons/Fontisto';
import { SafeAreaView } from 'react-native-safe-area-context';
const screen = Dimensions.get('window');
const screenWidth = screen.width;
const screenHeight = screen.height;

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - i);
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June',
  'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'
];

const ICONS = {
  pulse: {
    image: require('../../../Utility/Public/images/healthIcon5.png'),
    tint: '#204b86',
  },
  bp: {
    image: require('../../../Utility/Public/images/healthIcon6.png'),
    tint: '#204b86',
  },
  height: {
    image: require('../../../Utility/Public/images/healthIcon1.png'),
    tint: '#0f988a',
  },
  weight: {
    image: require('../../../Utility/Public/images/healthIcon2.png'),
    tint: '#0f988a',
  },
  bmi: {
    image: require('../../../Utility/Public/images/healthIcon7.png'),
    tint: '#56c3c1',
  },
  waist: {
    image: require('../../../Utility/Public/images/healthIcon8.png'),
    tint: '#56c3c1',
  },
};



function Chip({ label, active, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}>
      <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function IconCell({ iconKey }) {
  const { image, tint } = ICONS[iconKey] || {};
  console.log("iconKey>>>>>>>>>>>>>>>>", image);

  return (
    <View style={[styles.iconCircle, { backgroundColor: tint || '#0f988a' }]}>
      {image ? (
        <Image
          source={image}
          style={{
            width: 34,
            height: 34,
            resizeMode: 'contain', // remove tintColor if you want original colors
          }}
        />
      ) : (
        <MaterialCommunityIcons name="heart-pulse" size={20} color={Colors.white} />
      )}
    </View>
  );
}

export default function HealthMonitoring() {
  const [pageLoading, setPageLoading] = useState(false);
  const [activeYear, setActiveYear] = useState(2025);
  const [activeMonth, setActiveMonth] = useState(0);
  const [vitals, setVitals] = useState([]);
  const [dates, setDates] = useState([]);
  const [rows, setRows] = useState([]);
  const userId = useSelector((s) => s?.token?.loginUserId);
  const navigation = useNavigation();
  const hasFetchedVitalsRef = useRef(false);
  const [refreshing, setRefreshing] = useState(false);

  // Handle hardware back button: always go to HealthParameter
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('HealthParameter');
        return true; // prevent default behavior
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
      setVitals(vitalsList);
      hasFetchedVitalsRef.current = true;
    } catch (e) {
      // no-op
    } finally {
      if (isManual) setRefreshing(false); else setPageLoading(false);
    }
  };

  // Fetch patient profile vitals once (per user)
  useEffect(() => {
    hasFetchedVitalsRef.current = false; // reset when user changes
    fetchVitals(false);
  }, [userId]);

  const monthIndex = (name) => {
    const map = {
      Jan: 0, January: 0,
      Feb: 1, February: 1,
      Mar: 2, March: 2,
      Apr: 3, April: 3,
      May: 4,
      Jun: 5, June: 5,
      Jul: 6, July: 6,
      Aug: 7, August: 7,
      Sep: 8, September: 8,
      Oct: 9, October: 9,
      Nov: 10, November: 10,
      Dec: 11, December: 11,
    };
    return map[name] ?? 0;
  };

  const fmtDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  };

  // Build dates and rows whenever vitals or filters change
  useEffect(() => {
    if (!vitals?.length) {
      // fallback to empty table
      setDates([]);
      setRows([
        { key: 'pulse', label: 'Pulse Rate', values: [] },
        { key: 'bp', label: 'Blood Pressure', values: [] },
        { key: 'height', label: 'Height', values: [] },
        { key: 'weight', label: 'Weight', values: [] },
        { key: 'bmi', label: 'BMI', values: [] },
        { key: 'waist', label: 'Waist', values: [] },
      ]);
      return;
    }

    const filtered = vitals.filter((v) => {
      if (!v.effectiveDateTime) return false;
      const d = new Date(v.effectiveDateTime);
      return d.getFullYear() === activeYear && d.getMonth() === activeMonth;
    });


    const idWiseDate = filtered.reduce((acc, v) => {
      const date = fmtDate(v.effectiveDateTime); // formatted date
      if (!acc[v.id]) acc[v.id] = ""; // init array for this id
      if (!acc[v.id].includes(date)) acc[v.id] = date; // add unique date
      return acc;
    }, {});
    // Unique dates
    const dateSet = Array.from(new Set(filtered.map((v) => fmtDate(v.effectiveDateTime))));

    const sortedDates = dateSet.sort((a, b) => {
      const [da, ma, ya] = a.split('.');
      const [db, mb, yb] = b.split('.');
      const dateA = new Date(`${ya}-${ma}-${da}T00:00:00Z`).getTime();
      const dateB = new Date(`${yb}-${mb}-${db}T00:00:00Z`).getTime();
      return dateA - dateB; // ascending order
    });

    const labelByInt = {
      1: { key: 'height', label: 'Height' },
      2: { key: 'weight', label: 'Weight' },
      3: { key: 'bmi', label: 'BMI' },
      4: { key: 'waist', label: 'Waist' },
      5: { key: 'bp', label: 'Blood Pressure' },
      6: { key: 'pulse', label: 'Pulse Rate' },
    };

    const rowsBuilt = [6, 5, 1, 2, 3, 4] // order similar to mock
      .map((vi) => {
        const meta = labelByInt[vi];
        const values = Object.keys(idWiseDate).map((dstr) => {
          const matches = filtered.filter((v) => v.id.toString() === dstr.toString() && v.valueInteger === vi);
          if (!matches.length) return '';
          const latest = matches.reduce((acc, cur) => (
            new Date(acc.effectiveDateTime) > new Date(cur.effectiveDateTime) ? acc : cur
          ));
          return latest.valueString || '';
        });
        return { key: meta.key, label: meta.label, values };
      });

    // setDates(sortedDates);
    setDates(idWiseDate || {});
    setRows(rowsBuilt);
  }, [vitals, activeYear, activeMonth]);

  const handleGoBack = () => {
    navigation.navigate('HealthParameter');
  };

  return (

    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <View style={styles.container}>
        <Loader style={styles.loadingCss} loading={pageLoading} />
        <CustomHeader pageName={'Health Parameters'} />

        <View style={styles.subHeaderRow}>
          <TouchableOpacity style={styles.subHeaderBackBtn} onPress={handleGoBack}>
            <FontAwesome6 name="arrow-left-long" size={20} color={Colors.black} />
          </TouchableOpacity>
          <Text style={styles.subHeaderTitle}>Previous Records</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchVitals(true)} />
          }
        >
          {/* Filters */}
          <View style={styles.filters}>
            <Text style={styles.filterLabel}>Year</Text>
            <View style={styles.filterRow}>
              {YEARS.map((y) => (
                <Chip key={y} label={String(y)} active={y === activeYear} onPress={() => setActiveYear(y)} />
              ))}
            </View>
            <Text style={[styles.filterLabel, { marginTop: 10 }]}>Month</Text>
            <View style={styles.filterRow}>
              {MONTHS.map((m, index) => (
                <Chip key={m} label={m} active={index === activeMonth} onPress={() => setActiveMonth(index)} />
              ))}
            </View>
            <Text style={styles.helperText}>Only the months for which you entered readings are displayed here.</Text>
          </View>

          {/* Table */}
          {/* <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tableBox}>
            <View style={[styles.tableRow, styles.headerRow]}>
              <View style={[styles.cellMetric, styles.headerCell]}>
                <Text style={[styles.headerText]}>Date</Text>
              </View>
              {Object.keys(dates).length > 0 &&
                Object.values(dates).map((d, index) => (
                  <View key={index} style={[styles.cellDate, styles.headerCell]}>
                    <Text style={styles.headerText}>{d}</Text>
                  </View>
                ))}
            </View>

            {rows.map((r, idx) => (
              <View key={r.key} style={[styles.tableRow, idx % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
                <View style={[styles.cellMetric, styles.metricCell]}>
                  <View style={styles.metricCellInner}>
                    <IconCell iconKey={r.key} />
                    <Text style={styles.metricLabel}>{r.label}</Text>
                  </View>
                </View>
                {r.values.map((v, i) => (
                  <View key={i} style={[styles.cellDate, styles.valueCell]}>
                    <Text style={styles.valueText}>{v}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView> */}
          <View style={styles.tableWrapper}>
            {/* Fixed left column */}
            <View style={styles.fixedColumn}>
              <View style={[styles.headerCell, styles.fixedHeader]}>
                <Text style={[styles.headerText, styles.headerTextStart]}>Date</Text>
              </View>
              {rows.map((r, idx) => (
                <View
                  key={r.key}
                  style={[styles.cellMetric, idx % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
                  <View style={styles.metricCellInner}>
                    <IconCell iconKey={r.key} />
                    <Text style={styles.metricLabel}>{r.label}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Scrollable right section */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                {/* Header row */}
                <View style={[styles.tableRow, styles.headerRow]}>
                  {Object.keys(dates).length > 0 &&
                    Object.values(dates).map((d, index) => (
                      <View key={index} style={[styles.cellDate, styles.headerCell]}>
                        <Text style={styles.headerText}>{d}</Text>
                      </View>
                    ))}
                </View>

                {/* Data rows */}
                {rows.map((r, idx) => (
                  <View
                    key={r.key}
                    style={[
                      styles.tableRow,
                      idx % 2 === 0 ? styles.rowEven : styles.rowOdd,
                    ]}
                  >
                    {r.values.map((v, i) => (
                      <View key={i} style={[styles.cellDate, styles.valueCell]}>
                        <Text style={styles.valueText}>{v}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const BORDER = '#000';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#dff7f8',
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
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 20,
  },
  filters: {
    marginBottom: 12,
    //backgroundColor: 'red',
  },
  filterLabel: {
    color: '#000',
    fontFamily: 'Arimo-Bold',
    fontSize: 14,
    marginBottom: 6,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
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
    fontSize: 13,
  },
  chipTextActive: { color: '#2aa394' },
  chipTextInactive: { color: '#333' },
  helperText: {
    color: '#333',
    fontFamily: 'Arimo-Regular',
    fontSize: 13,
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',

  },
  headerRow: {
    backgroundColor: '#2aa394',
  },
  tableBox: {
    // backgroundColor: 'red',
    padding: 0,
  },
  headerCell: {
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#2aa394',

  },
  headerText: {
    color: '#fff',
    fontFamily: 'Montserrat-Bold',
    fontSize: 12,
    //paddingLeft:10
  },
  headerTextStart: {
    paddingLeft: 10
  },
  cellMetric: {
    width: 140,
    backgroundColor: '#eaf8f6',
    borderWidth: 1,
    borderColor: BORDER,
    padding: 10.23,
  },
  cellDate: {
    minWidth: 130,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricCell: {},
  metricCellInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricLabel: {
    color: '#000',
    fontFamily: 'Arimo-Bold',
    fontSize: 13,
    display: 'flex',
    flexWrap: 'wrap',
    width: 90,
    //backgroundColor:'blue'
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowEven: {
    backgroundColor: '#fff',
  },
  rowOdd: {
    backgroundColor: '#f7fcfb',
  },
  valueCell: {},
  valueText: {
    color: '#000',
    fontFamily: 'Montserrat-Medium',
    fontSize: 12,
    paddingHorizontal: 5,
    paddingVertical: 8,
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 8,
    marginBottom: 6,
  },
  subHeaderBackBtn: {
    padding: 6,
  },
  subHeaderTitle: {
    color: '#000',
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
  },
  tableWrapper: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderColor: BORDER,
    borderWidth: 1,
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
  fixedHeader: {
    backgroundColor: '#2aa394',
    borderRightWidth: 1,
    borderColor: BORDER,
  },
});
