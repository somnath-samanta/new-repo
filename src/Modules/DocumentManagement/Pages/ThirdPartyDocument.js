const screen = Dimensions.get("window");
const screenWidth = screen.width;
const screenheight = screen.height;
const bookingscreenWidth = screenWidth - 30
const bookingscreenWidthLeft = bookingscreenWidth - 50;
const uploadscreenheight = screenheight * 0.25;
const bottomscreenheight = Platform.OS === 'ios' ? screenheight * 0.60 : screenheight * 0.62;


import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
    FlatList,
    Text,
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
    AppState
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { getMyDocumentList } from '../Controller/DocumentManagementController';
import Loader from '../../../Utility/Components/Loader';
import Config from '../../../Utility/Config';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
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
import { useNavigationState } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
const renderEmptyComponent = () => {
    return (
        <View style={{ padding: 20, alignItems: 'center' }}>
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
    // console.log("reduxAuthJson", reduxAuthJson);
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
    const insets = useSafeAreaInsets();
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight : insets.top;
    const [modalVisible, setModalVisible] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [fileUri, setFileUri] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [internetIsconnected, setInternetIsconnected] = useState(false);

    const [selectedTimeLine, setSelectedTimeLine] = useState("");
    const [selectedDocumentType, setSelectedDocumentType] = useState("");
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
            //console.log("unsubscribe===================", state.isConnected)
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

    useEffect(() => {
        //console.log("internetIsconnected==========", internetIsconnected)
    }, [internetIsconnected])

    // Handle app state changes when returning from file viewer
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'active') {
                // Clear loading state when app becomes active again
                console.log('App has come to the foreground!');
                setLoading(false);
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    const getThirdPartyDocsFn = (type = "", timeline = "", documentType = "") => {
        try {

            if (type !== "refresh") {
                setLoading(true);
            }
            let searchHash = {
                id: reduxAuthJson.token.loginUserId,
                fetchingFrom: 'APP'
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

                searchHash.documentType = documentType && documentType != "" ? documentType : selectedDocumentType;
            }

            getMyDocumentList(searchHash).then(async (response) => {
                // console.log("response>>>>>>>>>>>>>>>>>", response.PomsPatientDocumentList);
                setRefreshBtnFnFlag(false);
                setAppointmentsDataAfterFilter(response.PomsPatientDocumentList);
                setAppointmentsData(response.PomsPatientDocumentList);
                setRefreshing(false);
                setTimeout(() => {
                    setLoading(false);
                }, 500);
            })

        } catch (error) {
            console.error("Error fetching questionnaire list:", error);
            setRefreshBtnFnFlag(false);
            setLoading(false);
            // Handle error here (e.g., show a toast or alert)
        } finally {
            // setLoading(false); // Ensure loading state is reset
        }
    }


    const handleLoadMore = () => {
        if (appointmentsDataAfterFilter !== null && appointmentsDataAfterFilter !== undefined && appointmentsDataAfterFilter.length > 0) {
            if (!loading && hasMore) {
                setPage(page + 1);
            }
        }
    };

    const renderFooter = () => {
        return loading ? (
            // <View style={{ padding: "30px 10px 10px 10px" }}>
            //     <ActivityIndicator size="large" color="#0000ff" />
            // </View>
            <></>
        ) : null;
    };

    const renderItem = (item) => {
        return <>
            <View style={[styles.appointmentCardMainBox]}>
                <View style={[styles.appointmentCard]}>
                    <View style={styles.appointmentCardRow}>
                        <View style={styles.leftView}>
                            <View style={styles.rowPractitioner}>
                                <View style={styles.textContainer}>
                                    <Text style={styles.practitionerName}>Name : {item?.item?.documentName}</Text>
                                    <Text style={[styles.marginLeftClass, styles.showText]}>Upload date : {moment(item?.item?.createdOn, 'YYYY-MM-DD').format('DD MMM. YY')}</Text>
                                    <Text style={[styles.marginLeftClass, styles.showText]}>Reported date : {moment(item?.item?.report_date, 'YYYY-MM-DD').format('DD MMM. YY')}</Text>
                                    <Text style={styles.practitionerSpeciality}>{item?.item?.documentType}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.rightView}>
                            <View style={styles.actionButtonsContainer}>
                                {
                                    ["jpg", "jpeg", "png"].includes(item?.item?.documentUrl.split(".").pop().toLowerCase()) ?
                                        <TouchableOpacity style={styles.eyeButton} onPress={() => handalShowDocument(item.item)}>
                                            <Ionicons name="eye-outline" size={18} color="#fff" />
                                            <Text style={styles.eyeButtonTxt}>View</Text>
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity style={styles.eyeButton} onPress={() => downloadPDFLink(item.item)}>
                                            <Ionicons name="eye-outline" size={18} color="#fff" />
                                            <Text style={styles.eyeButtonTxt}>View</Text>
                                        </TouchableOpacity>
                                }
                                {/* <TouchableOpacity 
                                    style={[styles.eyeButton, styles.downloadButton]} 
                                    onPress={() => handleDownloadToDevice(item?.item?.documentUrl)}
                                >
                                    <Ionicons name="download-outline" size={18} color="#fff" />
                                    <Text style={styles.eyeButtonTxt}>Save</Text>
                                </TouchableOpacity> */}
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </>
    };

    const handalShowDocument = (obj) => {
        // console.log("handalShowDocument === isconnected======", internetIsconnected)
        // console.log("Document URL:", obj.documentUrl)
        setErrorFlag(false)
        setImageLoading(false)
        if (internetIsconnected) {
            const extension = obj.documentUrl.split(".").pop().toLowerCase();
            // console.log("Document Extension:", extension)
            setDocumentExtension(extension)
            setdocumentUrl(obj.documentUrl);
            setImageShowFlag(true);

        }
        else {
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
            // Request storage permissions on Android (if needed)
            // console.log("Entry downloaded")
            setWebViewLoading(true); // Show loading indicator
            setModalVisible(true);
            // setPdfView(true)
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
        console.log('=== iOS Download/View ===');
        console.log('URL:', pdfUrl);
        
        // Simply open the URL in WebView modal - no download needed
        // WebView will handle the rendering
        setLoading(false);
        setWebViewLoading(true); // Show loading indicator
        setFileUri(pdfUrl);
        setModalVisible(true);
        
        console.log('Opening document in WebView modal');
    };

    const handleDownloadToDevice = async (fileUrl) => {
        try {
            if (!fileUrl) {
                Alert.alert('Error', 'No file to download');
                return;
            }

            setIsDownloading(true);
            console.log('Starting download to device:', fileUrl);
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

            console.log('Download complete:', response.path());
            setIsDownloading(false);

            if (Platform.OS === 'ios') {
                // Show share sheet to save to Files or other apps
                Toast.show('Opening share options...');
                setTimeout(() => {
                    Share.share({
                        url: `file://${response.path()}`,
                        title: fileName,
                        message: `Save ${fileName}`
                    }).then((result) => {
                        if (result.action === Share.sharedAction) {
                            Toast.show('File saved successfully!');
                        }
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
        if (Platform.OS == 'ios') {
            // console.log("=========IOS==");
            downloadPDFForIOS(pdfUrl);
        } else {
            const fileUrl = pdfUrl; // URL of the file
            const extension = await getFileExtension(fileUrl);
            const filePath = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${new Date().getTime()}.${extension}`; // Path to save the file

            ReactNativeBlobUtil.config({
                fileCache: true, // Enable file caching
                path: filePath,  // Destination path
            })
                .fetch('GET', fileUrl)
                .then((res) => {
                    // console.log('File downloaded to:', res.path());

                    // Open the file
                    FileViewer.open(filePath, { showOpenWithDialog: true })
                        .then(() => {
                            setLoading(false);
                            // console.log('FileViewer success');
                        })
                        .catch((error) => {
                            setLoading(false);
                            console.error('FileViewer error:', error);
                            Alert.alert('Error', 'None of your apps can open this file.');
                        });
                })
                .catch((err) => {
                    setLoading(false);
                    console.error('Error downloading file:', err);
                });

        }

    };

    const getFileExtension = async (fileUrl) => {
        // Extract the extension from the file URL
        return fileUrl.split('.').pop().split('?')[0].toLowerCase();
    };

    // const handleFilter = () => {
    //     setFilterFlag(!filterFlag);
    // }

    const handleBackPress = () => {
        //console.log("handleBackPress");
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            // console.log("No previous screen to go back to.");
        }
    }

    const generateUniqueId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
    };

    const handleUpload = () => {
        setFileUploadFlag(true);
    }

    const getDocumentList = (type = "") => {
        setTimeout(() => {
            setFileUploadFlag(false)
        }, 1000);
        setHasMore(true);
        setPage(0);
        setData([])
        setAppointmentsDataAfterFilter([]);
        setAppointmentsData([]);
        getThirdPartyDocsFn(type)
    }

    const refreshBtnFn = () => {
        //console.log("***********yes********3rd*********")
        // refreshBtnFn();
        // setRefreshBtnFnFlag
        setLoading(false);
        setRefreshBtnFnFlag(true);
        getThirdPartyDocsFn("reload")
    }

    const webViewLoadFinish = () => {
        //console.log("webViewLoadFinish================")
        setLoading(false);
    }

    onRefresh = () => {
        setRefreshing(true)
        setSelectedTimeLine("")
        setSelectedDocumentType("")
        setRefreshBtnFnFlag(true);
        getThirdPartyDocsFn("refresh");
    }
    const handleGoBack = () => {
        navigation.goBack();
    };

    const handleFilter = () => {
        // console.log("********")
        setSearchSheetVisible(true);
    }

    const clearFilterFn = () => {
        setSelectedTimeLine("");
        setSelectedDocumentType("");
    }

    const applyFilters = (obj) => {
        if (isconnected) {
            getThirdPartyDocsFn("filter", obj.Timeline, obj.DocumentType);
        } else {
            Toast.show("No internet connection");
        }
    };

    return (

        <View style={styles.container}>
            <View>
                <CustomHeader pageName={routeName}
                    refreshBtnFn={refreshBtnFn} />
            </View>
            <Loader style={styles.loadingCss} loading={loading} />
            <View style={styles.searchBoxes}>
                <View style={styles.leftGroup}>
                    <TouchableOpacity style={[styles.backbtn, styles.backbtnTop]}
                        onPress={() => handleGoBack()}
                    >
                        <FontAwesome6 name="arrow-left-long" size={26} color={Colors.black} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.searchBoX} onPress={() => handleFilter()} >
                        <Image source={require('../../../Utility/Public/images/filter.png')} style={styles.filtericon} />
                        <Text style={styles.searchBoXTxt}>Filters</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.refreshBtn}
                    onPress={() => refreshBtnFn()}
                >
                    <FontAwesome name="refresh" size={26} color="#000" />
                </TouchableOpacity>
            </View>
            <View style={styles.uploadButtonBox}>
                <TouchableOpacity style={styles.uploadButton} onPress={() => handleUpload()}>
                    <View style={styles.buttonContent}>
                        <Text style={styles.buttonInnText}> Upload Your clinical Documents and Reports</Text>
                        <View style={styles.uploadIconContainer}>
                            <Feather name="upload" size={40} color="#fff" style={styles.uploadIcon} />
                        </View>
                        <Text style={styles.hintTxt}>You can upload PDF/Word documents or
                            PNG/JPEG files with max 5MB. </Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.appointmentScreenView}>

                <FlatList
                    data={appointmentsDataAfterFilter}
                    renderItem={renderItem}
                    keyExtractor={(item) => generateUniqueId()}
                    ListFooterComponent={renderFooter}
                    // onEndReached={handleLoadMore}
                    onRefresh={onRefresh}
                    refreshing={refreshing}
                    initialNumToRender={10}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={!loading ? renderEmptyComponent : null} // This will show when the list is empty
                />

            </View>

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
                        <View style={[styles.modalContent, styles.pdfmodalContent]}>
                        {errorFlag ?
                            <View style={styles.noImageContainer}>
                                <Text style={styles.messageTxt}>Image not found or cannot be loaded.</Text>
                            </View>
                            :
                            <>
                            {imageLoading && (
                                <View style={styles.imageLoadingContainer}>
                                    <ActivityIndicator size="large" color="#24ad91" />
                                    <Text style={styles.loadingText}>Loading image...</Text>
                                </View>
                            )}
                            <Image
                                source={{ uri: documentUrl }}
                                style={styles.imageShowBox}
                                onLoadStart={() => {
                                    console.log("Image loading started", new Date().toISOString());
                                    setImageLoading(true);
                                }}
                                onLoadEnd={() => {
                                    console.log("Image loading completed", new Date().toISOString());
                                    setTimeout(() => {
                                        setImageLoading(false);
                                    }, 100);
                                }}
                                resizeMode="contain"
                                onError={(error) => {
                                    console.log("Image loading error:", error.nativeEvent.error);
                                    setErrorFlag(true);
                                    setImageLoading(false);
                                }}
                            />
                            </>
                            
                            }

                        <View style={[styles.bottonBoxes]}>
                            <TouchableOpacity
                                style={[styles.bottonBox, styles.closeButtonStyle]}
                                onPress={() => setImageShowFlag(false)}
                            >
                                <Ionicons name="close-circle-outline" size={18} color="#fff" />
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
                                <Ionicons name="download-outline" size={18} color="#fff" />
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
                        <View style={[styles.modalContainer, styles.pdfmodalContainer]}>
                            <View style={[styles.modalContent, styles.pdfmodalContent]}>
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
                                            onLoadStart={() => {
                                                console.log('Web view start');
                                                setWebViewLoading(true);
                                            }}
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
                                            scalesPageToFit={true}
                                        />
                                        {webViewLoading && (
                                            <View style={styles.webViewLoadingContainer}>
                                                <ActivityIndicator size="large" color="#24ad91" />
                                                <Text style={styles.loadingText}>Loading document...</Text>
                                            </View>
                                        )}
                                    </>
                                }
                                {/* Button to close the modal */}
                                <View style={[styles.bottonBoxes]}>
                                    <TouchableOpacity 
                                        style={[styles.bottonBox, styles.closeButtonStyle]} 
                                        onPress={() => modalColseWevview()}
                                    >
                                        <Ionicons name="close-circle-outline" size={18} color="#fff" />
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
                                        <Ionicons name="download-outline" size={18} color="#fff" />
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
                //style={{ backgroundColor: '#f3f3f3' }}
                // backgroundStyle={{ backgroundColor: '#f3f3f3' }} 
                bodyContent={
                    <>
                        <SearchBottomSheetDesign
                            hidesearchSheet={hidesearchSheet}
                            useFor="thirdPartyDocument"
                            // selectOptionForSendBy={selectOptionForSendBy}
                            // setSelectedSendBy={setSelectedSendBy}
                            applyFilters={applyFilters}
                            setSelectedTimeLine={setSelectedTimeLine}
                            setSelectedDocumentType={setSelectedDocumentType}
                            clearFilterFn={clearFilterFn}
                            // forceClearFilterFlag={forceClearFilterFlag}
                            // selectedSendBy={selectedSendBy}
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
            {/* <Modal
                visible={modalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)} // Close modal on back button
                transparent={true}
            >
                <View style={[styles.modalContainer, styles.pdfmodalContainer]}>
                    <View style={[styles.modalContent, styles.pdfmodalContent]}>
                        <WebView
                            source={{
                                uri:
                                    Platform.OS === 'android'
                                        ? `https://docs.google.com/gview?embedded=true&url=${fileUri}`
                                        : fileUri,
                            }}
                            style={styles.webview}
                            onError={(error) => console.log('WebView error:', error)}
                        />
                        
                        <View style={[styles.bottonBoxes]}>
                            <TouchableOpacity style={styles.bottonBox} onPress={() => modalColseWevview()}>
                                <Text style={styles.eyeButtonTxt}>Close PDF</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.bottonBox} onPress={() => downloadPdf(fileUri)}>
                                <Text style={styles.eyeButtonTxt}>{isDownloading ? 'Downloading...' : 'Download PDF'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal> */}
        </View >
    );
}

export default ThirdPartyDocument;

const styles = StyleSheet.create({
    appointmentCardMainBox: {
        paddingHorizontal: 15,
        marginVertical: 7.5,
    },
    appointmentCard: {
        backgroundColor: '#fff',
        marginBottom: 0,
        marginTop: 0,
        padding: 10,
        paddingVertical: 15,
        shadowColor: Platform.OS == 'ios' ? '#666' : '#000',
        shadowOffset: { width: Platform.OS == 'ios' ? .8 : 1 },
        shadowOpacity: Platform.OS == 'ios' ? 0.3 : 0.5,
        shadowRadius: 5,
        elevation: Platform.OS == 'ios' ? 3 : 5,
        borderRadius: 10,

    },
    appointmentCardRow: {
        flexDirection: 'row', // Align children in a row
        alignItems: 'center',  // Center items vertically
        justifyContent: 'space-between',
        // backgroundColor:'red',
        //paddingBottom: 10,
        // borderBottomWidth: 1,
        // borderColor: '#ddd',
    },
    leftView: {
        width: "70%",
        //backgroundColor:'yellow',
    },
    rightView: {
        width: "30%",
        // position: 'absolute',
        // top: 0,
        // right: 0,
        // width: 75,
        //height: 52,
        padding: 0,
        borderRadius: 0,
        alignItems: 'center',
        // backgroundColor:'blue',
        justifyContent: 'center',
        textAlign: 'center',
        //paddingTop: 15,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center', // Center items vertically
    },
    actionButtonsContainer: {
        flexDirection: 'column',
        gap: 5,
        alignItems: 'center',
    },
    eyeButton: {
        // backgroundColor:'red',
        width: 90,
        //height: 40,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#24ad91',
        borderRadius: 10,
        flexDirection: 'row',
        position: 'relative',
        gap: 5,
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    downloadButton: {
        backgroundColor: '#2196F3',
        marginTop: 5,
    },
    eyeButtonTxt: {
        fontSize: 14,
        color: '#fff',
        textAlign: 'center',
        fontFamily: 'Arimo-Bold',
        fontWeight: 700,
        //marginTop:-5,
    },
    //     docImg:{
    // marginTop:20,
    // backgroundColor:'black',
    // paddingTop:10,
    // paddingBottom:10,
    // position:'absolute',
    // left:0,
    // top:15,
    //     },
    videoIcon: {
        height: 30,
        width: 30,
        objectFit: 'contain',
    },

    status: {
        color: '#ff5e57', // Color for status like "Cancelled"
        fontWeight: '600',
    },

    logoHeight: {
        height: '100%',
        width: '100%'
    },
    videoImg: {
        width: '18px',
        height: '16px',
        marginRight: '7px',
        marginTop: '2px',
        color: 'blue',
        textAlign: 'right'
    },

    callContainer: {

    },
    videoConsultContainer: {

    },

    videoConsultText: {
        color: 'white', // White text color
        fontSize: 16,
        fontWeight: 'bold',
    },

    container: {
        flex: 1,
        backgroundColor: '#dff7f8',
        width: screenWidth,
        height: screenheight,
    },
    panel: {
        position: 'relative',
        zIndex: 9999999,

    },

    styleListTopView: {
        flexDirection: 'row',
        // flexWrap: 'wrap',
        justifyContent: 'flex-start',
        paddingLeft: 3,
        paddingRight: 3,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        //backgroundColor:'red',
        //overflow:'scroll',
        //marginRight:-200,
        //float:'right'
        // position: 'absolute',
        // zIndex: 9999999,
        // top: '90%',
        // overflow:'scroll',
        // paddingBottom:10,

    },
    styleListSecondTopView: {
        marginBottom: 5,
        width: '40%',
        marginLeft: 2,
        marginRight: 2,
        backgroundColor: '#fff',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 0,
        color: '#666',
        fontSize: 14,


    },
    picker: {
        height: 50,                 // Set the height of the picker
        width: '100%',              // Set the width of the picker
        color: '#666',
        fontSize: 12,
        padding: 0,
        margin: 0,
    },
    visibleFilter: {
        display: 'block'
    },
    hiddenFilter: {
        display: 'none'
    },
    appointmentScreenView: {
        // paddingLeft: 10,
        //paddingRight: 15,
        marginTop: 0,
        backgroundColor: '#dff7f8',
        //backgroundColor: 'blue',
        // paddingHorizontal: 15,
        height: bottomscreenheight,
        paddingBottom: 10,
    },

    rowPractitioner: {
        flexDirection: 'row',
        alignItems: 'center', // Center items vertically
        // marginBottom: 8,
        // paddingLeft: 12
    },
    noManIcon: {
        marginRight: 10, // Add spacing between icon and text
    },
    textContainer: {
        flexDirection: 'column', // Stack text vertically
        marginTop: 0
    },
    practitionerName: {
        fontSize: 14, // Adjust font size as needed
        color: Colors.black,
        fontFamily: 'Arimo-Bold',
        fontWeight:'700'
    },
    practitionerSpeciality: {
        fontSize: 14, // Adjust font size as needed
        color: '#333', // Change color to differentiate from name if needed
        fontFamily: 'Montserrat-Medium',
    },

    showText: {
        color: '#000',
        fontSize: 14
    },
    loadingCss: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        left: 0,
        top: 0
    },
    uploadButtonBox: {
        //backgroundColor: 'red',
        width: screenWidth,
        padding: 0,
        paddingHorizontal: 15,
        marginVertical: 15,
        height: uploadscreenheight,
        marginTop: 5,
    },
    uploadButton: {
        backgroundColor: '#fff',
        textAlign: 'center',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: uploadscreenheight,
        shadowColor: Platform.OS == 'ios' ? '#666' : '#000',
        shadowOffset: { width: Platform.OS == 'ios' ? .8 : 1 },
        shadowOpacity: Platform.OS == 'ios' ? 0.3 : 0.5,
        shadowRadius: 5,
        elevation: Platform.OS == 'ios' ? 3 : 5,
        borderRadius: 10,
        padding: 0,
    },
    buttonContent: {
        width: '100%',
        height: 160,
        flexDirection: 'column',
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        // backgroundColor: '#fff',
        padding: 10,
        paddingBottom: 0,
        fontSize: 16,
        color: '#428174',
        borderRadius: 7,
        fontWeight: 'bold',
    },
    buttonInnText: {
        color: '#000',
        fontSize: 16,
        fontFamily: 'Arimo-Bold',
        textAlign: 'center',
        fontWeight:'700'
    },
    uploadIconContainer: {
        backgroundColor: '#229980',
        padding: 15,
        borderRadius: 50,
        marginTop: 7.5,
        width: 70, // Make width and height equal for a circular shape
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden', // Ensures border radius is applied
    },
    uploadIcon: {
        color: '#fff',
        fontSize: 38,
    },
    uploadDocumentTxt: {
        padding: Platform.OS == 'ios' ? 10 : 0,
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    photoModalimage: {
        width: 95,
        height: 95,
        marginTop: 10,
        borderRadius: 10,
        marginBottom: 0,
        borderStyle: 'solid',
        borderColor: '#428174',
        borderWidth: 5,
    },
    norecordFound: {
        fontSize: 14,
        fontFamily: 'Montserrat-Medium',
        color: '#000',
    },
    modalImageViewContainer: {
        flex: 1,

        width: '100%',
        // marginTop: -50,
        justifyContent: 'center',
        alignItems: 'center',

        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        maxHeight: screenheight - 350,

        // padding:10,
    },
    imageShowBox: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },

    pdfmodalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        maxHeight: screenheight - 300,
    },
    pdfmodalContent: {
        width: '100%',
        height: '90%',
        backgroundColor: 'white',
        borderRadius: 0,
        paddingBottom: 0,


    },
    webview: {
        flex: 1,
    },
    webViewLoadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 1000,
    },
    imageLoadingContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -50 }, { translateY: -50 }],
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#24ad91',
        fontFamily: 'Arimo-Regular',
    },
    bottonBoxes: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#fff',
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    bottonBox: {
        flex: 1,
        marginHorizontal: 5,
        backgroundColor: '#24ad91',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    closeButtonStyle: {
        backgroundColor: '#f44336',
    },
    downloadButtonStyle: {
        backgroundColor: '#24ad91',
    },
    downloadButtonDisabled: {
        backgroundColor: '#9e9e9e',
        opacity: 0.6,
    },
    hintTxt: {
        color: '#333',
        fontFamily: 'Arimo-Regular',
        fontSize: 13,
        paddingTop: 10,
        textAlign: 'center'
        //padding: 15,
    },
    noImageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 25,
    },
    messageTxt: {
        fontSize: 20,
        lineHeight: 28,
        fontFamily: 'Montserrat-Medium',
        color: '#000',
        textAlign: 'center',
    },
    searchBoxes: {
        padding: 0,
        paddingHorizontal: 15,
        display: 'flex',
        width: screenWidth,
        // backgroundColor: 'red',
        //height: filterheight,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

    },
    leftGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchBoX: {
        //backgroundColor: 'blue',
        padding: 0,
        paddingVertical: 5,
        paddingHorizontal: 15,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: 150,
    },
    filtericon: {
        width: 20,
        height: 20,
        objectFit: 'contain',
    },
    searchBoXTxt: {
        //backgroundColor: '#fff',
        fontSize: 17,
        fontFamily: 'Montserrat-Bold',
        color: Colors.black,
        padding: 10,
        paddingVertical: 5,
        fontWeight:700
    },

});