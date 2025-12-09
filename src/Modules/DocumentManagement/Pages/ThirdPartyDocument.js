import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  FlatList,
  Text as RNText,
  useColorScheme,
  View,
  TouchableOpacity,
  Image,
  Button,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Dimensions,
  Animated,
  Easing,
  ScrollView,
  Platform,
  StatusBar,
  Modal,
  Share,
  AppState,
  PixelRatio,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { getMyDocumentList } from '../Controller/DocumentManagementController';
import Loader from '../../../Utility/Components/Loader';
import Config from '../../../Utility/Config';
import { useNavigation, useFocusEffect, useNavigationState } from '@react-navigation/native';
import HeaderBar from '../../../Utility/Components/HeaderBar';
import Colors from '../../../Utility/Colors';
import GlobalBottomSheet from '../../../Utility/Components/GlobalBottomSheet';
import BottomSheetDesign from '../Components/BottomSheetDesign';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import FileUploadAndTakePhoto from '../Components/FileUploadAndTakePhoto';
import GlobalModal from '../../../Utility/Components/GlobalModal'
import Entypo from 'react-native-vector-icons/Entypo';
import ImageView from 'react-native-image-view';
import Feather from 'react-native-vector-icons/Feather';
import { Alert } from 'react-native';
import CustomHeader from '../../../Utility/Components/CustomHeader'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'; // 👈 added SafeAreaView
import ReactNativeBlobUtil from 'react-native-blob-util'
import FileViewer from "react-native-file-viewer";
import NetInfo from "@react-native-community/netinfo";
import { WebView } from 'react-native-webview';
import Utility from '../../../Utility/Utility';
import RNFS from 'react-native-fs';
import Toast from 'react-native-simple-toast';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import EventEmitter from '../../../Contexts/EventEmitter';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import SearchBottomSheetDesign from '../../../Utility/Components/SearchBottomSheetDesign';

/* ------------------ Responsive helpers (PixelRatio + Dimensions) ------------------ */
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;
const { width: W, height: H } = Dimensions.get('window');

const scale = (size) => (W / BASE_WIDTH) * size;
const vScale = (size) => (H / BASE_HEIGHT) * size;
const mScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;
const font = (size) => Math.round(PixelRatio.roundToNearestPixel(size));
/* ---------------------------------------------------------------------------------- */

// Local non-scaling Text
const Text = (props) => <RNText allowFontScaling={false} maxFontSizeMultiplier={1} {...props} />;

// Screen/layout metrics
const screen = Dimensions.get("window");
const screenWidth = screen.width;
const screenheight = screen.height;
const bookingscreenWidth = screenWidth - scale(30);
const bookingscreenWidthLeft = bookingscreenWidth - scale(50);
const uploadscreenheight = screenheight * 0.25;
// const bottomscreenheight = Platform.OS === 'ios' ? screenheight * 0.60 : screenheight * 0.62; // ❌ not needed anymore

const renderEmptyComponent = () => {
  return (
    <View style={{ padding: scale(20), alignItems: 'center' }}>
      <Text style={styles.norecordFound}>No records found</Text>
    </View>
  );
};

