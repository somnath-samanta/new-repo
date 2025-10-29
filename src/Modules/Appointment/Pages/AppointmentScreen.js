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
    BackHandler,
    StatusBar,
    Alert,
    Platform,
    LogBox
} from 'react-native';

// Suppress orientation change warning (app uses static dimensions)
LogBox.ignoreLogs(['instanceHandle is null']);
import { useSelector, useDispatch } from 'react-redux';
import { SelectList } from 'react-native-dropdown-select-list';
import moment from 'moment';
import { getAppointmentList, pomsAppointmentUpdate, get_pricing_details, cancelAppointment, getPractitionerList } from '../Controller/AppointmentController';
import Loader from '../../../Utility/Components/Loader';
import Config from '../../../Utility/Config';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Colors from '../../../Utility/Colors';
import GlobalBottomSheet from '../../../Utility/Components/GlobalBottomSheet';
import BottomSheetDesign from '../Components/BottomSheetDesign';
import SearchBottomSheetDesign from '../../../Utility/Components/SearchBottomSheetDesign';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { WebView } from 'react-native-webview';
import Entypo from 'react-native-vector-icons/Entypo';
import GlobalModal from '../../../Utility/Components/GlobalModal';
import CustomHeader from '../../../Utility/Components/CustomHeader'
import { useNavigationState } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NetInfo from "@react-native-community/netinfo";
import Toast from 'react-native-simple-toast';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

const screen = Dimensions.get("window");
const screenWidth = screen.width;
const screenheight = screen.height;
const nextAppointmentBoxheight = screenheight * 0.25;
const nextAppointmentBoxInnheight = Platform.OS == 'ios' ? screenheight * 0.18 : screenheight * 0.18;
const filterheight = screenheight * 0.06;
const flatListHeight = Platform.OS == "ios" ? screenheight * 0.57 : screenheight * 0.60;
const flatListHeightFull = Platform.OS == "ios" ? screenheight * 0.80 : screenheight * 0.85;


const renderEmptyComponent = () => {
    return (
        <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={styles.norecordFound}>No records found</Text>
        </View>
    );
};

const handalFeedback = () => {
    Alert.alert(
        "Confirmation",
        "Please note that you will be redirected to our website or the OC Patient Portal to complete this task",
        [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "Yes",
                onPress: () => {
                    Linking.openURL(Config.feedbackUrl).catch((err) =>
                        console.error("Couldn't load page", err)
                    );
                },
            },
        ],
        { cancelable: true } // Allow dismissal by tapping outside the alert
    );
};
const handalPrescription = () => {
    // console.log("handalPrescription");
    Linking.openURL(Config.feedbackUrl).catch((err) => console.error("Couldn't load page", err));
}

