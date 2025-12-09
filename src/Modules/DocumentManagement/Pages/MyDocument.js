// ✅ Responsive + zoom-resilient MyDocument screen

const screen = Dimensions.get("window");
const screenWidth = screen.width;
const screenheight = screen.height;
const sixtyPercentOfScreenHeight = screenheight * 0.5;
const fortyPercentOfScreenHeight = screenheight * 0.4;
const bookingscreenWidth = screenWidth - 30
const bookingscreenWidthLeft = bookingscreenWidth - 50;
const liHeight = screenheight * 0.04;
const flatlistHeight = screenheight * 0.04;
const isSmallIOS = Platform.OS === 'ios' && screenheight <= 812; // 12/13 mini and similar

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  FlatList,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Dimensions,
  BackHandler,
  Platform,
  Modal,
  Button,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
  Share,
  PixelRatio,              // 👈 added
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { getMyDocumentList } from '../Controller/DocumentManagementController';
import Loader from '../../../Utility/Components/Loader';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../../Utility/Colors';
import FileUploadAndTakePhoto from '../Components/FileUploadAndTakePhoto';
import GlobalModal from '../../../Utility/Components/GlobalModal'
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import { WebView } from 'react-native-webview';
import CustomHeader from '../../../Utility/Components/CustomHeader'
import { useNavigationState } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ReactNativeBlobUtil from 'react-native-blob-util'
import FileViewer from "react-native-file-viewer";
import NetInfo from "@react-native-community/netinfo";
import Utility from "../../../Utility/Utility"
import RNFS from 'react-native-fs';
import Toast from 'react-native-simple-toast';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import EventEmitter from '../../../Contexts/EventEmitter';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Ionicons from 'react-native-vector-icons/Ionicons';

/* ------------------ Responsive helpers (PixelRatio + Dimensions) ------------------ */
const BASE_WIDTH = 375;   // your design base width
const BASE_HEIGHT = 812;  // your design base height

const { width: W, height: H } = Dimensions.get('window');

const scale = (size) => (W / BASE_WIDTH) * size;          // horizontal/general
const vScale = (size) => (H / BASE_HEIGHT) * size;         // vertical
const mScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;


/* ---------------------------------------------------------------------------------- */
// exact size you specify (scaled by device width only)
const fontExact = (size) => {
  return Math.round(PixelRatio.roundToNearestPixel(size * (W / BASE_WIDTH)));
};

// keep layout stable vs system font-scale; optional clamp (e.g. [1,1.15] allows up to +15%)
const fontLocked = (size, { clamp = [1, 1] } = {}) => {
  const fs = PixelRatio.getFontScale();
  const clamped = Math.min(Math.max(fs, clamp[0]), clamp[1]);
  return Math.round(PixelRatio.roundToNearestPixel((size * (W / BASE_WIDTH)) / clamped));
};
// (Optional) prevent font scaling globally; remove if you want to respect accessibility
if (Text.defaultProps == null) Text.defaultProps = {};
Text.defaultProps.allowFontScaling = false;
if (TextInput.defaultProps == null) TextInput.defaultProps = {};
TextInput.defaultProps.allowFontScaling = false;

const renderEmptyComponent = () => {
  return (
    <View style={{ padding: scale(20), alignItems: 'center' }}>
      <Text allowFontScaling={false} style={styles.norecordFound}>No records found</Text>
    </View>
  );
};