function ThirdPartyDocument({ props }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [issearchSheetVisible, setSearchSheetVisible] = useState(false);
  const hidesearchSheet = () => setSearchSheetVisible(false);
  const reduxAuthJson = useSelector((state) => state);
  const [appointmentsData, setAppointmentsData] = useState([]);
  const [appointmentsDataAfterFilter, setAppointmentsDataAfterFilter] = useState([]);
  const ITEMS_PER_PAGE = 10;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filterFlag, setFilterFlag] = useState(false);
  const [isSheetVisible, setSheetVisible] = useState(false);
  const [fileUploadFlag, setFileUploadFlag] = useState(false);
  const [imageShowFlag, setImageShowFlag] = useState(false);
  const [errorFlag, setErrorFlag] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [documentUrl, setdocumentUrl] = useState("");
  const [documentExtension, setDocumentExtension] = useState("");
  const hideBottomSheet = () => setSheetVisible(false);
  const snapPoints = ['50%'];
  const routeName = useNavigationState(state => state.routeNames[state.index]);
  const insets = useSafeAreaInsets(); // 👈 use bottom inset
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight : insets.top;
  const [modalVisible, setModalVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [fileUri, setFileUri] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [internetIsconnected, setInternetIsconnected] = useState(false);

  const [selectedTimeLine, setSelectedTimeLine] = useState("");
  const [selectedDocumentType, setSelectedDocumentType] = useState("Thirdparty");
  const [isconnected, setIsconnected] = useState(false);
  const [refreshBtnFnFlag, setRefreshBtnFnFlag] = useState(false);
  const [webViewLoading, setWebViewLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsconnected(state.isConnected)
      if (!state.isConnected) {
        setLoading(false);
        setRefreshing(false);
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      getDocumentList()
      return () => {
        setLoading(false);
      };
    }, [])
  );
  useEffect(() => {
    getDocumentList()
  }, [])

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setInternetIsconnected(state.isConnected)
      if (!state.isConnected) {
        setLoading(false);
        setRefreshing(false);
      }
    })
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {}, [internetIsconnected])

  // Handle app state changes when returning from file viewer
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        setLoading(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const getThirdPartyDocsFn = (type = "", timeline = "", documentType = "Thirdparty") => {
    try {
      if (type !== "refresh") setLoading(true);
      let searchHash = {
        id: reduxAuthJson.token.loginUserId,
        fetchingFrom: 'APP',
        documentType: "Thirdparty",
        documentFor: "Thirdparty"
      }

      if (!["refresh", "reload"].includes(type)) {
        let timelineHash = {
          '7': '1week',
          '30': '1month',
          '90': '3months',
          '180': '6months',
          '365': '1year',
        }
        let timeLineText = timeline && timeline != "" ? timeline : selectedTimeLine;
        searchHash.timeline = timeLineText !== "" ? timelineHash[timeLineText] : "";
        searchHash.documentFor = documentType && documentType != "" ? documentType : 'Thirdparty';
      }

      getMyDocumentList(searchHash).then(async (response) => {
        setRefreshBtnFnFlag(false);
        setAppointmentsDataAfterFilter(response.PomsPatientDocumentList);
        setAppointmentsData(response.PomsPatientDocumentList);
        setRefreshing(false);
        setTimeout(() => setLoading(false), 500);
      })

    } catch (error) {
      console.error("Error fetching questionnaire list:", error);
      setRefreshBtnFnFlag(false);
      setLoading(false);
    } finally {}
  }

  const handleLoadMore = () => {
    if (appointmentsDataAfterFilter?.length > 0) {
      if (!loading && hasMore) setPage(page + 1);
    }
  };

  const renderFooter = () => (loading ? <></> : null);

  const renderItem = (item) => (
    <View style={[styles.appointmentCardMainBox]}>
      <View style={[styles.appointmentCard]}>
        <View style={styles.appointmentCardRow}>
          <View style={styles.leftView}>
            <View style={styles.rowPractitioner}>
              <View style={styles.textContainer}>
                <Text style={styles.practitionerName}>Name : {item?.item?.documentName}</Text>
                <Text style={[styles.marginLeftClass, styles.showText]}>Upload date : {moment(item?.item?.createdOn, 'YYYY-MM-DD').format('DD MMM. YY')}</Text>
                {item?.item?.documentType.toString().toLowerCase() !== "other" &&
                  <Text style={[styles.marginLeftClass, styles.showText]}>Reported date : {moment(item?.item?.report_date, 'YYYY-MM-DD').format('DD MMM. YY')}</Text>
                }
                <Text style={styles.practitionerSpeciality}>{item?.item?.documentType}</Text>
              </View>
            </View>
          </View>
          <View style={styles.rightView}>
            <View style={styles.actionButtonsContainer}>
              {["jpg", "jpeg", "png"].includes(item?.item?.documentUrl.split(".").pop().toLowerCase()) ? (
                <TouchableOpacity style={styles.eyeButton} onPress={() => handalShowDocument(item.item)}>
                  <Ionicons name="eye-outline" size={18} color="#fff" />
                  <Text style={styles.eyeButtonTxt}>View</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.eyeButton} onPress={() => downloadPDFLink(item.item)}>
                  <Ionicons name="eye-outline" size={18} color="#fff" />
                  <Text style={styles.eyeButtonTxt}>View</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const handalShowDocument = (obj) => {
    setErrorFlag(false)
    setImageLoading(false)
    if (internetIsconnected) {
      const extension = obj.documentUrl.split(".").pop().toLowerCase();
      setDocumentExtension(extension)
      setdocumentUrl(obj.documentUrl);
      setImageShowFlag(true);
    } else {
      Toast.show("No internet connection");
    }
  }

  const downloadPDFLink = Utility.debounceButton((item) => {
    if (internetIsconnected) {
      setLoading(true);
      downloadPdf(item.documentUrl);
    } else {
      Toast.show("No internet connection");
    }
  }, 300);

  const downloadFile = async (url) => {
    try {
      setWebViewLoading(true);
      setModalVisible(true);
      setFileUri(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Error', 'Failed to download the document.');
    }
  };
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
          }).catch((error) => {
            console.error('Share error:', error);
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
    return
  };

  const getFileExtension = async (fileUrl) => fileUrl.split('.').pop().split('?')[0].toLowerCase();

  const handleBackPress = () => {
    if (navigation.canGoBack()) navigation.goBack();
  }

  const generateUniqueId = () =>
    Date.now().toString(36) + Math.random().toString(36).substring(2, 15);

  const handleUpload = () => setFileUploadFlag(true);

  const getDocumentList = (type = "") => {
    setTimeout(() => setFileUploadFlag(false), 1000);
    setHasMore(true);
    setPage(0);
    setData([])
    setAppointmentsDataAfterFilter([]);
    setAppointmentsData([]);
    getThirdPartyDocsFn(type)
  }

  const refreshBtnFn = () => {
    setLoading(false);
    setRefreshBtnFnFlag(true);
    getThirdPartyDocsFn("reload")
  }

  const webViewLoadFinish = () => setLoading(false);

  onRefresh = () => {
    setRefreshing(true)
    setSelectedTimeLine("")
    setSelectedDocumentType("Thirdparty")
    setRefreshBtnFnFlag(true);
    getThirdPartyDocsFn("refresh");
  }

  const handleGoBack = () => navigation.goBack();

  const handleFilter = () => setSearchSheetVisible(true);

  const clearFilterFn = () => {
    setSelectedTimeLine("");
    setSelectedDocumentType("Thirdparty");
  }

  const applyFilters = (obj) => {
    if (isconnected) {
      getThirdPartyDocsFn("filter", obj.Timeline, obj.DocumentType);
    } else {
      Toast.show("No internet connection");
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea]}
      edges={['left', 'right', 'bottom']} // 👈 protects bottom nav/gesture area
    >
      <View>
        <CustomHeader pageName={routeName} refreshBtnFn={refreshBtnFn} />
      </View>
      <Loader style={styles.loadingCss} loading={loading} />

      <View style={styles.searchBoxes}>
        <View style={styles.leftGroup}>
          <TouchableOpacity style={[styles.backbtn, styles.backbtnTop]} onPress={handleGoBack}>
            <FontAwesome6 name="arrow-left-long" size={scale(26)} color={Colors.black} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchBoX} onPress={handleFilter}>
            <Image source={require('../../../Utility/Public/images/filter.png')} style={styles.filtericon} />
            <Text style={styles.searchBoXTxt}>Filters</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={refreshBtnFn}>
          <FontAwesome name="refresh" size={scale(26)} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.uploadButtonBox}>
        <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
          <View style={styles.buttonContent}>
            <Text style={styles.buttonInnText}> Upload Your clinical Documents and Reports</Text>
            <View style={styles.uploadIconContainer}>
              <Feather name="upload" size={scale(40)} color="#fff" style={styles.uploadIcon} />
            </View>
            <Text style={styles.hintTxt}>You can upload PDF/Word documents or{"\n"}
              PNG/JPEG files with max 5MB. </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.appointmentScreenView}>
        <FlatList
          data={appointmentsDataAfterFilter}
          renderItem={renderItem}
          keyExtractor={generateUniqueId}
          ListFooterComponent={renderFooter}
          onRefresh={onRefresh}
          refreshing={refreshing}
          initialNumToRender={10}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={!loading ? renderEmptyComponent : null}
          // 👇 ensures last items stay above the gesture bar / soft nav
          contentContainerStyle={{ paddingBottom: (insets.bottom || 0) + vScale(24) }}
        />
      </View>

      {/* Modals / BottomSheet unchanged */}
      <GlobalModal
        visible={fileUploadFlag}
        onCancel={() => setFileUploadFlag(false)}
        footer={false}
        header={true}
        headerTitle={
          <View >
            <Text style={styles.uploadDocumentTxt}>Upload Document</Text>
          </View>
        }
        body={
          <FileUploadAndTakePhoto
            getDocumentList={getDocumentList}
            useFor="ThirdPartyDocument"
            patientId={reduxAuthJson.token.loginUserId}
            patientName={reduxAuthJson.currentUserDetails.firstName}
          />
        }
      />

      <GlobalModal
        visible={imageShowFlag}
        animationType="fade"
        onCancel={() => setImageShowFlag(false)}
        cancelBtnShow={false}
        headerTitle="View 3rd Party Docs and Report"
        footer={false}
        body={
          <View style={styles.modalImageViewContainer}>
            <View style={[styles.imgmodalContent]}>
              {errorFlag ? (
                <View style={styles.noImageContainer}>
                  <Text style={styles.messageTxt}>Image not found or cannot be loaded.</Text>
                </View>
              ) : (
                <>
                  {imageLoading && (
                    <View style={styles.imageLoadingContainer}>
                      <ActivityIndicator size="large" color="#24ad91" />
                      <Text style={styles.loadingText}>Loading Document...</Text>
                    </View>
                  )}
                  <Image
                    source={{ uri: documentUrl }}
                    style={styles.imageShowBox}
                    onLoadStart={() => setImageLoading(true)}
                    onLoadEnd={() => setTimeout(() => setImageLoading(false), 100)}
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
                  <Ionicons name="close-circle-outline" size={scale(18)} color="#fff" />
                  <Text style={styles.eyeButtonTxt}>Close</Text>
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
                  <Ionicons name="download-outline" size={scale(18)} color="#fff" />
                  <Text style={styles.eyeButtonTxt}>
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
        headerTitle="View 3rd Party Docs and Report"
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
                      domStorageEnabled={true}
                      javaScriptEnabled={true}
                      allowFileAccess={true}
                      mixedContentMode="always"
                      startInLoadingState={false}
                      scalesPageToFit={false}
                      textZoom={100}
                    />
                    {webViewLoading && (
                      <View style={styles.webViewLoadingContainer}>
                        <ActivityIndicator size="large" color="#24ad91" />
                        <Text style={styles.loadingText}>Loading document...</Text>
                      </View>
                    )}
                  </>
                }
                <View style={[styles.bottonBoxes]}>
                  <TouchableOpacity
                    style={[styles.bottonBox, styles.closeButtonStyle]}
                    onPress={modalColseWevview}
                  >
                    <Ionicons name="close-circle-outline" size={scale(18)} color="#fff" />
                    <Text style={styles.eyeButtonTxt}>Close</Text>
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
                    <Ionicons name="download-outline" size={scale(18)} color="#fff" />
                    <Text style={styles.eyeButtonTxt}>
                      {isDownloading ? 'Downloading...' : 'Download'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        }
      />

      <GlobalBottomSheet
        isVisible={issearchSheetVisible}
        onClose={hidesearchSheet}
        snapPoints={Platform.OS == 'ios' ? ["74%"] : ["70%"]}
        bodyContent={
          <>
            <SearchBottomSheetDesign
              hidesearchSheet={hidesearchSheet}
              useFor="thirdPartyDocument"
              applyFilters={applyFilters}
              setSelectedTimeLine={setSelectedTimeLine}
              setSelectedDocumentType={setSelectedDocumentType}
              clearFilterFn={clearFilterFn}
              selectedTimeLine={selectedTimeLine}
              selectedDocumentType={selectedDocumentType}
              filterFor="thirdPartyDocument"
              refreshBtnFnFlag={refreshBtnFnFlag}
              timeLineFilter={true}
              paymentStatusFilter={false}
              paymentModeFilter={false}
              keywordSearchFilter={false}
              sentByFilter={false}
              documentTypeFilter={true}
            />
          </>
        }
      />
    </SafeAreaView>
  );
}

