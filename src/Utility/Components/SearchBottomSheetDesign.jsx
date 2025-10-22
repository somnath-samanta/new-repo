const screen = Dimensions.get("window");
const screenWidth = screen.width;
const screenheight = screen.height;
const filterContainerheight = screenheight * 0.65;
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Dimensions, Alert, Platform, ActivityIndicator } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import CheckBox from '@react-native-community/checkbox';
import { Dropdown } from 'react-native-element-dropdown';
import { getPatientQuestionnaireName } from '../../Modules/Questionnaire/Controller/QuestionnaireController';
import { useSelector } from 'react-redux';
import Loader from './Loader';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const SearchBottomSheetDesign = ({ hidesearchSheet, useFor, setSelectedTimeLine, setSelectedPaymentStatus, setSelectedPaymentMode, applyFilters, selectOptionForSentBy, setSelectedSendBy, clearFilterFn, forceClearFilterFlag, selectedTimeLine, selectedPaymentStatus, selectedPaymentMode, selectedSendBy, filterFor, refreshBtnFnFlag, timeLineFilter, paymentStatusFilter, paymentModeFilter, keywordSearchFilter, sentByFilter, documentTypeFilter = false, setSelectedDocumentType, selectedDocumentType, setSelectedKeywordText, selectedKeywordText }) => {

    const documentTypeFilterOption = [
        { label: "Any", value: "" },
        { label: "Investigations", value: "Investigations" },
        { label: "Others", value: "Other" }
    ]

    const reduxAuthJson = useSelector((state) => state);
    const [activeTab, setActiveTab] = useState(0); // track the active tab
    const tabs = useFor === "appointment" ? ["Timeline", "Payment Status", "Payment Mode"] : ["Timeline", "Sent By"];
    // const [selectedTimelineOption, setSelectedTimelineOption] = useState(null);
    const [selectedTimelineOption, setSelectedTimelineOption] = useState('');
    const [selectedPaymentStatusOption, setSelectedPaymentStatusOption] = useState(null);
    const [selectedPaymentModeOption, setSelectedPaymentModeOption] = useState(null);
    const [selectedKeyword, setSelectedKeyword] = useState(''); // default = Anytime
    const [selectedSentBy, setSelectedSentBy] = useState(''); // default = Anytime
    const [isFocusForKeyword, setIsFocusForKeyword] = useState(false);
    const [isFocusForSentBy, setIsFocusForSentBy] = useState(false);
    const [isFocusForDocumentType, setIsFocusForDocumentType] = useState(false);
    const [keywordOptionData, setKeywordOptionData] = useState([]);
    const [keywordSearchText, setKeywordSearchText] = useState('');
    const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);
    const [SelectOptionForTimeLine, setSelectOptionForTimeLine] = useState([
        { label: 'Anytime', value: '' },
        { label: '1 Week', value: '7' },
        { label: '1 Month', value: '30' },
        { label: '3 Months', value: '90' },
        { label: '6 Months', value: '180' },
        { label: '1 Year', value: '365' },
    ]);
    // Function to render each tab item
    const renderTab = ({ item, index }) => (
        <TouchableOpacity
            style={[
                styles.tab,
                activeTab === index && styles.activeTab // Apply active styling
            ]}
            onPress={() => setActiveTab(index)} // Set active tab on press
        >
            <Text style={[styles.tabText, activeTab === index && styles.activeTabText]}>
                {item}
            </Text>
        </TouchableOpacity>
    );
    useEffect(() => {
        if (refreshBtnFnFlag) {
            clearFilters();
        }
    }, [refreshBtnFnFlag])
    useEffect(() => {
        if (forceClearFilterFlag) {
            clearFilters();
        }
    }, [forceClearFilterFlag])

    useEffect(() => {
        if (useFor === "questionnaire") {
            setSelectOptionForTimeLine([
                // { label: 'Week', value: '7' },
                // { label: 'Last 30 days', value: '30' },
                // { label: 'Last three months', value: '90' },
                // { label: 'Last six months', value: '180' },
                { label: 'Anytime', value: '' },
                { label: '1 Week', value: '7' },
                { label: '1 Month', value: '30' },
                { label: '3 Months', value: '90' },
                { label: '6 Months', value: '180' },
                { label: '1 Year', value: '365' },
            ])
        }
    }, [useFor])


    const selectOptionForPaymentStatus = [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' }
    ];
    const SelectOptionForPaymentMode = [
        { label: 'PMI', value: 'pmi' },
        { label: 'Self Pay', value: 'selfpay' },
        { label: 'Third Party', value: 'thirdPartyPayer' }
    ];
    const [selectedSendByOption, setSelectedSendByFilter] = React.useState("");
    const SelectOptionForTimeLineQues = [
        { label: '7', value: 'Week' },
        { label: '30', value: '1 month' },
        { label: '90', value: '3 months' },
        { label: '180', value: '6 months' }
    ]
    // const sentByOptionData = [
    //     { label: 'Item 1', value: '1' },
    //     { label: 'Item 2', value: '2' },
    //     { label: 'Item 3', value: '3' },
    //     { label: 'Item 4', value: '4' },
    //     { label: 'Item 5', value: '5' },
    //     { label: 'Item 6', value: '6' },
    //     { label: 'Item 7', value: '7' },
    //     { label: 'Item 8', value: '8' },
    // ];

    // Fetch questionnaire names for autocomplete
    const fetchQuestionnaireNames = async (searchText) => {
        try {
            const patientId = reduxAuthJson?.token?.loginUserId;
            if (!patientId) return;

            const response = await getPatientQuestionnaireName({
                id: patientId,
                questionnaireName: searchText || null,
            });

            if (response?.data?.PatientQuestionnaireList) {
                // Extract unique questionnaire names
                const uniqueNames = [...new Set(
                    response.data.PatientQuestionnaireList.map(
                        item => item.questionnaire?.questionnaireName
                    ).filter(Boolean)
                )];

                // Transform to dropdown format
                const options = uniqueNames.map(name => ({
                    label: name,
                    value: name,
                }));

                setKeywordOptionData(options);
            }
        } catch (error) {
            console.log('Error fetching questionnaire names:', error);
        } finally {
            setIsLoadingKeywords(false);
        }
    };

    useEffect(() => {
        // Clear previous timer before setting a new one
        const delayTimer = setTimeout(() => {
            if (keywordSearchText.trim().length > 2) {
                // console.log("Fetching for:-------------------", keywordSearchText);
                setIsLoadingKeywords(true);
                fetchQuestionnaireNames(keywordSearchText);
            } else {
                // console.log("Fetching for:-------------------Else");
                // setKeywordOptionData([]);
                setIsLoadingKeywords(false);
            }
        }, 900); // waits 500ms after user stops typing

        // Cleanup function: clear timer only
        return () => clearTimeout(delayTimer);
    }, [keywordSearchText]);

    const handleSelect = (value, type) => {
        // console.log("handleSelect", value, type);
        if (type == "Timeline") {
            setSelectedTimelineOption(value);
            //setSelectedTimeLine(value)
        }
        if (type == "PaymentStatus") {
            setSelectedPaymentStatusOption(value);
            //setSelectedPaymentStatus(value);
        }
        if (type == "PaymentMode") {
            setSelectedPaymentModeOption(value);
            //setSelectedPaymentMode(value);
        }
        if (type == "SendBy") {
            setSelectedSendByFilter(value);
            //setSelectedSendBy(value);
        }


    };
    const applyFiltersFn = () => {

        setSelectedTimeLine(selectedTimelineOption)
        if (filterFor === "appointment") {
            setSelectedPaymentStatus(selectedPaymentStatusOption);
            setSelectedPaymentMode(selectedPaymentModeOption);

            applyFilters({
                "Timeline": selectedTimelineOption,
                "PaymentStatus": selectedPaymentStatusOption,
                "PaymentMode": selectedPaymentModeOption,
            });
            hidesearchSheet();
        } else if (filterFor === "questionnaire") {
            setSelectedSendBy(selectedSentBy);
            setSelectedKeywordText(selectedKeyword);
            applyFilters({
                "Timeline": selectedTimelineOption,
                "SendBy": selectedSentBy,
                "Keyword": selectedKeyword
            });
            hidesearchSheet();
        } else if (filterFor === "thirdPartyDocument") {
            setSelectedDocumentType(selectedDocumentType);
            applyFilters({
                "Timeline": selectedTimelineOption,
                "DocumentType": selectedDocumentType
            });
            hidesearchSheet();
        }
    }

    const CustomCheckbox = ({ value, onPress, disabled }) => (
        <TouchableOpacity
            // disabled={disabled}
            // style={[
            //     styles.checkbox,
            //     value && { backgroundColor: '#219197' }  // Custom checkmark color
            // ]}
            style={[
                styles.checkbox,
                //disabled &&  styles.checkboxDisabled,
                value && { backgroundColor: '#24ad91' }  // Custom checkmark color
            ]}
            onPress={onPress}
        >
            {value && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
    );

    const hidesearchSheetPanel = () => {
        hidesearchSheet();
        setSelectedTimelineOption(selectedTimeLine);
        if (filterFor === "appointment") {
            setSelectedPaymentStatusOption(selectedPaymentStatus);
            setSelectedPaymentModeOption(selectedPaymentMode);
        } else if (filterFor === "questionnaire") {
            setSelectedSendByFilter(selectedSendBy);
            setSelectedKeyword(selectedKeywordText);
        }else{
            setSelectedDocumentType(selectedDocumentType);
        }
    };
    const clearFilters = () => {
        // clearFilterFn();
        setSelectedTimelineOption('');
        setSelectedTimeLine("")

        if (timeLineFilter) {
            setSelectedTimelineOption('');
            setSelectedTimeLine("")
        }
        if (paymentStatusFilter) {
            setSelectedPaymentStatus("");
            setSelectedPaymentStatusOption(null);
        }
        if (paymentModeFilter) {
            setSelectedPaymentMode("");
            setSelectedPaymentModeOption(null);
        }
        if (keywordSearchFilter) {
            setSelectedKeyword("");
        }
        if (sentByFilter) {
            setSelectedSentBy("");
             setSelectedSendBy("")
        }
        if (documentTypeFilter) {
            setSelectedDocumentType("");
        }

        if(keywordSearchFilter){
            setSelectedKeywordText("");
        }

        // if (filterFor === "appointment") {
        //     setSelectedPaymentStatusOption(null);
        //     setSelectedPaymentModeOption(null);

        //     setSelectedPaymentStatus("");
        //     setSelectedPaymentMode("");
        // } else {
        //     setSelectedSendByFilter("");
        //     setSelectedSendBy("");
        // }
    };


    const insets = useSafeAreaInsets();
    const containerTopBoxHeight = 50; // approximate height of top box
    const containerBottomHeight = 30; // approximate height of bottom buttons
    const availableHeight = filterContainerheight - containerTopBoxHeight - containerBottomHeight - insets.top - insets.bottom;



    return (
        <SafeAreaView style={styles.Container}>
            <Loader loading={isLoadingKeywords} />
            <View style={styles.containerTopBox}>
                <Text style={[styles.containerTopBoxTxt, styles.containerTopBoxTxtLeft]}>Filters</Text>
                <TouchableOpacity
                    style={[styles.containerTopBoxTxt, styles.containerTopBoxTxtRight]}
                    onPress={() => clearFilters()}
                >
                    <Text style={[styles.containerTopBoxTxt, styles.containerTopBoxTxtRight, { textDecorationLine: 'underline' }]}>Clear Filters</Text>
                </TouchableOpacity>

            </View>
            {/* {useFor === "appointment" ? */}
            <View style={styles.containerTop}>
                {/* Vertical Tabs */}
                {/* <View style={styles.containerLeft}>
                    <FlatList
                        data={tabs}
                        renderItem={renderTab}
                        keyExtractor={(item, index) => index.toString()}
                    //style={styles.tabContainer}
                    />
                </View> */}
                <View style={styles.containerRight}>
                    <ScrollView
                        style={{ height: availableHeight }}
                        contentContainerStyle={{ paddingBottom: 5 }}
                        showsVerticalScrollIndicator={true}
                    >
                        {
                            timeLineFilter &&

                            <View style={styles.searchBoxPanel}>
                                <Text style={styles.searchBoxPanelTitle}>Timeline</Text>
                                <View style={styles.searchBoxPanelRow}>
                                    {/* Column 1 */}
                                    <View style={styles.column}>
                                        {SelectOptionForTimeLine.slice(0, 3).map((option) => (
                                            <TouchableOpacity
                                                key={option.value}
                                                style={styles.radioContainer}
                                                onPress={() => handleSelect(option.value, "Timeline")}
                                            >
                                                <View style={styles.outerCircle}>
                                                    {selectedTimelineOption === option.value && <View style={styles.innerCircle} />}
                                                </View>
                                                <Text style={styles.label}>{option.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                    {/* Column 2 */}
                                    <View style={styles.column2}>
                                        {SelectOptionForTimeLine.slice(3, 6).map((option) => (
                                            <TouchableOpacity
                                                key={option.value}
                                                style={styles.radioContainer}
                                                onPress={() => handleSelect(option.value, "Timeline")}
                                            >
                                                <View style={styles.outerCircle}>
                                                    {selectedTimelineOption === option.value && <View style={styles.innerCircle} />}
                                                </View>
                                                <Text style={styles.label}>{option.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        }
                        {
                            paymentStatusFilter &&
                            <View style={styles.searchBoxPanel}>
                                <Text style={styles.searchBoxPanelTitle}>Payment Status</Text>
                                <View style={styles.searchBoxPanelRow}>
                                    {/* Column 1 */}
                                    <View style={styles.column}>
                                        {selectOptionForPaymentStatus.slice(0, 3).map((option) => (
                                            <TouchableOpacity
                                                key={option.value}
                                                style={styles.checkboxContainer}
                                                onPress={() => handleSelect(option.value, "PaymentStatus")}
                                            >
                                                <CustomCheckbox
                                                    value={selectedPaymentStatusOption === option.value}
                                                    onPress={() => handleSelect(option.value, "PaymentStatus")}
                                                />
                                                <Text style={styles.label}>{option.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                    {/* Column 2 */}
                                    <View style={styles.column2}>
                                        {selectOptionForPaymentStatus.slice(3, 6).map((option) => (
                                            <TouchableOpacity
                                                key={option.value}
                                                style={styles.checkboxContainer}
                                                onPress={() => handleSelect(option.value, "PaymentStatus")}
                                            >
                                                <CustomCheckbox
                                                    value={selectedPaymentStatusOption === option.value}
                                                    onPress={() => handleSelect(option.value, "PaymentStatus")}
                                                />
                                                <Text style={styles.label}>{option.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        }
                        {
                            paymentModeFilter &&
                            <View style={styles.searchBoxPanel}>
                                <Text style={styles.searchBoxPanelTitle}>Payment Mode</Text>
                                <>
                                    {SelectOptionForPaymentMode.map((option) => (
                                        <TouchableOpacity
                                            key={option.value}
                                            style={styles.checkboxContainer}
                                            onPress={() => handleSelect(option.value, "PaymentMode")}
                                        >
                                            <CustomCheckbox
                                                value={selectedPaymentModeOption === option.value}
                                                onPress={() => handleSelect(option.value, "PaymentMode")}
                                            />
                                            <Text style={styles.label}>{option.label}</Text>
                                        </TouchableOpacity>

                                    ))}
                                </>
                            </View>
                        }
                        {
                            keywordSearchFilter &&
                            <View style={styles.searchBoxPanel}>
                                <View style={styles.searchBoxPanelSelectRow}>
                                    {/* Column 1 */}
                                    <View style={styles.column}>
                                        <Text style={styles.searchBoxPanelTitle}>Keyword Search</Text>
                                    </View>
                                    {/* Column 2 */}
                                    <View style={styles.column2}>
                                        <View style={{ position: 'relative' }}>
                                            <Dropdown
                                                style={[styles.dropdown, isFocusForKeyword && { borderColor: 'blue' }]}
                                                placeholderStyle={styles.placeholderStyle}
                                                selectedTextStyle={styles.selectedTextStyle}
                                                inputSearchStyle={styles.inputSearchStyle}
                                                iconStyle={styles.iconStyle}
                                                data={keywordOptionData}
                                                search
                                                maxHeight={300}
                                                labelField="label"
                                                valueField="value"
                                                placeholder={!isFocusForKeyword ? 'Search questionnaire...' : '...'}
                                                searchPlaceholder="Type to search..."
                                                value={selectedKeyword}
                                                onFocus={() => setIsFocusForKeyword(true)}
                                                onBlur={() => setIsFocusForKeyword(false)}
                                                onChange={item => {
                                                    setSelectedKeyword(item.value);
                                                    setIsFocusForKeyword(false);
                                                }}
                                                onChangeText={(text) => {
                                                    setKeywordSearchText(text);
                                                    fetchQuestionnaireNames(text);
                                                }}
                                                disable={isLoadingKeywords}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        }
                        {
                            sentByFilter &&
                            <View style={styles.searchBoxPanel}>
                                <View style={styles.searchBoxPanelSelectRow}>
                                    {/* Column 1 */}
                                    <View style={styles.column}>
                                        <Text style={styles.searchBoxPanelTitle}>Sent By</Text>
                                    </View>
                                    {/* Column 2 */}
                                    <View style={styles.column2}>
                                        <Dropdown
                                            style={[styles.dropdown, isFocusForSentBy && { borderColor: 'blue' }]}
                                            placeholderStyle={styles.placeholderStyle}
                                            selectedTextStyle={styles.selectedTextStyle}
                                            inputSearchStyle={styles.inputSearchStyle}
                                            iconStyle={styles.iconStyle}
                                            data={selectOptionForSentBy}
                                            search
                                            maxHeight={300}
                                            labelField="label"
                                            valueField="value"
                                            placeholder={!isFocusForSentBy ? 'Select item' : '...'}
                                            searchPlaceholder="Search..."
                                            value={selectedSentBy}
                                            onFocus={() => setIsFocusForSentBy(true)}
                                            onBlur={() => setIsFocusForSentBy(false)}
                                            onChange={item => {
                                                setSelectedSentBy(item.value);
                                                setIsFocusForSentBy(false);
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>
                        }
                        {
                            documentTypeFilter &&
                            <View style={styles.searchBoxPanel}>
                                <View style={styles.searchBoxPanelSelectRow}>
                                    {/* Column 1 */}
                                    <View style={styles.column}>
                                        <Text style={styles.searchBoxPanelTitle}>Sent By</Text>
                                    </View>
                                    {/* Column 2 */}
                                    <View style={styles.column2}>
                                        <Dropdown
                                            style={[styles.dropdown, isFocusForDocumentType && { borderColor: 'blue' }]}
                                            placeholderStyle={styles.placeholderStyle}
                                            selectedTextStyle={styles.selectedTextStyle}
                                            inputSearchStyle={styles.inputSearchStyle}
                                            iconStyle={styles.iconStyle}
                                            data={documentTypeFilterOption}
                                            search
                                            maxHeight={300}
                                            labelField="label"
                                            valueField="value"
                                            placeholder={!isFocusForDocumentType ? 'Select item' : '...'}
                                            searchPlaceholder="Search..."
                                            value={selectedDocumentType}
                                            onFocus={() => setIsFocusForDocumentType(true)}
                                            onBlur={() => setIsFocusForDocumentType(false)}
                                            onChange={item => {
                                                setSelectedDocumentType(item.value);
                                                setIsFocusForDocumentType(false);
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>
                        }
                    </ScrollView>
                </View>
            </View>

            <View style={[
                styles.containerBottom,
                { paddingBottom: insets.bottom + 5 } // ensures spacing even with gesture bar
            ]}>
                <TouchableOpacity
                    style={[styles.filterbutton, styles.filterCancelbutton]}
                    onPress={() => hidesearchSheetPanel()}
                >
                    <Text style={styles.filterbuttonlabel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.filterbutton}
                    onPress={() => {
                        // applyFilters();
                        applyFiltersFn();
                    }}
                >
                    <Text style={styles.filterbuttonlabel}>Apply</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};


export default SearchBottomSheetDesign;

const styles = StyleSheet.create({
    Container: {
        paddingLeft: 10,
        paddingRight: 10,
        // backgroundColor: 'pink',
        // display: 'flex',
        // flexDirection: 'row',
        // justifyContent: "flex-start",
        //flex: 1,
        width: screenWidth,
        height: filterContainerheight,
        // borderWidth:1,
        // borderColor:'#000'
    },
    containerTopBox: {
        backgroundColor: '#fff',
        width: "100%",
        padding: 10,
        borderBottomColor: '#ddd',
        borderBottomWidth: .5,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        position: 'absolute',
        left: 0,
        top: 0,
        // backgroundColor: 'red'


    },
    containerTopBoxTxt: {
        color: '#666',
        fontSize: 16,
        fontFamily: 'Montserrat-Bold',
    },
    containerTopBoxTxtRight: {
        fontFamily: 'Montserrat-Bold',
        color: "#219197",
        fontSize: 14,

    },
    containerTop: {
        width: "100%",
        //height: "52%",
        // backgroundColor: 'pink',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: "flex-start",
        marginTop: 20,
        // height: filterContainerheight - 110,
    },
    containerBottom: {
        width: screenWidth,
        // height:"20%",
        backgroundColor: '#fff',
        paddingLeft: 15,
        paddingRight: 15,
        flexDirection: 'row',
        justifyContent: "space-between",
        position: 'absolute',
        left: 0,
        bottom: 0,
    },
    // containerLeft: {
    //     width: "35%",
    //     padding: 0,
    //     backgroundColor: "red",
    // },
    containerRight: {
        width: "100%",
        // height: "100%",
        flex: 1,
        // padding: 0,
        // backgroundColor: "pink",
        // borderTopRightRadius: 15,
        // borderBottomRightRadius: 15,
        //height: filterContainerheight,
    },
    inncontainerRight: {
        //backgroundColor: 'red',
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
    },
    // tab: {
    //     paddingVertical: 15,
    //     paddingHorizontal: 10,
    //     borderTopLeftRadius: 15,
    //     borderBottomLeftRadius: 15,
    // },
    // activeTab: {
    //     backgroundColor: '#f3f3f3', // Active tab background color

    // },
    // tabText: {
    //     color: '#333',
    //     fontSize: 16,
    // },
    // activeTabText: {
    //     color: '#24ad91', // Active tab text color
    //     //fontWeight: 'bold',
    // },
    checkboxContainer: {
        // backgroundColor: 'pink',
        borderBottomColor: "#fff",
        borderBottomWidth: 1,
        display: 'flex',
        justifyContent: "flex-start",
        alignItems: 'center',
        flexDirection: 'row',
        paddingVertical: 5,
        paddingHorizontal: 0,
    },
    checkbox: {
        height: 24,
        width: 24,
        borderWidth: 1,
        borderColor: '#666',  // Border color
        backgroundColor: '#fff',  // Background color
        borderRadius: 0, // Rounded corners
        padding: Platform.OS == "android" ? 0 : 5,
        paddingLeft: 5,
        color: '#fff',
        marginRight: 5,
    },
    // checkboxDisabled: {
    //     pointerEvents: 'none',
    // },
    label: {
        marginLeft: 8,
        color: '#333', fontSize: 14,
        fontFamily: 'Montserrat-Medium',

    },
    checkmark: {
        color: '#333',
        fontFamily: 'Montserrat-Bold',
    },
    filterbutton: {
        // Add padding for better spacing
        borderRadius: 5,             // Optional: Rounded corners
        alignItems: 'center',        // Center the text
        backgroundColor: "#24ad91",
        padding: 15,
        width: "49.2%"
    },
    filterbuttonlabel: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Montserrat-Bold',
    },
    filterCancelbutton: {
        backgroundColor: "#999999",
    },
    radioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 6,
    },
    outerCircle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    innerCircle: {
        height: 10,
        width: 10,
        borderRadius: 50,
        backgroundColor: '#219880',
    },
    label: {
        fontSize: 16,
        color: '#333',
    },

    searchBoxPanel: {
        //backgroundColor: 'green',
        display: 'flex',
        width: screenWidth - 15,
        margin: 0,
        padding: 0,
        marginHorizontal: 5,
        marginTop: 5,
    },
    searchBoxPanelTitle: {
        fontSize: 16,
        color: '#333',
        fontFamily: 'Arimo-Bold',
    },
    searchBoxPanelRow: {
        //backgroundColor: '#007AFF',
        width: screenWidth - 15,
        flexDirection: 'row',       // ✅ set row direction
        justifyContent: 'space-between', // space between columns
        alignItems: 'flex-start',
        padding: 5,                 // optional padding
    },
    column: {
        // backgroundColor: 'yellow',
        width: '48%',               // ✅ slightly less than 50% to prevent wrapping
    },

    column2: {
        // backgroundColor: 'green',
        width: '48%',               // ✅ slightly less than 50% to prevent wrapping
    },
    searchBoxPanelSelectRow: {
        //backgroundColor: '#007AFF',
        width: screenWidth - 15,
        flexDirection: 'row',       // ✅ set row direction
        justifyContent: 'flex-start', // space between columns
        alignItems: 'center',
        padding: 5,                 // optional padding
    },
    dropdown: {
        height: 40,
        borderColor: '#ccc',
        borderRadius: 0,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#000'
    },
    placeholderStyle: {
        fontSize: 16,
        color: '#999',
    },
    selectedTextStyle: {
        fontSize: 16,
        color: '#333',
    },
    loaderContainer: {
        position: 'absolute',
        right: 10,
        top: 10,
        zIndex: 1000,
    },


});
