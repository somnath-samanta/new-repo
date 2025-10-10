const screen = Dimensions.get("window");
const screenWidth = screen.width;
const screenheight = screen.height;
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, SafeAreaView, StyleSheet, ScrollView, Button, FlatList, TouchableOpacity, Dimensions, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import moment from "moment";
import Colors from '../../../Utility/Colors';
import { updatePatientQuestionnaireUpdate } from '../Controller/QuestionnaireController';
import Toast from 'react-native-simple-toast';
import Loader from '../../../Utility/Components/Loader';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
const PatientQuestionList = ({ questionObj, handleBackPress, reloadQuestionnaireList }) => {
    var [selectedDocadmintype, setSelectedDocadmintype] = useState(questionObj?.questionnaire?.administeredType)
    var [selectedDocStatus, setSelectedDocStatus] = useState(questionObj?.status);
    const [selectedValue, setSelectedValue] = useState(null);
    const [setCheckedvalue, setChecked] = useState(null);
    const [questionsData, setQuestionsData] = useState(questionObj?.questionnaire?.questions);
    const [sumofData, setSumofData] = useState(0);
    var [showErrorMessage, setErrorMessages] = React.useState(false);
    const [pageLoading, setPageLoading] = useState(false);

    const [isSelected, setSelection] = useState(false);
    useEffect(() => {
        //console.log("------------------------|||", selectedDocStatus);
        handleSelectedDocument(questionsData)
    }, [questionsData])

    const handleSelectedoptionTextAreaChanges = (
        idx,
        qidx,
        text
    ) => {

        if (text.length <= 1000) {
            let duplicateQuestionData = questionsData.map((obj) => ({
                ...obj,
            }));

            let duplicateQuestion = duplicateQuestionData[qidx];

            // console.log("questiondata1 before", duplicateQuestion);
            duplicateQuestion["selectedOptionId"] = idx.toString();
            duplicateQuestion.selectedOptionText = text;
            setQuestionsData([...duplicateQuestionData]);
        } else {
            alert("Max limit 1000");
        }
    };

    const handleSelectedoptionChanges = (e, idx, qidx, optiontext) => {
        let duplicateQuestionData = questionsData.map((obj) => ({
            ...obj,
        }));

        // console.log("optiontext:::::", optiontext);

        let duplicateQuestion = duplicateQuestionData[qidx];

        // console.log("questiondata1 before", duplicateQuestion);
        duplicateQuestion["selectedOptionId"] = idx.toString();
        duplicateQuestion.selectedOptionText = optiontext;
        setQuestionsData([...duplicateQuestionData]);
    };

    const handleSelectedDropdownChanges = (itemValue, qidx, optionsList) => {
        var optionsList1 = optionsList.options.filter(e => e.optionId.toString() === itemValue.toString());

        var dropdownSelectedValue = optionsList1[0]?.option;
        var selectedOptionId1 = optionsList1[0]?.optionId;
        let duplicateQuestionData = questionsData.map((obj) => ({
            ...obj,
        }));

        let duplicateQuestion = duplicateQuestionData[qidx];
        duplicateQuestion["selectedOptionId"] = selectedOptionId1;
        duplicateQuestion.selectedOptionText = dropdownSelectedValue;

        setQuestionsData([...duplicateQuestionData]);
    };


    const handleSelectedCommentChanges = (comment, qidx) => {
        let duplicateQuestionData = questionsData.map((obj) => ({
            ...obj,
        }));
        let duplicateQuestion = duplicateQuestionData[qidx];
        duplicateQuestion.comments = comment;

        setQuestionsData([...duplicateQuestionData]);
    };

    const handleSelectedDocument = (doc) => {
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
                setSumofData(totalScore);
            }
        }
    };

    const handleSubmitForm = async (action) => {
        try {
            let submitdataFlag = true;

            questionsData.forEach(function (comment) {
                if (
                    comment?.showCommentBox == "1" && comment.isCommentBoxRequired == "1" && comment?.comments == "" ||
                    comment?.showCommentBox == "1" && comment.isCommentBoxRequired == "1" && comment?.comments == null ||
                    comment?.showCommentBox == "1" && comment.isCommentBoxRequired == "1" && comment?.comments == undefined) {
                    submitdataFlag = false;
                    if (action !== "Incomplete") {
                        setErrorMessages(true);
                    }
                }
            });

            const notSubmitedAllQuestionFlag = questionsData.every((item) => {

                if (item.optionType !== "4") {
                    return item.selectedOptionId !== null; // true if selectedOptionId is not null
                } else {
                    // console.log("item.selectedOptionText============", item.selectedOptionText);
                    return item.selectedOptionText !== null && item.selectedOptionText !== ""; // true if selectedOptionText is not empty
                }
            });

            let finalData = {
                resourceType: "QuestionnaireBuilder",
                id: questionObj["questionnaire"]["id"],
                questionnaireName: questionObj["questionnaire"]["questionnaireName"],
                questionnaireDescription: questionObj["questionnaire"]["questionnaireDescription"],
                administeredType: questionObj["questionnaire"]["administeredType"],
                questions: questionsData,
            };
            if (submitdataFlag || action === "Incomplete") {
                if (notSubmitedAllQuestionFlag || action === "Incomplete") {
                    setPageLoading(true);
                    let data = await updatePatientQuestionnaireUpdate({
                        variables: {
                            id: questionObj?.id,
                            questionnaire: finalData,
                            status: action
                        },
                    });
                    if (data) {
                        // console.log("---------------------", data);
                        setPageLoading(false);
                        Toast.show("Saved successfully");
                        reloadQuestionnaireList();
                    } else {
                        Toast.show("An error occurred while saving. Please try again.");
                        setPageLoading(false);
                    }
                } else {
                    Toast.show("Please answer all the questions before submitting");
                }
            } else {
                Toast.show("Please fill in the required fields");
            }
        } catch (error) {
            console.error("Error:", error);
            setPageLoading(false);
            // Handle error here (e.g., show a toast or alert)
        }
    }
    const CustomCheckbox = ({ value, onPress, disabled }) => (
        <TouchableOpacity
            disabled={disabled}
            // style={[
            //     styles.checkbox,
            //     value && { backgroundColor: '#219197' }  // Custom checkmark color
            // ]}
            style={[
                styles.checkbox,
                disabled && styles.checkboxDisabled,
                value && { backgroundColor: '#24ad91' }  // Custom checkmark color
            ]}
            onPress={onPress}
        >
            {value && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
    );
    const CustomRadioButton = ({ selected, onPress, disabled }) => (
        // console.log("disabled***************************///***********************", disabled),
        <TouchableOpacity
            disabled={disabled}
            // style={[
            //     styles.customRadioButton,
            //     selected && styles.customRadioButtonSelected
            // ]}
            style={[
                styles.customRadioButton,
                disabled && styles.customRadioButtonDisabled, // Add disabled style only if disabled is true
                selected && styles.customRadioButtonSelected // Add selected style only if selected is true
            ]}
            onPress={onPress}
        >
            {selected && <View style={styles.customRadioButtonInner} />}
        </TouchableOpacity>
    );


    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        if (Platform.OS === 'ios') {
            const keyboardShowListener = Keyboard.addListener(
                'keyboardWillShow', // Use iOS-specific event
                () => setTimeout(() => setKeyboardVisible(true), 600)
            );

            const keyboardHideListener = Keyboard.addListener(
                'keyboardWillHide', // Use iOS-specific event
                () => setTimeout(() => setKeyboardVisible(false), 300)
            );

            return () => {
                keyboardShowListener.remove();
                keyboardHideListener.remove();
            };
        }
    }, []);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Main Content */}
            <View style={styles.content}>
                <Loader style={styles.loadingCss} loading={pageLoading} />

                <View style={styles.mainViewBoxContainer}>

                    <View style={(selectedDocadmintype === 2 || selectedDocadmintype === 3) && selectedDocStatus == "Incomplete" ? [styles.mainViews] : [styles.mainViews, styles.mainViewBox]}>
                        <TouchableOpacity style={[styles.backbtn, styles.backbtnTop]}
                            onPress={handleBackPress}
                        >
                            <FontAwesome6 name="arrow-left-long" size={26} color={Colors.black} />
                        </TouchableOpacity>

                        <ScrollView
                            contentContainerStyle={styles.scrollViewContent}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View style={(selectedDocadmintype === 2 || selectedDocadmintype === 3) && selectedDocStatus == "Incomplete" ? [styles.mainView] : [styles.mainView, styles.mainViewBoxx]}>
                                <Text style={styles.mainViewTxt}>{questionObj?.questionnaire?.questionnaireName}
                                </Text>
                                <Text style={styles.mainViewTxt}>Instructions: {" "}
                                    <Text style={styles.mainViewTxtSpan}>{questionObj?.questionnaire?.questionnaireDescription}</Text>
                                </Text>
                                <Text style={styles.mainViewTxt}>Date: {" "}
                                    <Text style={styles.mainViewTxtSpan}>{moment(questionObj?.assignedOn).format("DD-MM-YYYY")}</Text>
                                </Text>
                                {
                                    questionsData.map((obj, index) => {
                                        return (
                                            <View style={styles.containers}>
                                                <Text style={styles.questionBX}>{index + 1}.{" "}{obj.question}</Text>
                                                <View style={styles.textAreaBX}>
                                                    {
                                                        obj.optionType == "4" ?
                                                            <>
                                                                <TextInput
                                                                    style={styles.textArea}
                                                                    placeholder=""
                                                                    multiline={true}
                                                                    // numberOfLines={4}  // Adjust the number of lines as needed
                                                                    value={obj.selectedOptionText}
                                                                    onChangeText={(text) => handleSelectedoptionTextAreaChanges(4, index, text)}
                                                                    //scrollEnabled={false} // Fixes KeyboardAvoidingView behavior
                                                                    scrollEnabled={Platform.OS === 'ios' ? isKeyboardVisible : false}
                                                                    editable={!(selectedDocadmintype == "1"
                                                                        ||
                                                                        selectedDocStatus === "Completed")}
                                                                />
                                                            </>
                                                            : ""
                                                    }
                                                </View>


                                                {

                                                    <>
                                                        <View style={styles.ansContainerBox}>
                                                            {obj?.options?.map((optionObj, optionIndex) => {
                                                                return (
                                                                    <View key={optionIndex}>
                                                                        {/* Radio Buttin */}
                                                                        {obj.optionType === "1" && (
                                                                            <View style={styles.radioButtonContainer}>
                                                                                <CustomRadioButton
                                                                                    selected={obj?.selectedOptionId === optionIndex.toString()}
                                                                                    onPress={() =>
                                                                                        handleSelectedoptionChanges(1, optionIndex, index, optionObj.option)
                                                                                    }
                                                                                    disabled={selectedDocadmintype === 1 || selectedDocStatus === "Completed"}
                                                                                />
                                                                                <Text style={styles.label}>{optionObj.option}</Text>
                                                                            </View>
                                                                        )}
                                                                        {/** Checkbox */}

                                                                        {
                                                                            obj.optionType == "2" ? (
                                                                                <View style={styles.checkboxContainer}>
                                                                                    <CustomCheckbox
                                                                                        value={obj.selectedOptionId == optionIndex}
                                                                                        onPress={() =>
                                                                                            handleSelectedoptionChanges(1, optionIndex, index, optionObj.option)
                                                                                        }
                                                                                        disabled={selectedDocadmintype === 1 || selectedDocStatus === "Completed"}
                                                                                    />
                                                                                    <Text style={styles.label}>{optionObj.option}</Text>
                                                                                </View>
                                                                            )
                                                                                :
                                                                                (<></>)
                                                                        }
                                                                    </View>
                                                                );
                                                            })}
                                                        </View>

                                                        {/* Select option */}
                                                        {
                                                            obj.optionType == "3" ?
                                                                (
                                                                    <>

                                                                        <View style={styles.pickerContainer}>
                                                                            <RNPickerSelect
                                                                                onValueChange={(value) => handleSelectedDropdownChanges(value, index, obj)}
                                                                                value={questionsData[index]?.selectedOptionId !== null ? questionsData[index]?.selectedOptionId : ""}
                                                                                items={
                                                                                    [

                                                                                        ...obj?.options.map((optionObj) => ({
                                                                                            label: optionObj.option,
                                                                                            value: optionObj.optionId,
                                                                                        }))
                                                                                    ]
                                                                                }
                                                                                //multiline={true}
                                                                                //textInputProps={{multiline: true}} 
                                                                                pickerProps={{ numberOfLines: 2 }}
                                                                                // style={{ inputIOS: styles.picker, inputAndroid: styles.picker }}
                                                                                style={pickerStyle}
                                                                                disabled={selectedDocadmintype === 1 || selectedDocStatus === "Completed"}
                                                                            />
                                                                        </View>
                                                                    </>
                                                                )
                                                                :
                                                                ("")
                                                        }
                                                        <View style={styles.additionalComments}>
                                                            {
                                                                obj.showCommentBox == "1" ?
                                                                    (
                                                                        <>
                                                                            <View>
                                                                                <Text style={styles.additionalCommentsLabel}>Additional Comments</Text>
                                                                                <TextInput
                                                                                    style={styles.textAreaAdditionalComments}
                                                                                    placeholder=""
                                                                                    multiline={true}
                                                                                    //numberOfLines={1}  // Adjust the number of lines as needed
                                                                                    //scrollEnabled={false} // Fixes KeyboardAvoidingView behavior
                                                                                    scrollEnabled={Platform.OS === 'ios' ? isKeyboardVisible : false}
                                                                                    value={obj.comments}
                                                                                    onChangeText={(text) => handleSelectedCommentChanges(text, index)}
                                                                                    editable={!(selectedDocadmintype === 1
                                                                                        ||
                                                                                        selectedDocStatus === "Completed")}
                                                                                />
                                                                            </View>
                                                                            {obj.isCommentBoxRequired == "1" && selectedDocadmintype === 2 ? (
                                                                                <>
                                                                                    {showErrorMessage &&
                                                                                        (obj?.comments == "" ||
                                                                                            obj?.comments == null ||
                                                                                            obj?.comments == undefined) ? (
                                                                                        <View>
                                                                                            <Text style={styles.errorMsg}>Please enter comments</Text>
                                                                                        </View>
                                                                                    ) : (
                                                                                        ""
                                                                                    )}
                                                                                </>
                                                                            ) : ""}
                                                                            {selectedDocadmintype == 3 ? (
                                                                                <>
                                                                                    {showErrorMessage &&
                                                                                        (obj?.comments == "" ||
                                                                                            obj?.comments == null ||
                                                                                            obj?.comments == undefined) ? (
                                                                                        <View>
                                                                                            <Text style={styles.errorMsg}>Please enter comments</Text>
                                                                                        </View>
                                                                                    ) : (
                                                                                        ""
                                                                                    )}
                                                                                </>
                                                                            ) : ""}
                                                                        </>
                                                                    )
                                                                    :
                                                                    ("")
                                                            }
                                                        </View>


                                                    </>

                                                }


                                            </View>
                                        )
                                    })
                                }
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </View>
            {/* style={styles.actionRowBoxs} */}
            {/* Fixed Submit Button */}
            <View style={styles.footer}>
                <View style={(selectedDocadmintype === 2 || selectedDocadmintype === 3) && selectedDocStatus == "Incomplete" ? [styles.actionRowBoxs] : [styles.actionRowBoxsPart]}>
                    <Text style={styles.mainViewTxtTotal}>Total Score: {sumofData}</Text>
                    <View 
                     style={(selectedDocadmintype === 2 || selectedDocadmintype === 3) && selectedDocStatus == "Incomplete" ? [styles.actionRow] : [styles.actionRowBox]}
                    >
                        {
                            (selectedDocadmintype === 2 || selectedDocadmintype === 3) && selectedDocStatus == "Incomplete" ?
                                <>

                                    <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => handleBackPress()}>
                                        <Text style={styles.buttonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <View style={styles.buttonRowBoxs}>
                                        <TouchableOpacity style={[styles.actionButton, styles.saveExitButton]} onPress={() => handleSubmitForm('Incomplete')}>
                                            <Text style={[styles.buttonText, styles.saveExitButtonTxt]}>Save & Exit</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.SendButton]}
                                            onPress={() => handleSubmitForm('Completed')}
                                        >
                                            <Text style={styles.buttonText}>Submit</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                                :
                                <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => handleBackPress()}>
                                    <Text style={styles.buttonText}>Close</Text>
                                </TouchableOpacity>
                        }
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 10,
    },
    content: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingHorizontal: 0,
        backgroundColor: '#dff7f8',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
    },
    footer: {
        //padding: 16,
        backgroundColor: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    saveExitButtonTxt: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },

    mainViewBoxContainer: {
        backgroundColor: '#dff7f8',
    },
    mainViews: {
        padding: 0,
        paddingVertical: 0,
        backgroundColor: '#dff7f8',
        marginTop: -10,
        // backgroundColor: '#f2f8dfff',
    },
    mainViewBox: {
        padding: 0,
    },
    mainView: {
        padding: 0,
        paddingHorizontal: 15,
        paddingTop: 0,
        //paddingBottom:  Platform.OS == "ios" ? 170 : 160,
        paddingBottom: Platform.OS == "ios" ? 20 : 10,
    },
    mainViewBoxx: {
        paddingBottom: Platform.OS == "ios" ? 20 : 10,
    },

    mainViewTxt: {
        color: '#000', fontSize: 14, fontFamily: 'Montserrat-Bold',
        paddingVertical: 2.5,
    },
    mainViewTxtSpan: {
        color: '#000', fontSize: 14, fontFamily: 'Arimo-Regular',
        paddingLeft: 10,
    },
    mainViewTxtTotal: {
        color: '#333', fontSize: 14, lineHeight: 18, marginTop: 5, marginBottom: 10, fontFamily: 'Arimo-Bold',
        paddingHorizontal: 0, height: Platform.OS == "ios" && 40, 
    },
    containers: {
        backgroundColor: '#fff',
        shadowColor: Platform.OS == 'ios' ? '#666' : '#000',
        shadowOffset: { width: Platform.OS == 'ios' ? .8 : 1 },
        shadowOpacity: Platform.OS == 'ios' ? 0.3 : 0.5,
        shadowRadius: 5,
        elevation: Platform.OS == 'ios' ? 3 : 5,
        borderRadius: 5,
        padding: 10,
        marginVertical: 7.5,

    },
    questionBX: {
        color: '#000', fontSize: 14, fontFamily: 'Arimo-Bold',
        marginBottom: 15,
        marginVertical: 7.5,
    },
    ansContainerBox: {
        width: '100%',
        display: 'flex',
        margin: 0,
        flexWrap: 'wrap',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        width: '95%',
        paddingRight: 15,

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
    checkboxDisabled: {
        pointerEvents: 'none',
    },
    label: {
        marginLeft: 8,
        color: '#333', fontSize: 14,
        fontFamily: 'Arimo-Regular',
        flexWrap: 'wrap',
    },
    checkmark: {
        color: '#333',
        fontFamily: 'Arimo-Regular',
    },
    radioButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    customRadioButton: {
        height: 24,
        width: 24,
        borderRadius: 12, // Fully rounded for radio button shape
        borderWidth: 2,
        borderColor: '#666',
        alignItems: 'center',
        justifyContent: 'center',
    },
    customRadioButtonSelected: {
        borderColor: '#24ad91', // Color when selected
    },
    customRadioButtonDisabled: {
        pointerEvents: 'none',
    },
    customRadioButtonInner: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: '#24ad91', // Inner circle color when selected
    },
    textArea: {
        height: 150,  // You can set the height for the text area
        justifyContent: "flex-start",
        textAlignVertical: 'top',  // Ensure text starts at the top
        borderColor: '#666',
        borderWidth: 1,
        padding: 10,
        borderRadius: 0,
        fontSize: 14,
        fontFamily: 'Arimo-Bold',
        color: '#333',
    },
    textAreaAdditionalComments: {
        height: 100,  // You can set the height for the text area
        justifyContent: "flex-start",
        textAlignVertical: 'top',  // Ensure text starts at the top
        borderColor: '#666',
        borderWidth: 1,
        padding: 10,
        borderRadius: 0,
        color: '#333',
    },

    pickerContainer: {
        borderColor: '#666',  // Set the border bottom color
        borderWidth: 1,       // Set the border bottom width
        color: '#666',
        fontSize: 14,
        fontFamily: 'Arimo-Regular',
    },
    picker: {
        height: 50,                 // Set the height of the picker
        width: '100%',              // Set the width of the picker
        color: '#666',
        fontSize: 16,
        padding: Platform.OS == 'ios' ? 5 : 0,
        // backgroundColor: 'white', // Input background for light theme
    },
    actionRowBoxs: {
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: '100%',
        padding: 5,
        paddingHorizontal: 15,
        borderColor: '#ddd',
        borderTopWidth: 0.5,
        paddingBottom: 15,
        borderWidth: 1,
        borderColor: '#000'

    },
    actionRowBoxsPart: {
       // backgroundColor: 'red',
        width: '100%',
        padding: 5,
        paddingHorizontal:15,
        textAlign: 'center',
        display: 'flex',
        flexDirection:'row',
        justifyContent:'space-between'
       

    },
    actionRow: {
        flexDirection: 'row', // Align children in a row
        alignItems: 'center',  // Center items vertically
        justifyContent: 'space-between',
        marginTop: 0,
        //flexWrap: 'wrap',
        //bottom: Platform.OS == 'ios' ? 20 : 0,
        // backgroundColor: 'yellow',
        padding: 0,
        display: 'flex',
        width: '100%',
        // borderWidth: 1,
        // borderColor: '#000'
    },
    actionRowBox: {
        // backgroundColor: '#14c81dff',
        // bottom: 0,
    },
    cancelButton: {
        backgroundColor: Colors.gray99,   // Replace Colors.green01 with actual color
    },
    SendButton: {
        backgroundColor: '#007b80',
        marginLeft: 10,
    },
    saveExitButton: {
        // backgroundColor: '#007b80',
        color: '#666',
        fontSize: 16,
    },
    buttonRowBoxs: {
        //backgroundColor:'red',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'row'

    },
    actionButton: {
        padding: 0,
        paddingTop: 10,
        paddingBottom: 10,            // Add padding for better spacing
        borderRadius: 3,             // Optional: Rounded corners
        alignItems: 'center',
        //flex: 1,        // Center the text
        // width: '48.5%',
        marginVertical: 2,
    },
    buttonText: {
        color: '#fff',               // Replace Colors.white with actual color
        fontSize: 14,
        fontFamily: 'Arimo-Bold',
        paddingHorizontal: 15,
    },
    errorMsg: {
        color: Colors.red,
        fontSize: 14,
    },
    additionalComments: {
        padding: 0,
        margin: 0,
        marginTop: 10,
    },
    additionalCommentsLabel: {
        color: '#000', fontSize: 14, fontFamily: 'Arimo-Bold',
    },
    loadingCss: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        left: 0,
        top: 0
    },
    backbtnTop: {
        width: 40,
        height: 35,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: "red",
        marginTop: 0,
        marginLeft: 10,

    }

});
const pickerStyle = {
    inputIOS: {
        width: '100%',              // Set the width of the picker
        color: '#000',
        fontSize: 16,
        padding: 5,
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
};


export default PatientQuestionList;
