const screen = Dimensions.get("window");
const screenWidth = screen.width;
const screenheight = screen.height;

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Button,
  Image,
  Alert,
  Platform,
  PermissionsAndroid,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  ScrollView,
  Dimensions,
  PixelRatio,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
// import DocumentPicker from 'react-native-document-picker';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Toast from 'react-native-simple-toast';
import CrashLogger from '../../../Utility/CrashLogger';
import Loader from '../../../Utility/Components/Loader';
import { Picker } from '@react-native-picker/picker';
import Entypo from 'react-native-vector-icons/Entypo';
import RNFS from 'react-native-fs';
import { savePatientDocumentsMutation } from "../Controller/DocumentManagementController"
import ImagePicker from 'react-native-image-crop-picker';
import RNPickerSelect from 'react-native-picker-select';
import CommonDatePicker from '../../../Utility/Components/CommonDatePicker';
import Colors from '../../../Utility/Colors';
import Feather from 'react-native-vector-icons/Feather';
import Utility from '../../../Utility/Utility';
import LoginStyle from '../../../Modules/Login/Public/css/LoginStyle';
import { Dropdown } from 'react-native-element-dropdown';
import { pick } from '@react-native-documents/picker'
import { SafeAreaView } from 'react-native-safe-area-context';

/* ------------------ Responsive helpers (PixelRatio + Dimensions) ------------------ */
// Base device you designed for
const BASE_WIDTH = 375;   // iPhone 11 width
const BASE_HEIGHT = 812;  // iPhone 11 height
const { width: W, height: H } = Dimensions.get('window');

const scale = (size) => (W / BASE_WIDTH) * size;     // horizontal/general scaling
const vScale = (size) => (H / BASE_HEIGHT) * size;   // vertical scaling
const mScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

// Exact-size font helper: ignores system font scaling (prevents “zoomed” fonts shrinking)
const font = (size) => Math.round(PixelRatio.roundToNearestPixel(size));
/* ---------------------------------------------------------------------------------- */

// Anti-zoom for Dropdown etc. (keep your cap for dropdown internals)
const sysScale = PixelRatio.getFontScale();
const SCALE_CAP = 1.00;
const scaled = (size) => size * Math.min(sysScale, SCALE_CAP);

