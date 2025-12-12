import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  ScrollView,
  BackHandler,
  Image,
  Platform,
  Keyboard,
  LayoutAnimation,
  UIManager,
  Dimensions,
  PixelRatio,
} from 'react-native';
import CustomHeader from '../../../Utility/Components/CustomHeader';
import Loader from '../../../Utility/Components/Loader';
import Colors from '../../../Utility/Colors';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-simple-toast';
import { savePatientHealthParameters } from '../Controller/HealthParametersController';
import { KeyboardAvoidingView } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import NetInfo from "@react-native-community/netinfo";

/* ------------------ Responsive helpers (PixelRatio + Dimensions) ------------------ */
const BASE_WIDTH = 375;    // design width
const BASE_HEIGHT = 812;   // design height
const { width: W, height: H } = Dimensions.get('window');

const scale = (size) => (W / BASE_WIDTH) * size;     // horizontal/general scaling
const vScale = (size) => (H / BASE_HEIGHT) * size;   // vertical scaling
const font = (size) => Math.round(PixelRatio.roundToNearestPixel(size));
/* ---------------------------------------------------------------------------------- */

// Enable smooth layout changes on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function AddHealthRecord() {
  const [pageLoading, setPageLoading] = useState(false);
  const [isMetric, setIsMetric] = useState(true);
  const navigation = useNavigation();
  const reduxAuthJson = useSelector((state) => state);
  const insets = useSafeAreaInsets();

  // 👉 keyboard height state (Android fix)
  const [kbHeight, setKbHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKbHeight(e?.endCoordinates?.height || 0);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKbHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const [heightM, setHeightM] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [weightG, setWeightG] = useState('');
  const [bmi, setBmi] = useState('');
  const [waist, setWaist] = useState('');
  const [pulse, setPulse] = useState('');
  const [bp, setBp] = useState('');
  const [bpError, setBpError] = useState('');
  const [isconnected, setIsconnected] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsconnected(state.isConnected)
      if (!state.isConnected) setPageLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleIntegerInput = (text, setter, maxValue = null, fieldName = '') => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (maxValue !== null && cleaned !== '') {
      const numValue = parseInt(cleaned, 10);
      if (numValue > maxValue) {
        Toast.show(`${fieldName} must not exceed ${maxValue}`);
        return; // Don't update if exceeds max
      }
    }
    setter(cleaned);
  };

  const convertToPoundOld = (kgOrLb, gOrOz) => {
    const totalKg = kgOrLb + gOrOz / 100;
    const totalPounds = totalKg * 2.20462262185;
    let pounds = Math.floor(totalPounds);
    // Extract first 2 decimal digits as "ounces" (decimal representation)
    const decimalPart = totalPounds - pounds;
    let ounces = Math.round(decimalPart * 100);
    // Handle case where ounces become 100 after rounding
    if (ounces === 100) {
      ounces = 0;
      pounds += 1;
    }
    // console.log("totalPounds", totalPounds);
    // console.log("pounds", pounds);
    // console.log("ounces", ounces);
    setWeightKg(pounds > 0 ? String(pounds) : "");
    setWeightG(ounces > 0 ? String(ounces) : "");
  }

  const convertToPound = (kgOrLb, gOrOz) => {
    const totalKg = kgOrLb + gOrOz / 10;  // Changed from /100 to /10
    const totalPounds = totalKg * 2.20462262185;
    let pounds = Math.floor(totalPounds);
    // Extract first 1 decimal digit
    const decimalPart = totalPounds - pounds;
    let decimal = Math.round(decimalPart * 10);  // Changed from *100 to *10
    // Handle case where decimal becomes 10 after rounding
    if (decimal === 10) {  // Changed from 100 to 10
      decimal = 0;
      pounds += 1;
    }

    setWeightKg(pounds > 0 ? String(pounds) : "");
    setWeightG(decimal > 0 ? String(decimal) : "");  // Now shows 0-9
  }

  const convertToKg = (kgOrLb, gOrOz) => {
    // Treat gOrOz as decimal digits (0-9), not actual ounces
    const totalPounds = Number(kgOrLb) + Number(gOrOz) / 10;  // Changed /100 to /10
    const totalKg = totalPounds / 2.20462262185;
    let kg = Math.floor(totalKg);
    // Extract first 1 decimal digit
    const decimalPart = totalKg - kg;
    let grams = Math.round(decimalPart * 10);  // Changed *100 to *10
    // Handle case where grams becomes 10 due to rounding
    if (grams === 10) {  // Changed 100 to 10
      grams = 0;
      kg += 1;
    }
    setWeightKg(kg > 0 ? String(kg) : "");
    setWeightG(grams > 0 ? String(grams) : "");
  }

  const convertToKgOld = (kgOrLb, gOrOz) => {
    // Treat gOrOz as decimal digits (0-99), not actual ounces
    const totalPounds = Number(kgOrLb) + Number(gOrOz) / 100;
    const totalKg = totalPounds / 2.20462262185;
    let kg = Math.floor(totalKg);
    // Extract first 2 decimal digits as grams
    const decimalPart = totalKg - kg;
    let grams = Math.round(decimalPart * 100);
    // Handle case where grams becomes 100 due to rounding
    if (grams === 100) {
      grams = 0;
      kg += 1;
    }
    setWeightKg(kg > 0 ? String(kg) : "");
    setWeightG(grams > 0 ? String(grams) : "");
  }

  const handleUnitToggle = (newIsMetric) => {
    const mOrFt = parseFloat(heightM || '0');
    const cmOrIn = parseFloat(heightCm || '0');
    const kgOrLb = parseFloat(weightKg || '0');
    const gOrOz = parseFloat(weightG || '0');
    const waistVal = parseFloat(waist || '0');

    if (!newIsMetric) {
      if (mOrFt > 0 || cmOrIn > 0) {
        const totalCm = mOrFt * 100 + cmOrIn;
        const totalInches = totalCm / 2.54;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        setHeightM(feet ? String(feet) : '');
        setHeightCm(inches ? String(inches) : '');
      }
      if (kgOrLb > 0 || gOrOz > 0) {
        convertToPound(kgOrLb, gOrOz);
        /*const totalKg = kgOrLb + gOrOz / 100;
        const totalPounds = totalKg * 2.20462262185;
        let pounds = Math.floor(totalPounds);
        // Extract first 2 decimal digits as "ounces" (decimal representation)
        const decimalPart = totalPounds - pounds;
        let ounces = Math.round(decimalPart * 100);
        // Handle case where ounces become 100 after rounding
        if (ounces === 100) {
          ounces = 0;
          pounds += 1;
        }
        // console.log("totalPounds", totalPounds);
        // console.log("pounds", pounds);
        // console.log("ounces", ounces);
        setWeightKg(pounds > 0 ? String(pounds) : "");
        setWeightG(ounces > 0 ? String(ounces) : "");*/
      }
      if (waistVal > 0) setWaist(String(Math.round(waistVal / 2.54)));
    } else {
      if (mOrFt > 0 || cmOrIn > 0) {
        const totalInches = mOrFt * 12 + cmOrIn;
        const totalCm = totalInches * 2.54;
        const meters = Math.floor(totalCm / 100);
        let cm = Math.round(totalCm % 100);
        if (meters == 2) {
          cm = ""
        }
        setHeightM(meters ? String(meters) : '');
        setHeightCm(cm ? String(cm) : '');
      }
      if (kgOrLb > 0 || gOrOz > 0) {
        convertToKg(kgOrLb, gOrOz);
        /* // Treat gOrOz as decimal digits (0-99), not actual ounces
         const totalPounds = Number(kgOrLb) + Number(gOrOz) / 100;
         const totalKg = totalPounds / 2.20462262185;
         let kg = Math.floor(totalKg);
         // Extract first 2 decimal digits as grams
         const decimalPart = totalKg - kg;
         let grams = Math.round(decimalPart * 100);
         // Handle case where grams becomes 100 due to rounding
         if (grams === 100) {
           grams = 0;
           kg += 1;
         }
         setWeightKg(kg > 0 ? String(kg) : "");
         setWeightG(grams > 0 ? String(grams) : "");*/
      }
      if (waistVal > 0) setWaist(String(Math.round(waistVal * 2.54)));
    }

    setIsMetric(newIsMetric);
  };

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

  const calculateBMI = () => {
    const mOrFt = parseFloat(heightM || '0');
    const cmOrIn = parseFloat(heightCm || '0');
    const kgOrLb = parseFloat(weightKg || '0');
    const gOrOz = parseFloat(weightG || '0');

    if ((mOrFt > 0 || cmOrIn > 0) && (kgOrLb > 0 || gOrOz > 0)) {
      let heightInMeters, weightInKg;
      if (isMetric) {
        heightInMeters = mOrFt + cmOrIn / 100;
        weightInKg = kgOrLb + gOrOz / 1000;
      } else {
        heightInMeters = mOrFt * 0.3048 + cmOrIn * 0.0254;
        weightInKg = kgOrLb * 0.453592 + gOrOz * 0.0283495;
      }
      if (heightInMeters > 0) setBmi((weightInKg / (heightInMeters * heightInMeters)).toFixed(2));
    } else if (!heightM && !heightCm && !weightKg && !weightG) {
      setBmi('');
    }
  };
  useEffect(() => { calculateBMI(); }, [heightM, heightCm, weightKg, weightG, isMetric]);

  const resetForm = () => {
    setHeightM(''); setHeightCm(''); setWeightKg(''); setWeightG('');
    setBmi(''); setWaist(''); setPulse(''); setBp(''); setBpError('');
    setIsMetric(true);
  };

  const handleBpChange = (text) => {
    let cleaned = text.replace(/[^0-9/]/g, '');
    const slashCount = (cleaned.match(/\//g) || []).length;
    if (slashCount > 1) {
      cleaned = cleaned.replace(/\/+/g, '/');
      const parts = cleaned.split('/');
      cleaned = parts[0] + '/' + parts.slice(1).join('');
    }
    if (cleaned.length > bp.length && cleaned.length >= 3 && !cleaned.includes('/')) {
      cleaned = cleaned.slice(0, 3) + '/' + cleaned.slice(3);
    }
    setBp(cleaned);
    setBpError('');
  };

  const validateBp = () => {
    if (!bp) { setBpError(''); return { isValid: true, error: '' }; }
    const bpPattern = /^(\d{2,3})\/(\d{2,3})$/;
    const match = bp.match(bpPattern);
    if (!match) {
      const error = bp.includes('/') ? 'Invalid data entered' : 'Invalid format. Use format: 120/80';
      setBpError(error);
      return { isValid: false, error };
    }
    const systolic = parseInt(match[1], 10);
    const diastolic = parseInt(match[2], 10);
    if (systolic > 275) {
      const error = 'Systolic should not exceed 275';
      setBpError(error);
      return { isValid: false, error };
    }
    if (diastolic > 195) {
      const error = 'Diastolic should not exceed 195';
      setBpError(error);
      return { isValid: false, error };
    }
    if (systolic <= diastolic) {
      const error = 'Systolic must be greater than diastolic';
      setBpError(error);
      return { isValid: false, error };
    }
    setBpError('');
    return { isValid: true, error: '' };
  };

  const handleGoBack = () => { resetForm(); navigation.navigate('HealthParameter'); };

  const onSave = async () => {
    try {
      if (!isconnected) { Toast.show('No internet connection'); return; }

      if (
        !heightM &&
        !heightCm &&
        !weightKg &&
        !weightG &&
        !waist &&
        !bp &&
        !pulse
      ) {
        Toast.show('Please enter at least one record');
        return;
      }

      // --- validations (unchanged) ---
      if (heightM || heightCm) {
        const mOrFt = parseFloat(heightM || '0');
        const cmOrIn = parseFloat(heightCm || '0');
        if (isMetric) {
          const totalCm = mOrFt * 100 + cmOrIn;
          if (totalCm > 200) { Toast.show('Height must not exceed 2 m (200 cm)'); return; }
          if (mOrFt === 2 && cmOrIn > 0) { Toast.show('Height (cm) must be 0 when meters is 2'); return; }
          if (cmOrIn > 99) { Toast.show('Height (cm) must not exceed 99 cm'); return; }
        } else {
          const totalInches = mOrFt * 12 + cmOrIn;
          if (totalInches > 79) { Toast.show('Height must not exceed 6 ft 7 in (79 inches)'); return; }
          if (mOrFt === 6 && cmOrIn > 7) { Toast.show('Height (inches) must not exceed 7 when feet is 6'); return; }
          if (cmOrIn > 11) { Toast.show('Height (inches) must not exceed 11 inches'); return; }
        }
      }
      if (weightKg || weightG) {
        const kgOrLb = parseFloat(weightKg || '0');
        const gOrOz = parseFloat(weightG || '0');
        if (isMetric) {
          const totalKg = kgOrLb + gOrOz / 1000;
          if (totalKg > 300) { Toast.show('Weight must not exceed 300 kg'); return; }
          if (kgOrLb === 300 && gOrOz > 0) { Toast.show('Weight (grams) must be 0 when kg is 300'); return; }
          if (gOrOz > 999) { Toast.show('Weight (grams) must not exceed 999 g'); return; }
        } else {
          const totalOz = kgOrLb * 16 + gOrOz;
          if (totalOz > 10582) { Toast.show('Weight must not exceed 661 lb 6 oz'); return; }
          if (kgOrLb === 661 && gOrOz > 6) { Toast.show('Weight (ounces) must not exceed 6 when lb is 661'); return; }
          if (gOrOz > 15) { Toast.show('Weight (ounces) must not exceed 15 oz'); return; }
        }
      }
      if (waist) {
        const waistNum = parseFloat(waist);
        if (!isNaN(waistNum)) {
          if (isMetric && waistNum > 200) { Toast.show('Waist circumference must not exceed 200 cm'); return; }
          if (!isMetric && waistNum > 78) { Toast.show('Waist circumference must not exceed 78 inches'); return; }
        }
      }
      if (bp) {
        const bpValidation = validateBp();
        if (!bpValidation.isValid) {
          Toast.show(bpValidation.error || 'Invalid BP');
          return;
        }
      }

      const vitalsdata = [];
      const ftMtInput = isMetric ? 'M' : 'Ft';
      const inCmInput = isMetric ? 'Cm' : 'In';
      const heightDim = isMetric ? 'cm' : 'inch';
      const stKgInput = isMetric ? 'Kg' : 'Lb';
      const lbGInput = isMetric ? 'G' : 'Oz';
      const weightDim = isMetric ? 'kg' : 'lb';
      const bpunits = 'mmHg';
      const pulseunits = 'bpm';

      if (heightM || heightCm) {
        const mOrFt = parseFloat(heightM || '0');
        const cmOrIn = parseFloat(heightCm || '0');
        const totalCmOrIn = isMetric ? mOrFt * 100 + cmOrIn : mOrFt * 12 + cmOrIn;
        const heightString = `${heightM || 0} ${ftMtInput} ${heightCm || 0} ${inCmInput}`;
        vitalsdata.push({
          resourceType: 'Observation',
          status: '1',
          valueString: heightString,
          valueInteger: 1,
          valueQuantity: { value: Number(totalCmOrIn), unit: heightDim },
          code: { coding: { code: "" } }
        });
      } else {
        vitalsdata.push({ resourceType: 'Observation', status: '1', valueString: '-', valueInteger: 1, valueQuantity: { value: 0, unit: heightDim }, code: { coding: { code: "" } } });
      }

      if (weightKg || weightG) {
        const a = parseFloat(weightKg || '0');
        const b = parseFloat(weightG || '0');
        const total = isMetric ? a + b / 1000 : a + b / 16;
        const weightString = `${weightKg || 0} ${stKgInput} ${weightG || 0} ${lbGInput}`;
        vitalsdata.push({
          resourceType: 'Observation',
          status: '1',
          valueString: weightString,
          valueInteger: 2,
          valueQuantity: { value: Number(total), unit: weightDim },
          code: { coding: { system: "1" } }
        });
      } else {
        vitalsdata.push({ resourceType: 'Observation', status: '1', valueString: '-', valueInteger: 2, valueQuantity: { value: 0, unit: weightDim }, code: { coding: { system: "1" } } });
      }

      if (bmi) {
        vitalsdata.push({ resourceType: 'Observation', status: '1', valueString: String(parseFloat(bmi)), valueInteger: 3, code: { coding: { system: "" } } });
      } else {
        vitalsdata.push({ resourceType: 'Observation', status: '1', valueString: '-', valueInteger: 3, code: { coding: { system: "" } } });
      }

      if (waist) {
        const waistNum = parseFloat(waist);
        const waistUnits = isMetric ? 'cm' : 'inch';
        vitalsdata.push({
          resourceType: 'Observation',
          valueInteger: 4,
          valueString: `${waistNum} ${waistUnits}`,
          status: '1',
          valueQuantity: { value: Number(waistNum), unit: waistUnits },
          code: { coding: { system: "" } }
        });
      } else {
        vitalsdata.push({ resourceType: 'Observation', status: '1', valueString: '-', valueInteger: 4, code: { coding: { system: "" } } });
      }

      if (bp) {
        const sys = parseFloat(String(bp).split('/')[0]);
        vitalsdata.push({
          resourceType: 'Observation',
          valueString: `${bp.trim()} ${bpunits}`,
          valueInteger: 5,
          status: '1',
          valueQuantity: { value: isNaN(sys) ? undefined : Number(sys), unit: 'mmHg' },
          code: { coding: { system: "" } }
        });
      } else {
        vitalsdata.push({ resourceType: 'Observation', status: '1', valueString: '-', valueInteger: 5, code: { coding: { system: "" } } });
      }

      if (pulse) {
        const pulseNum = parseFloat(pulse);
        if (!isNaN(pulseNum)) {
          if (pulseNum && pulseNum > 250) { Toast.show('Pulse rate must not exceed 250'); return; }
        }
        vitalsdata.push({
          resourceType: 'Observation',
          valueString: `${pulseNum} ${pulseunits}`,
          valueInteger: 6,
          status: '1',
          valueQuantity: { value: Number(pulseNum), unit: 'bpm' },
          code: { coding: { system: "" } }
        });
      } else {
        vitalsdata.push({ resourceType: 'Observation', status: '1', valueString: '-', valueInteger: 6, code: { coding: { system: "" } } });
      }

      const patientId = reduxAuthJson?.token?.loginUserId;
      if (!patientId) { Toast.show('User not identified. Please re-login.'); return; }

      setPageLoading(true);
      const res = await savePatientHealthParameters({ variables: { id: patientId, vitals: vitalsdata } });
      setTimeout(() => setPageLoading(false), 500);

      if (res?.data?.PatientUpdate?.id) {
        Toast.show('Record saved successfully');
        resetForm();
        navigation.navigate('HealthParameter');
      } else {
        Toast.show('Unable to save record.');
      }
    } catch (e) {
      setPageLoading(false);
      Toast.show('Unexpected error occurred');
      console.error('onSave error:', e);
    }
  };

  const SectionHeader = ({ title, image }) => (
    <View style={styles.sectionHeader}>
      <Image source={image} style={{ width: scale(40), height: scale(40), resizeMode: 'contain' }} />
      <Text allowFontScaling={false} style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const refreshBtnFn = async () => {
    try {
      navigation.navigate('AddHealthRecord');
      setPageLoading(true);
      resetForm();
      Toast.show('Refreshed successfully');
    } catch (error) {
      console.error('Refresh error:', error);
      Toast.show('Failed to refresh data');
    } finally {
      setPageLoading(false);
    }
  };

  // --------- Shared content (used below with/without KAV) ----------
  const Content = (
    <>
      <View style={styles.subHeaderRow}>
        <View style={styles.subHeaderRowLeft}>
          <TouchableOpacity style={styles.subHeaderBackBtn} onPress={handleGoBack}>
            <FontAwesome6 name="arrow-left-long" size={20} color={Colors.black} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={refreshBtnFn}>
          <FontAwesome name="refresh" size={26} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, {
          paddingBottom: insets.bottom + vScale(40) + (Platform.OS === 'android' ? kbHeight : 0),
        }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text allowFontScaling={false} style={styles.formTitle}>Record your physical health parameters here</Text>

        <View style={styles.unitToggleRow}>
          <Text allowFontScaling={false} style={styles.unitLabel}>Imperial</Text>
          <Switch
            value={isMetric}
            onValueChange={handleUnitToggle}
            trackColor={{ true: '#3bbfb5' }}
            thumbColor="#fff"
          />
          <Text allowFontScaling={false} style={[styles.unitLabel, styles.unitActive]}>Metric</Text>
        </View>

        {/* Height */}
        <View style={styles.rowBox}>
          <SectionHeader
            title="Height"
            image={require('../../../Utility/Public/images/healthIcon1.png')}
          />
          <View style={styles.twoColRow}>
            <TextInput
              style={styles.input}
              allowFontScaling={false}
              placeholder={isMetric ? 'M' : 'Ft'}
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={heightM}
              onChangeText={(text) => {
                handleIntegerInput(text, setHeightM, isMetric ? 2 : 7, isMetric ? 'Height (M)' : 'Height (Ft)');
                if (isMetric && text === '2') {
                  setHeightCm('');
                } else if (!isMetric && text === '6' && heightCm > 7) {
                  setHeightCm('7');
                }
              }}
              returnKeyType="next"
              maxLength={1}
            />
            <TextInput
              style={[styles.input, (isMetric && heightM === '2') && styles.disabled]}
              allowFontScaling={false}
              placeholder={isMetric ? 'Cm' : 'In'}
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={heightCm}
              onChangeText={(text) => {
                if (!isMetric && heightM === '6') {
                  handleIntegerInput(text, setHeightCm, 7, 'Height (In)');
                } else {
                  handleIntegerInput(text, setHeightCm, isMetric ? 99 : 11, isMetric ? 'Height (Cm)' : 'Height (In)');
                }
              }}
              returnKeyType="next"
              maxLength={2}
              editable={!(isMetric && heightM === '2')}
            />
          </View>
        </View>

        {/* Weight */}
        <View style={styles.rowBox}>
          <SectionHeader
            image={require('../../../Utility/Public/images/healthIcon2.png')}
            title="Weight"
          />
          <View style={styles.twoColRow}>
            <TextInput
              style={styles.input}
              allowFontScaling={false}
              placeholder={isMetric ? 'Kg' : 'Lb'}
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={weightKg}
              onChangeText={(text) => {
                handleIntegerInput(text, setWeightKg, isMetric ? 300 : 661, isMetric ? 'Weight (Kg)' : 'Weight (Lb)');
                if (isMetric && text === '300') {
                  setWeightG('');
                } else if (!isMetric && text === '661') {
                  setWeightG('');
                }
              }}
              returnKeyType="next"
              maxLength={4}
            />
            <TextInput
              style={[styles.input, ((isMetric && weightKg === '300')) && styles.disabled]}
              allowFontScaling={false}
              placeholder={isMetric ? 'G' : 'Oz'}
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={weightG}
              onChangeText={(text) => {
                if (!isMetric && weightKg === '661') {
                  handleIntegerInput(text, setWeightG, 6, 'Weight (Oz)');
                } else {
                  handleIntegerInput(text, setWeightG, isMetric ? 999 : 15, isMetric ? 'Weight (G)' : 'Weight (Oz)');
                }
              }}
              returnKeyType="next"
              maxLength={3}
              editable={!((isMetric && weightKg === '300'))}
            />
          </View>
        </View>

        {/* BMI */}
        <View style={styles.rowBox}>
          <SectionHeader
            image={require('../../../Utility/Public/images/healthIcon7.png')}
            title="BMI"
          />
          <TextInput
            style={[styles.inputFull, styles.disabled]}
            allowFontScaling={false}
            placeholder="BMI"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={bmi}
            readOnly
            onChangeText={(text) => handleIntegerInput(text, setBmi)}
          />
        </View>

        {/* Waist */}
        <View style={styles.rowBox}>
          <SectionHeader
            image={require('../../../Utility/Public/images/healthIcon8.png')}
            title="Waist Circumference"
          />
          <TextInput
            style={styles.inputFull}
            allowFontScaling={false}
            placeholder={isMetric ? 'cm' : 'inch'}
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={waist}
            onChangeText={(text) => handleIntegerInput(text, setWaist, isMetric ? 200 : 78, isMetric ? 'Waist (cm)' : 'Waist (inch)')}
            maxLength={3}
          />
        </View>

        {/* Pulse & BP */}
        <View style={styles.rowBox}>
          <View style={styles.rowHeaderWrap}>
            <SectionHeader
              image={require('../../../Utility/Public/images/healthIcon5.png')}
              title="Pulse Rate"
            />
            <View style={styles.sectionHeader}>
              <Image
                source={require('../../../Utility/Public/images/healthIcon6.png')}
                style={{ width: scale(40), height: scale(40), resizeMode: 'contain' }}
              />
              <Text allowFontScaling={false} style={[styles.sectionTitle, styles.sectionTitleWintHing]}>Blood Pressure</Text>
              <TouchableOpacity
                style={{ marginLeft: 3 }}
                onPress={() => Toast.show('Enter BP in mmHg (e.g., 120/80), max allowed: 275/195.', Toast.LONG, Toast.TOP, { yOffset: 20 })}
              >
                <FontAwesome name="info-circle" size={14} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.twoColRow}>
            <TextInput
              style={styles.input}
              allowFontScaling={false}
              placeholder="Per minute"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={pulse}
              onChangeText={(text) => handleIntegerInput(text, setPulse, 250, 'Pulse rate')}
              maxLength={3}
            />
            <View style={{ flex: 1, position: 'relative' }}>
              <TextInput
                style={[styles.input, bpError && styles.inputError]}
                allowFontScaling={false}
                placeholder="Sys/Dia"
                placeholderTextColor="#666"
                keyboardType="default"
                value={bp}
                onChangeText={handleBpChange}
                onBlur={validateBp}
                maxLength={7}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer (floats; lifted by keyboard on Android) */}
      <View style={[
        styles.footerBtns,
        {
          bottom: Platform.OS === 'android' ? kbHeight : 0,
        }
      ]}>
        <TouchableOpacity style={[styles.ctaBtn, styles.ctaSecondary]} onPress={handleGoBack}>
          <Text allowFontScaling={false} style={styles.ctaText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.ctaBtn, styles.ctaPrimary]} onPress={onSave}>
          <Text allowFontScaling={false} style={styles.ctaText}>Save New Record</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <Loader style={styles.loadingCss} loading={pageLoading} />
      <CustomHeader pageName="Physical Parameters" />

      {/* iOS uses KAV; Android relies on kbHeight listeners */}
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior="padding"
          keyboardVerticalOffset={insets.top + vScale(80)}
        >
          {Content}
        </KeyboardAvoidingView>
      ) : (
        <View style={{ flex: 1 }}>
          {Content}
        </View>
      )}
    </SafeAreaView>
  );
}