export default ThirdPartyDocument;

const styles = StyleSheet.create({
  safeArea: {               // 👈 NEW
    backgroundColor: '#dff7f8',
    flex: 1,
    paddingTop: 0,
  },

  appointmentCardMainBox: {
    paddingHorizontal: scale(15),
    marginVertical: vScale(7.5),
  },
  appointmentCard: {
    backgroundColor: '#fff',
    marginBottom: 0,
    marginTop: 0,
    padding: scale(10),
    paddingVertical: vScale(15),
    shadowColor: Platform.OS == 'ios' ? '#666' : '#000',
    shadowOffset: { width: Platform.OS == 'ios' ? .8 : 1, height: 0 },
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
  leftView: { width: '70%' },
  rightView: {
    width: '30%',
    padding: 0,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  actionButtonsContainer: {
    flexDirection: 'column',
    gap: vScale(5),
    alignItems: 'center',
  },
  eyeButton: {
    width: scale(90),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#24ad91',
    borderRadius: scale(10),
    flexDirection: 'row',
    gap: scale(5),
    paddingHorizontal: scale(8),
    paddingVertical: vScale(6),
  },
  downloadButton: { backgroundColor: '#2196F3', marginTop: vScale(5) },
  eyeButtonTxt: {
    fontSize: font(14),
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Arimo-Bold',
    fontWeight: '700',
  },

  container: {
    flex: 1,
    backgroundColor: '#dff7f8',
    width: '100%',
    height: '100%',
  },

  appointmentScreenView: {
    flex: 1,                // 👈 use flex so list can grow and respect SafeArea
    backgroundColor: '#dff7f8',
    paddingBottom: vScale(0), // light padding; FlatList adds more via contentContainerStyle
  },

  // ... (unchanged styles below)
  styleListTopView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingLeft: scale(3),
    paddingRight: scale(3),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  styleListSecondTopView: {
    marginBottom: vScale(5),
    width: '40%',
    marginLeft: scale(2),
    marginRight: scale(2),
    backgroundColor: '#fff',
    borderRadius: scale(5),
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 0,
    color: '#666',
    fontSize: font(14),
  },
  picker: {
    height: vScale(50),
    width: '100%',
    color: '#666',
    fontSize: font(12),
    padding: 0,
    margin: 0,
  },
  rowPractitioner: { flexDirection: 'row', alignItems: 'center' },
  noManIcon: { marginRight: scale(10) },
  textContainer: { flexDirection: 'column', marginTop: 0 },
  practitionerName: {
    fontSize: font(14),
    color: Colors.black,
    fontFamily: 'Arimo-Bold',
    fontWeight: '700'
  },
  practitionerSpeciality: {
    fontSize: font(14),
    color: '#333',
    fontFamily: 'Montserrat-Medium',
  },
  showText: { color: '#000', fontSize: font(14) },
  loadingCss: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    top: 0
  },
  uploadButtonBox: {
    width: '100%',
    padding: 0,
    paddingHorizontal: scale(15),
    marginVertical: vScale(15),
    height: uploadscreenheight,
    marginTop: vScale(5),
  },
  uploadButton: {
    backgroundColor: '#fff',
    textAlign: 'center',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    height: uploadscreenheight,
    shadowColor: Platform.OS == 'ios' ? '#666' : '#000',
    shadowOffset: { width: Platform.OS == 'ios' ? .8 : 1, height: 0 },
    shadowOpacity: Platform.OS == 'ios' ? 0.3 : 0.5,
    shadowRadius: scale(5),
    elevation: Platform.OS == 'ios' ? 3 : 5,
    borderRadius: scale(10),
    padding: 0,
  },
  buttonContent: {
    width: '100%',
    height: vScale(160),
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: scale(10),
    paddingBottom: 0,
    fontSize: font(16),
    color: '#428174',
    borderRadius: scale(7),
    fontWeight: 'bold',
  },
  buttonInnText: {
    color: '#000',
    fontSize: font(16),
    fontFamily: 'Arimo-Bold',
    textAlign: 'center',
    fontWeight: '700'
  },
  uploadIconContainer: {
    backgroundColor: '#229980',
    padding: scale(15),
    borderRadius: scale(50),
    marginTop: vScale(7.5),
    width: scale(70),
    height: scale(70),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  uploadIcon: { color: '#fff', fontSize: font(38) },
  uploadDocumentTxt: {
    padding: Platform.OS == 'ios' ? vScale(10) : 0,
    color: '#000',
    fontSize: font(16),
    fontFamily: 'Arimo-Bold',
    textAlign: 'center',
    fontWeight: '700',
  },
  norecordFound: {
    fontSize: font(14),
    fontFamily: 'Montserrat-Medium',
    color: '#000',
  },
  modalImageViewContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: vScale(400)
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
    objectFit: 'contain',
    resizeMode: 'contain',
  },
  pdfmodalContainer: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: screenheight - vScale(400)
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
    zIndex: 1000,
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: '50%', left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: vScale(10),
    fontSize: font(16),
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
    gap: scale(6),
  },
  closeButtonStyle: { backgroundColor: '#f44336' },
  downloadButtonStyle: { backgroundColor: '#24ad91' },
  downloadButtonDisabled: { backgroundColor: '#9e9e9e', opacity: 0.6 },
hintTxt: {
  color: '#333',
  fontFamily: 'Arimo-Regular',
  fontSize: font(14),
  paddingTop: vScale(10),
  textAlign: 'center',
  lineHeight: font(20), // corrected line height using same scaling logic
},
  noImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(25),
  },
  messageTxt: {
    fontSize: font(20),
    lineHeight: font(28),
    fontFamily: 'Montserrat-Medium',
    color: '#000',
    textAlign: 'center',
  },
  searchBoxes: {
    padding: 0,
    paddingHorizontal: scale(15),
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftGroup: { flexDirection: 'row', alignItems: 'center' },
  searchBoX: {
    padding: 0,
    paddingVertical: vScale(5),
    paddingHorizontal: scale(15),
    flexDirection: 'row',
    alignItems: 'center',
    width: scale(150),
  },
  filtericon: { width: scale(20), height: scale(20), objectFit: 'contain' },
  searchBoXTxt: {
    fontSize: font(17),
    fontFamily: 'Montserrat-Bold',
    color: Colors.black,
    padding: scale(10),
    paddingVertical: vScale(5),
    fontWeight: '700'
  },
});