function MyDocument({ props }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const reduxAuthJson = useSelector((state) => state);
  const [appointmentsDataAfterFilter, setAppointmentsDataAfterFilter] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterFlag, setFilterFlag] = useState(false);
  const [fileUploadFlag, setFileUploadFlag] = useState(false);
  const [imageShowFlag, setImageShowFlag] = useState(false);
  const [errorFlag, setErrorFlag] = useState(false);
  const [documentUrl, setdocumentUrl] = useState("");
  const snapPoints = ['50%'];
  const [viewDocumentFlag, setviewDocumentFlag] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fileUri, setFileUri] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isconnected, setIsconnected] = useState(false);
  const routeName = useNavigationState(state => state.routeNames[state.index]);
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight : insets.top;
  const [imageLoading, setImageLoading] = useState(false);
  const [webViewLoading, setWebViewLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getDocumentList();
      return () => {
        setviewDocumentFlag(false)
        setLoading(false);
      };
    }, [])
  );

  useEffect(() => {
    getDocumentList();
    return () => {
      setviewDocumentFlag(false)
    };
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsconnected(state.isConnected)
      if (!state.isConnected) {
        setLoading(false);
        setRefreshing(false);
      }
    })
    const listener = EventEmitter.addListener("broadcustMessage", async (message) => {
      if (message.close_additional_view) {
        setviewDocumentFlag(false);
      }
    })
    return () => {
      listener.remove();
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleBackButtonPress = () => {
      if (viewDocumentFlag) {
        setviewDocumentFlag(false);
        return true;
      }
      if (fileUri !== "") {
        setFileUri("");
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackButtonPress);
    return () => backHandler.remove();
  }, [viewDocumentFlag, fileUri]);

  const getAppointmentListFn = (type = "") => {
    try {
      if (type == "") setLoading(true);

      getMyDocumentList({ id: reduxAuthJson.token.loginUserId, documentType: 'GovtId' }).then(async (response) => {
        let finalDcoumentList = []
        response.PomsPatientDocumentList?.forEach(element => {
          let found = finalDcoumentList?.some(
            (el) => el?.documentName === element?.documentName
          );
          if (!found) {
            finalDcoumentList.push({
              documentName: element?.documentName,
              documentUrl: element?.documentUrl,
              createdOn: element?.createdOn,
              selected: 0
            })
          }
        });
        setAppointmentsDataAfterFilter(finalDcoumentList);
        setRefreshing(false);
        setTimeout(() => setLoading(false), 500);
      })
    } catch (error) {
      console.error("Error fetching questionnaire list:", error);
      setLoading(false);
    }
  }

  const renderFooter = () => (loading ? <></> : null);

  const renderItem = (item) => {
    return (
      <View style={[styles.appointmentCardMainBox]}>
        <View style={[styles.appointmentCard]}>
          <View style={styles.appointmentCardRow}>
            <View style={styles.leftView}>
              <View style={styles.rowPractitioner}>
                <View style={styles.textContainer}>
                  <Text allowFontScaling={false} style={styles.practitionerName}>{item?.item?.documentName}</Text>
                </View>
              </View>
              <View style={styles.row}>
                <Text allowFontScaling={false} style={[styles.marginLeftClass, styles.showText]}>
                  {moment(item?.item?.createdOn, 'YYYY-MM-DD').format('DD MMM. YY')}
                </Text>
              </View>
            </View>
            <View style={styles.rightView}>
              {
                ["jpg", "jpeg", "png"].includes(item?.item?.documentUrl.split(".").pop().toLowerCase()) ?
                  <TouchableOpacity style={styles.eyeButton} onPress={() => handalShowDocument(item.item)}>
                    <Text allowFontScaling={false} style={styles.eyeButtonTxt}>
                      <Ionicons name="document-text-outline" size={18} color="#fff" /> View
                    </Text>
                  </TouchableOpacity>
                  :
                  <TouchableOpacity style={styles.eyeButton} onPress={() => downloadPDFLink(item.item)}>
                    <Text allowFontScaling={false} style={styles.eyeButtonTxt}>
                      <Ionicons name="document-text-outline" size={18} color="#fff" /> View
                    </Text>
                  </TouchableOpacity>
              }
            </View>
          </View>
        </View>
      </View>
    );
  };

  const handalShowDocument = (obj) => {
    setErrorFlag(false)
    setImageLoading(false)
    if (isconnected) {
      setdocumentUrl(obj.documentUrl);
      setImageShowFlag(true);
    } else {
      Toast.show("No internet connection");
    }
  }

  const downloadFile = async (url) => {
    try {
      setLoading(true);
      setFileUri(url);
    } catch (err) {}
  };

  useEffect(() => {
    if (fileUri && fileUri != "") {
      setModalVisible(true)
    }
  }, [fileUri])

  const downloadPDFLink = Utility.debounceButton((item) => {
    if (isconnected) {
      setLoading(true);
      downloadPdf(item.documentUrl);
    } else {
      Toast.show("No internet connection");
    }
  }, 300);

  const handleFilter = () => setFilterFlag(!filterFlag);

  const handleBackPress = () => {
    if (navigation.canGoBack()) navigation.goBack();
  }

  const generateUniqueId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 15);

  const handleUpload = () => setFileUploadFlag(true);

  const getDocumentList = (type = "") => {
    setTimeout(() => setFileUploadFlag(false), 1000);
    setAppointmentsDataAfterFilter([]);
    getAppointmentListFn(type)
  }

  const items = [
    'Current signed passport',
    'Residence permit issued by the Home Office',
    'EU identity photo-card',
    'Valid UK photo-card driving licence',
    'Valid armed or police forces photo identity card',
    'Disabled blue badge- with photo',
    'Citizen card',
    'Valid student ID with photograph'
  ];

  const viewDocument = () => {
    setviewDocumentFlag(true)
    EventEmitter.emit("broadcustMessage", { "has_additional_view": true });
  }

  const modalColseWevview = () => {
    setModalVisible(false);
    setFileUri("");
    setWebViewLoading(false);
  }

  const getMimeType = (filePath) => {
    const extension = filePath.split('.').pop();
    const mimeTypes = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      txt: 'text/plain',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      mp4: 'video/mp4',
      mp3: 'audio/mpeg',
    };
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  };

  const downloadPDFForIOS = (pdfUrl) => {
    setLoading(false);
    setWebViewLoading(true);
    setFileUri(pdfUrl);
    setModalVisible(true);
  };

  const handleDownloadToDevice = async (fileUrl) => {
    try {
      if (!fileUrl) {
        Alert.alert('Error', 'No file to download');
        return;
      }
      setIsDownloading(true);
      Toast.show('Downloading file...');
      const extension = await getFileExtension(fileUrl);
      const fileName = `document_${new Date().getTime()}.${extension}`;
      const filePath = Platform.OS === 'ios'
        ? `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${fileName}`
        : `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${fileName}`;

      const response = await ReactNativeBlobUtil.config({
        fileCache: true,
        path: filePath,
        addAndroidDownloads: Platform.OS === 'android' ? {
          useDownloadManager: true,
          notification: true,
          title: fileName,
          description: 'Downloading document',
          mime: getMimeType(fileName),
        } : undefined,
      }).fetch('GET', fileUrl);

      setIsDownloading(false);

      if (Platform.OS === 'ios') {
        Toast.show('Opening share options...');
        setTimeout(() => {
          Share.share({
            url: `file://${response.path()}`,
            title: fileName,
            message: `Save ${fileName}`
          }).catch(() => {
            Alert.alert('Success', 'File downloaded. You can find it in the app\'s documents folder.');
          });
        }, 300);
      } else {
        Toast.show('File downloaded successfully!');
        Alert.alert('Success', 'File has been downloaded to your Downloads folder.');
      }
    } catch (error) {
      setIsDownloading(false);
      console.error('Download error:', error);
      Alert.alert('Download Error', 'Failed to download file. Please try again.');
    }
  };

  const downloadPdf = async (pdfUrl) => {
    downloadPDFForIOS(pdfUrl);
    return;
  };

  const getFileExtension = async (fileUrl) => fileUrl.split('.').pop().split('?')[0].toLowerCase();

  const refreshBtnFn = () => {
    setLoading(false);
    getAppointmentListFn()
  }

  const imageViewCloseFN = () => {
    setdocumentUrl("")
    setImageShowFlag(false)
  }

  const webViewLoadFinish = () => setLoading(false);

  onRefresh = () => {
    setRefreshing(true)
    getAppointmentListFn("refresh")
  }
  const callbackhandler = () =>{ 
    setviewDocumentFlag(false); 
  }
  const handleGoBack = () => {
    if (viewDocumentFlag) {
      setviewDocumentFlag(false);
      return true;
    }else{
      navigation.goBack();
    }
  }

  return (
    <View style={styles.container}>
      <View>
        <CustomHeader pageName={routeName}
          refreshBtnFn={refreshBtnFn}
          viewDocumentFlag={viewDocumentFlag}
          callbackhandler={callbackhandler}
        />
      </View>
      <Loader style={styles.loadingCss} loading={loading} />

      <TouchableOpacity style={[styles.backbtn, styles.backbtnTop]} onPress={handleGoBack}>
        <FontAwesome6 name="arrow-left-long" size={26} color={Colors.black} />
      </TouchableOpacity>

      {!viewDocumentFlag &&
        <>
          <View style={styles.infoBox}>
            <View style={styles.inninfoBox}>
              <Text allowFontScaling={false} style={styles.mainHeading}>Valid forms of  Photo IDs</Text>
              {items.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <Text allowFontScaling={false} style={styles.bullet}>
                    <Entypo name="dot-single" size={20} color="#000" style={styles.bulletStyle} />
                  </Text>
                  <Text allowFontScaling={false} style={styles.itemText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.uploadButtonBox}>
            <TouchableOpacity style={styles.uploadButton} onPress={() => handleUpload()}>
              <View style={styles.buttonContent}>
                <Text allowFontScaling={false} style={styles.buttonInnText}>Upload Your ID</Text>
                <View style={styles.uploadIconContainer}>
                  <Feather name="upload" size={40} color="#fff" style={styles.uploadIcon} />
                </View>
                <Text allowFontScaling={false} style={styles.hintTxt}>
                  You can upload PDF/Word document or{"\n"} PNG/JPEG files with Max 5 MB.
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.allDocumentBox}>
            <TouchableOpacity style={styles.allDocument} onPress={() => viewDocument()}>
              <Text allowFontScaling={false} style={styles.allDocumentText}>View Document </Text>
            </TouchableOpacity>
          </View>
        </>
      }

      {viewDocumentFlag &&
        <View style={styles.appointmentScreenView}>
          <FlatList
            data={appointmentsDataAfterFilter}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            ListFooterComponent={renderFooter}
            onEndReachedThreshold={0.5}
            initialNumToRender={10}
            onRefresh={onRefresh}
            refreshing={refreshing}
            ListEmptyComponent={!loading ? renderEmptyComponent : null}
          />
        </View>
      }

      <GlobalModal
        visible={fileUploadFlag}
        onCancel={() => setFileUploadFlag(false)}
        footer={false}
        header={true}
        headerTitle={
          <View>
            <Text allowFontScaling={false} style={styles.uploadDocumentTxt}>Upload Document</Text>
          </View>
        }
        body={
          <FileUploadAndTakePhoto
            getDocumentList={getDocumentList}
            useFor="MyDocument"
            patientId={reduxAuthJson.token.loginUserId}
            patientName={reduxAuthJson.currentUserDetails.firstName}
          />
        }
      />

      <GlobalModal
        visible={imageShowFlag}
        animationType="fade"
        onCancel={() => setImageShowFlag(false)}
        footer={false}
        header={true}
        headerTitle='View Document'
        body={
          <View style={[styles.modalImageViewContainer]}>
            <View style={[styles.imgmodalContent]}>
              {errorFlag ? (
                <View style={styles.noImageContainer}>
                  <Text allowFontScaling={false} style={styles.messageTxt}>Document not found or cannot be loaded.</Text>
                </View>
              ) : (
                <>
                  {imageLoading && (
                    <View style={styles.imageLoadingContainer}>
                      <ActivityIndicator size="large" color="#24ad91" />
                      <Text allowFontScaling={false} style={styles.loadingText}>Loading Document...</Text>
                    </View>
                  )}
                  <Image
                    source={{ uri: documentUrl }}
                    style={styles.imageShowBox}
                    onLoadStart={() => {
                      setImageLoading(true);
                    }}
                    onLoadEnd={() => {
                      setTimeout(() => setImageLoading(false), 100);
                    }}
                    resizeMode="contain"
                    onError={() => {
                      setErrorFlag(true);
                      setImageLoading(false);
                    }}
                  />
                </>
              )}

              <View style={[styles.bottonBoxes]}>
                <TouchableOpacity
                  style={[styles.bottonBox, styles.closeButtonStyle]}
                  onPress={() => setImageShowFlag(false)}
                >
                  <Ionicons name="close-circle-outline" size={18} color="#fff" />
                  <Text allowFontScaling={false} style={styles.eyeButtonTxt}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.bottonBox,
                    styles.downloadButtonStyle,
                    isDownloading && styles.downloadButtonDisabled
                  ]}
                  onPress={() => handleDownloadToDevice(documentUrl)}
                  disabled={isDownloading}
                >
                  <Ionicons name="download-outline" size={18} color="#fff" />
                  <Text allowFontScaling={false} style={styles.eyeButtonTxt}>
                    {isDownloading ? 'Downloading...' : 'Download'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
      />

      <GlobalModal
        visible={modalVisible}
        onCancel={modalColseWevview}
        cancelBtnShow={false}
        headerTitle="View Document"
        footer={false}
        body={
          <>
            <View style={[styles.pdfmodalContainer]}>
              <View style={[styles.pdfmodalContent]}>
                {fileUri && fileUri != "" &&
                  <>
                    <WebView
                      source={{
                        uri:
                          Platform.OS === 'android'
                            ? `https://docs.google.com/gview?embedded=true&url=${fileUri}`
                            : fileUri,
                      }}
                      style={styles.webview}
                      onError={(error) => console.log('WebView error:', error)}
                      onHttpError={(error) => console.error('HTTP Error:', error)}
                      onLoadStart={() => setWebViewLoading(true)}
                      onLoadEnd={() => {
                        webViewLoadFinish();
                        setWebViewLoading(false);
                      }}
                      cacheEnabled={false}
                      domStorageEnabled
                      javaScriptEnabled
                      allowFileAccess
                      mixedContentMode="always"
                      startInLoadingState={false}
                      scalesPageToFit
                    />
                    {webViewLoading && (
                      <View style={styles.webViewLoadingContainer}>
                        <ActivityIndicator size="large" color="#24ad91" />
                        <Text allowFontScaling={false} style={styles.loadingText}>Loading document...</Text>
                      </View>
                    )}
                  </>
                }
                <View style={[styles.bottonBoxes]}>
                  <TouchableOpacity
                    style={[styles.bottonBox, styles.closeButtonStyle]}
                    onPress={() => modalColseWevview()}
                  >
                    <Ionicons name="close-circle-outline" size={18} color="#fff" />
                    <Text allowFontScaling={false} style={styles.eyeButtonTxt}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.bottonBox,
                      styles.downloadButtonStyle,
                      isDownloading && styles.downloadButtonDisabled
                    ]}
                    onPress={() => handleDownloadToDevice(fileUri)}
                    disabled={isDownloading}
                  >
                    <Ionicons name="download-outline" size={18} color="#fff" />
                    <Text allowFontScaling={false} style={styles.eyeButtonTxt}>
                      {isDownloading ? 'Downloading...' : 'Download'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        }
      />
    </View>
  );
}