const handalSupport = () => {
    Alert.alert(
        "Confirmation",
        "Please note that you will be redirected to our website or the OC Patient Portal to complete this task",
        [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "Yes",
                onPress: () => {
                    Linking.openURL(Config.supportUrl).catch((err) =>
                        console.error("Couldn't load page", err)
                    );
                },
            },
        ],
        { cancelable: true } // Allow dismissal by tapping outside the alert
    );
};
function AppointmentScreen(props) {

    const navigation = useNavigation();
    const dispatch = useDispatch();
    const reduxAuthJson = useSelector((state) => state);
    // console.log("reduxAuthJson", reduxAuthJson);
    const [appointmentsData, setAppointmentsData] = useState([]);
    const [appointmentsDataAfterFilter, setAppointmentsDataAfterFilter] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSheetVisible, setSheetVisible] = useState(false);
    const [appointmentCancelObj, setAppointmentCancelObj] = useState({});
    const [webViewFlag, setWebViewFlag] = useState(false);
    const [webViewFlagForBookFollowUp, setWebViewFlagForBookFollowUp] = useState(false);
    const [nextAppointment, setNextAppointment] = useState(null);
    const [forceClearFilterFlag, setForceClearFilterFlag] = useState(false);
    const hideBottomSheet = () => setSheetVisible(false);
    // const snapPoints = ['50%'];
    const [snapPoints, setSnapPoints] = useState(['35%']);
    const [issearchSheetVisible, setSearchSheetVisible] = useState(false);
    // const hidesearchSheet = () => setSearchSheetVisible(!issearchSheetVisible);
    const [cancellationType, setCancellationType] = useState("");
    const [cancellationPrice, setCancellationPrice] = useState(0);
    const [appointmentPrice, setAppointmentPrice] = useState(0);
    const [refundPrice, setRefundPrice] = useState(0);
    const [cancellationAppointmentFlag, setCancellationAppointmentFlag] = useState(false);
    const [refreshBtnFnFlag, setRefreshBtnFnFlag] = useState(false);

    // const [selectedTimeline, setSelectedTimeLine] = React.useState("");
    const [selectedTimeLine, setSelectedTimeLine] = useState("");
    const routeName = useNavigationState(state => state.routeNames[state.index]);
    const insets = useSafeAreaInsets();
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight : insets.top;
    const [selectedPaymentStatus, setSelectedPaymentStatus] = React.useState("");
    const [selectedPaymentMode, setSelectedPaymentMode] = React.useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [isconnected, setIsconnected] = useState(false);
    const [isProcessingTouchableOpacity, setIsProcessingTouchableOpacity] = useState(false);
    const [contactUsFlag, setContactUsFlag] = useState(false);
    const [practList, setPractList] = useState([]);
    const [webViewSourceUrl, setWebViewSourceUrl] = useState({});

    const { reload } = props.route.params || {};
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



    /*useEffect(() => {
        const handleBackButtonPress = () => {
            hideBottomSheet();
            setSearchSheetVisible(false);
            if (webViewFlag || webViewFlagForBookFollowUp) {
                // Go back to Component One
                setWebViewFlag(false);
                setWebViewFlagForBookFollowUp(false);
                return true; // Prevent default back button behavior
            }
            return false; // Allow default behavior if already on Component One
        };

        // Add event listener
        BackHandler.addEventListener("hardwareBackPress", handleBackButtonPress);

        // Clean up event listener on component unmount
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", handleBackButtonPress);
        };
    }, [webViewFlag, webViewFlagForBookFollowUp]);*/

    useEffect(() => {
        const handleBackButtonPress = () => {
            // Always hide bottom sheet first
            hideBottomSheet();
            setSearchSheetVisible(false);

            // Handle WebView flags
            if (webViewFlag || webViewFlagForBookFollowUp) {
                setWebViewFlag(false);
                setWebViewFlagForBookFollowUp(false);
                return true; // prevent default back button action
            }

            return false; // let default behavior happen
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            handleBackButtonPress
        );

        // cleanup
        return () => backHandler.remove();
    }, [webViewFlag, webViewFlagForBookFollowUp, hideBottomSheet]);

    useEffect(() => {
        if (reload && reload == true) {
            navigation.setParams({ reload: undefined });
            setForceClearFilterFlag(false);
            getAppointmentListFn();
            return () => {
                setAppointmentsDataAfterFilter([]);
                setAppointmentsData([]);
                setWebViewFlag(false);
                setWebViewFlagForBookFollowUp(false);
                clearFilterFn();
                setForceClearFilterFlag(true);
            };
        }
    }, [reload])


    useFocusEffect(
        React.useCallback(() => {
            setForceClearFilterFlag(false);
            getAppointmentListFn();
            getPractitionerListFn();
            return () => {
                // setAppointmentsDataAfterFilter([]);
                // setAppointmentsData([]);
                setWebViewFlag(false);
                setWebViewFlagForBookFollowUp(false);
                clearFilterFn();
                setForceClearFilterFlag(true);
            };
        }, [])
    );


    const convertToUTC = (appointmentDate, appointmentTime) => {
        // Parse date in DD-MM-YYYY format
        const [day, month, year] = appointmentDate.split("-").map(Number);

        // Parse time and period (am/pm)
        let [time, period] = appointmentTime.split(" ");
        let [hours, minutes] = time.split(":").map(Number);

        // Convert 12-hour to 24-hour format
        if (period.toLowerCase() === "pm" && hours !== 12) {
            hours += 12;
        } else if (period.toLowerCase() === "am" && hours === 12) {
            hours = 0;
        }

        // Create a Date object in local time
        const localDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));

        return localDate;
    }

    const nextAppointmentData = () => {
        // Get current UTC time
        const nowUTC = new Date();

        // Convert each appointment date and time to UTC
        const upcomingAppointments = appointmentsData
            .map(appointment => {
                const utcDateTime = convertToUTC(appointment.appointmentDate, appointment.appointmentTime);
                return { ...appointment, utcDateTime };
            })
            // Filter for future appointments only
            .filter(appointment => appointment.utcDateTime > nowUTC && (appointment.appointmentStatus === "Approved" || appointment.appointmentStatus === "In Progress"));

        // Sort appointments by closest future date
        upcomingAppointments.sort((a, b) => a.utcDateTime - b.utcDateTime);

        // Get the closest upcoming appointment
        const closestAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;

        // console.log("Closest Upcoming Appointment:", closestAppointment);
        setNextAppointment(closestAppointment)
    }



    useEffect(() => {
        if (appointmentsData && appointmentsData != undefined && appointmentsData.length > 0) {
            nextAppointmentData();
        } else {
            setNextAppointment(null)
        }
    }, [appointmentsData]);

    const getPractitionerListFn = () => {
        getPractitionerList().then(async (response) => {
            processPractitioners(response)

        }).catch((error) => {
            console.log(error);

        });
    }

    const processPractitioners = (result) => {
        let practitionerList = result?.PractitionerList || [];
        let finalJson = [];

        if (practitionerList.length === 0) {
            // history.push("/nosearch-results");
        }

        practitionerList.forEach((practitioner) => {
            let nameList = practitioner.name || [];
            let id = practitioner.id || "";
            let finalname = "Unknown";
            let firstLastName = "Unknown";
            let speciality = practitioner.speciality || "";
            let communication = practitioner.communication || [];
            let gender = practitioner.gender || "Unknown";

            nameList.forEach((name) => {
                if (name.use === "official") {
                    finalname = `${name.prefix?.[0] || ""} ${name.given?.[0] || ""} ${name.family || ""}`.trim();
                    firstLastName = `${name.given?.[0] || ""} ${name.family || ""}`.trim();
                }
            });

            let finallang = communication
                .flatMap((commlist) => commlist.coding?.map((coding) => coding.display) || [])
                .join(", ");

            let qualificationList = practitioner.qualification || [];
            let finalqualification = qualificationList
                .flatMap((qualification) => qualification.code.coding?.map((qualf) => qualf.code) || [])
                .join(", ");

            let photourl = practitioner.photo?.[0]?.url || "";

            let ratings = parseFloat(practitioner.ratings) || 1;

            finalJson.push({
                id,
                name: finalname,
                firstLastName,
                yearsOfExp: practitioner.yearsOfExp || 0,
                ratings,
                overAllRatings: practitioner.overAllRatings || 0,
                languages: finallang,
                qualification: finalqualification,
                photo: photourl,
                code: speciality,
                gender,
                subspeciality: practitioner.subspeciality || "",
            });
        });

        finalJson.sort((a, b) => (b.ratings || 1) - (a.ratings || 1));
        setPractList(finalJson);
    };


    const getAppointmentListFn = (type = "") => {
        try {
            if (type == "") {
                setLoading(true);
            }
            getAppointmentList({ id: reduxAuthJson.token.loginUserId }).then(async (response) => {
                setAppointmentsDataAfterFilter(response.PomsAppointmentList);
                setAppointmentsData(response.PomsAppointmentList);
                setRefreshBtnFnFlag(false);
                setRefreshing(false);
                setTimeout(() => {
                    setLoading(false);
                }, 500);

            }).catch((error) => {
                console.error("Error in getAppointmentList:", error);
                setLoading(false);
                setRefreshBtnFnFlag(false);
                setRefreshing(false);
            });

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

    const applyFilters = (obj) => {
        if (isconnected) {

            // Make a copy of appointmentsData so that all filters can be applied sequentially
            let filteredData = [...appointmentsData]; // Ensure it's a new reference

            // Apply timeline filter
            if (obj['Timeline'] !== null && obj['Timeline'] !== "") {
                let timeLine = obj['Timeline']
                // if (obj['Timeline'] !== null) {
                //     timeLine = obj['Timeline']
                // }
                const pastDate = moment().subtract(timeLine, 'days').format('YYYY-MM-DD');
                // filteredData = filteredData.filter(appointment =>
                //     moment(appointment.appointmentDate, 'DD-MM-YYYY').format('YYYY-MM-DD') >= pastDate
                // );

                const today = moment().format('YYYY-MM-DD');

                filteredData = filteredData.filter(appointment => {
                    const appointmentDate = moment(appointment.appointmentDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
                    return appointmentDate >= pastDate && appointmentDate <= today;
                });
            }

            // Filter by appointmentStatus
            if (obj['PaymentStatus'] !== null && obj['PaymentStatus'] !== "") {
                let paymentStatus = obj['PaymentStatus']
                // if (obj['PaymentStatus'] !== null) {
                //     paymentStatus = obj['PaymentStatus']
                // }
                filteredData = filteredData.filter(appointment => {
                    return appointment.appointmentStatus.toLowerCase() === paymentStatus.toLowerCase();
                });
            }

            // Filter by appointmentPayType
            if (obj['PaymentMode'] !== null && obj['PaymentMode'] !== "") {
                let paymentMode = obj['PaymentMode']
                // if (obj['PaymentMode'] !== null) {
                //     paymentMode = obj['PaymentMode']
                // }
                filteredData = filteredData.filter(appointment => {
                    return appointment.appointmentPayType.toLowerCase() === paymentMode.toLowerCase()
                });
            }

            // Only now update the state after all filtering is complete
            setAppointmentsDataAfterFilter(filteredData);
        } else {
            Toast.show("No internet connection");
        }
    };

    const handleBottomSheetShow = (item) => {
        if (isProcessingTouchableOpacity) return; // Prevent multiple clicks
        setIsProcessingTouchableOpacity(true);
        setAppointmentCancelObj(item);
        setSheetVisible(true);
        setIsProcessingTouchableOpacity(false);
    }

    const formatAMPM = (date) => {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }

    const convertTime12to24 = (time12h) => {
        const [time, modifier] = time12h.split(' ');

        let [hours, minutes] = time.split(':');

        if (hours === '12') {
            hours = '00';
        }

        if (modifier === 'pm') {
            hours = parseInt(hours, 10) + 12;
        }

        return `${hours}:${minutes}`;
    }

    const goToVideoScreen = async (obj) => {
        try {
            setLoading(true);
            const result = await pomsAppointmentUpdate({ id: obj.id });

            let ele = result?.data?.PomsAppointmentUpdate;
            if (ele) {

                let currentDate = moment(new Date()).format("DD-MM-YYYY");
                let startbutton = false;

                let appointmentTime = ele["appointmentTime"];
                let currentTime = formatAMPM(new Date());
                let appTime = convertTime12to24(appointmentTime).split(":");
                let cTime = convertTime12to24(currentTime).split(":");
                let differenceInMin = appTime[1] - cTime[1];
                let differenceInHours = appTime[0] - cTime[0];
                let resultInMinutes2 = Math.round(differenceInHours * 60);
                let resultInMinutes = resultInMinutes2 + differenceInMin;
                if (resultInMinutes) {
                    if (resultInMinutes <= 15 && resultInMinutes >= -5) {
                        startbutton = true;
                    }
                }

                let videoDetailsObj = {
                    id: ele["id"],
                    practitionerName: ele["practitionerName"],
                    practitionerId: ele["practitionerId"],
                    practitionerSpeciality: ele["practitionerSpeciality"],
                    appointmentDate: ele["appointmentDate"],
                    appointmentDate1: ele["appointmentDate"].split("-"),
                    todayDate: currentDate.split("-"),
                    appointmentTime: ele["appointmentTime"],
                    startbuttonOpen: startbutton,
                    differenceInMin: resultInMinutes,
                    slotId: ele["slotId"],
                    patientName:
                        ele["appointmentBookedByFirstName"] +
                        " " +
                        ele["appointmentBookedBySurName"],
                    appointmentCreatedOn: ele["appointmentCreatedOn"],
                    appointmentFor: ele["appointmentFor"],
                    appointmentNumber: ele["appointmentNumber"],
                    appointmentBookedBy: ele["appointmentBookedBy"],
                    appointmentBookedId: ele["appointmentBookedId"],
                    appointmentBookedDOB: ele["appointmentBookedDOB"],
                    appointmentType: ele["appointmentType"],
                    appointmentMode: ele["appointmentMode"],
                    appointmentDuration: ele["appointmentDuration"],
                    appointmentBookedByTitle: ele["appointmentBookedByTitle"],
                    appointmentBookedByFirstName: ele["appointmentBookedByFirstName"],
                    appointmentBookedBySurName: ele["appointmentBookedBySurName"],
                    appointmentBookedByGender: ele["appointmentBookedByGender"],
                    appointmentBookedByEmail: ele["appointmentBookedByEmail"],
                    appointmentBookedByPhoneNumber:
                        ele["appointmentBookedByPhoneNumber"],
                    appointmentBookedForTitle: ele["appointmentBookedForTitle"],
                    appointmentBookedForFirstName: ele["appointmentBookedForFirstName"],
                    appointmentBookedForSurName: ele["appointmentBookedForSurName"],
                    appointmentBookedForGender: ele["appointmentBookedForGender"],
                    appointmentBookedForEmail: ele["appointmentBookedForEmail"],
                    appointmentBookedForPhoneNumber:
                        ele["appointmentBookedForPhoneNumber"],
                    appointmentBookedForRelationship:
                        ele["appointmentBookedForRelationship"],
                    appointmentNeedLanguageSupport:
                        ele["appointmentNeedLanguageSupport"],
                    appointmentSpecialNotes: ele["appointmentSpecialNotes"],
                    appointmentPrice: ele["appointmentPrice"],
                    appointmentPayType: ele["appointmentPayType"],
                    appointmentPMIName: ele["appointmentPMIName"],
                    appointmentPMIResponsibleParty:
                        ele["appointmentPMIResponsibleParty"],
                    appointmentPMIFirstName: ele["appointmentPMIFirstName"],
                    appointmentPMISurName: ele["appointmentPMISurName"],
                    appointmentGroupId: ele["appointmentGroupId"],
                    appointmentMemberPolicyNumber: ele["appointmentMemberPolicyNumber"],
                    appointmentExpiresOn: ele["appointmentExpiresOn"],
                    appointmentPMIAuthorisationCode:
                        ele["appointmentPMIAuthorisationCode"],
                    appointmentPMIAuthorisationSession:
                        ele["appointmentPMIAuthorisationSession"],
                    appointmentThirdPartyName: ele["appointmentThirdPartyName"],
                    appointmentThirdPartyId: ele["appointmentThirdPartyId"],
                    appointmentThirdPartyComments: ele["appointmentThirdPartyComments"],

                    appointmentPatientTechAbility: ele["appointmentPatientTechAbility"],
                    appointmentPatientMentalAbility:
                        ele["appointmentPatientMentalAbility"],
                    appointmentPatientConsent: ele["appointmentPatientConsent"],
                    appointmentStatus: ele["appointmentStatus"],
                    videoSessionId: ele["videoSessionId"],
                    videoSessionToken: ele["videoSessionToken"],
                    videoAPIKey: ele["videoAPIKey"],
                    videoAPISecret: ele["videoAPISecret"],
                    prescriptions: ele["prescriptions"],
                    letters: ele["letters"],
                    diagnosis: ele["diagnosis"],
                    disorderDetails: ele["disorderDetails"],
                    videoStartTime: ele["videoStartTime"],
                    videoEndTime: ele["videoEndTime"],
                    currentVideoTime: ele["currentVideoTime"],
                    isStartVideoClicked: ele["isStartVideoClicked"],
                }

                let dataHash = {
                    "refreshToken": reduxAuthJson.token.refreshToken,
                    "accesToken": reduxAuthJson.token.accesToken,
                    "tokenExpiryDate": reduxAuthJson.token.tokenExpiryDate,
                    "PatientDetails": reduxAuthJson.currentUserDetails,
                    "videoDetails": videoDetailsObj
                }

                const data = JSON.stringify(dataHash);
                const encodedData = encodeURIComponent(data);
                setWebViewSourceUrl({ uri: `${Config.videoCallLink}?data=${encodedData}` })
                //  const url = `${Config.videoCallLink}?data=${encodedData}`;
                //  const url = `https://73dd-122-160-113-252.ngrok-free.app/appointment/video-consultation?data=${encodedData}`;
                // Linking.openURL(url);
                setLoading(false);
                setWebViewFlag(true);

            }

        } catch (error) {
            setLoading(false);
            console.error(error);
        }
    }


    const getStatusName = (status) => {
        return <Text style={[styles.statusText, styles.yetToConfirm]}>{status}</Text>;
        /*switch (status) {
            case 'pending':
                return <Text style={[styles.statusText, styles.yetToConfirm]}>Pending</Text>;
            case 'completed':
                return <Text style={[styles.statusText, styles.completed]}>Completed</Text>;
            case 'cancelled':
                return <Text style={[styles.statusText, styles.cancelled]}>Cancelled</Text>;
            case 'in progress':
                return <Text style={[styles.statusText, styles.ongoing]}>In Progress</Text>;
            default:
                return <Text style={[styles.statusText, styles.upcoming]}>Upcoming</Text>;
        }*/
    }

    const onRefresh = () => {
        setRefreshing(true)
        setRefreshBtnFnFlag(true);
        getAppointmentListFn("refresh");
    }

    const renderItem = (obj) => {
        return <>
            <View style={styles.nextAppointmentBoxMain}>
                <View style={[styles.nextAppointmentBox, styles.nextAppointmentBoxFlatList]}>
                    <View style={styles.innnextAppointmentBox}>
                        <View style={[styles.innnextAppointmentBoxLeft, styles.innnextAppointmentBoxLeftFlatList]}>
                            <View style={styles.appointmentScreenView}>
                                <View style={[styles.appointmentCard]}>
                                    <View style={styles.appointmentCardRow}>
                                        <View style={[styles.leftView, styles.leftViewFlatListBox]}>
                                            <Text style={[styles.nextAppointmentBoxTxt, styles.smalltxt]}>{getStatusName(obj?.item?.appointmentStatus)}</Text>
                                            <Text style={styles.practitionerName}>{obj?.item?.appointmentType},
                                                {obj?.item?.appointmentMode === "Video Consultation" ? "Online" : ""}
                                            </Text>
                                            <Text style={[styles.practitionerName, styles.marginMore]}>{obj?.item?.practitionerName}</Text>
                                            <Text style={styles.practitionerSpeciality}>
                                                {/* {moment(item.appointmentDate, 'DD-MM-YYYY').format('DD-MM-YYYY')} */}
                                                {moment(obj?.item?.appointmentDate, "DD-MM-YYYY").format("DD MMM. YY")}, {" "}
                                                {obj?.item?.appointmentTime.toUpperCase()}
                                            </Text>

                                            {/* <TouchableOpacity onPress={() => handalBookFollowUp(obj.item)} style={styles.rightViewFlatList}>
                                                <Text style={styles.statusBoxTxt}>Book Follow-up</Text>
                                            </TouchableOpacity> */}

                                        </View>
                                        {/* <View style={styles.rightView}>
                                            {(() => {
                                                const appointmentDate1 = obj?.item?.appointmentDate.split("-");
                                                const todayDate = moment().format('DD-MM-YYYY').split("-");

                                                const isFutureAppointment = (new Date(appointmentDate1[2], parseInt(appointmentDate1[1]) - 1, appointmentDate1[0]) >= new Date(todayDate[2], parseInt(todayDate[1]) - 1, todayDate[0]));
                                                const isUpcomingWithinTwoDays = moment([appointmentDate1[2], appointmentDate1[1] - 1, appointmentDate1[0]]).diff(moment([todayDate[2], todayDate[1] - 1, todayDate[0]]), 'days') < 2;

                                                if (obj?.item?.appointmentMode !== "Face to Face" && (obj?.item?.appointmentStatus === "Approved" || obj?.item?.appointmentStatus === "In Progress") && isFutureAppointment) {
                                                    return isUpcomingWithinTwoDays ? (
                                                        <TouchableOpacity style={styles.iconBox} onPress={() => { goToVideoScreen(obj?.item) }}>
                                                            <AntDesign name="playcircleo" size={35} color="#fff" />
                                                        </TouchableOpacity>
                                                    ) : (
                                                        <TouchableOpacity style={[styles.iconBox, styles.grayColor]}>
                                                            <AntDesign name="playcircleo" size={35} color="#fff" />
                                                        </TouchableOpacity>
                                                    );
                                                } else {
                                                    return obj?.item?.appointmentMode !== "Face to Face" ?
                                                        (
                                                            <TouchableOpacity
                                                                style={[styles.iconBox, styles.grayColor]}
                                                                onPress={() => {
                                                                    Toast.show("Video call is not possible for this appointment.");
                                                                }}
                                                            >
                                                                <AntDesign name="playcircleo" size={35} color="#fff" />
                                                            </TouchableOpacity>
                                                        )
                                                        :
                                                        (

                                                            <Image source={require('../Public/images/faceTofaceGray.png')} style={{ width: 40, height: 40 }} />
                                                        );
                                                }
                                            })()}
                                        </View> */}
                                    </View>
                                </View>
                            </View>
                            {/* <View style={[styles.appointmentScreenView, styles.appointmentScreenViewBottom]}>
                                <View style={[styles.appointmentCard]}>
                                    <View style={styles.appointmentCardRow}>
                                        <View style={[styles.leftView, styles.leftViewFlatList, styles.leftViewFlatListBox]}>
                                            <Text style={styles.practitionerSpeciality}>
                                                {moment(obj?.item?.appointmentDate, "DD-MM-YYYY").format("DD MMM. YY")} {"\n"}
                                                {obj?.item?.appointmentTime.toUpperCase()}
                                            </Text>
                                        </View>
                                        <View style={[styles.rightView, styles.rightViewFlatList]}>
                                            <TouchableOpacity onPress={handalBookFollowUp}>
                                                <Text style={styles.statusBoxTxt}>Book Follow-up</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </View> */}
                        </View>
                        <View style={[styles.innnextAppointmentBoxRight, styles.innnextAppointmentBoxRightFlat]}>
                            <TouchableOpacity style={[styles.lastView]}
                                onPress={() => handleBottomSheetShow(obj?.item)}
                                disabled={isProcessingTouchableOpacity}
                            >
                                <Entypo name="dots-three-vertical" size={35} color="#000" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </>
    };
    // const slideAnim = useRef(new Animated.Value(-300)).current; // Initial position is off-screen
    const handleFilter = () => {
        setSearchSheetVisible(true);
    }

    const generateUniqueId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
    };

    const clearFilterFn = () => {
        setSelectedTimeLine("");
        setSelectedPaymentStatus("");
        setSelectedPaymentMode("");
    }

    const handalCancelAppointment = () => {
        if (isconnected) {

            let appointmentDate = appointmentCancelObj["appointmentDate"];
            let appointmentDateArray = appointmentDate.split("-");
            const newStartDate = new Date();
            const newEndDate = new Date(
                appointmentDateArray[2] + "-" + appointmentDateArray[1] + "-" + appointmentDateArray[0]
            );
            const one_day = 1000 * 60 * 60 * 24;
            let dateSpan;
            dateSpan = Math.ceil(
                (newEndDate.getTime() - newStartDate.getTime()) / one_day
            );
            getPricingDetails(dateSpan)
        } else {
            Toast.show("No internet connection");
        }
    }

    const getPricingDetails = (days) => {
        try {
            setLoading(true);
            let result = get_pricing_details().then(async (response) => {
                var pricingList = response?.Pricing;
                let appointmentCancellationPricingObj = []
                if (pricingList) {
                    if (days >= 0 && days <= 2) {
                        appointmentCancellationPricingObj.push(pricingList?.appointmentCancellationPricing1);
                    } else if (days > 2 && days <= 5) {
                        appointmentCancellationPricingObj.push(pricingList?.appointmentCancellationPricing2);
                    } else if (days > 5) {
                        appointmentCancellationPricingObj.push(pricingList?.appointmentCancellationPricing3);
                    }

                    let appPrice = parseInt(appointmentCancelObj["appointmentPrice"]);
                    var cancellationPrice = 0;
                    var refundPrice = 0;
                    if (appointmentCancellationPricingObj[0].cancellationPriceType == 1) {
                        let paidAmount = parseInt(appointmentCancelObj["appointmentPrice"]);
                        let cancellationPercentage = appointmentCancellationPricingObj[0].cancellationAmount;
                        refundPrice = ((paidAmount) * cancellationPercentage) / 100
                        setCancellationType("Percentage")
                    } else {
                        refundPrice = appointmentCancellationPricingObj[0].cancellationAmount;
                        setCancellationType("Value")
                    }
                    cancellationPrice = appPrice - refundPrice;
                    setAppointmentPrice(appPrice);
                    setCancellationPrice(refundPrice);
                    setRefundPrice(cancellationPrice);
                    setTimeout(() => {
                        setLoading(false);
                        setCancellationAppointmentFlag(true);
                    }, 500)
                }

            });
        } catch (error) {
            setLoading(false);
            console.error(error);
        }

    }

    const hideCancellationPopup = () => {
        setCancellationAppointmentFlag(false);
    }

    const appointmentCancellation = async () => {
        if (isconnected) {
            try {
                setLoading(true);
                await cancelAppointment({
                    variables: {
                        id: appointmentCancelObj.id,
                        appointmentStatusType: 2,
                        appointmentStatus: "Cancelled",
                        cancellationPrice: cancellationPrice,
                        refundPrice: refundPrice,
                        cancellationType: cancellationType,
                    },
                }).then((result) => {
                    if (result) {

                        setLoading(false);
                        setCancellationAppointmentFlag(false);
                        setSearchSheetVisible(false);
                        setSheetVisible(false);
                        setAppointmentsDataAfterFilter([]);
                        setAppointmentsData([]);
                        setRefreshBtnFnFlag(true);
                        getAppointmentListFn();
                    }
                });

            } catch (error) {
                setLoading(false);
                console.error('Error updating appointment:', error);
            }
        } else {
            Toast.show("No internet connection");
        }
    }

    const handalBookFollowUp = (obj) => {
        let innerHash = {
            "id": obj.practitionerId,
            "name": obj.practitionerName,
            "firstLastName": obj.practitionerName,
            "yearsOfExp": 0,
            "ratings": "",
            "overAllRatings": 0,
            "languages": "",
            "qualification": "",
            "photo": "",
            "code": obj.practitionerSpeciality,
            "gender": "",
            "subspeciality": ""
        }
        practList.forEach((element) => {
            if (element["id"] == obj.practitionerId) {
                innerHash = element
            }
        });

        let dataHash = {
            "refreshToken": reduxAuthJson.token.refreshToken,
            "accesToken": reduxAuthJson.token.accesToken,
            "tokenExpiryDate": reduxAuthJson.token.tokenExpiryDate,
            "PatientDetails": reduxAuthJson.currentUserDetails,
            "followupPractDetails": innerHash,
            "appDetails": obj
            // "videoDetails": videoDetailsObj
        }

        const data = JSON.stringify(dataHash);
        const encodedData = encodeURIComponent(data);
        setWebViewSourceUrl({ uri: `${Config.bookFollowUpUrl}?data=${encodedData}` })
        setWebViewFlagForBookFollowUp(true)
    };

    const refreshBtnFn = () => {
        setLoading(false);
        setRefreshBtnFnFlag(true);
        getAppointmentListFn()
    }

    const handalContactUs = () => {
        setContactUsFlag(true);
        hideBottomSheet();
    };
    const hideContactUsFlag = () => {
        setContactUsFlag(false);
    }

    const hideAllWebView = () => {
        setWebViewFlag(false);
        setWebViewFlagForBookFollowUp(false);
    }

    const handleMessage = (event) => {
        const data = JSON.parse(event.nativeEvent.data);
        setWebViewFlag(false);
        setWebViewFlagForBookFollowUp(false);
        if (data.message === "save successfully") {
            getAppointmentListFn()
        }
    };

    const handleGoBack = () => {
        // Check if navigation can go back to avoid errors
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            // Optional fallback if this is the first screen
            console.log("No screen to go back to");
        }
    };

    return (
        <>
        <View style={styles.container}>
            <CustomHeader pageName={webViewFlag ? "Video Consultation" : webViewFlagForBookFollowUp ? "Book Follow-up" : routeName}
                refreshBtnFn={refreshBtnFn}
                hideAllWebView={hideAllWebView}
            />
                <Loader loading={loading} />



            {
                webViewFlag || webViewFlagForBookFollowUp ?
                <>
                <TouchableOpacity onPress={hideAllWebView} style={[styles.backbtn, {marginLeft: 10}]}>
                    <FontAwesome6 name="arrow-left-long" size={26} color={Colors.black} />
                </TouchableOpacity>
                    <WebView
                        source={webViewSourceUrl}
                        mediaPlaybackRequiresUserAction={false}
                        allowsInlineMediaPlayback={true}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        onMessage={handleMessage}
                    />
                </>
                    :
                    <>


                        {
                            nextAppointment !== null && nextAppointment !== undefined &&
                            <View style={styles.nextAppointmentBoxMain}>

                                <View style={[styles.nextAppointmentBox, styles.nextAppointmentBoxCard]}>

                                    <TouchableOpacity style={[styles.backbtn, styles.backbtnTop]}
                                        onPress={handleGoBack}
                                    >
                                        <FontAwesome6 name="arrow-left-long" size={26} color={Colors.black} />
                                    </TouchableOpacity>
                                    <View style={styles.innnextAppointmentBox}>
                                        <View style={styles.innnextAppointmentBoxLeft}>
                                            <View style={styles.appointmentScreenView}>
                                                <View style={[styles.appointmentCard]}>
                                                    <View style={styles.appointmentCardRow}>
                                                        <View style={[styles.leftView, styles.leftViewListBoxNext]}>
                                                            <Text style={styles.nextAppointmentBoxTxt}>Next Appointment</Text>
                                                            <Text style={styles.practitionerName}>{nextAppointment["appointmentType"]}, {nextAppointment["appointmentMode"] === "Video Consultation" ? "Online" : ""}</Text>
                                                            <Text style={[styles.practitionerName, styles.marginMore]}>
                                                                {nextAppointment["practitionerName"]}</Text>
                                                            <Text style={styles.practitionerSpeciality}>
                                                                {moment(nextAppointment["appointmentDate"], "DD-MM-YYYY").format("DD MMM. YY")}, {" "}
                                                                {moment(nextAppointment["appointmentTime"], "hh:mm a").format("hh.mm a")}
                                                            </Text>
                                                            {/* <TouchableOpacity onPress={() => handalBookFollowUp(nextAppointment)} style={styles.rightViewFlatList}>
                                                                <Text style={styles.statusBoxTxt}>Book Follow-up</Text>
                                                            </TouchableOpacity> */}
                                                        </View>
                                                        <View style={styles.rightView}>
                                                            {(() => {
                                                                const appointmentDate1 = nextAppointment.appointmentDate.split("-");
                                                                const todayDate = moment().format('DD-MM-YYYY').split("-");

                                                                const isFutureAppointment = (new Date(appointmentDate1[2], parseInt(appointmentDate1[1]) - 1, appointmentDate1[0]) >= new Date(todayDate[2], parseInt(todayDate[1]) - 1, todayDate[0]));
                                                                const isUpcomingWithinTwoDays = moment([appointmentDate1[2], appointmentDate1[1] - 1, appointmentDate1[0]]).diff(moment([todayDate[2], todayDate[1] - 1, todayDate[0]]), 'days') < 2;

                                                                if (nextAppointment.appointmentMode !== "Face to Face" && (nextAppointment.appointmentStatus === "Approved" || nextAppointment.appointmentStatus === "In Progress") && isFutureAppointment) {
                                                                    return isUpcomingWithinTwoDays ? (
                                                                        <TouchableOpacity style={styles.iconBox} onPress={() => { goToVideoScreen(nextAppointment) }}>
                                                                            <AntDesign name="playcircleo" size={35} color="#fff" />
                                                                        </TouchableOpacity>
                                                                    ) : (
                                                                        <TouchableOpacity style={[styles.iconBox, styles.grayColor]}>
                                                                            <AntDesign name="playcircleo" size={35} color="#fff" />
                                                                        </TouchableOpacity>
                                                                    );
                                                                } else {

                                                                    return nextAppointment.appointmentMode !== "Face to Face" ? (
                                                                        <TouchableOpacity style={[styles.iconBox, styles.grayColor]}>
                                                                            <AntDesign name="playcircleo" size={35} color="#fff" />
                                                                        </TouchableOpacity>
                                                                    ) : (
                                                                        <Image
                                                                            source={require('../Public/images/faceToface.png')}
                                                                            style={{ width: 35, height: 35 }}
                                                                        />
                                                                    )
                                                                }
                                                            })()}
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                            {/* <View style={[styles.appointmentScreenView, styles.appointmentScreenViewBottom]}>
                                                <View style={[styles.appointmentCard]}>
                                                    <View style={styles.appointmentCardRow}>
                                                        <View style={[styles.leftView, styles.leftViewFlatList, styles.leftViewFlatListBox]}>
                                                            <Text style={styles.practitionerSpeciality}>
                                                                {moment(nextAppointment["appointmentDate"], "DD-MM-YYYY").format("DD MMM. YY")} {"\n"}
                                                                {moment(nextAppointment["appointmentTime"], "hh:mm a").format("hh.mm a")}
                                                            </Text>
                                                        </View>
                                                        <View style={[styles.rightView, styles.rightViewFlatList]}>
                                                            <TouchableOpacity onPress={handalBookFollowUp}>
                                                                <Text style={styles.statusBoxTxt}>Book Follow Up</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View> */}
                                        </View>
                                        <View style={styles.innnextAppointmentBoxRight}>
                                            <TouchableOpacity
                                                style={styles.lastView}
                                                onPress={() => handleBottomSheetShow(nextAppointment)}
                                                disabled={isProcessingTouchableOpacity}
                                            >
                                                <Entypo name="dots-three-vertical" size={35} color="#000" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </View>

                        }
                        <View style={styles.searchBoxes}>
                            <View style={styles.searchBoxesLeft}>

                                {
                                    nextAppointment == null &&  nextAppointment == undefined &&
                                    <TouchableOpacity style={[styles.backbtn, styles.backbtnTop]}
                                        onPress={handleGoBack}
                                    >
                                        <FontAwesome6 name="arrow-left-long" size={26} color={Colors.black} />
                                    </TouchableOpacity>
                                }
                                <TouchableOpacity style={styles.searchBoX} onPress={() => handleFilter()}>
                                    <Image source={require('../../../Utility/Public/images/filter.png')} style={styles.filtericon} />
                                    <Text style={styles.searchBoXTxt}>Filters</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity style={styles.refreshBtn}
                                onPress={refreshBtnFn}
                            >
                                <FontAwesome name="refresh" size={26} color="#000" />
                            </TouchableOpacity>
                        </View>
                        <>

                            <View style={
                                nextAppointment !== null && nextAppointment !== undefined ? styles.appointmentScreenViewBox : styles.appointmentScreenViewBoxFull}>
                                <FlatList
                                    data={appointmentsDataAfterFilter}
                                    renderItem={renderItem}
                                    keyExtractor={(item, index) => index.toString()}
                                    ListFooterComponent={renderFooter}
                                    //onEndReached={handleLoadMore}
                                    onEndReachedThreshold={0.5}
                                    initialNumToRender={10}
                                    onRefresh={onRefresh}
                                    refreshing={refreshing}
                                    ListEmptyComponent={!loading ? renderEmptyComponent : null} // This will show when the list is empty

                                />
                            </View>

                            <GlobalBottomSheet
                                isVisible={isSheetVisible}
                                onClose={hideBottomSheet}
                                snapPoints={snapPoints}
                                bodyContent={
                                    <View>
                                        <BottomSheetDesign
                                            handalContactUs={handalContactUs}
                                            handalFeedback={handalFeedback}
                                            handalPrescription={handalPrescription}
                                            handalSupport={handalSupport}
                                            handalCancelAppointment={handalCancelAppointment}
                                            appointmentCancelObj={appointmentCancelObj}
                                        />
                                    </View>
                                }
                            />

                            <GlobalBottomSheet
                                isVisible={issearchSheetVisible}
                                onClose={() => {
                                    if (issearchSheetVisible) {
                                        setSearchSheetVisible(false);

                                    }
                                }}
                                snapPoints={Platform.OS == 'ios' ? ["74%"] : ["70%"]}
                                enablePanDownToClose={false}
                                //style={{ backgroundColor: '#f3f3f3' }}
                                // backgroundStyle={{ backgroundColor: '#f3f3f3' }} 
                                bodyContent={

                                    <SearchBottomSheetDesign
                                        hidesearchSheet={() => setSearchSheetVisible(false)}
                                        useFor="appointment"
                                        setSelectedTimeLine={setSelectedTimeLine}
                                        setSelectedPaymentStatus={setSelectedPaymentStatus}
                                        setSelectedPaymentMode={setSelectedPaymentMode}
                                        applyFilters={applyFilters}
                                        clearFilterFn={clearFilterFn}
                                        forceClearFilterFlag={forceClearFilterFlag}
                                        selectedTimeLine={selectedTimeLine}
                                        selectedPaymentStatus={selectedPaymentStatus}
                                        selectedPaymentMode={selectedPaymentMode}
                                        filterFor="appointment"
                                        refreshBtnFnFlag={refreshBtnFnFlag}
                                        timeLineFilter={true}
                                        paymentStatusFilter={true}
                                        paymentModeFilter={true}
                                        keywordSearchFilter={false}
                                        sentByFilter={false}
                                    />

                                }
                            />


                            <GlobalModal
                                visible={cancellationAppointmentFlag}
                                animationType="fade"
                                onCancel={hideCancellationPopup}
                                cancelBtnShow={false}
                                saveBtnLabel="Submit"
                                headerTitle="Appointment Cancellation"
                                onSave={appointmentCancellation}
                                body={
                                    <>
                                        <View style={styles.contentUL}>
                                            {/* <View style={styles.contentULBox}>
                                                <View style={styles.contentLI}>
                                                    <Text style={styles.contentLIText}>Appointment Paid Fee: {appointmentPrice}</Text>
                                                </View>
                                                <View style={styles.contentLI}>
                                                    <Text style={styles.contentLIText}>Cancellation Fee: {cancellationPrice}</Text>
                                                </View>
                                                <View style={styles.contentLI}>
                                                    <Text style={styles.contentLIText}>Refundable Fee: {refundPrice}</Text>
                                                </View>
                                            </View> */}
                                            <View style={[styles.contentLI, styles.contentLIQues]}>
                                                <Text style={[styles.contentLIText, styles.contentLITextQues]}>You will incur charges if you cancel. Are you sure you want to cancel appointment?
                                                </Text>
                                            </View>
                                        </View>
                                    </>
                                }
                            />
                            <GlobalModal
                                visible={contactUsFlag}
                                animationType="fade"
                                onCancel={hideContactUsFlag}
                                cancelBtnShow={false}
                                footer={false}
                                headerTitle="Contact Us"
                                body={
                                    <>
                                        <View style={styles.contactUsContent}>
                                            <TouchableOpacity
                                                style={styles.footerBoxMultipleBox}
                                                onPress={() => Linking.openURL('tel:+442039277699')}
                                            >
                                                <View style={styles.iconBoxContact}><Ionicons name="call" size={16} color="#fff" /></View>
                                                <Text style={styles.footerBoxMultipleBoxText}> +44 20 3927 7699</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.footerBoxMultipleBox}
                                                onPress={() => Linking.openURL('mailto:clinicadmin@oaktreeconnect.co.uk')}
                                            >
                                                <View style={[styles.iconBoxContact, styles.emailiconBox]}><EvilIcons name="envelope" size={24} color="#fff" /></View>
                                                <Text style={styles.footerBoxMultipleBoxText}>clinicadmin@oaktreeconnect.co.uk</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                }
                            />
                        </>
                    </>
            }

        </View >
    </>

    );
}

