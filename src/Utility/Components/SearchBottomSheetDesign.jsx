const screen = Dimensions.get("window");
const screenWidth = screen.width;
const screenheight = screen.height;
const filterContainerheight = screenheight * 0.65;
import React, { useEffect, useState } from 'react';
import { View, Text, Image, SafeAreaView, StyleSheet, FlatList, TouchableOpacity, Dimensions, Alert, Platform } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import CheckBox from '@react-native-community/checkbox';

const SearchBottomSheetDesign = ({ hidesearchSheet, useFor, setSelectedTimeLine, setSelectedPaymentStatus, setSelectedPaymentMode, applyFilters, selectOptionForSendBy, setSelectedSendBy, clearFilterFn, forceClearFilterFlag, selectedTimeLine, selectedPaymentStatus, selectedPaymentMode, selectedSendBy, filterFor, refreshBtnFnFlag }) => {

    const [activeTab, setActiveTab] = useState(0); // track the active tab
    const tabs = useFor === "appointment" ? ["Timeline", "Payment Status", "Payment Mode"] : ["Timeline", "Sent By"];
    const [selectedTimelineOption, setSelectedTimelineOption] = useState(null);
    const [selectedPaymentStatusOption, setSelectedPaymentStatusOption] = useState(null);
    const [selectedPaymentModeOption, setSelectedPaymentModeOption] = useState(null);
    const [SelectOptionForTimeLine, setSelectOptionForTimeLine] = useState([
        { label: 'Last 30 days', value: '30' },
        { label: 'Last three months', value: '90' },
        { label: 'Last six months', value: '180' },
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
                { label: 'Week', value: '7' },
                { label: 'Last 30 days', value: '30' },
                { label: 'Last three months', value: '90' },
                { label: 'Last six months', value: '180' },
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



    const handleSelect = (value, type) => {
        console.log("handleSelect", value, type);
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
        } else {
            setSelectedSendBy(selectedSendByOption);
            applyFilters({
                "Timeline": selectedTimelineOption,
                "SendBy": selectedSendByOption
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
        console.log("---", selectedTimeLine, selectedPaymentStatus, selectedPaymentMode);
        // console.log("===",selectedTimelineOption, selectedPaymentStatusOption, selectedPaymentModeOption);
        setSelectedTimelineOption(selectedTimeLine);
        if (filterFor === "appointment") {
            setSelectedPaymentStatusOption(selectedPaymentStatus);
            setSelectedPaymentModeOption(selectedPaymentMode);
        } else {
            setSelectedSendByFilter(selectedSendBy);
        }
    };
    const clearFilters = () => {
        // clearFilterFn();
        setSelectedTimelineOption(null);
        setSelectedTimeLine("")
        if (filterFor === "appointment") {
            setSelectedPaymentStatusOption(null);
            setSelectedPaymentModeOption(null);

            setSelectedPaymentStatus("");
            setSelectedPaymentMode("");
        } else {
            setSelectedSendByFilter("");
            setSelectedSendBy("");
        }
    };

    return (
        <SafeAreaView style={styles.Container}>
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
                <View style={styles.containerLeft}>
                    <FlatList
                        data={tabs}
                        renderItem={renderTab}
                        keyExtractor={(item, index) => index.toString()}
                    //style={styles.tabContainer}
                    />
                </View>
                <View style={styles.containerRight}>
                    <ScrollView style={styles.inncontainerRight}>
                        {`${tabs[activeTab]}` === "Timeline" ?
                            <>
                                {SelectOptionForTimeLine.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={styles.checkboxContainer}
                                        onPress={() => handleSelect(option.value, "Timeline")}
                                    >
                                        <CustomCheckbox
                                            value={selectedTimelineOption === option.value}
                                            onPress={() => handleSelect(option.value, "Timeline")}
                                        />
                                        <Text style={styles.label}>{option.label}</Text>
                                    </TouchableOpacity>

                                ))}
                            </>

                            : `${tabs[activeTab]}` === "Payment Status" ?
                                <>
                                    {selectOptionForPaymentStatus.map((option) => (
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
                                </>
                                : `${tabs[activeTab]}` === "Payment Mode" ?
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
                                    :
                                    <>
                                      {selectOptionForSendBy.map((option) => (
                                        <TouchableOpacity
                                            key={option.value}
                                            style={styles.checkboxContainer}
                                            onPress={() => handleSelect(option.value, "SendBy")}
                                        >
                                            <CustomCheckbox
                                                value={selectedSendByOption === option.value}
                                                onPress={() => handleSelect(option.value, "SendBy")}
                                            />
                                            <Text style={styles.label}>{option.label}</Text>
                                        </TouchableOpacity>

                                    ))}                                     
                                    </>
                        }
                    </ScrollView>
                </View>
            </View>

            <View style={styles.containerBottom}>
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
        //backgroundColor: 'pink',
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
        position:'absolute',
        left:0,
        top:0,

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
      //backgroundColor: 'pink',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: "flex-start",
        marginTop:50,
       height: filterContainerheight -110,
    },
    containerBottom: {
        width: screenWidth,
        // height:"20%",
       backgroundColor: '#fff',
        paddingLeft: 15,
        paddingRight: 15,
        flexDirection: 'row',
        justifyContent: "space-between",
        position:'absolute',
        left:0,
        bottom:0,
    },
    containerLeft: {
        width: "35%",
        padding: 0,
        // backgroundColor: "#f3f3f3",
    },
    containerRight: {
        width: "65%",
        // height: "100%",
        //flex: 1,
        // padding: 0,
        backgroundColor: "#f3f3f3",
        // borderTopRightRadius: 15,
        // borderBottomRightRadius: 15,
        //height: filterContainerheight,
    },
    inncontainerRight: {
       // backgroundColor: 'red',
        display:'flex',
        flexDirection:'column',
        flexWrap:'wrap',
       // height: 300,
        // overflow: 'scroll',
    },
    tab: {
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderTopLeftRadius: 15,
        borderBottomLeftRadius: 15,
    },
    activeTab: {
        backgroundColor: '#f3f3f3', // Active tab background color

    },
    tabText: {
        color: '#333',
        fontSize: 16,
    },
    activeTabText: {
        color: '#24ad91', // Active tab text color
        //fontWeight: 'bold',
    },
    checkboxContainer: {
        // backgroundColor: 'pink',
        borderBottomColor: "#fff",
        borderBottomWidth: 1,
        display: 'flex',
        justifyContent: "flex-start",
        alignItems: 'center',
        flexDirection: 'row',
        paddingVertical: 15,
        paddingHorizontal: 10,
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
        color: '#fff'
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
    }



});
