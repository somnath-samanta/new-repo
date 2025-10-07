const screen = Dimensions.get("window");
const screenWidth = screen.width;
const screenheight = screen.height;
const panelheight = Platform.OS === 'ios' ? screenheight * 0.90 : screenheight * 0.92;
import React, { useState, useEffect, useCallback, memo } from 'react';
import {
    FlatList,
    Text,
    View,
    StyleSheet,
    ActivityIndicator,
    Button,
    Image,
    TouchableOpacity,
    Dimensions,
    BackHandler,
    StatusBar
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { getQuestionnaireList } from '../Controller/QuestionnaireController';
import Loader from '../../../Utility/Components/Loader';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import PatientQuestionList from '../Components/PatientQuestionList';
import Colors from '../../../Utility/Colors';
import GlobalBottomSheet from '../../../Utility/Components/GlobalBottomSheet';
import SearchBottomSheetDesign from '../../../Utility/Components/SearchBottomSheetDesign';
import CustomHeader from '../../../Utility/Components/CustomHeader'
import { useNavigationState } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NetInfo from "@react-native-community/netinfo";
import Toast from 'react-native-simple-toast';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import EventEmitter from '../../../Contexts/EventEmitter';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
const getTotalScore = (doc) => {
    if (doc) {
        let questionslistData = doc;
        let optionScoreListData = [];
        if (questionslistData) {
            questionslistData?.forEach(function (data1, index) {
                let questionsData2 = data1?.["options"];
                questionsData2?.forEach(function (data, index) {
                    if (data1?.selectedOptionText == data?.option) {
                        optionScoreListData.push(data?.optionScore);
                    }
                });
            });
            // console.log("optionScoreListData", optionScoreListData);
        }
        if (optionScoreListData.length > 0) {
            let totalScore = optionScoreListData.reduce((acc, current) => acc + current, 0);
            return totalScore;
        }
    }
};

const QuestionnaireItem = memo(({ item, index, onSelectDocument }) => {
    //    console.log(item)
    return (
        <View style={[styles.appointmentCard]} key={index}>


            <View style={styles.rowPractitioner}>
                <View style={styles.textContainer}>
                    <View style={styles.textContainerTop}>
                        <Text style={styles.practitionerName}>
                            {item.questionnaire.questionnaireName}
                        </Text>
                        <Text style={[styles.marginLeftClass, styles.showText]}>
                            {moment(item.assignedOn, 'YYYY-MM-DD').format('DD MMM. YY')}
                        </Text>
                    </View>
                    <Text style={styles.practitionerSpeciality}>Assigned by : {item.assignedName}</Text>
                    <View style={[styles.row, styles.timerow]}>
                        {
                            item.status === "Incomplete" ?
                                <Text style={[styles.statusvalue, styles.statusIncomplete]}>{getTotalScore(item.questionnaire.questions) > 0 ? "Partially Complete" : item.status}</Text>
                                :
                                <Text style={[styles.statusvalue, styles.statusComplete]}>{item.status}</Text>
                        }
                        <TouchableOpacity onPress={() => onSelectDocument(item)} style={styles.questionnaireAction}>
                            <Text style={styles.questionnaireActionText}>View/ Complete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
});

const renderEmptyComponent = () => {
    return (
        <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={styles.norecordFound}>No records found</Text>
        </View>
    );
};

function QuestionnaireScreen(props) {
    const [issearchSheetVisible, setSearchSheetVisible] = useState(false);
    const hidesearchSheet = () => setSearchSheetVisible(false);
    const dispatch = useDispatch();
    const reduxAuthJson = useSelector((state) => state);
    const [questionnaireData, setQuestionnaireData] = useState([]);
    const [questionnaireDataAfterFilter, setQuestionnaireDataAfterFilter] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [openQuestionList, setOpenQuestionList] = useState(false);
    const [forceClearFilterFlag, setForceClearFilterFlag] = useState(false);
    const routeName = useNavigationState(state => state.routeNames[state.index]);
    const insets = useSafeAreaInsets();
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight : insets.top;
    const [refreshBtnFnFlag, setRefreshBtnFnFlag] = useState(false);


    const [selectedTimeLine, setSelectedTimeLine] = React.useState("");

    const [selectedSendBy, setSelectedSendBy] = React.useState("");
    const [selectOptionForSendBy, setSelectOptionForSendBy] = useState([
        { label: 'All', value: '', disable: true },
        // { label: '', value: 'All' }
    ]);
    const [refreshing, setRefreshing] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const navigation = useNavigation();

    console.log("navigation=======", props)
    const { questionnairereload } = props.route.params || {};

    console.log("reload==============", questionnairereload)

    useFocusEffect(
        React.useCallback(() => {
            // This will run every time the Appointment screen is focused
            //   console.log("Appointment Screen is focused ==========================================");
            setForceClearFilterFlag(false);

            //if (reduxAuthJson.currentUserDetails) {
            // console.log("Appointment Screen is focused ==========================================");
            // setQuestionnaireDataAfterFilter([]);
            // setQuestionnaireData([]);
            getQuestionnaireListFn();
            // setOpenQuestionList(false);
            //}

            return () => {
                clearFilterFn();
                setLoading(false);
                setForceClearFilterFlag(true);
                // setQuestionnaireDataAfterFilter([]);
                // setQuestionnaireData([]);
                setOpenQuestionList(false);
            };
        }, [])
    );
    // useEffect(() => {
    //     if (reduxAuthJson.currentUserDetails) {
    //         // console.log("Appointment Screen is focused ==========================================");
    //         setQuestionnaireDataAfterFilter([]);
    //         setQuestionnaireData([]);
    //         getQuestionnaireListFn();
    //         setOpenQuestionList(false);
    //     }
    // }, [])

    useEffect(() => {
        if (questionnairereload && questionnairereload == true) {
            navigation.setParams({ questionnairereload: undefined });
            // console.log("Appointment Screen is focused ==========================================");
            setQuestionnaireDataAfterFilter([]);
            setQuestionnaireData([]);
            getQuestionnaireListFn();
            setOpenQuestionList(false);
        }
    }, [questionnairereload])
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected)
            if (!state.isConnected) {
                // You are offline
                // console.log("---------------Offline");
                setLoading(false);
                setRefreshing(false);
            } else {

            }
        });
        const listener = EventEmitter.addListener("broadcustMessage", async (message) => {
            // console.log("EventEmitter message=== in my document", message);
            if (message.close_additional_view) {
                setOpenQuestionList(false);
            }
        })
        return () => {
            listener.remove();
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        // console.log("openQuestionList===========entry", openQuestionList)
        const handleBackButtonPress = () => {
            setSearchSheetVisible(false);
            if (openQuestionList) {
                // Go back to Component One
                setOpenQuestionList(false);
                return true; // Prevent default back button behavior
            }
            return false; // Allow default behavior if already on Component One
        };

        // Add event listener
        /*BackHandler.addEventListener("hardwareBackPress", handleBackButtonPress);

        // Clean up event listener on component unmount
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", handleBackButtonPress);
        };*/


        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            handleBackButtonPress
        );

        return () => backHandler.remove(); // cleanup listener
    }, [openQuestionList]);

    const getQuestionnaireListFn = (type = "") => {
        try {
            console.log("refreshing===========", refreshing)
            if (type == "") {
                setLoading(true);
            }
            getQuestionnaireList({ id: reduxAuthJson.token.loginUserId }).then(async (response) => {

                setLoading(false);

                setQuestionnaireDataAfterFilter(response.PatientQuestionnaireList);
                setQuestionnaireData(response.PatientQuestionnaireList);
                setRefreshing(false)

                // Get unique assigned name
                const uniqueAssignedNames = [...new Set(response.PatientQuestionnaireList.map(item => item.assignedName))];
                const transformedArray = [
                    { label: 'All', value: '', disable: true },
                    // { label: '', value: 'All' }
                ];
                const nameObjects = uniqueAssignedNames.map(name => ({
                    label: name,
                    value: name
                }));

                transformedArray.push(...nameObjects);

                setSelectOptionForSendBy(transformedArray);
                setRefreshBtnFnFlag(false);
            })
        } catch (error) {
            console.error("Error fetching questionnaire list:", error);
            setLoading(false);
            // Handle error here (e.g., show a toast or alert)
        } finally {
            // setLoading(false); // Ensure loading state is reset
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
        if (isConnected) {
            console.log("*******applyFilters**********2222", obj);
            // Make a copy of questionnaireData so that all filters can be applied sequentially
            let filteredData = [...questionnaireData]; // Ensure it's a new reference

            // Apply timeline filter
            if (obj['Timeline'] !== null && obj['Timeline'] !== "") {
                // console.log("------------------------------selectedTimeLine", filteredData);
                let timeLine = obj['Timeline']
                const pastDate = moment().subtract(timeLine, 'days').format('YYYY-MM-DD');
                // console.log("pastDate",selectedTimeLine, pastDate);
                filteredData = filteredData.filter(questionnaire =>
                    moment(questionnaire.assignedOn, 'YYYY-MM-DD').format('YYYY-MM-DD') >= pastDate
                );
            }

            // Filter by appointmentStatus
            if (obj['SendBy'] !== null && obj['SendBy'] !== "") {
                let SendBy = obj['SendBy']
                filteredData = filteredData.filter(questionnaire => {
                    //console.log("==============", questionnaire);
                    return questionnaire.assignedName.toLowerCase() === SendBy.toLowerCase();
                });
            }

            // Only now update the state after all filtering is complete
            setQuestionnaireDataAfterFilter(filteredData);
        } else {
            Toast.show("No internet connection");
        }
    };



    const handleFilter = () => {
        console.log("********")
        setSearchSheetVisible(true);
    }

    const handleBackPress = () => {
        if (openQuestionList) {
            setOpenQuestionList(false);
        } else {
            navigation.goBack();
        }
    }

    const reloadQuestionnaireList = (type = "") => {
        setOpenQuestionList(false);
        setQuestionnaireDataAfterFilter([]);
        setQuestionnaireData([]);
        setRefreshBtnFnFlag(true);
        getQuestionnaireListFn(type);


    }

    onRefresh = () => {
        setRefreshing(true)
        setRefreshBtnFnFlag(true);
        getQuestionnaireListFn("refreshQuestion");
    }


    const handleSelectedDocument = (questionsArray) => {
        setSelectedQuestions(questionsArray);
        setOpenQuestionList(true);
        EventEmitter.emit("broadcustMessage", { "has_additional_view": true });
    };

    // const renderItem = useCallback(({ item, index }) => {
    //     return <QuestionnaireItem item={item} index={index} onSelectDocument={handleSelectedDocument} />;
    // }, []);
    const renderItem = (item) => {
        // console.log("======================================", item.index, questionnaireDataAfterFilter.length);
        return <>
            <View style={[styles.appointmentCard]} key={item.index}>
                <View style={styles.rowPractitioner}>
                    <View style={styles.textContainer}>
                        <View style={styles.textContainerTop}>
                            <Text style={styles.practitionerName}>
                                {item?.item?.questionnaire.questionnaireName}
                            </Text>
                            <Text style={[styles.marginLeftClass, styles.showText]}>
                                {moment(item?.item?.assignedOn, 'YYYY-MM-DD').format('DD MMM. YY')}
                            </Text>
                        </View>
                        <Text style={styles.practitionerSpeciality}>Assigned by : {item?.item?.assignedName}</Text>
                        <View style={[styles.row, styles.timerow]}>
                            {
                                item?.item?.status === "Incomplete" ?
                                    <Text style={[styles.statusvalue, styles.statusIncomplete]}>{getTotalScore(item?.item?.questionnaire.questions) > 0 ? "Partially Complete" : item?.item?.status}</Text>
                                    :
                                    <Text style={[styles.statusvalue, styles.statusComplete]}>{item?.item?.status}</Text>
                            }
                            <TouchableOpacity onPress={() => handleSelectedDocument(item?.item)} style={styles.questionnaireAction}>
                                <Text style={styles.questionnaireActionText}>View/ Complete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </>;
    };

    const generateUniqueId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
    };

    const clearFilterFn = () => {
        setSelectedTimeLine("");
        setSelectedSendBy("");
    }

    const refreshBtnFn = () => {
        // console.log("***********yes********Qu*********")
        setLoading(false);
        setRefreshBtnFnFlag(true);
        getQuestionnaireListFn()
    }
    const callbackhandler = () => {
        setOpenQuestionList(false);
    }
    // const handleGoBack = () => {
    //     navigation.goBack();
    // }
    const handleGoBack = () => {
        console.log("handleGoBack:>>>>>>>>>> ", routeName);
        if (routeName == 'MyDocument') {
            // console.log("----------my document----viewDocumentFlag--------",viewDocumentFlag)
            if (viewDocumentFlag) {
                callbackhandler(viewDocumentFlag);
            } else {
                navigation.goBack();
            }
        } else if (routeName == 'Questionnaire') {
            //console.log("----------Questionnaire-----openQuestionList--", openQuestionList)
            if (openQuestionList) {
                callbackhandler(openQuestionList);
            } else if (routeName == 'Home') {
                setLoading(true); // Show full-screen loader
                setTimeout(() => {
                    setLoading(false); // Hide loader
                    navigation.navigate('Home');
                }, 2000); // 10 seconds delay
            } else {
                navigation.goBack();
            }
        } else {
            navigation.goBack();
        }

    };

    return (
        <View style={styles.container}>
            {/* <View style={{ paddingTop: statusBarHeight }}> */}
            <View>
                <CustomHeader pageName={routeName}
                    refreshBtnFn={refreshBtnFn}
                    openQuestionList={openQuestionList}
                    callbackhandler={callbackhandler}
                />
            </View>
            <Loader style={styles.loadingCss} loading={loading} />
            {
                !openQuestionList ?
                    <View style={[styles.panel]}>
                        <View style={styles.searchBoxes}>
                            <View style={styles.leftGroup}>
                                <TouchableOpacity style={[styles.backbtn, styles.backbtnTop]}
                                    onPress={()=>handleGoBack()}
                                >
                                    <FontAwesome6 name="arrow-left-long" size={26} color={Colors.black} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.searchBoX} onPress={() => handleFilter()} >
                                    <Image source={require('../../../Utility/Public/images/filter.png')} style={styles.filtericon} />
                                    <Text style={styles.searchBoXTxt}>Filter</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity style={styles.refreshBtn}
                                onPress={refreshBtnFn}
                            >
                                <FontAwesome name="refresh" size={26} color="#000" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={questionnaireDataAfterFilter}
                            renderItem={renderItem}
                            // keyExtractor={(item) => item.appointmentBookedId + item.id + "-" + generateUniqueId().toString()}
                            keyExtractor={(item) => item.appointmentBookedId + item.id}
                            ListFooterComponent={renderFooter}
                            contentContainerStyle={{ paddingBottom: 10 }}
                            onEndReachedThreshold={0.5}
                            onRefresh={onRefresh}
                            refreshing={refreshing}
                            initialNumToRender={10}
                            ListEmptyComponent={!loading ? renderEmptyComponent : null} // This will show when the list is empty
                        />
                    </View>
                    :
                    <PatientQuestionList
                        questionObj={selectedQuestions}
                        handleBackPress={handleBackPress}
                        reloadQuestionnaireList={reloadQuestionnaireList}
                    />
            }

            <GlobalBottomSheet
                isVisible={issearchSheetVisible}
                onClose={hidesearchSheet}
                snapPoints={Platform.OS == 'ios' ? ["74%"] : ["70%"]}
                //style={{ backgroundColor: '#f3f3f3' }}
                // backgroundStyle={{ backgroundColor: '#f3f3f3' }} 
                bodyContent={

                    <SearchBottomSheetDesign
                        hidesearchSheet={hidesearchSheet}
                        useFor="questionnaire"
                        selectOptionForSendBy={selectOptionForSendBy}
                        setSelectedSendBy={setSelectedSendBy}
                        applyFilters={applyFilters}
                        setSelectedTimeLine={setSelectedTimeLine}
                        clearFilterFn={clearFilterFn}
                        forceClearFilterFlag={forceClearFilterFlag}
                        selectedSendBy={selectedSendBy}
                        selectedTimeLine={selectedTimeLine}
                        filterFor="questionnaire"
                        refreshBtnFnFlag={refreshBtnFnFlag}

                    />

                }
            />
        </View >
    );
}