export default AppointmentScreen;

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#dff7f8',
    },

    nextAppointmentBoxMain: {
        paddingHorizontal: 15,
    },
    nextAppointmentBox: {
        // width: screenWidth,
        width: '100%',
        // height: 200,
        // backgroundColor: 'blue',
        textAlign: 'center',
        padding: 0,
        // paddingVertical: 7.5,
    },
    nextAppointmentBoxCard: {
        //    backgroundColor: 'red',
        //     paddingLeft: 0,
        //     paddingVertical: 0,
        //     // marginBottom: 10,
        //     height: nextAppointmentBoxInnheight,
        // marginTop: 15,
        paddingTop: 15,

    },
    nextAppointmentBoxFlatList: {
        paddingVertical: 0,
        //marginTop: 15,

    },

    innnextAppointmentBox: {
        width: '100%',
        backgroundColor: '#fff',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 0,
        //paddingHorizontal: 15,
        flexDirection: 'row',
        // backgroundColor: 'red',
        height: nextAppointmentBoxInnheight,
        borderRadius: 10,
        shadowColor: Platform.OS == 'ios' ? '#666' : '#000',
        shadowOffset: { width: Platform.OS == 'ios' ? .8 : 1 },
        shadowOpacity: Platform.OS == 'ios' ? 0.3 : 0.5,
        shadowRadius: 5,
        elevation: Platform.OS == 'ios' ? 3 : 5,
        marginBottom: 15,

    },

    innnextAppointmentBoxLeft: {
        width: "85%",
        //paddingHorizontal: 15,
    },
    innnextAppointmentBoxLeftFlatList: {
        width: "85%",
    },
    innnextAppointmentBoxLeftFlat: {
        // backgroundColor: 'pink',
    },
    innnextAppointmentBoxRight: {
        width: "15%",
        // backgroundColor:'yellow'
    },
    innnextAppointmentBoxRightFlat: {
        width: "15%",
        //backgroundColor: 'green',
    },
    lastView: {
        width: "100%",
        //height: 100,
        textAlign: 'left',
        display: 'flex',
        justifyContent: 'flex-start',
        // alignItems: 'center',
    },
    nextAppointmentBoxTxt: {
        color: '#000', // White text color
        fontSize: 16,
        fontFamily: 'Montserrat-Bold',
        fontWeight:'700'
    },
    smalltxt: {
        fontSize: 14,
    },
    appointmentScreenView: {
        width: '100%',
        // marginTop: 10,
        position: "relative",
        //backgroundColor:'red',
    },
    appointmentScreenViewBottom: {
        marginTop: 0,
    },
    appointmentCard: {
        paddingVertical: 0,
    },
    appointmentCardRow: {
        flexDirection: 'row', // Align children in a row
        alignItems: 'center',  // Center items vertically
        justifyContent: 'space-between',
        //backgroundColor: 'red',
    },
    leftView: {
        width: "80%",
        //backgroundColor: 'red',
    },
    leftViewListBoxNext: {
        paddingLeft: 15,
    },
    leftViewFlatListBox: {
        paddingLeft: 15,
        width: "100%",
    },

    rightView: {
        width: "20%",
        padding: 0,
        borderRadius: 0,
        alignItems: 'center',
        // backgroundColor: 'blue'
    },
    practitionerName: {
        fontSize: 14,
        fontFamily: 'Arimo-Regular',
        color: Colors.black
    },
    marginMore: {
        marginTop: 10,
    },
    practitionerSpeciality: {
        fontSize: 14,
        fontFamily: 'Arimo-Regular',
        color: Colors.black,
        lineHeight: 20,
        marginTop: 0,
    },
    iconBox: {
        backgroundColor: '#24ad91',
        padding: 5,
        borderRadius: 50,
    },
    grayColor: {
        backgroundColor: '#ddd',
    },
    searchBoxes: {
        padding: 0,
        paddingHorizontal: 15,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: screenWidth,
        //backgroundColor: 'red'
    },
    searchBoxesLeft: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    searchBoX: {
        // backgroundColor: 'red',
        padding: 0,
        paddingVertical: 10,
        //paddingHorizontal: 15,
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
    appointmentScreenViewBox: {
        //backgroundColor: 'red',
        // marginTop:15,
        padding: 0,
        height: flatListHeight,
        paddingBottom: 10,
        paddingTop: 0,
        width: '100%',
        // marginBottom:2,
    },
    appointmentScreenViewBoxFull: {
        //backgroundColor:'blue',
        // marginTop:15,
        padding: 0,
        height: flatListHeightFull,
        paddingBottom: 15,
        paddingTop: 0,
    },
    appointmentCardFlatList: {
        backgroundColor: '#fff',
        marginVertical: 5,
        padding: 15,
    },
    appointmentCardColumn: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    cardFlatList: {
        flexDirection: 'row',
    },
    leftViewFlatList: {
        //backgroundColor: 'red',
        width: '50%',
    },
    rightViewFlatList: {
        backgroundColor: "#24ad91",
        width: '80%',
        position: 'relative',
        padding: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3,
        // height: 40,
        marginTop: 5,

    },
    statusBoxTxt: {
        fontSize: 13,
        fontFamily: 'Arimo-Bold',
        //lineHeight:42,
        color: '#fff',
        width: '100%',
        borderRadius: 0,
        padding: 10,
        textAlign: 'center',
        //paddingVertical: 7,

    },
    contentUL: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        paddingHorizontal: 10,
        flexWrap: 'wrap',
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentULBox: {
        borderWidth: 1,
        borderColor: '#000',
        padding: 5,

    },
    contentLI: {
        width: '100%',
        textAlign: 'center',

    },
    contentLIQues: {
        marginTop: 10,
    },
    contentLIText: {
        fontSize: 12,
        fontFamily: 'Montserrat-Medium',
        color: '#666',
        textAlign: 'center',
        lineHeight: 15,
    },
    contentLITextQues: {
        fontSize: 13,
        fontFamily: 'Montserrat-Bold',
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    norecordFound: {
        fontSize: 14,
        fontFamily: 'Montserrat-Medium',
        color: '#000',
    },
    refreshBtn: {
        //backgroundColor:'red',
        width: 45,
        height: 45,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 0,
    },
    contactUsContent: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 10,
        paddingBottom: 15,
        backgroundColor: '#fff',
        paddingTop: 0,
        borderRadius: 4,
    },
    footerBoxMultipleBox: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 5,
        backgroundColor: '#f3f3f3',
        shadowColor: Platform.OS == 'ios' ? '#666' : '#000',
        shadowOffset: { width: Platform.OS == 'ios' ? .8 : 1 },
        shadowOpacity: Platform.OS == 'ios' ? 0.3 : 0.5,
        shadowRadius: 5,
        elevation: Platform.OS == 'ios' ? 3 : 5,
        borderRadius: 5,
    },
    iconBoxContact: {
        width: '15%',
        backgroundColor: "#24ad91",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,


    },
    footerBoxMultipleBoxText: {
        width: '85%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        paddingLeft: 0,
        fontSize: 12,
        fontFamily: 'Montserrat-Medium',
        color: '#333',
        paddingVertical: 12,
        paddingLeft: 5,

    },
    backbtnTop: {
        width: 40,
        height: 35,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        //backgroundColor: "#24ad91",
        marginTop: 10,
        marginRight: 5,

    }












});

