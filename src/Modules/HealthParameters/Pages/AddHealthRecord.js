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

function AddHealthRecord() {
  const [pageLoading, setPageLoading] = useState(false);
  const [isMetric, setIsMetric] = useState(true);
  const navigation = useNavigation();
  const reduxAuthJson = useSelector((state) => state);
  const insets = useSafeAreaInsets();

  // Form state
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
      if (!state.isConnected) {
        setPageLoading(false);
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Handle hardware back button
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

  // Calculate BMI when height and weight values are present
  const calculateBMI = () => {
    const mOrFt = parseFloat(heightM || '0');
    const cmOrIn = parseFloat(heightCm || '0');
    const kgOrLb = parseFloat(weightKg || '0');
    const gOrOz = parseFloat(weightG || '0');

    // Check if we have valid height and weight values
    if ((mOrFt > 0 || cmOrIn > 0) && (kgOrLb > 0 || gOrOz > 0)) {
      let heightInMeters, weightInKg;

      if (isMetric) {
        // Convert height to meters
        heightInMeters = mOrFt + cmOrIn / 100;
        // Convert weight to kg
        weightInKg = kgOrLb + gOrOz / 1000;
      } else {
        // Convert feet and inches to meters (1 ft = 0.3048 m, 1 in = 0.0254 m)
        heightInMeters = mOrFt * 0.3048 + cmOrIn * 0.0254;
        // Convert pounds and ounces to kg (1 lb = 0.453592 kg, 1 oz = 0.0283495 kg)
        weightInKg = kgOrLb * 0.453592 + gOrOz * 0.0283495;
      }

      // Calculate BMI: weight (kg) / height² (m²)
      if (heightInMeters > 0) {
        const bmiValue = weightInKg / (heightInMeters * heightInMeters);
        setBmi(bmiValue.toFixed(2));
      }
    } else if (!heightM && !heightCm && !weightKg && !weightG) {
      // Clear BMI if both height and weight are empty
      setBmi('');
    }
  };

  useEffect(() => {
    calculateBMI();
  }, [heightM, heightCm, weightKg, weightG, isMetric]);

  const resetForm = () => {
    setHeightM('');
    setHeightCm('');
    setWeightKg('');
    setWeightG('');
    setBmi('');
    setWaist('');
    setPulse('');
    setBp('');
    setBpError('');
  };

  // Handle blood pressure input with auto-formatting
  const handleBpChange = (text) => {
    // Remove all non-numeric characters except slash
    let cleaned = text.replace(/[^0-9/]/g, '');

    // Prevent multiple slashes
    const slashCount = (cleaned.match(/\//g) || []).length;
    if (slashCount > 1) {
      cleaned = cleaned.replace(/\/+/g, '/');
      const parts = cleaned.split('/');
      cleaned = parts[0] + '/' + parts.slice(1).join('');
    }

    // Auto-add slash after systolic (first 2-3 digits) only when typing forward
    // Don't auto-add if user is deleting (text is shorter than current bp)
    if (cleaned.length > bp.length && cleaned.length >= 3 && !cleaned.includes('/')) {
      cleaned = cleaned.slice(0, 3) + '/' + cleaned.slice(3);
    }

    setBp(cleaned);
    setBpError('');
  };

  // Validate blood pressure format
  const validateBp = () => {
    if (!bp) {
      setBpError('');
      return true;
    }

    const bpPattern = /^(\d{2,3})\/(\d{2,3})$/;
    const match = bp.match(bpPattern);

    if (!match) {
      setBpError('Invalid format. Use format: 120/80');
      return false;
    }

    const systolic = parseInt(match[1]);
    const diastolic = parseInt(match[2]);

    if (systolic < 70 || systolic > 250) {
      setBpError('Systolic should be between 70-250');
      return false;
    }

    if (diastolic < 40 || diastolic > 150) {
      setBpError('Diastolic should be between 40-150');
      return false;
    }

    if (systolic <= diastolic) {
      setBpError('Systolic must be greater than diastolic');
      return false;
    }

    setBpError('');
    return true;
  };

  const handleGoBack = () => {
    navigation.navigate('HealthParameter');
  };

  const onSave = async () => {
    try {
      if(!isconnected){
        Toast.show('No internet connection');
        return;
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

      // Height
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
          code: {
            coding: {
              code: ""
            }
          }
        });
      }

      // Weight
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
          code: {
            coding: {
              system: "1"
            }
          }
        });
      }

      // BMI
      if (bmi) {
        const bmiNum = parseFloat(bmi);
        if (!isNaN(bmiNum)) {
          vitalsdata.push({
            resourceType: 'Observation',
            status: '1',
            valueString: bmiNum.toString(),
            valueInteger: 3,
            code: {
              coding: {
                system: ""
              }
            }
          });
        }
      }

      // Waist Circumference
      if (waist) {
        const waistNum = parseFloat(waist);
        if (!isNaN(waistNum)) {
          const waistUnits = isMetric ? 'cm' : 'inch';
          vitalsdata.push({
            resourceType: 'Observation',
            valueInteger: 4,
            valueString: `${waistNum} ${waistUnits}`,
            status: '1',
            valueQuantity: { value: Number(waistNum), unit: waistUnits },
            code: {
              coding: {
                system: ""
              }
            }
          });
        }
      }

      // BP
      if (bp) {
        const sys = parseFloat(String(bp).split('/')[0]);
        vitalsdata.push({
          resourceType: 'Observation',
          valueString: `${bp.trim()} ${bpunits}`,
          valueInteger: 5,
          status: '1',
          valueQuantity: { value: isNaN(sys) ? undefined : Number(sys), unit: 'mmHg' },
          code: {
            coding: {
              system: ""
            }
          }
        });
      }

      // Pulse
      if (pulse) {
        const pulseNum = parseFloat(pulse);
        if (!isNaN(pulseNum)) {
          vitalsdata.push({
            resourceType: 'Observation',
            valueString: `${pulseNum} ${pulseunits}`,
            valueInteger: 6,
            status: '1',
            valueQuantity: { value: Number(pulseNum), unit: 'bpm' },
            code: {
              coding: {
                system: ""
              }
            }
          });
        }
      }

      if (vitalsdata.length === 0) {
        Toast.show('Please enter at least one parameter to save.');
        return;
      }

      // Validate blood pressure format before saving
      if (bp && !validateBp()) {
        return;
      }

      const patientId = reduxAuthJson?.token?.loginUserId;
      if (!patientId) {
        Toast.show('User not identified. Please re-login.');
        return;
      }

      setPageLoading(true);
      const res = await savePatientHealthParameters({
        variables: { id: patientId, vitals: vitalsdata },
      });
      setTimeout(() => {
        setPageLoading(false);
      }, 500);
      if (res?.data?.PatientUpdate?.id) {
        Toast.show('Record saved successfully');
        resetForm();
        // navigation.goBack();
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
      <Image source={image} style={{ width: 40, height: 40, resizeMode: 'contain' }} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const refreshBtnFn = async () => {
    try {
      navigation.navigate('AddHealthRecord');
      setPageLoading(true); // show loader
      resetForm(); // clear all input fields
      Toast.show('Refreshed successfully');
    } catch (error) {
      console.error('Refresh error:', error);
      Toast.show('Failed to refresh data');
    } finally {
      setPageLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <Loader style={styles.loadingCss} loading={pageLoading} />
      <CustomHeader pageName="Physical Parameters" />

      <View style={styles.subHeaderRow}>
        <View style={styles.subHeaderRowLeft}>
          <TouchableOpacity style={styles.subHeaderBackBtn} onPress={handleGoBack}>
            <FontAwesome6 name="arrow-left-long" size={20} color={Colors.black} />
          </TouchableOpacity>
          {/* <Text style={styles.subHeaderTitle}>Previous Records</Text> */}
        </View>
        <TouchableOpacity style={styles.refreshBtn}
          onPress={() => refreshBtnFn()}
        >
          <FontAwesome name="refresh" size={26} color="#000" />
        </TouchableOpacity>
      </View>

      {/* 👇 KeyboardAvoidingView wraps content and footer */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 80} // Adjust if header overlaps
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.formTitle}>Record your physical health parameters here</Text>

          <View style={styles.unitToggleRow}>
            <Text style={styles.unitLabel}>Imperial</Text>
            <Switch
              value={isMetric}
              onValueChange={setIsMetric}
              trackColor={{ true: '#3bbfb5' }}
              thumbColor="#fff"
            />
            <Text style={[styles.unitLabel, styles.unitActive]}>Metric</Text>
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
                placeholder={isMetric ? 'M' : 'Ft'}
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={heightM}
                onChangeText={setHeightM}
                returnKeyType="next"
              />
              <TextInput
                style={styles.input}
                placeholder={isMetric ? 'Cm' : 'In'}
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={heightCm}
                onChangeText={setHeightCm}
                returnKeyType="next"
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
                placeholder={isMetric ? 'Kg' : 'Lb'}
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={weightKg}
                onChangeText={setWeightKg}
                returnKeyType="next"
              />
              <TextInput
                style={styles.input}
                placeholder={isMetric ? 'G' : 'Oz'}
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={weightG}
                onChangeText={setWeightG}
                returnKeyType="next"
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
              style={styles.inputFull}
              placeholder="BMI"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={bmi}
              onChangeText={setBmi}
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
              placeholder={isMetric ? 'cm' : 'inch'}
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={waist}
              onChangeText={setWaist}
            />
          </View>

          {/* Pulse & BP */}
          <View style={styles.rowBox}>
            <View style={styles.rowHeaderWrap}>
              <SectionHeader
                image={require('../../../Utility/Public/images/healthIcon5.png')}
                title="Pulse Rate"
              />
              {/* <SectionHeader
                image={require('../../../Utility/Public/images/healthIcon6.png')}
                title="Blood Pressure"
              /> */}
              <View style={styles.sectionHeader}>
                <Image
                  source={require('../../../Utility/Public/images/healthIcon6.png')}
                  style={{ width: 40, height: 40, resizeMode: 'contain' }}
                />
                <Text style={styles.sectionTitle}>Blood Pressure</Text>

                <TouchableOpacity
                  style={{ marginLeft: 3 }}
                  onPress={() =>
                    Toast.show(
                      'Enter your blood pressure in mmHg (e.g., 120/80)',
                      Toast.LONG,           // make it stay longer
                      Toast.TOP,            // show near the top
                      { yOffset: 20 }       // move a bit down from top
                    )
                  }
                >
                  <FontAwesome name="info-circle" size={14} color="#333" />
                </TouchableOpacity>

              </View>
            </View>
            <View style={styles.twoColRow}>
              <TextInput
                style={styles.input}
                placeholder="Per minute"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={pulse}
                onChangeText={setPulse}
              />
              <View style={{ flex: 1, position: 'relative' }}>
                <TextInput
                  style={[styles.input, bpError && styles.inputError]}
                  placeholder="Sys/Dia"
                  placeholderTextColor="#666"
                  keyboardType="default"
                  value={bp}
                  onChangeText={handleBpChange}
                  onBlur={validateBp}
                  maxLength={7}
                />
                {bpError ? (
                  <Text style={styles.errorText}>{bpError}</Text>
                ) : (
                  <Text style={styles.hint}>* 120/80 mmHg</Text>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footerBtns, { paddingBottom: insets.bottom + 15 }]}>
          <TouchableOpacity style={[styles.ctaBtn, styles.ctaSecondary]} onPress={handleGoBack}>
            <Text style={styles.ctaText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.ctaBtn, styles.ctaPrimary]} onPress={onSave}>
            <Text style={styles.ctaText}>Save New Record</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

}

export default AddHealthRecord;

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: '#E6F6F3',
  },
  subHeaderRow: {
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 8,
    marginBottom: 6,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subHeaderRowLeft: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  subHeaderBackBtn: {
    padding: 6,
  },
  subHeaderTitle: {
    color: '#000',
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
  },
  content: {
    paddingHorizontal: 15,
    paddingTop: 0, // 👈 no extra padding before content
  },
  formTitle: {
    color: '#000',
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 700,
  },
  unitToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  unitLabel: {
    color: '#000',
    fontFamily: 'Arimo-Bold',
    fontWeight: 700
  },
  unitActive: {
    fontFamily: 'Arimo-Bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    width: '48%',
  },
  sectionTitle: {
    color: '#000',
    fontFamily: 'Arimo-Bold',
    fontSize: 14,
    marginLeft: 10,
    fontWeight: 700
  },
  rowBox: {
    marginBottom: 8,
    //backgroundColor:'pink'
  },
  twoColRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  rowHeaderWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#000',
    fontFamily: 'Arimo-Regular',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 45,
  },
  inputFull: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#000',
    fontFamily: 'Arimo-Regular',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 10,
    height: 45,
  },
  footerBtns: {
    position: 'absolute',
    left: 15,
    right: 15,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#E6F6F3',
  },
  ctaBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  ctaSecondary: {
    backgroundColor: '#7f7f7f',
  },
  ctaPrimary: {
    backgroundColor: '#229980',
  },
  ctaText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Arimo-Bold',
  },
  hint: {
    fontSize: 10,
    color: 'red',
    position: 'absolute',
    right: 5,
    bottom: -15,
  },
  errorText: {
    fontSize: 10,
    color: 'red',
    position: 'absolute',
    right: -2,
    bottom: -25,
  },

});