export default QuestionnaireScreen;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#dff7f8',
    },
    searchBoxes: {
        padding: 0,
        paddingHorizontal: 15,
        display: 'flex',
        width: screenWidth,
        //backgroundColor: 'red',
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
    },
    panel: {
        //backgroundColor: 'red', 
        height: panelheight,
        paddingBottom: Platform.OS === 'ios' ? 10 : 0,
    },
    appointmentCard: {
        padding: 0,
        paddingHorizontal: 15,
        borderRadius: 0,
        //marginVertical: 5,
        marginBottom: 5,
        //backgroundColor: '#666',
    },
    rowPractitioner: {
        flexDirection: 'row',
        alignItems: 'flex-start', // Top items vertically
        marginBottom: 0,
        backgroundColor: '#fff',
        padding: 15,
        paddingVertical: 25,
        //height: nextAppointmentBoxInnheight,
        borderRadius: 5,
        shadowColor: Platform.OS == 'ios' ? '#666' : '#000',
        shadowOffset: { width: Platform.OS == 'ios' ? .8 : 1 },
        shadowOpacity: Platform.OS == 'ios' ? 0.3 : 0.5,
        shadowRadius: 5,
        elevation: Platform.OS == 'ios' ? 3 : 5,
        // marginVertical: 1.5,
        marginBottom: 10,
        // borderBottomWidth: 2,
        // borderBottomColor: '#000',
        //marginVertical:5,

    },
    textContainer: {
        flexDirection: 'column', // Stack text vertically
        marginTop: 0,
        //backgroundColor:'#fff',
        padding: 0,
        width: '100%',
    },
    textContainerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        //backgroundColor:'red',
        width: '100%',
        flexWrap: 'wrap',
    },
    practitionerName: {
        fontSize: 14, // Adjust font size as needed
        fontFamily: 'Montserrat-Bold',
        color: '#000',
        width: '70%',
        display: 'flex',
        flexWrap: 'wrap',
        // backgroundColor: 'yellow',


    },
    showText: {
        color: '#000',
        fontSize: 14,
        width: '30%',
        display: 'flex',
        justifyContent: 'flex-end',
        textAlign: 'right',
    },
    practitionerSpeciality: {
        fontSize: 14,
        color: '#000',
        flexWrap: 'wrap',
        display: 'flex',
        fontFamily: 'Arimo-Regular',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statusvalue: {
        fontSize: 14,
        color: '#000',
        padding: 5,
        paddingHorizontal: 0,
        fontFamily: 'Arimo-Bold',
    },
    statusIncomplete: {
        // backgroundColor: '#219197',
        color: '#2e95b4',
    },
    statusComplete: {
        color: '#007b80',
    },
    statusPending: {
        color: '#cd3e2c',
    },
    statusStarted: {
        color: '#2e95b4',
    },
    questionnaireAction: {
        backgroundColor: '#24ad91',
        padding: 8,
        paddingHorizontal: 10,
        borderRadius: 3,
    },
    questionnaireActionText: {
        fontSize: 12,
        color: '#fff',
        fontFamily: 'Arimo-Bold',
    },
    norecordFound: {
        fontSize: 14,
        fontFamily: 'Arimo-Regular',
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
    backbtnTop: {
        width: 40,
        height: 35,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: "#24ad91",
        marginTop: 0,
        marginRight: 10,

    }
});
