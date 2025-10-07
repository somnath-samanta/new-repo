import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
class Utility {

    static async getCurrencySymbol(currencyCode) {

        const currencySymbols = {
            "USD": "$",
            "EUR": "€",
            "GBP": "£",
            "INR": "₹",
            "JPY": "¥",
            "AUD": "A$",
            "CAD": "C$",
            "CNY": "¥",
            "CHF": "CHF",
            "RUB": "₽",
            "BRL": "R$",
            "ZAR": "R",
            "SEK": "kr",
            "NOK": "kr",
            "DKK": "kr",
            "PLN": "zł",
            "MXN": "$",
            "ARS": "$",
            "CLP": "$",
            "COP": "$",
            "NZD": "$",
            "SGD": "$",
            "HKD": "$",
            "MYR": "RM",
            "IDR": "Rp",
            "THB": "฿",
            "KRW": "₩",
            "TRY": "₺",
            "ILS": "₪",
            "EGP": "£",
            "SAR": "﷼",
            "AED": "د.إ",
            "PKR": "₨",
            "LKR": "₨",
            "BDT": "৳",
            "VND": "₫",
            "PHP": "₱",
            "KZT": "₸",
            "UAH": "₴",
            "NGN": "₦",
            "GHS": "₵",
            "KES": "Sh",
            "TZS": "Sh",
            "UGX": "USh",
            "ZMW": "ZK",
            "MAD": "د.م.",
            "DZD": "د.ج",
            "TND": "د.ت",
            "LBP": "ل.ل",
            "JOD": "د.ا",
            "QAR": "ر.ق",
            "BHD": "ب.د",
            "OMR": "ر.ع.",
            "KWD": "د.ك"
        }

        return currencySymbols[currencyCode] || currencyCode; // Fallback to currencyCode if symbol not found
    }


    static hasNonZeroValues(input) {
        const numbers = input.split(',').map(Number);
        return numbers.some(num => num !== 0);
    }

    static formatDate = (date) => {
        if (!date) return '';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    static validate_pan_Number = (value) => {
        var number = value.toUpperCase();
        var filter = /[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (filter.test(number)) {
            return true;
        }
        else {
            return false;
        }
    }

    static validate_aadhar_number = (value) => {
        var number = value;
        // var filter = /^\d{4}\s\d{4}\s\d{4}$/;
        var filter = /^\d{12}$/;
        if (filter.test(number)) {
            return true;
        }
        else {
            return false;
        }
    }

    static validate_identity_card_number = (value) => {
        var number = value;
        var filter = /^[A-Za-z0-9]{8,}$/;
        if (filter.test(number)) {
            return true;
        }
        else {
            return false;
        }
    }
    static validate_driving_licence_number = (value) => {
        var number = value;
        var filter = /^[A-Za-z0-9]{6,12}$/;
        if (filter.test(number)) {
            return true;
        }
        else {
            return false;
        }
    }
    static validateIFSC = (value) => {
        var number = value.toUpperCase();
        var filter = /^[A-Za-z]{4}0[A-Z0-9]{6}$/;
        if (filter.test(number)) {
            return true;
        }
        else {
            return false;
        }
    }
    static validateBankAccountNumber = (value) => {
        var number = value.toUpperCase();
        var filter = /^\d{9,18}$/;
        if (filter.test(number)) {
            return true;
        }
        else {
            return false;
        }
    }

    static debounceButton = (func, delay) => {
        let timeoutId;
        let lastArgs;
        let lastThis;

        const later = function () {
            func.apply(lastThis, lastArgs);
            lastThis = null;
            lastArgs = null;
        };

        return function () {
            lastThis = this;
            lastArgs = arguments;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(later, delay);
        };
    }


}


export default Utility;