const screen = Dimensions.get("window");
const screenWidth = screen.width;
const screenheight = screen.height;
import React, { useEffect, useState } from 'react';
import { View, Button, Image, Alert, Platform, PermissionsAndroid, StyleSheet, TouchableOpacity, Text, TextInput, ScrollView, Dimensions } from 'react-native';
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

// import DatePicker from "react-native-date-picker";
import { SafeAreaView } from 'react-native-safe-area-context';

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

  const [SelectOptionForDocument, setselectOptionForDocument] = useState([
    { label: 'Passport', value: 'Current_signed_passport' },
    { label: 'Residence Permit', value: 'Residence_permit_issued_by_the_Home_Office' },
    { label: 'National Identity', value: 'EU_or_Swiss_national_identity_photo-card' },
    { label: 'Driving Licence', value: 'Valid_UK_photo-card_driving_licence' },
    { label: "Armed or police force's ID", value: "Valid_armed_or_police_force's_photographic_identity_card" },
    { label: 'Disabled blue badge', value: 'Photographic_disabled_blue_badge' },
    { label: 'Citizen card', value: 'Citizen_card' },
    { label: 'Valid student ID', value: 'Valid_student_ID_with_photograph' },
  ]);

  const [SelectOptionForTag, setselectOptionForTag] = useState([
    { label: "Depression Clinical Trial", value: "Depression Clinical Trial" },
    { label: "Neurostimulator candidate", value: "Neurostimulator candidate" }
  ]);

  useEffect(() => {
    if (useFor === "ThirdPartyDocument") {
      setselectOptionForDocument([
        // { label: 'Referral Letter', value: 'Referral Letter' },
        // { label: 'GP Enquiry', value: 'GP Enquiry' },
        // { label: 'Medical Report', value: 'Medical Report' },
        // { label: 'Therapy Letter', value: 'Therapy Letter' },
        // { label: 'Investigations', value: 'Investigations' },
        // { label: 'Imaging Report', value: 'Imaging Report' }
        { label: 'Investigations', value: 'Investigations' },
        { label: 'Others', value: 'Others' },
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
  // const takePhoto = async () => {
  //   if (selectedDocument === "") {
  //     Toast.show("Please select document type");
  //   } else {
  //     if (Platform.OS === 'android') {
  //       const isCameraPermitted = await requestCameraPermission();
  //       if (!isCameraPermitted) {
  //         console.log('Camera permission denied');
  //         return;
  //       }
  //     }

  //     launchCamera(
  //       { mediaType: 'photo', quality: 0.5, includeBase64: true, saveToPhotos: true },
  //       (response) => {
  //         if (response.didCancel) {
  //           console.log('User cancelled image picker');
  //         } else if (response.errorCode) {
  //           console.log('ImagePicker Error: ', response.errorMessage);
  //         } else if (response.assets) {
  //           const fileSize = response.assets[0].fileSize / 1024 / 1024; // in MiB
  //           if (fileSize > 1) {
  //             Toast.show("Please make sure your document is not more than 1 MB.");
  //             return;
  //           }

  //           const fileType = response.assets[0].type;
  //           // Convert image to base64
  //           const imageBase64 = `data:${fileType};base64,${response.assets[0].base64}`;
  //           console.log(imageBase64)

  //           return false;

  //           setDocumentObj((prevImageUri) => ({
  //             ...prevImageUri,
  //             // [selectedDocument]: response.assets[0],
  //             [selectedDocument]: { uri: imageBase64, type: fileType, name: response.assets[0].name }
  //           }));
  //           setSelectedDocument("");
  //         }
  //       }
  //     );
  //   }
  // };
  // const takePhoto = async () => {
  //   if (selectedDocument === "") {
  //     Toast.show("Please select document type");
  //   } else {
  //     if (Object.keys(documentObj).length < 3) {
  //       ImagePicker.openCamera({
  //         width: 300,
  //         height: 400,
  //         cropping: true,
  //         includeBase64: true
  //       }).then(image => {
  //         const fileSize = (response[0].size / (1024 * 1024)) * 5; // in MiB
  //         if (fileSize > 5) {
  //           Toast.show("Please make sure your document is not more than 5 MB.");
  //           return false;
  //         }

  //         const fileType = image.mime;
  //         // Convert image to base64
  //         const imageBase64 = `data:${fileType};base64,${image.data}`;

  //         const fileNameArray = image.path.split("/")
  //         // console.log(imageBase64);
  //         setDocumentObj((prevImageUri) => ({
  //           ...prevImageUri,
  //           // [selectedDocument]: response.assets[0],
  //           [selectedDocument]: { uri: imageBase64, type: fileType, name: fileNameArray[fileNameArray.length - 1] }
  //         }));
  //         setSelectedDocument("");
  //       });
  //     } else {
  //       Toast.show("Maximum upload limit reached. You can only upload up to 3 documents.")
  //     }
  //   }
  // };
  const takePhoto = async () => {
    // console.log("selectedDocument======", selectedDocument)
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
          // Convert file size from bytes to MB
          const fileSize = image.size / (1024 * 1024); // Size in MB

          if (fileSize > 5) {
            Toast.show("Please ensure that the document you upload is no more than 5 MB");
            return false;
          }

          const fileType = image.mime; // MIME type of the image
          const imageBase64 = `data:${fileType};base64,${image.data}`; // Convert to Base64

          // Extract file name from path
          const fileNameArray = image.path.split("/");
          const fileName = fileNameArray[fileNameArray.length - 1];
          // console.log("fileType---------------", fileType);
          // Update document object
          setDocumentObj((prevImageUri) => ({
            ...prevImageUri,
            [selectedDocument]: {
              uri: imageBase64,
              type: fileType,
              name: fileName,
            },
          }));
          if (useFor !== "ThirdPartyDocument") {
            setSelectedDocument(""); // Reset document type selection
          }
        }).catch((err) => {
          // Handle errors from the image picker
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

  const selectFile = async () => {
    //console.log("selectedDocument========", selectedDocument)
    if (selectedDocument == null || selectedDocument == "") {
      Toast.show("Please select a document type");
    } else {
      if (Object.keys(documentObj).length < 3) {
        try {
          // Use ImagePicker to select from gallery
          const image = await ImagePicker.openPicker({
            width: 300,
            height: 400,
            cropping: true,
            includeBase64: true,
            mediaType: 'photo',
            compressImageQuality: 0.7, // Compress to 70% quality
            compressImageMaxWidth: 1024,
            compressImageMaxHeight: 1024,
          });

          // Convert file size from bytes to MB
          const fileSize = image.size / (1024 * 1024);

          if (fileSize > 5) {
            Toast.show("Please ensure that the document you upload is no more than 5 MB");
            return false;
          }

          const fileType = image.mime; // MIME type of the image
          const imageBase64 = `data:${fileType};base64,${image.data}`; // Convert to Base64

          // Extract file name from path
          const fileNameArray = image.path.split("/");
          const fileName = fileNameArray[fileNameArray.length - 1];

          // Update document object
          setDocumentObj((prevImageUri) => ({
            ...prevImageUri,
            [selectedDocument]: {
              uri: imageBase64,
              type: fileType,
              name: fileName,
            },
          }));

          if (useFor !== "ThirdPartyDocument") {
            setSelectedDocument(""); // Reset document type selection
          }
          Toast.show("Image selected successfully!");
        } catch (err) {
          if (err.code === 'E_PICKER_CANCELLED') {
            console.log('User cancelled image picker');
          } else {
            console.error("ImagePicker Error:", err);
            CrashLogger.logCrash(err, 'Gallery - selectFile');
            Toast.show("An error occurred while selecting the file.");
          }
        }
      } else {
        Toast.show("Maximum upload up to 3 documents.");
      }
    }
  };


  const cropImage = async (uri, fileExtension) => {
    // console.log(uri)
    try {
      const croppedImage = await ImagePicker.openCropper({
        path: uri,
        width: 300, // Specify the crop width
        height: 300, // Specify the crop height
        cropping: true, // Enable cropping
      });
      // console.log("croppedImage", croppedImage)
      // console.log("croppedImage path", croppedImage.path)
      let mimeType = `image/${fileExtension}`;


      const fileUri = Platform.OS === 'android' ? croppedImage.path : croppedImage.path.replace('file://', '');
      // console.log("fileUri", fileUri)
      const base64String = await RNFS.readFile(fileUri, 'base64');
      // console.log("-----------", base64String)

      let base64WithPrefix = `data:${mimeType};base64,${base64String}`;
      const fileNameArray = croppedImage.path.split("/")

      setDocumentObj((prevImageUri) => ({
        ...prevImageUri,
        [selectedDocument]: { uri: base64WithPrefix, type: croppedImage.mime, name: fileNameArray[fileNameArray.length - 1] },
      }));

      setSelectedDocument("");


      return croppedImage
    } catch (err) {
      console.log('Error cropping image:', err);
    }
  };

  // Upload file function
  const uploadFile = async () => {
    // Format date to DD/MM/YYYY
    const formatDateToDDMMYYYY = (date) => {
      if (!date) return "";
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const reportedFormattedDate = formatDateToDDMMYYYY(dateOfReport);
    try {
      let submitdataFlag = true;
      if (useFor === "ThirdPartyDocument" && selectedDocument !== 'Others') {
        if (documentName == "" || documentName == null || documentName == undefined) {
          setdocumentNameError(true)
          Toast.show("Please enter document name");
          submitdataFlag = false;
          return
        }

        if (reportedFormattedDate == "" || reportedFormattedDate == null || reportedFormattedDate == undefined) {
          setorganisationNameError(true)
          Toast.show("Please select Date of Report");
          submitdataFlag = false;
          return
        }
        if (organisationName == "" || organisationName == null || organisationName == undefined) {
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
          // console.log(key);
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

        const result = await savePatientDocumentsMutation({
          variables: variables,
        });
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

  const formatString = (keyName) => {
    return keyName.replace(/_/g, ' ');
  }

  const handleClose = (key) => {
    setDocumentObj((prevObj) => {
      const newObj = { ...prevObj };
      delete newObj[key];
      return newObj;
    });
  }

  function formatDateWithSuffix(date) {
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" }); // "Apr"
    const year = date.getFullYear();

    // Determine suffix
    let suffix = "th";
    if (day % 10 === 1 && day !== 11) suffix = "st";
    else if (day % 10 === 2 && day !== 12) suffix = "nd";
    else if (day % 10 === 3 && day !== 13) suffix = "rd";

    return `${day}${suffix} ${month} ${year}`;
  }

  const openDatePicker = () => {
    setIsDateOfReportPickerOpen(true);
  };

  const closeDatePicker = () => {
    setIsDateOfReportPickerOpen(false);
  };

  const clearDate = () => {
    setDateOfReport("");
  };

  const handleDateChange = (dateOfReport) => {
    setDateOfReport(dateOfReport);
    setIsDateOfReportPickerOpen(false);
  };

  return (
    // <View style={styles.photoModalcontainer}>
    //   <Loader style={styles.loadingCss} loading={pageLoading} />
    //   {/* Document type picker */}
    //   <Picker
    //     selectedValue={selectedDocument}
    //     onValueChange={(itemValue) => setSelectedDocument(itemValue)}
    //     style={styles.picker}
    //   >
    //     <Picker.Item label="Select Document Type" value="" />
    //     {SelectOptionForDocument.map((option) => (
    //       <Picker.Item key={option.value} label={option.label} value={option.value} />
    //     ))}
    //   </Picker>


    //   <TouchableOpacity style={styles.photoModalcustomButton} onPress={selectFile}>
    //     <Text style={styles.photoModalbuttonText}>Select File (Image/PDF)</Text>
    //   </TouchableOpacity>

    //   {Object.keys(documentObj).length > 0 && (
    //     <TouchableOpacity style={styles.uploadButton} onPress={uploadFile}>
    //       <Text style={styles.uploadButtonText}>Upload</Text>
    //     </TouchableOpacity>
    //   )}
    // </View>
    <View style={styles.photoModalcontainer}>
      {/* <ScrollView style={[styles.photoModalimageBoxesScroll]}> */}
      <View>
        <Loader style={styles.loadingCss} loading={pageLoading} />
        <View style={styles.documentTypeSecBox}>
          <View style={[styles.documentTypeSec, styles.documentTypeSecPicker]}>
            {/* <RNPickerSelect
              onValueChange={(itemValue) => {
                setSelectedDocument(itemValue);
                setDocumentType(itemValue);
              }}
              value={selectedDocument}
              items={SelectOptionForDocument}
              //textInputProps={{multiline: true}} 
              placeholder={{
                label: 'Select Document Type',
                value: null,
              }}
              placeholderTextColor="#999"
              pickerProps={{ numberOfLines: 2 }}
              style={pickerStyle}
            /> */}
            <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginVertical: 10 }}>
  <RNPickerSelect
    onValueChange={(itemValue) => {
      setSelectedDocument(itemValue);
      setDocumentType(itemValue);
    }}
    value={selectedDocument}
    items={SelectOptionForDocument}
    placeholder={{
      label: 'Select Document Type',
      value: null,
    }}
    style={{
      inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 8,
        color: '#000',
        paddingRight: 30, // to ensure text is not hidden by icon
      },
      inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        color: '#000',
      },
      placeholder: {
        color: '#999',
      },
    }}
    useNativeAndroidPickerStyle={false}
  />
</View>

          </View>
        </View>

        {
          useFor === "ThirdPartyDocument" && selectedDocument === "Investigations" &&
          <View style={styles.documentTypeSecBox}>
            <Text style={styles.documentTypeSecTxtBox}>Blood tests, X-rays / MRI / other imaging reports, lab tests done by your GP or hospital</Text>
            <View style={styles.documentTypeSec}>
              <View style={[documentNameError ? styles.inputContainermandatory : styles.inputContainer]}>
                <TextInput
                  style={styles.input}
                  value={documentName}
                  onChangeText={(text) => {
                    setDocumentName(text),
                      setdocumentNameError(false)
                  }}
                  placeholder="Document Name "
                  placeholderTextColor="#000"
                />
                {!documentName && (
                  <Text style={styles.redAsterisk}>*</Text>
                )}
              </View>


              <View style={styles.dateFieldBoxx}>
                <TouchableOpacity onPress={openDatePicker} style={styles.dateFieldd}>
                  {dateOfReport ?
                    <>
                      <Text style={styles.dateFieldSec}>
                        {Utility.formatDate(dateOfReport)}
                        <TouchableOpacity onPress={clearDate} style={styles.dateClear}>
                          <AntDesign
                            name="closecircle"
                            size={16}
                            color={Colors.secondary}
                          />
                        </TouchableOpacity>
                      </Text>
                    </>
                    :
                    // <Text style={{ color: Colors.black }}>Date of Report <Text style={{ color: Colors.red }}>*</Text></Text>
                    <Text style={{ color: Colors.black }}> Date of Report <Text style={{ color: 'red', fontSize:16 }}>*</Text></Text>

                  }
                </TouchableOpacity>
                <CommonDatePicker
                  open={isDateOfReportPickerOpen}
                  date={dateOfReport}
                  onDateChange={handleDateChange}
                  closeDatePicker={closeDatePicker}
                  type="Filter"
                  locale="en"
                />
                <TouchableOpacity onPress={openDatePicker} style={styles.dateFieldicon}>
                  <Feather
                    name="calendar"
                    size={22}
                    color={Colors.secondary}
                  /></TouchableOpacity>
                {dateOfReport == "" ? <Text style={LoginStyle.errorMsg}>{selectedDateError}</Text> : null}
              </View>

              {/* <View style={[documentAutherError ? styles.inputContainermandatory : styles.inputContainer]}>
                <TextInput
                    style={styles.input}
                  value={documentAuther}
                  onChangeText={(text) => {
                    setDocumentAuther(text),
                    setdocumentAutherError(false)
                  }}
                  placeholder="Enter Author"
                  placeholderTextColor="#000"
                />
              </View> */}

              <View style={[organisationNameError ? styles.inputContainermandatory : styles.inputContainer]}>
                <TextInput
                  style={styles.input}
                  value={organisationName}
                  onChangeText={(text) => {
                    setOrganisationName(text),
                      setorganisationNameError(false)
                  }}
                  placeholder="Organisation Name "
                  placeholderTextColor="#000"
                />
                 {!organisationName && (
                  <Text style={[styles.redAsterisk, styles.redAsteriskOrgName]}>*</Text>
                )}
              </View>

              <View style={[styles.tagInputContainer]}>
                <TextInput
                  style={[styles.input]}
                  value={tagInput}
                  onChangeText={setTagInput}
                  placeholder="Add tags (press Enter to add)"
                  placeholderTextColor="#666"
                  onSubmitEditing={() => {
                    if (tagInput.trim() !== '' && !tags.includes(tagInput.trim())) {
                      setTags([...tags, tagInput.trim()]);
                      setTagInput('');
                    }
                  }}
                  blurOnSubmit={false}
                />
                <View style={styles.tagsContainer}>
                  {tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                      <TouchableOpacity
                        onPress={() => {
                          const newTags = [...tags];
                          newTags.splice(index, 1);
                          setTags(newTags);
                        }}
                        style={styles.tagRemove}
                      >
                        <Text style={styles.tagRemoveText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
              {/* <View style={styles.documentTypeSecBox}>
            <View style={styles.documentTypeSec}>
              <Picker
                selectedValue={documentTag}
                onValueChange={(itemValue) => setDocumentTag(itemValue)}
                style={[styles.picker, { width: "100%", paddingRight: 0 }]}
                dropdownIconColor="#428174" // Custom icon color for iOS
              >
                <Picker.Item label="Select Document Type" value={""} color="#428174" style={{
                  width: "100%",
                }} />
                {SelectOptionForTag.map((option) => (
                  <Picker.Item key={option.value} label={option.label} value={option.value} />
                ))}
              </Picker>
            </View>
          </View> */}
            </View>
          </View>
        }
        <View style={styles.photoModalcontainerRow}>
          <TouchableOpacity style={styles.photoModalcustomButton} onPress={takePhoto}>
            <View style={styles.photoModalbuttonIcon}><Entypo name="camera" size={30} color="#666" /></View>
            <Text style={styles.photoModalbuttonText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoModalcustomButton} onPress={selectFile}>
            <View style={styles.photoModalbuttonIcon}><Entypo name="image" size={30} color="#666" /></View>
            <Text style={styles.photoModalbuttonText}>Select File
              {/* {"\n"}
              <Text style={styles.photoModalbuttonSubText}>(Image/PDF/Doc)</Text> */}
            </Text>
          </TouchableOpacity>
        </View>
        <Text></Text>
        <Text style={styles.hintTxt}>Camera Permission is required to take photo</Text>
        {useFor === "ThirdPartyDocument" && (
          <>
            <Text style={styles.hintTxt}>You can upload PDF/Word documents or PNG/JPEG files with max 5MB. </Text>
          </>
        )}
      </View>
      <View><Text>{Object.keys(documentObj).length > 0 ? Object.keys(documentObj).length : ""}</Text></View>
      {Object.keys(documentObj).length > 0 && (
        <View style={styles.photoModalimageBoxess}>
          <SafeAreaView style={styles.scrollViewcontainer} edges={['top']}>
            <ScrollView style={[styles.photoModalimageBoxesScroll]}>
              <View style={[styles.photoModalimageBoxes]}>
                {
                  Object.entries(documentObj).map(([key, obj], index) => (
                    <View key={`${key}-${index}`} style={styles.photoModalimageBox}>
                      <Text style={styles.phototypeTxt}>{formatString(key).length > 17 ? `${formatString(key).slice(0, 17)}...` : formatString(key)}</Text>

                      <TouchableOpacity style={styles.closeButton} onPress={() => handleClose(key)}>
                        <AntDesign name="closecircle" size={18} color="#f00" />
                      </TouchableOpacity>
                      {
                        obj.type === "pdf" ?
                          <Image source={require('../../../Utility/Public/images/pdf.png')} style={styles.photoModalimagePDF} />
                          : obj.type === "application/pdf" ? <Image source={require('../../../Utility/Public/images/pdf.png')} style={styles.photoModalimagePDF} /> : obj.type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? <Image source={require('../../../Utility/Public/images/doc.png')} style={styles.photoModalimagePDF} /> : <Image source={{ uri: obj.uri }} style={styles.photoModalimage} />
                      }
                    </View>
                  ))}
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      )}
      {/* </ScrollView> */}
      {Object.keys(documentObj).length > 0 && (
        <View style={styles.submitButtonBox}>
          <TouchableOpacity style={styles.uploadButton} onPress={uploadFile}>
            <Text style={styles.uploadButtonText}>Upload</Text>
          </TouchableOpacity>

        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  photoModalcontainer: {
    //flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 15,
    //padding:15,
    minHeight: 150,
    //backgroundColor: "red",
    width: '100%',
    maxHeight: screenheight - 70,
    padding: 0,
  },
  documentTypeSecBox: {
    // paddingHorizontal: 5,
    paddingHorizontal: 20,
    // width:'100%',
    //padding:30,
    // backgroundColor: 'yellow',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentTypeSecTxtBox: {
    // backgroundColor: 'yellow',
    // borderColor:'red',
    // borderWidth:1,
    fontSize: 12,
  },
  documentTypeSec: {
    borderRadius: 0,
    // shadowColor: '#fff',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.3,
    // shadowRadius: 4,
    // elevation: 3,
    // borderBottomWidth: 1,
    // borderBottomColor: '#000',
    color: '#000',
    width: '100%',
    //backgroundColor: 'pink',
    padding: 0,
  },
  documentTypeSecPicker: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  picker: {                // Set the height of the picker
    width: '100%',              // Set the width of the picker
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 0,
    margin: 0,
    fontFamily: 'Arimo-Regular',
  },
  photoModalcontainerRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingHorizontal: 10,
    //backgroundColor:'red',
    width: '100%',
  },
  photoModalcustomButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    // marginVertical: 10,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    // borderBottomWidth: 1,
    // borderBottomColor: '#428174',
    // borderBottomStyle: 'dashed',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    color: '#428174',
    marginLeft: 5,
    marginRight: 5,
    width: '48%',
    flexDirection: 'column',
    backgroundColor: "#ddd",

  },
  photoModalbuttonText: {
    color: '#000',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,

  },
  photoModalbuttonSubText: {
    color: '#000',
    fontSize: 12,
  },
  tagInputContainer: {
    width: '100%',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#333',
    fontSize: 14,
    marginRight: 4,
  },
  tagRemove: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagRemoveText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 14,
    textAlign: 'center',
    marginTop: -1,
  },
  photoModalimageBoxess: {
    // backgroundColor: 'pink',
    paddingHorizontal: 15,
    width: '100%',
    marginTop: 10,
  },
  photoModalimageBoxesScroll: {
    width: '100%',
  },
  photoModalimageBoxes: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-around',
    flexDirection: 'row',
    flexWrap: 'wrap',
    // backgroundColor:'blue',

  },
  photoModalimageBox: {
    position: 'relative',
    // backgroundColor: '#ccc',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '47%',

  },
  phototype: {
    color: '#428174',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  phototypeTxt: {
    color: '#000',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 5,
    marginTop: 5,
  },
  photoModalimage: {
    width: 95,
    height: 95,
    marginTop: 0,
    borderRadius: 0,
    marginBottom: 0,
    borderStyle: 'solid',
    borderColor: '#428174',
    borderWidth: 5,
  },
  photoModalimagePDF: {
    objectFit: 'contain',
    width: 95,
    height: 95,
    padding: 0,

  },
  closeButton: {
    position: 'absolute',
    right: Platform.OS === 'ios' ? 25 : 5,
    top: 20,
    zIndex: 999,
    color: 'red',
    backgroundColor: '#fff',
    borderRadius: 50,
  },
  submitButtonBox: {
    backgroundColor: '#fff',
    width: "90%",
    marginTop: 10,

  },
  uploadButton: {
    padding: 12,
    borderRadius: 5,
    display: 'flex',
    textAlign: 'center',
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#007667',

  },
  uploadButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Arimo-Bold',
  },
  loadingCss: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    top: 0
  },
  scrollViewcontainer: {
    maxHeight: 220,
    //backgroundColor: '#666',
    width: '100%',
    justifyContent: 'center', // This should be applied to contentContainerStyle
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    //marginBottom: 20,
    borderRadius: 0,
    position: 'relative',
    marginTop: 5,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  inputContainermandatory: {

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    //marginBottom: 20,
    //borderBottomColor: 'red',
    borderBottomWidth: 1,
    borderRadius: 0,
    position: 'relative',
    marginTop: 5,
    width: '100%',

  },
  input: {
    //flex: 1,
    height: 35,
    fontSize: 13,
    color: '#595959',
    paddingHorizontal: 5,
    paddingVertical: 0,
    backgroundColor: '#fff',
    fontFamily: 'Arimo-Regular',
    width: '100%',
  },
  hintTxt: {
    color: '#000',
    fontFamily: 'Arimo-Regular',
    fontSize: 13,
    paddingHorizontal: 15,
    textAlign: 'center',
    paddingTop: 5,
  },
  dateFieldBoxx: {
    width: '100%',
    marginTop: 5,
  },
  dateFieldd: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 10,
    paddingHorizontal: 5,
    borderColor: '#000',
    borderBottomWidth: 1,
  },
  dateFieldSec: {
    //backgroundColor: 'red',
    width: '100%',
    color: '#333',
    fontSize: 13,
    padding: 0,
  },
  dateClear: {
    marginLeft: 50,
    paddingLeft: 5,
  },
  redAsterisk: {
    position: 'absolute',
    left: '37%',
    top: 5,
    color: 'red',
    fontSize: 16,
  },
  redAsteriskOrgName:{
    left: '41%',
  },
  dateFieldicon: { position: 'absolute', right: 10, top:7, },


});

const pickerStyle = {
  inputIOS: {
    width: '100%',              // Set the width of the picker
    color: '#000',
    fontSize: 16,
    padding: 0,
    paddingVertical: 10,
    margin: 0,
    fontFamily: 'Arimo-Regular',
  },
  placeholder: {
    color: '#000',
    fontSize: 16,
  },
  inputAndroid: {
    width: '100%',              // Set the width of the picker
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 0,
    margin: 0,
    fontFamily: 'Arimo-Regular',
  },
}

export default FileUploadAndTakePhoto;
