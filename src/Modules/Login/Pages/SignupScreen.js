const screen = Dimensions.get("window");
const screenWidth = screen.width;
const screenheight = screen.height;

import React, { useState, useEffect, useRef, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    Dimensions,
    ScrollView,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LoginStyle from '../Public/css/LoginStyle';
import Colors from '../../../Utility/Colors';
import Feather from 'react-native-vector-icons/Feather';
import { userRegistration } from '../Controller/LoginController'
import Toast from 'react-native-simple-toast';
import Loader from '../../../Utility/Components/Loader';
import { useNavigation } from '@react-navigation/native';
import EventEmitter from '../../../Contexts/EventEmitter';
import { setSignUpEmail } from '../Actions/LoginAction'
import { connect } from 'react-redux';
import NetInfo from "@react-native-community/netinfo";
import CommonDatePicker from '../../../Utility/Components/CommonDatePicker';
import Utility from '../../../Utility/Utility';
import AntDesign from 'react-native-vector-icons/AntDesign';
import GlobalModal from '../../../Utility/Components/GlobalModal';
import moment from 'moment';
import RNPickerSelect from 'react-native-picker-select';
import { useDispatch, useSelector } from 'react-redux';

function SignupScreen(props) {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmpasswordError, setConfirmpasswordError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isconnected, setIsconnected] = useState(false);
    const [confirmpassword, setConfirmpassword] = useState("");
    const [firstname, Setfirstname] = useState('');
    const [surname, Setsurname] = useState('');
    const [phone, Setphone] = useState('');
    const [firstnameError, SetfirstnameError] = useState("");
    const [surnameError, SetsurnameError] = useState("");
    const [phoneError, SetphoneError] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedDateError, setSelectedDateError] = useState("");
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [passwordHintFlag, setPasswordHintFlag] = useState(false);
    const [isGuardian, setisGuardian] = useState(false);
    const [dobError, setDobError] = useState("");
    const [isUnderSix, setIsUnderSix] = useState(false);

    const [guardianFirstName, SetGuardianFirstName] = useState('');
    const [guardianFirstNameError, SetGuardianFirstNameError] = useState("");
    const [guardianSurname, SetGuardianSurname] = useState('');
    const [guardianSurnameError, SetGuardianSurnameError] = useState("");
    const [relationtoPatient, SetRelationtoPatient] = useState('');
    const [relationtoPatientError, SetRelationtoPatientError] = useState("");



    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsconnected(state.isConnected)
            if (!state.isConnected) {
                setLoading(false);
            }
        });
        return () => {
            unsubscribe();
        };
    }, []);

    const validation = () => {
        let valid = true;

        // Validate First Name
        if (!firstname) {
            SetfirstnameError("Name is required.");
            valid = false;
        } else {
            SetfirstnameError("");
        }

        // Validate Surname
        if (!surname) {
            SetsurnameError("Surname is required.");
            valid = false;
        } else {
            SetsurnameError("");
        }
        if (!selectedDate) {
            setSelectedDateError("Date of birth is required.");
            valid = false;
        } else {
            setSelectedDateError("");
        }

        if (dobError !== "") {
            valid = false;
        }


        // Validate Email
        if (email.trim() === "") {
            setEmailError("Please enter a valid email");
            valid = false;
        } else {
            const expr = /^([\w-.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(]?)$/;
            if (!expr.test(email)) {
                setEmailError("Please enter a valid email");
                valid = false;
            } else {
                setEmailError("");
            }
        }

        // Validate Phone Number
        if (phone.trim() === "") {
            SetphoneError("Please enter phone no.");
            valid = false;
        } else if (!/^\d{10}$/.test(phone)) {
            SetphoneError("Required 10 digits no.");
            valid = false;
        } else {
            SetphoneError("");
        }

        // Validate Password
        if (password.trim() === "") {
            setPasswordError("Please enter a password");
            valid = false;
        } else if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters.");
            valid = false;
        } else {
            setPasswordError("");
        }

        // Validate Confirm Password
        if (confirmpassword.trim() === "") {
            setConfirmpasswordError("Please confirm your password");
            valid = false;
        } else if (confirmpassword.length < 6) {
            setConfirmpasswordError("Password must be at least 6 characters.");
            valid = false;
        } else if (password !== confirmpassword) {
            setConfirmpasswordError("Passwords do not match");
            valid = false;
        } else {
            setConfirmpasswordError("");
        }


        if (isGuardian) {
            if (guardianFirstName === "") {
                valid = false;
                SetGuardianFirstNameError("First name is required.");
            } else {
                SetGuardianFirstNameError("");
            }

            if (guardianSurname === "") {
                valid = false;
                SetGuardianSurnameError("Surname is required");
            } else {
                SetGuardianSurnameError("");
            }

            if (relationtoPatient === "") {
                valid = false;
                SetRelationtoPatientError("Please select guardian relation to Patient");
            } else {
                SetRelationtoPatientError("");
            }
        }

        return valid;
    };


    signupSubmit = () => {
        if (isconnected) {
            try {
                let valid = validation();
                if (valid) {
                    let data = {}
                    data["firstName"] = firstname
                    data["lastName"] = surname
                    data["email"] = email
                    data["phoneNumber"] = phone
                    data["password"] = password
                    data["year_of_birth"] = Utility.formatDate(selectedDate)
                    data["guardianFirstName"] = guardianFirstName
                    data["guardianSurname"] = guardianSurname
                    data["relationtoPatient"] = relationtoPatient
                    // console.log("data???????????????????>>>>>>>>>>>>>>>", data)
                    setLoading(true);
                    userRegistration(data).then(async (response) => {
                        setLoading(false);
                        // console.log("response: ========", response);
                        // return false
                        if(response.status === 1){
                            dispatch(setSignUpEmail(email));
                            Toast.show("Sign up successfully");
                            navigation.navigate("Verification")
                        } else if (response.status === 0) {
                            Toast.show(response.message);
                        } else {
                            Toast.show("Error during sign-up. Please try again.");
                        }
                    }).catch((error) => {
                        setLoading(false);
                    });

                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching questionnaire list:", error);
                setLoading(false);
                // Handle error here (e.g., show a toast or alert)
            }
        } else {
            Toast.show("No internet connection");
        }
    }

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };
    const toggleConfirmPasswordVisibility = () => {
        setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
    };

    useEffect(() => {
        const listener = EventEmitter.addListener("broadcustMessage", async (message) => {
            if (message.passwordExpire === true) {
                navigation.navigate('Forgot', { email: email });
            }


        })
        return () => {
            listener.remove();
        }

    }, []);

    const gotoLoginPage = () => {
        navigation.navigate("Login")
    };

    const getCurrentAge = (date) => {
        return moment().diff(date, 'years', false)
    }

    const handleDateChange = (selectedDate) => {
        // console.log('handleDateChange--------------');
        setDobError("");
        let age = getCurrentAge(selectedDate);
        if (selectedDate) {
            if (age < 18 && age > 6) {
                setisGuardian(true);
            }
            if (age >= 18) {
                setisGuardian(false);
            }
            if (age < 6) {
                setIsUnderSix(true);
                setDobError("Below 6 years not allowed");
            } else {
                setisGuardian(true);
                setIsUnderSix(false);
                setDobError("");
            }


            if (age > 120) {
                setDobError("Below 120 years people are allowed.");
            }
        }


        setSelectedDate(selectedDate);

        //console.log('selectedDate--------------', selectedDate);
        setIsDatePickerOpen(false);
        // _handleRefresh();
    };
    const openDatePicker = () => {
        setIsDatePickerOpen(true);
    };

    const closeDatePicker = () => {
        setIsDatePickerOpen(false);
    };
    const clearDate = () => {
        setSelectedDate("");
    };
    const PasswordHint = () => {
        setPasswordHintFlag(true);
    };
    const specialChars = "= + - ^ $ * . [ ] ( ) ? ! @ # % & / , > < ' : ; | _ ~";
    const [isChecked, setIsChecked] = useState(false);
    const [isCheckedacknowledge, setIsCheckedacknowledge] = useState(false);
    const CustomCheckbox = ({ value, onPress, disabled }) => (
        <TouchableOpacity
            disabled={disabled}
            style={[
                LoginStyle.checkbox,
                disabled && LoginStyle.checkboxDisabled,
                value && { backgroundColor: '#24ad91' }  // Custom checkmark color
            ]}
            onPress={onPress}
        >
            {value && <Text style={LoginStyle.checkmark}>✓</Text>}
        </TouchableOpacity>
    );

    // useEffect(() => {
    //     console.log("isChecked>>>>>>>>>>>>", isChecked)
    //     console.log("isCheckedacknowledge>>>>>>>>>>>>", isCheckedacknowledge)
    // }, [isChecked, isCheckedacknowledge]);
    const scrollViewRef = useRef(null);
    const [additionalInfoLayoutY, setAdditionalInfoLayoutY] = useState(0);

    // Scroll to the section when `isGuardian` becomes true
    useEffect(() => {
        if (isGuardian) {
            scrollViewRef.current?.scrollTo({
                y: additionalInfoLayoutY,
                animated: true,
            });
        }
    }, [isGuardian, additionalInfoLayoutY]);

    return (

        <KeyboardAwareScrollView
            style={LoginStyle.container}
        >
            <>
                {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}

                <View
                    style={LoginStyle.logincontainer}
                >
                    <Image source={require('../../../Utility/Public/images/oaktreeLogo.png')} style={LoginStyle.oaktreeLogo} />

                    <View>
                        <Loader loading={loading} /> 
                        <View style={LoginStyle.loginBox}>
                            <Text style={LoginStyle.loginTxt}>Sign up</Text>
                            <View style={LoginStyle.scrollBox}>
                                <ScrollView ref={scrollViewRef} style={{ flex: 1 }}>
                                    <View style={[LoginStyle.inputContainerBoxesSignUp, LoginStyle.topSpace]}>
                                        <View style={[LoginStyle.inputContainer, LoginStyle.inputContainerSignUp]}>
                                            <TextInput
                                                style={LoginStyle.input}
                                                placeholder="First Name"
                                                placeholderTextColor={Colors.gray99}
                                                value={firstname}
                                                onChangeText={(text) => { Setfirstname(text); SetfirstnameError("") }}
                                                returnKeyLabel='Done'
                                                returnKeyType='done'
                                                autoCapitalize="none"
                                            />
                                            {firstnameError != "" ? <Text style={LoginStyle.errorMsg}>{firstnameError}</Text> : null}
                                        </View>
                                        <View style={[LoginStyle.inputContainer, LoginStyle.inputContainerSignUp]}>
                                            <TextInput
                                                style={LoginStyle.input}
                                                placeholder="Surname"
                                                placeholderTextColor={Colors.gray99}
                                                value={surname}
                                                onChangeText={(text) => { Setsurname(text); SetsurnameError("") }}
                                                returnKeyLabel='Done'
                                                returnKeyType='done'
                                                autoCapitalize="none"
                                            />
                                            {surnameError != "" ? <Text style={LoginStyle.errorMsg}>{surnameError}</Text> : null}
                                        </View>
                                    </View>
                                    <View style={LoginStyle.inputContainerBoxesSignUp}>
                                        <View style={[LoginStyle.inputContainer, LoginStyle.inputContainerSignUp, LoginStyle.dateFieldBox]}>
                                            <TouchableOpacity onPress={openDatePicker} style={LoginStyle.dateField}>
                                                {selectedDate ?
                                                    <>
                                                        <Text style={LoginStyle.dateFieldSec}>
                                                            {Utility.formatDate(selectedDate)} </Text>
                                                        <TouchableOpacity onPress={clearDate} style={LoginStyle.dateClear}>
                                                            <AntDesign
                                                                name="closecircle"
                                                                size={16}
                                                                color={Colors.secondary}
                                                            />
                                                        </TouchableOpacity>
                                                    </>
                                                    :
                                                    <Text style={{ color: Colors.gray99 }}>Date of birth</Text>
                                                }</TouchableOpacity>
                                            <CommonDatePicker
                                                open={isDatePickerOpen}
                                                date={selectedDate}
                                                onDateChange={handleDateChange}
                                                closeDatePicker={closeDatePicker}
                                                type="Filter"
                                                locale="en"
                                            />
                                            <TouchableOpacity onPress={openDatePicker} style={LoginStyle.dateFieldicon}>
                                                <Feather
                                                    name="calendar"
                                                    size={22}
                                                    color={Colors.secondary}
                                                /></TouchableOpacity>
                                            {selectedDate == "" ? <Text style={LoginStyle.errorMsg}>{selectedDateError}</Text> : null}
                                            {dobError !== "" ? <Text style={LoginStyle.errorMsg}>{dobError}</Text> : null}
                                        </View>
                                        <View style={[LoginStyle.inputContainer, LoginStyle.inputContainerSignUp]}>
                                            <TextInput
                                                style={LoginStyle.input}
                                                placeholder="Phone"
                                                placeholderTextColor={Colors.gray99}
                                                value={phone}
                                                onChangeText={(text) => {
                                                    const formattedText = text.replace(/[^0-9+]/g, '');
                                                    Setphone(formattedText);
                                                    SetphoneError("")
                                                }}
                                                returnKeyLabel='Done'
                                                returnKeyType='done'
                                                autoCapitalize="none"
                                                keyboardType="phone-pad"
                                            />
                                            {phoneError != "" ? <Text style={LoginStyle.errorMsg}>{phoneError}</Text> : null}
                                        </View>
                                    </View>
                                    <View style={[LoginStyle.inputContainerBoxes, LoginStyle.inputContainerBoxesSignUpDown]}>
                                        <View style={LoginStyle.inputContainer}>
                                            <TextInput
                                                style={LoginStyle.input}
                                                placeholder="Email"
                                                placeholderTextColor={Colors.gray99}
                                                value={email}
                                                onChangeText={(text) => { setEmail(text); setEmailError("") }}
                                                returnKeyLabel='Done'
                                                returnKeyType='done'
                                                //onSubmitEditing={() => { loginSubmit() }}
                                                autoCapitalize="none"
                                            />
                                            {emailError != "" ? <Text style={LoginStyle.errorMsg}>{emailError}</Text> : null}
                                        </View>
                                        <View style={[LoginStyle.forgetYourPasswordBox, LoginStyle.PasswordHintBox]}>
                                            <TouchableOpacity style={[LoginStyle.ForgetYourPassword, LoginStyle.HintPassword]} onPress={PasswordHint}>
                                                <Text style={[LoginStyle.ForgetYourPasswordText, LoginStyle.PasswordHint]}>Password Hints</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={LoginStyle.inputContainer}>
                                            <TextInput
                                                style={[LoginStyle.input, { flex: 1 }]}
                                                placeholder="Password"
                                                placeholderTextColor={Colors.gray99}
                                                secureTextEntry={!isPasswordVisible}
                                                value={password}
                                                onChangeText={(text) => { setPassword(text); setPasswordError(""); }}
                                                returnKeyLabel='Done'
                                                returnKeyType='done'
                                            //onSubmitEditing={() => { loginSubmit() }}
                                            />
                                            <TouchableOpacity onPress={togglePasswordVisibility}>
                                                <Feather
                                                    name={isPasswordVisible ? 'eye' : 'eye-off'}
                                                    size={22}
                                                    color={Colors.secondary}
                                                />
                                            </TouchableOpacity>
                                            {passwordError != "" ? <Text style={LoginStyle.errorMsg}>{passwordError}</Text> : null}
                                        </View>
                                        <View style={LoginStyle.inputContainer}>
                                            <TextInput
                                                style={[LoginStyle.input, { flex: 1 }]}
                                                placeholder="Confirm Password"
                                                placeholderTextColor={Colors.gray99}
                                                secureTextEntry={!isConfirmPasswordVisible}
                                                value={confirmpassword}
                                                onChangeText={(text) => { setConfirmpassword(text); setConfirmpasswordError(""); }}
                                                returnKeyLabel='Done'
                                                returnKeyType='done'
                                            //onSubmitEditing={() => { loginSubmit() }}
                                            />
                                            <TouchableOpacity onPress={toggleConfirmPasswordVisibility}>
                                                <Feather
                                                    name={isConfirmPasswordVisible ? 'eye' : 'eye-off'}
                                                    size={22}
                                                    color={Colors.secondary}
                                                />
                                            </TouchableOpacity>
                                            {confirmpasswordError != "" ? <Text style={LoginStyle.errorMsg}>{confirmpasswordError}</Text> : null}
                                        </View>
                                    </View>
                                    {
                                        isGuardian === true &&
                                        <View style={LoginStyle.additionalInfo} onLayout={(event) => {
                                            const layout = event.nativeEvent.layout;
                                            setAdditionalInfoLayoutY(layout.y);
                                        }}>
                                            <Text style={LoginStyle.additionalheadingTxt}>Additional Guardian Information</Text>
                                            <View style={[LoginStyle.inputContainerBoxesSignUp]}>
                                                <View style={[LoginStyle.inputContainer, LoginStyle.inputContainerSignUp]}>
                                                    <TextInput
                                                        style={LoginStyle.input}
                                                        placeholder="First Name"
                                                        placeholderTextColor={Colors.gray99}
                                                        value={guardianFirstName}
                                                        onChangeText={(text) => { SetGuardianFirstName(text); SetGuardianFirstNameError("") }}
                                                        returnKeyLabel='Done'
                                                        returnKeyType='done'
                                                        autoCapitalize="none"
                                                    />
                                                    {guardianFirstNameError !== "" ? <Text style={LoginStyle.errorMsg}>{guardianFirstNameError}</Text> : null}
                                                </View>
                                                <View style={[LoginStyle.inputContainer, LoginStyle.inputContainerSignUp]}>
                                                    <TextInput
                                                        style={LoginStyle.input}
                                                        placeholder="Surname"
                                                        placeholderTextColor={Colors.gray99}
                                                        value={guardianSurname}
                                                        onChangeText={(text) => { SetGuardianSurname(text); SetGuardianSurnameError("") }}
                                                        returnKeyLabel='Done'
                                                        returnKeyType='done'
                                                        autoCapitalize="none"
                                                    />
                                                    {guardianSurnameError !== "" ? <Text style={LoginStyle.errorMsg}>{guardianSurnameError}</Text> : null}
                                                </View>
                                            </View>
                                            <View style={LoginStyle.pickerContainer}
                                            >
                                                <RNPickerSelect
                                                    onValueChange={(value) => {
                                                        SetRelationtoPatient(value);
                                                        SetRelationtoPatientError("");
                                                    }}
                                                    value={relationtoPatient}
                                                    items={
                                                        [
                                                            { label: "Mother", value: "Mother" },
                                                            { label: "Father", value: "Father" },
                                                            { label: "Sister", value: "Sister" },
                                                            { label: "Brother", value: "Brother" },
                                                            { label: "Others", value: "Others" }
                                                        ]
                                                    }
                                                    //multiline={true}
                                                    //textInputProps={{multiline: true}} 
                                                    pickerProps={{ numberOfLines: 2 }}
                                                    style={pickerStyle}
                                                />
                                                {relationtoPatientError !== "" ? <Text style={LoginStyle.errorMsg}>{relationtoPatientError}</Text> : null}
                                            </View>

                                        </View>
                                    }



                                </ScrollView>
                            </View>
                            <View style={[LoginStyle.inputContainerBoxes, LoginStyle.inputContainerBoxesSignUpDown]}>
                                <View style={LoginStyle.checkboxContainer}>
                                    <CustomCheckbox
                                        value={isChecked}
                                        onPress={() => {
                                            setIsChecked(!isChecked)
                                        }
                                        }
                                    />
                                    <Text style={LoginStyle.checkboxlabel}>Yes, I would like to hear about offer & health news.</Text>
                                </View>
                                <View style={LoginStyle.checkboxContainer}>
                                    <CustomCheckbox
                                        value={isCheckedacknowledge}
                                        onPress={() => {
                                            setIsCheckedacknowledge(!isCheckedacknowledge)
                                        }
                                        }
                                    />
                                    <Text style={LoginStyle.checkboxlabel}>I acknowledge that I have read and agree to the  Terms & Conditions and the  Privacy Policy .</Text>
                                </View>
                            </View>
                            <View style={[LoginStyle.loginBtnInner, LoginStyle.loginBtnInnerSignup]}>
                                <TouchableOpacity style={LoginStyle.loginButton} onPress={signupSubmit}>
                                    <Text style={LoginStyle.loginButtonText}>Sign up</Text>
                                </TouchableOpacity>

                            </View>
                            <View style={[LoginStyle.signUpRow, LoginStyle.signUpRowForSignUp]}>
                                <Text style={LoginStyle.signUpText}>
                                    Want to go back?{' '}
                                    <Text style={LoginStyle.signUpLink} onPress={gotoLoginPage}>
                                        Login
                                    </Text>
                                </Text>
                                <View style={LoginStyle.signUpUnderline}></View>
                            </View>
                        </View >
                    </View >

                    <GlobalModal
                        visible={passwordHintFlag}
                        animationType="fade"
                        onCancel={() => setPasswordHintFlag(false)}
                        footer={false}
                        header={true}
                        headerTitle='Password Hints'
                        body={
                            <View style={LoginStyle.passwordHintContainer}>
                                <Text style={LoginStyle.hintTextInn}>* Minimum length, which must be at least 6 characters</Text>
                                <Text style={LoginStyle.hintTextInn}>* Requires numbers</Text>
                                <Text style={LoginStyle.hintTextInn}>
                                    * Requires a special character from this set: {specialChars}
                                </Text>
                                <Text style={LoginStyle.hintTextInn}>* Requires uppercase letters</Text>
                                <Text style={LoginStyle.hintTextInn}>* Requires lowercase letters</Text>
                            </View>
                        }

                    />

                </View>

                {/* </TouchableWithoutFeedback> */}
            </>
        </KeyboardAwareScrollView >

    );
}



const mapStateToProps = (globalState) => {
    return {
        //token: globalState.token

    };
}

// export default SignupScreen;
export default connect(mapStateToProps, { setSignUpEmail })(SignupScreen);

const pickerStyle = {
    inputIOS: {
        width: '100%',              // Set the width of the picker
        color: '#666',
        fontSize: 13,
        padding: 5,
        paddingVertical: 10,
        margin: 0,
        fontFamily: 'Montserrat-Regular',
        backgroundColor: '#fff',
    },
    placeholder: {
        color: '#666',
        fontSize: 13,
        fontFamily: 'Montserrat-Regular',
    },
    inputAndroid: {
        width: '100%',              // Set the width of the picker
        color: '#666',
        fontSize: 13,
        padding: 0,
        margin: 0,
        fontFamily: 'Montserrat-Regular',
        backgroundColor: '#fff',
    },
};
