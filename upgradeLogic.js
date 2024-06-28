import { prefixes } from "./prefix.js";

var currentArray = Array.from({length:5},()=>new Array(4).fill(0))
var targetArray = Array.from({length:5},()=>new Array(4).fill(0))

let NumberFormatValue = "";

let positionLevels = {};

function getGoldenScrapLevel(level) {
    if (level <= 400) {
        return Math.pow(10, 9) * level;
    } else if (level <= 500) {
        return 1.05 * Math.pow(10, 9) * level;
    } else {
        let ceil = Math.ceil((level - 500.0) / 100.0);
        return 1.05 * Math.pow(1.2, ceil) * (Math.pow(10, 9) * level);
    }
}

function getStarFragmentLevel(level) {
    if (level <= 10) {
        return Math.pow(10, 4) * level;
    }
    let ceil = Math.ceil(level / 10.0);
    if (ceil % 2 === 0) { // even
        return Math.pow(10, 4) * level * Math.pow(2, Math.ceil(level / 20.0));
    } else if (ceil % 2 !== 0) { // odd
        return Math.pow(10, 4) * level * Math.pow(2, Math.ceil(level / 20.0)) * (3 / 4.0);
    } else {
        return 0;
    }
}

function getMasteryLevel(level) {
    if (level <= 500) {
        return level;
    } else {
        let exp = (level - 500) / 100.0;
        return level * Math.pow(level, exp);
    }
}

function getMagnetLevel(level) {
    return 2.5 * Math.pow(10, 6) * Math.pow(1.15, level - 1) * level;
}

function getWrenchesLevel(level) {
    return Math.pow(10, 9) * Math.pow(1.075, level - 1) * level;
}
export function changeNumberFormatValue(value){
    NumberFormatValue = value;
}
export function convertToScientificNotation(number) {
    if (number < 1000000){}
    let exp = Math.floor(Math.log10(number));
    let mantissa = number / Math.pow(10, exp);
    mantissa = parseFloat(mantissa.toFixed(5)); // Truncate to 3 decimal places
    return mantissa + "E" + exp;
}

export function convertSuffixToNumber(str){
    if (str.length == 0){
        return null;
    }
    for (let suffix of prefixes) {
        if (str.endsWith(suffix.symbol)) {
            let numberStr = str.slice(0, -suffix.symbol.length);
            return parseFloat(numberStr) * suffix.factor;
        }
    }
    return parseFloat(str);; // No recognized suffix, parse as regular number
}

export function convertToMetricPrefixes(number) {
    for (let i = 0; i < prefixes.length; i++) {
        if (number >= prefixes[i].factor) {
            return (number / prefixes[i].factor).toFixed(2) + prefixes[i].symbol;
        }
    }

    return formatNumberWithSpaces(number); // No recognized number.toString(); // Less than million, return as is
}

export function convertToRegularNumber(number) {
    return formatNumberWithSpaces(number);
}

export function convertNumberIntoText(number){
    if (NumberFormatValue == "Normal"){
        return convertToRegularNumber(number);
    }
    else if (NumberFormatValue == "Suffix"){
        return convertToMetricPrefixes(number);
    }
    else if (NumberFormatValue == "Scientific"){

        return convertToScientificNotation(number);
    }
}

export function createPositionLevel(name){
    if (positionLevels[name] != null){
        return;
    }

    positionLevels[name] = {
        Current: Array.from({length:5},()=>new Array(4).fill(0)),
        Target: Array.from({length:5},()=>new Array(4).fill(0)),
    }
    // save levels
    savePositionLevels(name);
}

export function loadPositionLevels(name){
    if (positionLevels[name] == null){
        createPositionLevel(name);
    }

    for (let i = 0; i < 5; i++) { // Iterates over rows
        for (let j = 0; j < 4; j++) { // Iterates over columns
            let preLevel = positionLevels[name]["Current"][i][j];
            let postLevel = positionLevels[name]["Target"][i][j];

            currentArray[i][j].value = preLevel;
            targetArray[i][j].value = postLevel;

        }
    }
}

export function savePositionLevels(name){
    if (positionLevels[name] == null){
        return;
    }

    for (let i = 0; i < 5; i++) { // Iterates over rows
        for (let j = 0; j < 4; j++) { // Iterates over columns
            let preLevel = currentArray[i][j];
            let postLevel = targetArray[i][j];

            positionLevels[name]["Current"][i][j] = preLevel.value;
            positionLevels[name]["Target"][i][j] = postLevel.value;
        }
    }
}

export function initiate(current, target){
    current.forEach(element => {
        const col = element.id[element.id.length -1];
        const row = element.id[element.id.length -2];
        currentArray[row][col] = element;
    });

    target.forEach(element => {
        const col = element.id[element.id.length -1];
        const row = element.id[element.id.length -2];
        targetArray[row][col] = element;
    });
}

export function formatNumberWithSpaces(number) {
    // Create a NumberFormat instance with US locale and custom pattern
    let decimalFormat = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3
    });

    // Format the number with commas for thousands separators
    let formattedNumber = decimalFormat.format(number);

    // Replace commas with spaces
    formattedNumber = formattedNumber.replace(/,/g, ' ');

    return formattedNumber;
}



function calculateResource(name, number){
    const level = number + 1
    switch (name) {
        case "Golden Scrap":
            return getGoldenScrapLevel(level);
        case "Star Fragments":
            return getStarFragmentLevel(level);
        case "Magnets":
            return getMagnetLevel(level);
        case "Wrench":
            return getWrenchesLevel(level);
        case "Mastery Tokens":
            return getMasteryLevel(level);
        default:
            console.log("Error");
            return 0
    }
}


export function getLevelPrice(name, level){
    return calculateResource(name, level)
}

export function calculate(name, currentAmount, current, target){
    let amount = 0;
    let conversionFailed = false;
    // amount is optional


    for (let i = 0; i < 5; i++) { // Iterates over rows
        for (let j = 0; j < 4; j++) { // Iterates over columns
            let preLevel = parseInt(currentArray[i][j].value);
            let postLevel = parseInt(targetArray[i][j].value);

            if (preLevel > postLevel) {
                return {"str":"level error"};
            }
            for (let level = preLevel; level < postLevel; level++) {
                amount =  parseFloat(amount) + parseFloat(calculateResource(name,level));
            }
        }
    }

    
    currentAmount = convertSuffixToNumber(currentAmount);

    if (currentAmount != null && currentAmount == false){
        currentAmount == null;
        conversionFailed = true;
    }

    if (currentAmount != null && parseFloat(currentAmount)){
        let amountLeft = parseFloat(currentAmount , amount);
        let currentAmmountLeft = amountLeft - amount;
        if (currentAmmountLeft > 0){
            return {"amount": amount, "currentAmmountLeft": currentAmmountLeft, "str": "enough"};
        }
        else {
            return {"amount": amount, "currentAmmountLeft": Math.abs(currentAmmountLeft), "str": "more"};
        }
    }

    return {"amount": amount, "conversionFailed": conversionFailed};

}