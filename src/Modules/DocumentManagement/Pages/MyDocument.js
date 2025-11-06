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
const renderEmptyComponent = () => {
    return (
        <View style={{ padding: 20, alignItems: 'center' }}>
            <Text allowFontScaling={false} style={styles.norecordFound}>No records found</Text>
        </View>
    );
};

function MyDocument({ props }) {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const reduxAuthJson = useSelector((state) => state);
    // console.log("reduxAuthJson", reduxAuthJson);
    // const [appointmentsData, setAppointmentsData] = useState([]);
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
    // const [pdfView, setPdfView] = useState(false);
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
                //setAppointmentsDataAfterFilter([]);
                //setAppointmentsData([]);
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
            // console.log("EventEmitter message=== in my document", message);
            if (message.close_additional_view) {
                setviewDocumentFlag(false);
            }
        })
        return () => {
            listener.remove();
            unsubscribe();
        };
    }, []);

    /*useEffect(() => {
        const handleBackButtonPress = () => {
            if (viewDocumentFlag) {
                setviewDocumentFlag(false);
                return true;
            }
            if (fileUri != "") {
                setFileUri("");
                return true;
            }
            return false; // Allow default behavior if already on Component One
        };

        // Add event listener
        BackHandler.addEventListener("hardwareBackPress", handleBackButtonPress);

        // Clean up event listener on component unmount
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", handleBackButtonPress);
        };
    }, [viewDocumentFlag]);*/

    useEffect(() => {
        const handleBackButtonPress = () => {
            if (viewDocumentFlag) {
                setviewDocumentFlag(false);
                return true; // prevent default back behavior
            }
            if (fileUri !== "") {
                setFileUri("");
                return true;
            }
            return false; // allow default behavior
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            handleBackButtonPress
        );

        return () => backHandler.remove(); // cleanup
    }, [viewDocumentFlag, fileUri]);


    const getAppointmentListFn = (type = "") => {
        try {
            if (type == "") {
                setLoading(true);
            }

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
                // setAppointmentsData(response.PomsPatientDocumentList);
                // setLoading(false);
                setRefreshing(false);
                setTimeout(() => {
                    setLoading(false);
                }, 500);
            })

        } catch (error) {
            console.error("Error fetching questionnaire list:", error);
            setLoading(false);
            // Handle error here (e.g., show a toast or alert)
        }
    }
    const renderFooter = () => {
        return loading ? (
            // <View style={{ padding: "30px 10px 10px 10px" }}>
            //     <ActivityIndicator size="large" color="#0000ff" />
            // </View>
            <></>
        ) : null;
    };

    const renderItem = (item) => {

        // let renderHtml = renderDataHtml(item);
        return <>
            <View style={[styles.appointmentCardMainBox]}>
                <View style={[styles.appointmentCard]}>
                    <View style={styles.appointmentCardRow}>
                        <View style={styles.leftView}>
                            <View style={styles.rowPractitioner}>
                                <View style={styles.textContainer}>
                                    {/* <Text style={styles.practitionerSpeciality}>{item?.item?.documentType}</Text> */}
                                    <Text allowFontScaling={false} style={styles.practitionerName}>{item?.item?.documentName}</Text>
                                </View>
                            </View>
                            <View style={styles.row}>
                                <Text allowFontScaling={false} style={[styles.marginLeftClass, styles.showText]}>{moment(item?.item?.createdOn, 'YYYY-MM-DD').format('DD MMM. YY')}</Text>
                            </View>
                        </View>
                        <View style={styles.rightView}>
                            {
                                ["jpg", "jpeg", "png"].includes(item?.item?.documentUrl.split(".").pop().toLowerCase()) ?
                                    <TouchableOpacity style={styles.eyeButton} onPress={() => handalShowDocument(item.item)}>
                                        <Text allowFontScaling={false} style={styles.eyeButtonTxt}>{item?.item?.documentUrl.split(".")[item?.item?.documentUrl.split(".").length - 1].toString().toLowerCase() === "pdf" ? <Ionicons name="document-text-outline" size={18} color="#fff" />
                                            : item?.item?.documentUrl.split(".")[item?.item?.documentUrl.split(".").length - 1].toString().toLowerCase() === "doc" || item?.item?.documentUrl.split(".")[item?.item?.documentUrl.split(".").length - 1].toString().toLowerCase() === "docx" ? <Ionicons name="document-text-outline" size={18} color="#fff" />
                                                : <Ionicons name="document-text-outline" size={18} color="#fff" />} View</Text>
                                    </TouchableOpacity>
                                    :
                                    <TouchableOpacity style={styles.eyeButton} onPress={() => downloadPDFLink(item.item)}>
                                        <Text allowFontScaling={false} style={styles.eyeButtonTxt}>{item?.item?.documentUrl.split(".")[item?.item?.documentUrl.split(".").length - 1].toString().toLowerCase() === "pdf" ? <Ionicons name="document-text-outline" size={18} color="#fff" />
                                            : item?.item?.documentUrl.split(".")[item?.item?.documentUrl.split(".").length - 1].toString().toLowerCase() === "doc" || item?.item?.documentUrl.split(".")[item?.item?.documentUrl.split(".").length - 1].toString().toLowerCase() === "docx" ? <Ionicons name="document-text-outline" size={18} color="#fff" />
                                                : <Ionicons name="document-text-outline" size={18} color="#fff" />} View</Text>
                                    </TouchableOpacity>

                            }
                        </View>
                    </View>
                </View>
            </View>
        </>;
    };

    const handalShowDocument = (obj) => {
        setErrorFlag(false)
        setImageLoading(false)
        if (isconnected) {
            setdocumentUrl(obj.documentUrl); // ✅ Set the full URL, not just the extension

            setImageShowFlag(true);
        } else {
            Toast.show("No internet connection");
        }
    }


    const downloadFile = async (url) => {
        try {
            // Request storage permissions on Android (if needed)
            //console.log("Entry downloaded")
            setLoading(true);
            setFileUri(url);

        } catch (err) {
            //console.error('Error downloading file:', err);
            //alert('Error', 'Failed to download the document.');
        }
    };

    useEffect(() => {
        if (fileUri && fileUri != "") {
            setModalVisible(true)
            // console.log("webview uri========", `https://docs.google.com/gview?embedded=true&url=${fileUri}`)
        }
    }, [fileUri])

    const downloadPDFLink = Utility.debounceButton((item) => {
        if (isconnected) {
            // Download and preview the document
            setLoading(true);
            downloadPdf(item.documentUrl);
        } else {
            Toast.show("No internet connection");
        }
    }, 300);

    const handleFilter = () => {
        setFilterFlag(!filterFlag);
    }

    const handleBackPress = () => {
        // console.log("handleBackPress");
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            console.log("No previous screen to go back to.");
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
        setAppointmentsDataAfterFilter([]);
        // setAppointmentsData([]);
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
        // console.log("setviewDocumentFlag-----------", viewDocumentFlag)
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

    const downloadPDFForIOS__OLD = async (pdfUrl) => {

        try {
            // setLoading(true);

            // Path to store the downloaded PDF
            // const filePath = pdfUrl;
            const fileNameArray = pdfUrl.split("/")
            const filePath = `${RNFS.DocumentDirectoryPath}/${fileNameArray[fileNameArray.length - 1]}`;


            // Check if the file already exists
            const fileExists = await RNFS.exists(filePath);
            if (fileExists) {
                await RNFS.unlink(filePath);
            }
            //if (!fileExists) {
            //console.log('Downloading PDF...');
            // Download the PDF
            const downloadResult = await RNFS.downloadFile({
                fromUrl: pdfUrl,
                toFile: filePath,
            }).promise;
            if (downloadResult.statusCode !== 200) {
                setLoading(false);
                throw new Error('Failed to download PDF.');
            }
            //console.log("filePath-----", filePath);
            // } else {
            //     console.log("filePath-----exist", filePath);
            // }

            //console.log("-----------ready to open");
            const mimeType = getMimeType(filePath);
            //console.log("MIME Type:", mimeType);

            setLoading(false);

            setTimeout(async () => {
                await FileViewer.open(filePath, { showOpenWithDialog: true });
            }, 500)
        } catch (error) {

            // console.error('Error downloading PDF:', error);
            Alert.alert('Error', 'Could not download the document.');
        } finally {
            setLoading(false);
        }

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
        downloadPDFForIOS(pdfUrl);
        return
        if (Platform.OS == 'ios') {
            downloadPDFForIOS(pdfUrl);
        } else {
            const fileUrl = pdfUrl; // URL of the file
            const extension = await getFileExtension(fileUrl);
            const filePath = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${new Date().getTime()}.${extension}`; // Path to save the file
            const mimeType = getMimeType(filePath);
            //console.log("MIME Type:", mimeType);
            ReactNativeBlobUtil.config({
                fileCache: true, // Enable file caching
                path: filePath,  // Destination path
            })
                .fetch('GET', fileUrl)
                .then((res) => {
                    // console.log('File downloaded to:', res.path());

                    // Open the file
                    FileViewer.open(filePath, { mimeType })
                        .then(() => {
                            setLoading(false);
                            //console.log('FileViewer success');
                        })
                        .catch((error) => {
                            setLoading(false);
                            //console.error('FileViewer error:', error);
                            Alert.alert('Error', 'None of your apps can open this file.');
                        });
                })
                .catch((err) => {
                    setLoading(false);
                    //console.error('Error downloading file:', err);
                });
        }


    };

    const getFileExtension = async (fileUrl) => {
        // Extract the extension from the file URL
        return fileUrl.split('.').pop().split('?')[0].toLowerCase();
    };

    const refreshBtnFn = () => {
        setLoading(false);
        getAppointmentListFn()
    }
    // console.log("documentUrl>>>>>>", documentUrl)
    // console.log("imageShowFlag>>>>>>", imageShowFlag)
    const imageViewCloseFN = () => {
        setdocumentUrl("")
        setImageShowFlag(false)
    }

    const webViewLoadFinish = () => {
        // console.log("webViewLoadFinish================")
        setLoading(false);
    }

    onRefresh = () => {
        setRefreshing(true)
        getAppointmentListFn("refresh")
    }
    const callbackhandler = () => {
        setviewDocumentFlag(false);
    }
    const handleGoBack = () => {
        navigation.goBack();

    };

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
            {/* <HeaderBar
                title="My Document"
                onBackPress={handleBackPress}
                onFilterPress={handleFilter}
                filterHide={true}
            /> */}
            <TouchableOpacity style={[styles.backbtn, styles.backbtnTop]}
                onPress={handleGoBack}
            >
                <FontAwesome6 name="arrow-left-long" size={26} color={Colors.black} />
            </TouchableOpacity>
            {!viewDocumentFlag &&
                <>
                    <View style={styles.infoBox}>
                        <View style={styles.inninfoBox}>
                            <Text allowFontScaling={false} style={styles.mainHeading}>Valid forms of  Photo IDs</Text>
                            {items.map((item, index) => (
                                <View key={index} style={styles.listItem}>
                                    <Text allowFontScaling={false} style={styles.bullet}><Entypo name="dot-single" size={20} color="#000" style={styles.bulletStyle} /></Text>
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
                                <Text allowFontScaling={false} style={styles.hintTxt}>You can upload PDF/Word document or PNG/JPEG  files with Max 5 MB.</Text>
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
                        ListEmptyComponent={!loading ? renderEmptyComponent : null} // This will show when the list is empty
                    />
                </View>
            }

            <GlobalModal
                visible={fileUploadFlag}
                onCancel={() => setFileUploadFlag(false)}
                footer={false}
                header={true}
                headerTitle={
                    <View >
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
                            {errorFlag ?
                                <View style={styles.noImageContainer}>
                                    <Text allowFontScaling={false} style={styles.messageTxt}>Document not found or cannot be loaded.</Text>
                                </View>
                                :
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
                                            console.log("Document loading started", new Date().toISOString());
                                            setImageLoading(true);
                                        }}
                                        onLoadEnd={() => {
                                            console.log("Document loading completed", new Date().toISOString());
                                            setTimeout(() => {
                                                setImageLoading(false);
                                            }, 100);
                                        }}
                                        resizeMode="contain"
                                        onError={(error) => {
                                            console.log("Document loading error:", error.nativeEvent.error);
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




            {/* {imageShowFlag && documentUrl && documentUrl.trim() !== "" && (
                <ImageView
                    images={[
                        {
                            source: {
                                uri: documentUrl,
                            },
                        },
                    ]}
                    //imageIndex={0}
                    isVisible={imageShowFlag}
                    onClose={() => { imageViewCloseFN() }}
                //onClose={() => { setImageShowFlag(!imageShowFlag) }}
                //  renderFooter={(currentImage) => (<View><Text>My footer</Text></View>)}
                />
            )} */}

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
                                                <Text allowFontScaling={false} style={styles.loadingText}>Loading document...</Text>
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
        </View >
    );
}

export default MyDocument;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#dff7f8',
        width: screenWidth,

        // height: screenheight,
    },

    infoBox: {
        width: screenWidth,
        // On small iPhones give a floor so it doesn't crowd;
        // On Android (and larger iPhones) let content decide the height
        minHeight: isSmallIOS ? fortyPercentOfScreenHeight : undefined,
        padding: 15,
        paddingTop: 0,
    },

    inninfoBox: {
        width: '100%',
        // height: '100%',            // ✅ let it size to its content
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 5,
        shadowColor: Platform.OS == 'ios' ? '#666' : '#000',
        shadowOffset: { width: Platform.OS == 'ios' ? .8 : 1 },
        shadowOpacity: Platform.OS == 'ios' ? 0.3 : 0.5,
        shadowRadius: 5,
        elevation: Platform.OS == 'ios' ? 3 : 5,
    },
    mainHeading: {
        color: '#000',
        fontSize: 16,
        fontFamily: 'Montserrat-Bold',
        marginBottom: 10,
        fontWeight: 700
    },
    listItem: {
        //backgroundColor: 'red',
        flexDirection: 'row', // Align children in a row
        alignItems: 'flex-start',  // Center items vertically
        justifyContent: 'flex-start',
        paddingVertical: 1,
        //height:liHeight,
    },
    bullet: {
        color: '#000', // White text color
        //backgroundColor:'yellow',
        width: "10%",
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        paddingLeft: 5,
    },
    itemText: {
        color: '#000', // White text color
        fontSize: 14,
        fontFamily: 'Arimo-Regular',
        lineHeight: 22,
        flexWrap: 'wrap',
        //backgroundColor:'blue',
        width: "90%",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    uploadButtonBox: {
        //backgroundColor: 'red',
        width: screenWidth,
        padding: 0,
        paddingHorizontal: 15,
    },
    uploadButton: {
        backgroundColor: '#fff',
        textAlign: 'center',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Platform.OS == 'ios' ? '#666' : '#000',
        shadowOffset: { width: Platform.OS == 'ios' ? .8 : 1 },
        shadowOpacity: Platform.OS == 'ios' ? 0.3 : 0.5,
        shadowRadius: 5,
        elevation: Platform.OS == 'ios' ? 3 : 5,
        borderRadius: 5,
        padding: 10,
        paddingHorizontal: 15,
    },
    buttonContent: {
        width: '100%',
        height: Platform.OS == 'ios' ? 200 : 170,
        flexDirection: 'column',
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        //backgroundColor: '#fff',
        fontSize: 16,
        color: '#428174',
        borderRadius: 7,
        fontWeight: 'bold',
        padding: 0,
    },
    uploadIconContainer: {
        backgroundColor: '#24ad91',
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
        fontSize: 32,
    },
    buttonInnText: {
        color: '#000',
        fontSize: 18,
        fontFamily: 'Montserrat-Bold',
        fontWeight: 700
    },
    // uploadIcon: {
    //     //marginRight: 8, // Adjust spacing as needed
    //     backgroundColor: '#24ad91',
    //     padding: 15,
    //     borderRadius: 50,
    //     color: '#fff',
    //     marginTop: 15,
    // },
    allDocumentBox: {
        width: screenWidth,
        paddingHorizontal: 15,
        display: 'flex',
        //justifyContent:'center',
        alignItems: 'center',
    },
    allDocument: {
        backgroundColor: '#24ad91',
        width: '60%',
        //padding: 15,
        marginTop: 15,
        borderRadius: 10,
        shadowColor: '#666',
        shadowOffset: { width: .5 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 2,

    },
    allDocumentText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Arimo-Bold',
        textAlign: 'center',
        padding: 15,
        textAlign: 'center',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: 700



    },
    backArrow: {
        position: 'absolute',
        left: 15,
        top: -50,
        zIndex: 999,
        backgroundColor: '#000',
    },
    appointmentCardMainBox: {
        //backgroundColor:'blue',
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
        //backgroundColor:'blue',
        justifyContent: 'center',
        textAlign: 'center',
        //paddingTop: 15,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center', // Center items vertically
    },
    documentTypeColumn: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
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
    eyeButtonTxt: {
        fontSize: 14,
        color: '#fff',
        textAlign: 'center',
        fontFamily: 'Arimo-Bold',
        fontWeight: 700,
        //marginTop:-5,
    },
    videoIcon: {
        height: 30,
        width: 30,
        objectFit: 'contain',
    },

    appointmentScreenView: {
        // paddingLeft: 10,
        //paddingRight: 15,
        marginTop: 0,
        backgroundColor: '#dff7f8',
        paddingHorizontal: 0,
        //backgroundColor:'blue',
        height: Platform.OS == 'ios' ? screenheight - 100 : screenheight - 55,
        paddingBottom: 10,
    },

    rowPractitioner: {
        flexDirection: 'row',
        alignItems: 'center', // Center items vertically
        // marginBottom: 8,
        // paddingLeft: 12
    },
    textContainer: {
        flexDirection: 'column', // Stack text vertically
        marginTop: 0,

    },
    practitionerName: {
        fontSize: 14, // Adjust font size as needed
        color: Colors.black,
        fontFamily: 'Montserrat-Medium',
    },
    practitionerSpeciality: {
        fontSize: 14, // Adjust font size as needed
        color: '#747474', // Change color to differentiate from name if needed
        fontFamily: 'Montserrat-Medium',
    },
    marginLeftClass: {
        // marginLeft: 12
    },
    showText: {
        color: Colors.black,
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
    uploadDocumentTxt: {
        padding: Platform.OS == 'ios' ? 10 : 0,
        color: '#000',
        fontSize: 16,
        fontFamily: 'Arimo-Bold',
        textAlign: 'center',
        fontWeight: 700,
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
    modalImageViewContainer: {
        width: '100%',
        // marginTop: -50,
        justifyContent: 'center',
        alignItems: 'center',

        //backgroundColor: 'red',
        // maxHeight: screenheight - 350,
        maxHeight: 400

        // padding:10,
    },
    imgmodalContent: {
        width: '100%',
        height: '100%',
        borderRadius: 0,
        paddingBottom: 0,
        marginTop: 0
    },
    imageShowBox: {
        // width: 'auto',
        // maxWidth: '100%',
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        resizeMode: 'contain',

        // objectFit:'cover',
    },

    containerPdf: {
        // flex: 1,
        // justifyContent: 'flex-start',
        // alignItems: 'center',
        // // marginTop: 25,
        // borderWidth: 1,
        // borderColor: 'red',
        // padding: 20,
        // marginBottom: 200,
    },
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
        //maxHeight: screenheight - 300,
        maxHeight: screenheight - 400
    },
    pdfmodalContent: {
        width: '100%',
        height: '100%',
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
    norecordFound: {
        fontSize: 14,
        fontFamily: 'Arimo-Regular',
        color: '#000',
    },
    hintTxt: {
        color: '#333',
        fontFamily: 'Arimo-Regular',
        fontSize: 14,
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
        fontFamily: 'Arimo-Regular',
        color: '#000',
        textAlign: 'center',
    },
    backbtnTop: {
        width: 40,
        height: 35,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: "#24ad91",
        marginTop: 0,
        left: 15,

    }


});