export default MyDocument;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dff7f8',
    width: screenWidth,
  },

  infoBox: {
    width: screenWidth,
    minHeight: isSmallIOS ? fortyPercentOfScreenHeight : undefined,
    padding: scale(15),
    paddingTop: 0,
  },

  inninfoBox: {
    width: '100%',
    backgroundColor: '#fff',
    padding: scale(15),
    borderRadius: scale(5),
    shadowColor: Platform.OS == 'ios' ? '#666' : '#000',
    shadowOffset: { width: Platform.OS == 'ios' ? .8 : 1 },
    shadowOpacity: Platform.OS == 'ios' ? 0.3 : 0.5,
    shadowRadius: scale(5),
    elevation: Platform.OS == 'ios' ? 3 : 5,
  },

  // Bigger on purpose → exact
  mainHeading: {
    color: '#000',
    fontSize: fontExact(18),          // was font(16)
    lineHeight: fontExact(24),
    fontFamily: 'Montserrat-Bold',
    marginBottom: vScale(10),
    fontWeight: '700',
  },

  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingVertical: vScale(1),
  },
  bullet: {
    color: '#000',
    width: "10%",
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingLeft: scale(5),
  },

  // Body text → mostly stable, allow tiny zoom
  itemText: {
    color: '#000',
    fontSize: fontLocked(14, { clamp: [1, 1.15] }),
    lineHeight: fontLocked(22, { clamp: [1, 1.15] }),
    fontFamily: 'Arimo-Regular',
    flexWrap: 'wrap',
    width: "90%",
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  uploadButtonBox: {
    width: screenWidth,
    padding: 0,
    paddingHorizontal: scale(15),
  },
  uploadButton: {
    backgroundColor: '#fff',
    textAlign: 'center',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Platform.OS == 'ios' ? '#666' : '#000',
    shadowOffset: { width: Platform.OS == 'ios' ? .8 : 1 },
    shadowOpacity: Platform.OS == 'ios' ? 0.3 : 0.5,
    shadowRadius: scale(5),
    elevation: Platform.OS == 'ios' ? 3 : 5,
    borderRadius: scale(5),
    padding: vScale(10),
    paddingHorizontal: scale(15),
  },
  buttonContent: {
    width: '100%',
    height: Platform.OS == 'ios' ? vScale(200) : vScale(170),
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: fontLocked(16),
    color: '#428174',
    borderRadius: scale(7),
    fontWeight: 'bold',
    padding: 0,
  },
  uploadIconContainer: {
    backgroundColor: '#24ad91',
    padding: scale(15),
    borderRadius: scale(50),
    marginTop: vScale(7.5),
    width: scale(70),
    height: vScale(70),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  uploadIcon: {
    color: '#fff',
    fontSize: fontExact(32),
  },

  // Button label → exact (you want it visibly big)
  buttonInnText: {
    color: '#000',
    fontSize: fontExact(18),
    fontFamily: 'Montserrat-Bold',
    fontWeight: '700',
  },

  allDocumentBox: {
    width: screenWidth,
    paddingHorizontal: scale(15),
    alignItems: 'center',
  },
  allDocument: {
    backgroundColor: '#24ad91',
    width: '60%',
    marginTop: vScale(15),
    borderRadius: scale(10),
    shadowColor: '#666',
    shadowOffset: { width: .5, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: scale(5),
    elevation: 2,
  },

  // CTA → exact
  allDocumentText: {
    color: '#fff',
    fontSize: fontExact(16),
    fontFamily: 'Arimo-Bold',
    padding: vScale(15),
    textAlign: 'center',
    width: '100%',
    fontWeight: '700',
  },

  backArrow: {
    position: 'absolute',
    left: scale(15),
    top: vScale(-50),
    zIndex: 999,
    backgroundColor: '#000',
  },
  appointmentCardMainBox: {
    paddingHorizontal: scale(15),
    marginVertical: vScale(7.5),
  },
  appointmentCard: {
    backgroundColor: '#fff',
    padding: vScale(10),
    paddingVertical: vScale(15),
    shadowColor: Platform.OS == 'ios' ? '#666' : '#000',
    shadowOffset: { width: Platform.OS == 'ios' ? .8 : 1 },
    shadowOpacity: Platform.OS == 'ios' ? 0.3 : 0.5,
    shadowRadius: scale(5),
    elevation: Platform.OS == 'ios' ? 3 : 5,
    borderRadius: scale(10),
  },
  appointmentCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftView: { width: "70%" },
  rightView: {
    width: "30%",
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentTypeColumn: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  eyeButton: {
    width: scale(90),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#24ad91',
    borderRadius: scale(10),
    flexDirection: 'row',
    position: 'relative',
    paddingHorizontal: scale(8),
    paddingVertical: vScale(6),
  },

  // Button text → locked (stable)
  eyeButtonTxt: {
    fontSize: fontLocked(14),
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Arimo-Bold',
    fontWeight: '700',
  },

  appointmentScreenView: {
    marginTop: 0,
    backgroundColor: '#dff7f8',
    paddingHorizontal: 0,
    height: Platform.OS == 'ios' ? screenheight - vScale(100) : screenheight - vScale(55),
    paddingBottom: vScale(10),
  },

  rowPractitioner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flexDirection: 'column',
    marginTop: 0,
  },

  // Row texts → locked
  practitionerName: {
    fontSize: fontLocked(14),
    color: Colors.black,
    fontFamily: 'Montserrat-Medium',
  },
  practitionerSpeciality: {
    fontSize: fontLocked(14),
    color: '#747474',
    fontFamily: 'Montserrat-Medium',
  },
  showText: {
    color: Colors.black,
    fontSize: fontLocked(14),
  },

  loadingCss: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    top: 0
  },

  // Modal title → exact
  uploadDocumentTxt: {
    padding: Platform.OS == 'ios' ? vScale(10) : 0,
    color: '#000',
    fontSize: fontExact(16),
    fontFamily: 'Arimo-Bold',
    textAlign: 'center',
    fontWeight: '700',
  },
  photoModalimage: {
    width: scale(95),
    height: vScale(95),
    marginTop: vScale(10),
    borderRadius: scale(10),
    marginBottom: 0,
    borderStyle: 'solid',
    borderColor: '#428174',
    borderWidth: scale(5),
  },
  modalImageViewContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: vScale(400),
  },
  imgmodalContent: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    paddingBottom: 0,
    marginTop: 0
  },
  imageShowBox: {
    width: '100%',
    height: '100%',
  },

  containerPdf: {},
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },

  pdfmodalContainer: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: screenheight - vScale(400),
  },
  pdfmodalContent: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 0,
    paddingBottom: 0,
  },
  webview: { flex: 1 },
  webViewLoadingContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },

  // Loading text → locked
  loadingText: {
    marginTop: vScale(10),
    fontSize: fontLocked(16),
    color: '#24ad91',
    fontFamily: 'Arimo-Regular',
  },

  bottonBoxes: {
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingVertical: vScale(10),
    paddingHorizontal: scale(10),
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  bottonBox: {
    flex: 1,
    marginHorizontal: scale(5),
    backgroundColor: '#24ad91',
    borderRadius: scale(8),
    paddingVertical: vScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  closeButtonStyle: { backgroundColor: '#f44336' },
  downloadButtonStyle: { backgroundColor: '#24ad91' },
  downloadButtonDisabled: { backgroundColor: '#9e9e9e', opacity: 0.6 },

  // Misc → locked
  norecordFound: {
    fontSize: fontLocked(14),
    fontFamily: 'Arimo-Regular',
    color: '#000',
  },
  hintTxt: {
    color: '#333',
    fontFamily: 'Arimo-Regular',
    fontSize: fontLocked(14, { clamp: [1, 1.1] }),
    paddingTop: vScale(10),
    textAlign: 'center',
    lineHeight: fontLocked(18), // corrected line height using same scaling logic
  },
  noImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(25),
  },

  // Modal message → exact
  messageTxt: {
    fontSize: fontExact(20),
    lineHeight: fontExact(28),
    fontFamily: 'Arimo-Regular',
    color: '#000',
    textAlign: 'center',
  },

  backbtnTop: {
    width: scale(40),
    height: vScale(35),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    left: scale(15),
  }
});
