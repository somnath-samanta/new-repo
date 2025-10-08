import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, RefreshControl, BackHandler } from 'react-native';
import CustomHeader from '../../../Utility/Components/CustomHeader';
import Loader from '../../../Utility/Components/Loader';
import Colors from '../../../Utility/Colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useSelector } from 'react-redux';
import { getPatientHealthProfile } from '../Controller/HealthParametersController';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

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
    lib: 'FontAwesome5',
    name: 'heartbeat',
    tint: '#204b86'
  },
  bp: {
    lib: 'MaterialCommunityIcons',
    name: 'stethoscope',
    tint: '#204b86'
  },
  height: {
    lib: 'MaterialCommunityIcons',
    name: 'human-male-height-variant',
    tint: '#0f988a'
  },
  weight: {
    lib: 'MaterialCommunityIcons',
    name: 'scale-bathroom',
    tint: '#0f988a'
  },
  bmi: {
    lib: 'MaterialCommunityIcons',
    name: 'speedometer',
    tint: '#56c3c1'
  },
  waist: {
    lib: 'MaterialCommunityIcons',
    name: 'tape-measure',
    tint: '#56c3c1'
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
  const { lib, name, tint } = ICONS[iconKey] || {};
  const Wrap = ({ children }) => (
    <View style={[styles.iconCircle, { backgroundColor: tint || '#0f988a' }]}>{children}</View>
  );
  if (lib === 'FontAwesome5') {
    return (
      <Wrap>
        <FontAwesome5 name={name} size={20} color={Colors.white} />
      </Wrap>
    );
  }
  return (
    <Wrap>
      <MaterialCommunityIcons name={name} size={22} color={Colors.white} />
    </Wrap>
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

    const rowsBuilt = [1, 5, 3, 4, 2, 6] // order similar to mock
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {/* Header row */}
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

            {/* Data rows */}
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
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const BORDER = '#2aa394';

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
  },
  filterLabel: {
    color: '#000',
    fontFamily: 'Montserrat-Bold',
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
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  chipActive: {
    borderColor: '#2aa394',
    backgroundColor: '#e6f6f4',
  },
  chipInactive: {
    borderColor: '#d1d1d1',
    backgroundColor: '#efefef',
  },
  chipText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 12,
  },
  chipTextActive: { color: '#2aa394' },
  chipTextInactive: { color: '#9c9c9c' },
  helperText: {
    color: '#666',
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    marginTop: 8,
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
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  headerText: {
    color: '#fff',
    fontFamily: 'Montserrat-Bold',
    fontSize: 12,
  },
  cellMetric: {
    width: 140,
    backgroundColor: '#eaf8f6',
    borderWidth: 1,
    borderColor: BORDER,
    padding: 10,
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
    gap: 10,
  },
  metricLabel: {
    color: '#000',
    fontFamily: 'Montserrat-Bold',
    fontSize: 13,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
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
    // borderRadius: 20,
    // backgroundColor: '#efefef',
    // borderWidth: 1,
    // borderColor: '#ddd',
  },
  subHeaderTitle: {
    color: '#000',
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
  },
});