export default AddHealthRecord;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E6F6F3',
  },
  loadingCss: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    top: 0,
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
  subHeaderRowLeft: { flexDirection: 'row', alignItems: 'center' },
  subHeaderBackBtn: { padding: scale(6) },
  content: {
    paddingHorizontal: scale(15),
    paddingTop: 0,
    //backgroundColor:'red'
  },
  formTitle: {
    color: '#000',
    fontFamily: 'Montserrat-Bold',
    fontSize: font(16),
    marginBottom: vScale(10),
    fontWeight: '700',
  },
  unitToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
    marginBottom: vScale(10),
  },
  unitLabel: {
    color: '#000',
    fontFamily: 'Arimo-Bold',
    fontWeight: '700',
  },
  unitActive: { fontFamily: 'Arimo-Bold' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vScale(6),
    width: '48%',
  },
  sectionTitle: {
    color: '#000',
    fontFamily: 'Arimo-Bold',
    fontSize: font(13),
    marginLeft: scale(8),
    fontWeight: '700',
  },
  sectionTitleWintHing: {
    fontSize: font(13),
  },
  rowBox: { marginBottom: vScale(8) },
  twoColRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: scale(12),
    marginBottom: vScale(10),
  },
  rowHeaderWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: scale(12),
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: scale(8),
    paddingVertical: vScale(10),
    paddingHorizontal: scale(12),
    color: '#000',
    fontFamily: 'Arimo-Regular',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: vScale(45),
  },
  inputFull: {
    backgroundColor: '#fff',
    borderRadius: scale(8),
    paddingVertical: vScale(10),
    paddingHorizontal: scale(12),
    color: '#000',
    fontFamily: 'Arimo-Regular',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: vScale(10),
    height: vScale(45),
  },
  disabled: { backgroundColor: '#e0e0e0' },
  inputError: { borderColor: 'red' },
  footerBtns: {
    position: 'absolute',
    left: scale(15),
    right: scale(15),
    // dynamic bottom set in-line with kbHeight
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: scale(12),
    backgroundColor: '#E6F6F3',
    paddingVertical: 5,
  },
  ctaBtn: {
    flex: 1,
    borderRadius: scale(8),
    paddingVertical: vScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  ctaSecondary: { backgroundColor: '#7f7f7f' },
  ctaPrimary: { backgroundColor: '#229980' },
  ctaText: {
    color: '#fff',
    fontSize: font(14),
    fontFamily: 'Arimo-Bold',
  },
});
