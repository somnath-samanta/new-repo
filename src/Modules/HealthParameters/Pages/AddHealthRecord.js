import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, TextInput, Switch, ScrollView, BackHandler, Image } from 'react-native';
import CustomHeader from '../../../Utility/Components/CustomHeader';
import Loader from '../../../Utility/Components/Loader';
import Colors from '../../../Utility/Colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-simple-toast';
import { savePatientHealthParameters } from '../Controller/HealthParametersController';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

const screen = Dimensions.get('window');
const screenWidth = screen.width;
const screenHeight = screen.height;

function AddHealthRecord() {
  const [pageLoading, setPageLoading] = useState(false);
  const [isMetric, setIsMetric] = useState(true);
  const navigation = useNavigation();
  const reduxAuthJson = useSelector((state) => state);

  // Form state
  const [heightM, setHeightM] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [weightG, setWeightG] = useState('');
  const [bmi, setBmi] = useState('');
  const [waist, setWaist] = useState('');
  const [pulse, setPulse] = useState('');
  const [bp, setBp] = useState(''); // e.g., 110/70

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

  const resetForm = () => {
    setHeightM('');
    setHeightCm('');
    setWeightKg('');
    setWeightG('');
    setBmi('');
    setWaist('');
    setPulse('');
    setBp('');
    // Optionally reset unit system
    // setIsMetric(true);
  };

  const handleGoBack = () => {
    navigation.navigate('HealthParameter');
  };

  const onSave = () => {
    try {
      // Build vitals payload from entered fields (Observation_Input[])
      const vitalsdata = [];

      // Common label helpers
      const ftMtInput = isMetric ? 'M' : 'Ft';
      const inCmInput = isMetric ? 'Cm' : 'In';
      const heightDim = isMetric ? 'cm' : 'inch';
      const stKgInput = isMetric ? 'Kg' : 'Lb';
      const lbGInput = isMetric ? 'G' : 'Oz';
      const weightDim = isMetric ? 'kg' : 'lb';
      const bpunits = 'mmHg';
      const pulseunits = 'bpm';

      // Height -> valueInteger: 1
      if ((heightM && heightM.trim() !== '') || (heightCm && heightCm.trim() !== '')) {
        const mOrFt = parseFloat(heightM || '0') || 0;
        const cmOrIn = parseFloat(heightCm || '0') || 0;
        const totalCmOrIn = isMetric ? (mOrFt * 100 + cmOrIn) : (mOrFt * 12 + cmOrIn);
        const heightString = `${heightM || 0} ${ftMtInput} ${heightCm || 0} ${inCmInput}`;
        vitalsdata.push({
          resourceType: 'Observation',
          status: '1',
          valueString: heightString,
          valueInteger: 1,
          valueQuantity: {
            value: Number(totalCmOrIn),
            unit: heightDim,
          },
          code: {
            coding: {
              code: '',
            },
          },
        });
      }

      // Weight -> valueInteger: 2
      if ((weightKg && weightKg.trim() !== '') || (weightG && weightG.trim() !== '')) {
        const a = parseFloat(weightKg || '0') || 0; // Kg or Lb
        const b = parseFloat(weightG || '0') || 0; // G or Oz
        const total = isMetric ? (a + b / 1000) : (a + b / 16);
        const weightString = `${weightKg || 0} ${stKgInput} ${weightG || 0} ${lbGInput}`;
        vitalsdata.push({
          resourceType: 'Observation',
          status: '1',
          valueString: weightString,
          valueInteger: 2,
          valueQuantity: {
            value: Number(total),
            unit: weightDim,
          },
          code: {
            coding: {
              system: '1',
            },
          },
        });
      }

      // BMI -> valueInteger: 3
      if (bmi && bmi.trim() !== '') {
        const bmiNum = parseFloat(bmi);
        if (!isNaN(bmiNum)) {
          vitalsdata.push({
            resourceType: 'Observation',
            status: '1',
            valueString: bmiNum.toString(),
            valueInteger: 3,
            code: {
              coding: {
                system: '',
              },
            },
          });
        }
      }

      // Waist Circumference -> valueInteger: 4
      if (waist && waist.trim() !== '') {
        const waistNum = parseFloat(waist);
        if (!isNaN(waistNum)) {
          const waistUnits = isMetric ? 'cm' : 'inch';
          const cirInCmInput = waistUnits; // using same field name as sample
          const waistString = `${waistNum} ${waistUnits}`;
          vitalsdata.push({
            resourceType: 'Observation',
            valueInteger: 4,
            valueString: waistString,
            status: '1',
            valueQuantity: {
              value: Number(waistNum),
              unit: cirInCmInput,
            },
            code: {
              coding: {
                system: '',
              },
            },
          });
        }
      }

      // Blood Pressure -> valueInteger: 5
      if (bp && bp.trim() !== '') {
        // extract systolic if possible for numeric value
        const sys = parseFloat(String(bp).split('/')[0]);
        vitalsdata.push({
          resourceType: 'Observation',
          valueString: `${bp.trim()} ${bpunits}`,
          valueInteger: 5,
          status: '1',
          valueQuantity: {
            value: isNaN(sys) ? undefined : Number(sys),
            unit: 'mmHg',
          },
          code: {
            coding: {
              system: '',
            },
          },
        });
      }

      // Pulse -> valueInteger: 6
      if (pulse && pulse.trim() !== '') {
        const pulseNum = parseFloat(pulse);
        if (!isNaN(pulseNum)) {
          vitalsdata.push({
            resourceType: 'Observation',
            valueString: `${pulseNum} ${pulseunits}`,
            valueInteger: 6,
            status: '1',
            valueQuantity: {
              value: Number(pulseNum),
              unit: 'bpm',
            },
            code: {
              coding: {
                system: '',
              },
            },
          });
        }
      }

      if (vitalsdata.length === 0) {
        Toast.show('Please enter at least one parameter to save.');
        return;
      }

      const patientId = reduxAuthJson?.token?.loginUserId;
      if (!patientId) {
        Toast.show('User not identified. Please re-login.');
        return;
      }

      setPageLoading(true);
      savePatientHealthParameters({
        variables: {
          id: patientId,
          vitals: vitalsdata,
        },
      })
        .then((res) => {
          setPageLoading(false);
          if (res?.data?.PatientUpdate?.id) {
            Toast.show('Record saved successfully');
            resetForm();
            if (navigation.canGoBack()) navigation.goBack();
          } else {
            Toast.show('Unable to save record.');
          }
        })
        .catch((err) => {
          setPageLoading(false);
          Toast.show('Error saving record');
          console.error('savePatientHealthParameters error:', err);
        });
    } catch (e) {
      setPageLoading(false);
      console.error('onSave error:', e);
      Toast.show('Unexpected error occurred');
    }
  };

  // const SectionHeader = ({ icon, title, tint = '#0f988a' }) => (
  //   <View style={styles.sectionHeader}>
  //     <View style={[styles.sectionIconWrap, { backgroundColor: tint }]}>
  //       <MaterialCommunityIcons name={icon} size={20} color={Colors.white} />
  //     </View>
  //     <Text style={styles.sectionTitle}>{title}</Text>
  //   </View>
  // );

  const SectionHeader = ({ icon, title, image }) => (
    <View style={styles.sectionHeader}>
       <Image
          source={image}
          style={{ width: 40, height: 40, resizeMode: 'contain' }}
        />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Loader style={styles.loadingCss} loading={pageLoading} />
      <CustomHeader pageName={'Health Parameters'} />
      <View style={styles.subHeaderRow}>
        <TouchableOpacity style={styles.subHeaderBackBtn} onPress={handleGoBack}>
          <FontAwesome6 name="arrow-left-long" size={20} color={Colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.formTitle}>Record your physical health parameters here</Text>

        <View style={styles.unitToggleRow}>
          <Text style={styles.unitLabel}>Imperial</Text>
          <Switch value={isMetric} onValueChange={setIsMetric} trackColor={{ true: '#3bbfb5' }} thumbColor={'#fff'} />
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
              placeholderTextColor={'#666'}
              keyboardType="numeric"
              value={heightM}
              onChangeText={setHeightM}
            />
            <TextInput
              style={styles.input}
              placeholder={isMetric ? 'Cm' : 'In'}
              placeholderTextColor={'#666'}
              keyboardType="numeric"
              value={heightCm}
              onChangeText={setHeightCm}
            />
          </View>
        </View>
        <View style={styles.rowBox}>
          {/* Weight */}
          <SectionHeader image={require('../../../Utility/Public/images/healthIcon2.png')} title="Weight" />
          <View style={styles.twoColRow}>
            <TextInput
              style={styles.input}
              placeholder={isMetric ? 'Kg' : 'Lb'}
              placeholderTextColor={'#666'}
              keyboardType="numeric"
              value={weightKg}
              onChangeText={setWeightKg}
            />
            <TextInput
              style={styles.input}
              placeholder={isMetric ? 'G' : 'Oz'}
              placeholderTextColor={'#666'}
              keyboardType="numeric"
              value={weightG}
              onChangeText={setWeightG}
            />
          </View>
        </View>
        <View style={styles.rowBox}>
          {/* BMI */}
          <SectionHeader image={require('../../../Utility/Public/images/healthIcon7.png')} title="BMI" />
          <TextInput
            style={styles.inputFull}
            placeholder={'BMI'}
            placeholderTextColor={'#666'}
            keyboardType="numeric"
            value={bmi}
            onChangeText={setBmi}
          />
        </View>
        <View style={styles.rowBox}>
          {/* Waist Circumference */}
          <SectionHeader image={require('../../../Utility/Public/images/healthIcon8.png')} title="Waist Circumference" />
          <TextInput
            style={styles.inputFull}
            placeholder={isMetric ? 'cm' : 'inch'}
            placeholderTextColor={'#666'}
            keyboardType="numeric"
            value={waist}
            onChangeText={setWaist}
          />
        </View>
        <View style={styles.rowBox}>
          {/* Pulse & BP */}
          <View style={styles.rowHeaderWrap}>
            <SectionHeader image={require('../../../Utility/Public/images/healthIcon5.png')} title="Pulse Rate" />
            <SectionHeader image={require('../../../Utility/Public/images/healthIcon6.png')} title="Blood Pressure" />
          </View>
          <View style={styles.twoColRow}>
            <TextInput
              style={styles.input}
              placeholder={'Per minute'}
              placeholderTextColor={'#666'}
              keyboardType="numeric"
              value={pulse}
              onChangeText={setPulse}
            />
            <TextInput
              style={styles.input}
              placeholder={'Dia/ Sys mmHg'}
              placeholderTextColor={'#666'}
              keyboardType="default"
              value={bp}
              onChangeText={setBp}
            />
          </View>
        </View>
        {/* <View style={styles.footerSpace} /> */}
      </ScrollView>

      <View style={styles.footerBtns}>
        <TouchableOpacity style={[styles.ctaBtn, styles.ctaSecondary]} onPress={handleGoBack}>
          <Text style={styles.ctaText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.ctaBtn, styles.ctaPrimary]} onPress={onSave}>
          <Text style={styles.ctaText}>Save New Record</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

export default AddHealthRecord;

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
    // paddingHorizontal: 15,
    // paddingTop: 10,
    // paddingBottom: 0,
    // backgroundColor:'red'
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 0,
    paddingBottom: 0,
   // backgroundColor: 'red'
  },
  formTitle: {
    color: '#000',
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    marginBottom: 10,
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
  },
  unitActive: {
    fontFamily: 'Arimo-Bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 6,
    // backgroundColor: 'blue',
    width: '48%'
  },
  // sectionIconWrap: {
  //   width: 28,
  //   height: 28,
  //   borderRadius: 14,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   marginRight: 8,
  //  // backgroundColor: 'RED'
  // },
  sectionTitle: {
    color: '#000',
    fontFamily: 'Arimo-Bold',
    fontSize: 14,
    marginLeft: 10,
  },
  rowBox: {
    width: '100%',
    // backgroundColor: 'red',
    padding: 0,
    margin: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  twoColRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
    //backgroundColor: 'red'
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
    height:45
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
    width: '100%',
    height:45
  },
  
  footerBtns: {
    position: 'absolute',
    left: 15,
    right: 15,
    bottom: Platform.OS === 'ios' ? 15 : 35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    zIndex: 999,
    gap: 12,
  },

  ctaBtn: {
    flex: 1, // 👈 ensures equal width for both buttons
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  ctaSecondary: {
    backgroundColor: '#7f7f7f',
    marginRight: 6, // 👈 gives a small gap on the right side
  },

  ctaPrimary: {
    backgroundColor: '#229980',
  },

  ctaText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Arimo-Bold',
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 8,
    marginBottom: 6,
  },
});