const FileUploadAndTakePhoto = ({ getDocumentList, useFor, patientId, patientName }) => {
  const [documentObj, setDocumentObj] = useState({});
  const [selectedDocument, setSelectedDocument] = useState("");
  const [pageLoading, setPageLoading] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [documentAuther, setDocumentAuther] = useState("");
  const [organisationName, setOrganisationName] = useState("");
  const [documentTag, setDocumentTag] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const [documentNameError, setdocumentNameError] = useState(false);
  const [documentAutherError, setdocumentAutherError] = useState(false);
  const [organisationNameError, setorganisationNameError] = useState(false);
  const [openDateofReport, setOpenDateofReport] = useState(false);
  const [dateOfReport, setDateOfReport] = useState("");
  const [isDateOfReportPickerOpen, setIsDateOfReportPickerOpen] = useState(false);
  const [selectedDateError, setSelectedDateError] = useState("");
  const [dobError, setDobError] = useState("");

  // ---- NEW: modal scroll handling ----
  const modalScrollRef = useRef(null);
  const prevCountRef = useRef(0);

  const scrollModalToBottom = () => {
    requestAnimationFrame(() => {
      modalScrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  useEffect(() => {
    const count = Object.keys(documentObj).length;
    if (count > prevCountRef.current) {
      scrollModalToBottom();
    }
    prevCountRef.current = count;
  }, [documentObj]);
  // ------------------------------------

  const [SelectOptionForDocument, setselectOptionForDocument] = useState([
    { label: 'Passport', value: 'Current_signed_passport' },
    { label: 'Residence Permit', value: 'Residence_permit_issued_by_the_Home_Office' },
    { label: 'EU identity photo-card', value: 'EU_or_Swiss_national_identity_photo-card' },
    { label: 'UK photo-card driving licence', value: 'Valid_UK_photo-card_driving_licence' },
    { label: "Armed/ police forces photo ID", value: "Valid_armed_or_police_force's_photographic_identity_card" },
    { label: 'Disabled photo blue badge', value: 'Photographic_disabled_blue_badge' },
    { label: 'Citizen card', value: 'Citizen_card' },
    { label: ' Valid photo student ID', value: 'Valid_student_ID_with_photograph' },
  ]);

  const [SelectOptionForTag, setselectOptionForTag] = useState([
    { label: "Depression Clinical Trial", value: "Depression Clinical Trial" },
    { label: "Neurostimulator candidate", value: "Neurostimulator candidate" }
  ]);

  useEffect(() => {
    if (useFor === "ThirdPartyDocument") {
      setselectOptionForDocument([
        { label: 'Investigations', value: 'Investigations' },
        { label: 'Others', value: 'Other' },
      ]);
    } else {
      setDocumentType("GovtId");
      setDocumentAuther(patientName);
    }
  }, [useFor])

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to your camera to take a photo.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const takePhoto = async () => {
    if (selectedDocument == null || selectedDocument == "") {
      Toast.show("Please select a document type.");
    } else {
      if (Object.keys(documentObj).length < 3) {
        ImagePicker.openCamera({
          width: 300,
          height: 400,
          cropping: true,
          includeBase64: true,
          compressImageQuality: 0.7,
          compressImageMaxWidth: 1024,
          compressImageMaxHeight: 1024,
        }).then((image) => {
          const fileSize = image.size / (1024 * 1024);
          if (fileSize > 5) {
            Toast.show("Please ensure that the document you upload is no more than 5 MB");
            return false;
          }

          const fileType = image.mime;
          const imageBase64 = `data:${fileType};base64,${image.data}`;

          const fileNameArray = image.path.split("/");
          const fileName = fileNameArray[fileNameArray.length - 1];

          setDocumentObj((prevImageUri) => ({
            ...prevImageUri,
            [selectedDocument]: {
              uri: imageBase64,
              type: fileType,
              name: fileName,
            },
          }));
          if (useFor !== "ThirdPartyDocument") {
            setSelectedDocument("");
          }

          // NEW: encourage immediate scroll (effect will also catch this)
          scrollModalToBottom();
        }).catch((err) => {
          console.error("Error opening camera:", err.code);
          CrashLogger.logCrash(err, 'Camera - takePhoto');
          if (err.code === "E_NO_CAMERA_PERMISSION") {
            Toast.show("Please grant camera and photo library permissions.");
          } else {
            Toast.show("Failed to open camera. Please try again.");
          }
        });
      } else {
        Toast.show("Maximum upload up to 3 documents.");
      }
    }
  };

  // const selectDocument = async () => {
  //   Alert("click");
  //   try {
  //     const [result] = await pick({
  //       mode: 'open',
  //       type: [
  //         'public.item',
  //         'application/pdf',
  //         'image/*',
  //         'application/msword',
  //         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  //       ],
  //     });

  //     if (!result) return;

  //     const fileType = result.mimeType || result.type || '';
  //     const fileName = result.name || 'file';
  //     const uri = result.fileCopyUri || result.uri;

  //     const response = await fetch(uri);
  //     const blob = await response.blob();
  //     const reader = new FileReader();

  //     reader.onloadend = () => {
  //       const base64data = reader.result;

  //       const fileSize = blob.size / (1024 * 1024);
  //       if (fileSize > 5) {
  //         Toast.show('Please ensure that the document you upload is no more than 5 MB');
  //         return;
  //       }

  //       setDocumentObj(prev => ({
  //         ...prev,
  //         [selectedDocument]: {
  //           uri: base64data,
  //           type: fileType,
  //           name: fileName,
  //         },
  //       }));

  //       // NEW: encourage immediate scroll (effect will also catch this)
  //       scrollModalToBottom();
  //     };
  //     reader.readAsDataURL(blob);
  //   } catch (error) {
  //     console.error('Document picker error:', error);
  //     Toast.show('Failed to pick document');
  //   }
  // };
  

 

  const selectDocument = async () => {
     try {
      const pickerTypes =
        Platform.OS === 'ios'
          ? [
            'public.image', // images
            'com.adobe.pdf', // pdf
            'com.microsoft.word.doc', // .doc
            'org.openxmlformats.wordprocessingml.document', // .docx
          ]
          : [
            'application/pdf',
            'image/*',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ];

      const [result] = await pick({
        mode: 'open',
        type: pickerTypes,
      });

      if (!result) return;

      const fileType = result.mimeType || result.type || '';
      const fileName = result.name || 'file';
      const uri = result.fileCopyUri || result.uri;

      // 🔒 Extra safety: block ZIP or unknown files (iOS + Android)
      const allowedTypes = [
        'image/',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      const isAllowed = allowedTypes.some(t =>
        fileType.startsWith(t)
      );

      if (!isAllowed) {
        Toast.show('Only PDF, Image, and Word documents are allowed');
        return;
      }

      const response = await fetch(uri);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64data = reader.result;
        const fileSize = blob.size / (1024 * 1024);

        if (fileSize > 5) {
          Toast.show(
            'Please ensure that the document you upload is no more than 5 MB'
          );
          return;
        }

        setDocumentObj(prev => ({
          ...prev,
          [selectedDocument]: {
            uri: base64data,
            type: fileType,
            name: fileName,
          },
        }));

        scrollModalToBottom();
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Document picker error:', error);
      Toast.show('Failed to pick document');
    }
  };




  const selectFile = async () => {
    if (selectedDocument == null || selectedDocument == "") {
      Toast.show("Please select a document type.");
    } else {
      selectDocument();
    }
    return
  };

  const cropImage = async (uri, fileExtension) => {
    try {
      const croppedImage = await ImagePicker.openCropper({
        path: uri,
        width: 300,
        height: 300,
        cropping: true,
      });
      let mimeType = `image/${fileExtension}`;
      const fileUri = Platform.OS === 'android' ? croppedImage.path : croppedImage.path.replace('file://', '');
      const base64String = await RNFS.readFile(fileUri, 'base64');
      let base64WithPrefix = `data:${mimeType};base64,${base64String}`;
      const fileNameArray = croppedImage.path.split("/")

      setDocumentObj((prevImageUri) => ({
        ...prevImageUri,
        [selectedDocument]: { uri: base64WithPrefix, type: croppedImage.mime, name: fileNameArray[fileNameArray.length - 1] },
      }));
      setSelectedDocument("");

      scrollModalToBottom(); // optional, if you use the cropper path
      return croppedImage
    } catch (err) {
      console.log('Error cropping image:', err);
    }
  };

  const uploadFile = async () => {
    const formatDateToDDMMYYYY = (date) => {
      if (!date) return "";
      const isoDate = new Date(date).toISOString();
      return isoDate;
    };

    const reportedFormattedDate = formatDateToDDMMYYYY(dateOfReport);
    try {
      let submitdataFlag = true;
      if (useFor === "ThirdPartyDocument" && selectedDocument !== 'Other') {
        if (!documentName) {
          setdocumentNameError(true)
          Toast.show("Please enter document name");
          submitdataFlag = false;
          return
        }
        if (!reportedFormattedDate) {
          setorganisationNameError(true)
          Toast.show("Please select Date of Report");
          submitdataFlag = false;
          return
        }
        if (!organisationName) {
          setorganisationNameError(true)
          Toast.show("Please enter organisation Name");
          submitdataFlag = false;
          return
        }
      }
      if (submitdataFlag) {
        setPageLoading(true);

        let uploadArrayOfHash = {}
        for (const key in documentObj) {
          uploadArrayOfHash[key] = documentObj[key].uri;
        }

        const variables = {
          documents: JSON.stringify(uploadArrayOfHash),
          documentName: documentName || "",
          practitionerId: "",
          practitionerName: "",
          documentType: useFor === "ThirdPartyDocument" ? documentType : "GovtId",
          author: documentAuther || "",
          organizationName: organisationName || "",
          id: patientId,
          fetchingFrom: "APP",
          report_date: reportedFormattedDate || "",
          tags: tags || []
        }

        const result = await savePatientDocumentsMutation({ variables });
        setPageLoading(false);
        if (result.data.PomsPatientDocumentCreate.id !== "") {
          Toast.show("Document uploaded and saved successfully!");
          getDocumentList();
        } else {
          Toast.show("Error uploading document.");
        }
      }
    } catch (error) {
      setPageLoading(false);
      console.error("Upload encountered an error:", error);
      Toast.show("An error occurred while uploading the file.");
    }
  };

  const formatString = (keyName) => keyName.replace(/_/g, ' ');
  const handleClose = (key) => {
    setDocumentObj((prevObj) => {
      const newObj = { ...prevObj };
      delete newObj[key];
      return newObj;
    });
  }

  function formatDateWithSuffix(date) {
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    let suffix = "th";
    if (day % 10 === 1 && day !== 11) suffix = "st";
    else if (day % 10 === 2 && day !== 12) suffix = "nd";
    else if (day % 10 === 3 && day !== 13) suffix = "rd";
    return `${day}${suffix} ${month} ${year}`;
  }

  const openDatePicker = () => setIsDateOfReportPickerOpen(true);
  const closeDatePicker = () => setIsDateOfReportPickerOpen(false);
  const clearDate = () => setDateOfReport("");
  const handleDateChange = (d) => { setDateOfReport(d); setIsDateOfReportPickerOpen(false); };

  return (
    <View style={styles.photoModalcontainer}>
      <ScrollView
        ref={modalScrollRef}                  // <-- NEW
        style={[styles.photoModalcontainerScroll]}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Loader style={styles.loadingCss} loading={pageLoading} />
          <View style={styles.documentTypeSecBox}>
            <View style={[styles.documentTypeSec, styles.documentTypeSecPicker]}>
              <View style={[styles.documentTypeBox, styles.documentTypeBoxLeft]}>
                <Text allowFontScaling={false} style={styles.documendropdownLabelTxt}>Select Document Type</Text>
              </View>
              <View style={[styles.documentTypeBox, styles.documentTypeBoxRight]}>
                <Dropdown
                  style={styles.dropdown}
                  data={SelectOptionForDocument}
                  labelField="label"
                  valueField="value"
                  placeholder="Select..."
                  value={selectedDocument}
                  onChange={item => {
                    setSelectedDocument(item.value);
                    setDocumentType(item.value);
                  }}
                  maxHeight={vScale(200)}
                  placeholderTextColor="#333"
                  itemContainerStyle={styles.itemContainerStyle}

                  selectedTextStyle={styles.selectedTextStyle}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextProps={{ allowFontScaling: false, maxFontSizeMultiplier: 1, numberOfLines: 1 }}
                  placeholderProps={{ allowFontScaling: false, maxFontSizeMultiplier: 1, numberOfLines: 1 }}
                  itemTextStyle={styles.itemTextStyle}
                  itemTextProps={{ allowFontScaling: false, maxFontSizeMultiplier: 1 }}

                  renderItem={item => (
                    <View style={{ paddingVertical: vScale(6) }}>
                      <Text allowFontScaling={false} maxFontSizeMultiplier={1} style={styles.itemTextStyle} numberOfLines={1}>
                        {item.label}
                      </Text>
                    </View>
                  )}

                  renderPlaceholder={() => (
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                      <Text allowFontScaling={false} maxFontSizeMultiplier={1} style={styles.placeholderStyle} numberOfLines={1}>
                        Select...
                      </Text>
                    </View>
                  )}
                />
              </View>
            </View>
          </View>

          {useFor === "ThirdPartyDocument" && selectedDocument === "Investigations" && (
            <View style={styles.documentTypeSecBoxThirdParty}>
              <Text allowFontScaling={false} style={styles.documentTypeSecTxtBox}>
                Blood tests, X-rays / MRI / other imaging reports, lab tests done by your GP or hospital
              </Text>

              <View allowFontScaling={false} style={styles.documentTypeSecc}>
                <View style={[documentNameError ? styles.inputContainermandatory : styles.inputContainer]}>
                  <TextInput
                    style={styles.input}
                    allowFontScaling={false}
                    value={documentName}
                    onChangeText={(text) => { setDocumentName(text); setdocumentNameError(false); }}
                    placeholder="Document Name "
                    placeholderTextColor="#333"
                  />
                  {!documentName && (<Text allowFontScaling={false} style={styles.redAsterisk}>*</Text>)}
                </View>
                <View style={styles.dateFieldBoxx}>
                  <View style={styles.dateFieldRow}>
                    {/* Left side: tap date text to open the picker */}
                    <TouchableOpacity
                      style={styles.dateTextWrap}
                      onPress={openDatePicker}
                      activeOpacity={0.7}
                    >
                      {dateOfReport ? (
                        <Text allowFontScaling={false} style={styles.dateFieldSec} numberOfLines={1}>
                          {Utility.formatDate(dateOfReport)}
                        </Text>
                      ) : (
                        <Text allowFontScaling={false} style={styles.dateFieldSec} numberOfLines={1}>
                          Date of Report <Text style={{ color: 'red' }}>*</Text>
                        </Text>
                      )}
                    </TouchableOpacity>

                    {/* Middle: clear button (visible only when a date exists) */}
                    {Boolean(dateOfReport) && (
                      <TouchableOpacity
                        onPress={clearDate}
                        style={styles.dateClearBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <AntDesign name="closecircle" size={16} color={Colors.secondary} />
                      </TouchableOpacity>
                    )}

                    {/* Right: calendar icon */}
                    <TouchableOpacity
                      onPress={openDatePicker}
                      style={styles.dateCalendarBtn}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Feather name="calendar" size={22} color={Colors.secondary} />
                    </TouchableOpacity>
                  </View>

                  <CommonDatePicker
                    open={isDateOfReportPickerOpen}
                    date={dateOfReport}
                    onDateChange={handleDateChange}
                    closeDatePicker={closeDatePicker}
                    type="Filter"
                    locale="en"
                  />
                </View>



                <View style={[organisationNameError ? styles.inputContainermandatory : styles.inputContainer]}>
                  <TextInput
                    style={styles.input}
                    allowFontScaling={false}
                    value={organisationName}
                    onChangeText={(text) => { setOrganisationName(text); setorganisationNameError(false); }}
                    placeholder="Organisation Name "
                    placeholderTextColor="#333"
                  />
                  {!organisationName && (<Text allowFontScaling={false} style={[styles.redAsterisk, styles.redAsteriskOrgName]}>*</Text>)}
                </View>

                <View style={[styles.tagInputContainer]}>
                  <TextInput
                    style={[styles.input]}
                    allowFontScaling={false}
                    value={tagInput}
                    onChangeText={setTagInput}
                    placeholder="Tags (press 'Enter' to add)"
                    placeholderTextColor="#333"
                    onSubmitEditing={() => {
                      if (tagInput.trim() !== '' && !tags.includes(tagInput.trim())) {
                        setTags([...tags, tagInput.trim()]);
                        setTagInput('');
                      }
                    }}
                    returnKeyType="done"
                    inputAccessoryViewID={Platform.OS === 'ios' ? 'doneButton' : undefined}
                  />
                  <View style={styles.tagsContainer}>
                    {tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text allowFontScaling={false} style={styles.tagText}>{tag}</Text>
                        <TouchableOpacity
                          onPress={() => {
                            const newTags = [...tags];
                            newTags.splice(index, 1);
                            setTags(newTags);
                          }}
                          style={styles.tagRemove}
                        >
                          <Text allowFontScaling={false} style={styles.tagRemoveText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          )}

          <View style={styles.photoModalcontainerRow}>
            <TouchableOpacity style={styles.photoModalcustomButton} onPress={takePhoto}>
              <View style={styles.photoModalbuttonIcon}><Entypo name="camera" size={font(30)} color="#fff" /></View>
              <Text allowFontScaling={false} style={styles.photoModalbuttonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoModalcustomButton} onPress={selectFile}>
              <View style={styles.photoModalbuttonIcon}><Feather name="upload" size={font(30)} color="#fff" /></View>
              <Text allowFontScaling={false} style={styles.photoModalbuttonText}>Select File</Text>
            </TouchableOpacity>
          </View>

          <Text />

          <Text allowFontScaling={false} style={styles.hintTxt}>Camera Permission is required to take photo</Text>
          {useFor === "ThirdPartyDocument" && (
            <Text allowFontScaling={false} style={styles.hintTxt}>
              You can upload PDF/Word documents or{"\n"} PNG/JPEG files with max 5MB.
            </Text>
          )}
        </View>
        <View style={styles.bottomBoxesPanel}>
          <View style={styles.bottomBoxesPanelTxt}>
            <Text allowFontScaling={false} style={{ fontSize: font(12), color: '#000' }}>
              {Object.keys(documentObj).length > 0 ? Object.keys(documentObj).length : ""}
            </Text>
          </View>

          {Object.keys(documentObj).length > 0 && (
            <View style={styles.photoModalimageBoxess}>
              <SafeAreaView style={styles.scrollViewcontainer} edges={['top']}>
                <ScrollView style={[styles.photoModalimageBoxesScroll]}>
                  <View style={[styles.photoModalimageBoxes]}>
                    {Object.entries(documentObj).map(([key, obj], index) => (
                      <View key={`${key}-${index}`} style={styles.photoModalimageBox}>
                        <Text allowFontScaling={false} style={styles.phototypeTxt}>
                          {formatString(key).length > 17 ? `${formatString(key).slice(0, 17)}...` : formatString(key)}
                        </Text>

                        <TouchableOpacity style={styles.closeButton} onPress={() => handleClose(key)}>
                          <AntDesign name="closecircle" size={font(18)} color="#f00" />
                        </TouchableOpacity>

                        {obj.type === "pdf" || obj.type === "application/pdf" ? (
                          <Image source={require('../../../Utility/Public/images/pdf.png')} style={styles.photoModalimagePDF} />
                        ) : obj.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? (
                          <Image source={require('../../../Utility/Public/images/doc.png')} style={styles.photoModalimagePDF} />
                        ) : (
                          <Image source={{ uri: obj.uri }} style={styles.photoModalimage} />
                        )}
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </SafeAreaView>
            </View>
          )}
        </View>
      </ScrollView>
      {Object.keys(documentObj).length > 0 && (
        <View style={styles.submitButtonBox}>
          <TouchableOpacity style={styles.uploadButton} onPress={uploadFile}>
            <Text allowFontScaling={false} style={styles.uploadButtonText}>Upload</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  photoModalcontainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: vScale(15),
    minHeight: vScale(150),
    width: '100%',
    maxHeight: screenheight - vScale(250),
    padding: 0,
  },
  photoModalcontainerScroll: {
    paddingBottom: vScale(15),
    width: '100%',
    maxHeight: screenheight - vScale(250),
    padding: 0,
  },
  documentTypeSecBox: {
    paddingHorizontal: scale(20),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentTypeSecBoxThirdParty: {
    paddingHorizontal: scale(20),
  },
  documentTypeSecTxtBox: {
    fontSize: font(12),
    color: '#000',
  },
  documentTypeSec: {
    borderRadius: 0,
    color: '#000',
    width: '100%',
    padding: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row'
  },
  documentTypeBox: {},
  documentTypeBoxLeft: {
    width: '50%',
  },
  documentTypeBoxRight: {
    width: '50%',
  },
  picker: {
    width: '100%',
    color: '#000',
    fontSize: font(18),
    fontWeight: 'bold',
    padding: 0,
    margin: 0,
    fontFamily: 'Arimo-Regular',
  },
  photoModalcontainerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vScale(15),
    paddingHorizontal: scale(10),
    width: '100%',
  },
  photoModalcustomButton: {
    paddingVertical: vScale(10),
    paddingHorizontal: scale(24),
    borderRadius: scale(8),
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: scale(4),
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    color: '#428174',
    marginLeft: scale(5),
    marginRight: scale(5),
    width: '48%',
    flexDirection: 'column',
    backgroundColor: "#ddd",
  },
  photoModalbuttonIcon: {
    backgroundColor: '#428174',
    width: scale(60),
    height: scale(60),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50
  },
  photoModalbuttonText: {
    color: '#000',
    fontSize: font(14),
    textAlign: 'center',
    marginTop: vScale(5),
    fontFamily: 'Arimo-Bold',
    fontWeight: '700'
  },
  photoModalbuttonSubText: {
    color: '#000',
    fontSize: font(12),
  },
  tagInputContainer: {
    width: '100%',
    marginBottom: vScale(5),
    marginTop: vScale(5),
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: vScale(8),
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: scale(15),
    paddingVertical: vScale(4),
    paddingHorizontal: scale(12),
    marginRight: scale(8),
    marginBottom: vScale(8),
  },
  tagText: {
    color: '#333',
    fontSize: font(14),
    marginRight: scale(4),
  },
  tagRemove: {
    width: scale(18),
    height: scale(18),
    borderRadius: scale(9),
    backgroundColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagRemoveText: {
    color: 'white',
    fontSize: font(14),
    lineHeight: font(14),
    textAlign: 'center',
    marginTop: -1,
  },
  photoModalimageBoxess: {
    paddingHorizontal: scale(15),
    width: '100%',
    marginTop: vScale(10),
  },
  photoModalimageBoxesScroll: {
    width: '100%',
  },
  photoModalimageBoxes: {
    width: '100%',
    justifyContent: 'space-around',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photoModalimageBox: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: '47%',
  },
  phototype: {
    color: '#428174',
    fontSize: font(16),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  phototypeTxt: {
    color: '#000',
    fontSize: font(12),
    textAlign: 'center',
    marginBottom: vScale(5),
    marginTop: vScale(5),
  },
  photoModalimage: {
    width: scale(95),
    height: scale(95),
    marginTop: 0,
    borderRadius: 0,
    marginBottom: 0,
    borderStyle: 'solid',
    borderColor: '#428174',
    borderWidth: scale(5),
  },
  photoModalimagePDF: {
    objectFit: 'contain',
    width: scale(95),
    height: scale(95),
    padding: 0,
  },
  closeButton: {
    position: 'absolute',
    right: Platform.OS === 'ios' ? scale(25) : scale(5),
    top: vScale(20),
    zIndex: 999,
    backgroundColor: '#fff',
    borderRadius: 50,
  },
  submitButtonBox: {
    backgroundColor: '#fff',
    width: "100%",
    marginTop: vScale(10),
    paddingHorizontal: 10,
  },
  uploadButton: {
    padding: vScale(12),
    borderRadius: scale(5),
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#007667',
  },
  uploadButtonText: {
    fontSize: font(16),
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Arimo-Bold',
  },
  loadingCss: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    top: 0
  },
  scrollViewcontainer: {
    maxHeight: vScale(220),
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vScale(5),
    borderRadius: 0,
    position: 'relative',
    marginTop: vScale(5),
    width: '100%',
    /*borderBottomWidth: 1,
    borderBottomColor: '#333',*/
  },
  inputContainermandatory: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderRadius: 0,
    position: 'relative',
    marginTop: vScale(5),
    width: '100%',
    borderColor: '#333',
  },
  input: {
    height: vScale(40),
    fontSize: font(14),
    color: '#000',
    paddingHorizontal: scale(4),
    paddingVertical: 0,
    fontFamily: 'Arimo-Regular',
    width: '100%',
    opacity: 1,
    borderBottomWidth:Platform.OS === 'ios' ? 1 : 1.5,
    borderColor: '#333',
  },
  hintTxt: {
    color: '#000',
    fontFamily: 'Arimo-Regular',
    fontSize: font(13),
    paddingHorizontal: scale(15),
    textAlign: 'center',
    paddingTop: vScale(5),
  },
  dateFieldBoxx: {
    width: '100%',
    marginTop: vScale(5),
  },
  dateFieldRow: {
    width: '100%',
    borderBottomWidth:Platform.OS === 'ios' ? 1 : 1.5,
    borderColor: '#333',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vScale(10),
    paddingHorizontal: 0,
  },
  dateTextWrap: {
    flex: 1,
    paddingRight: scale(8),
  },
  dateFieldSec: {
    color: '#000',
    fontSize: font(14),     // your PixelRatio-aware font helper
    paddingLeft: 5,
  },
  dateClearBtn: {
    marginRight: scale(15),
  },
  dateCalendarBtn: {
    // keeps the icon aligned; add marginLeft if you want spacing
  },
  dateFieldd: {
    width: '100%',
    backgroundColor: '#fff',
    padding: scale(10),
    paddingHorizontal: 0,
    borderColor: '#333',
    borderBottomWidth: 1.5,
    margin: 0
  },
  dateFieldSecDuplicate: { // renamed to avoid duplicate key names
    width: '100%',
    color: '#000',
    fontSize: font(14),
    padding: 0,
  },
  dateClear: {
    marginLeft: scale(50),
    paddingLeft: scale(5),
  },
  redAsterisk: {
    position: 'absolute',
    left:  Platform.OS === 'ios' ? scale(0.30 * BASE_WIDTH) : scale(0.37 * BASE_WIDTH),
    top:  Platform.OS === 'ios' ? vScale(6) : vScale(5),
    color: 'red',
    fontSize: font(16),
  },
  redAsteriskOrgName: {
    left: Platform.OS === 'ios' ? scale(0.35 * BASE_WIDTH) : scale(0.41 * BASE_WIDTH),
  },
  dateFieldicon: { position: 'absolute', right: scale(10), top: vScale(7) },
  dropdown: {
    height: vScale(40),
    borderBottomColor: '#333',
    borderBottomWidth: 2,
    marginTop: vScale(5),
    width: '100%',
    paddingHorizontal: scale(5),
  },

  // Dropdown text styles (kept your anti-zoom cap via `scaled`)
  placeholderStyle: { fontSize: scaled(14), color: '#000' },
  selectedTextStyle: { fontSize: scaled(14), color: '#000' },
  itemTextStyle: { fontSize: scaled(14), color: '#000', lineHeight: scaled(16), padding: scale(5) },
  itemContainerStyle: {
    paddingVertical: 0,
    margin: 0,
    minHeight: vScale(25),
    padding: scale(5),
  },
  bottomBoxesPanel: { textAlign: 'center', padding: 10, },
  bottomBoxesPanelTxt: { width: '100%', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  documendropdownLabelTxt: {
    fontSize: scaled(14),
    color: '#000'
  }
});

export default FileUploadAndTakePhoto;
