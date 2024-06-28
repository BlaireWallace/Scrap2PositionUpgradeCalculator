import * as upgradeLogic from "./upgradeLogic.js";

// Current resource logic
const currencyButtons = document.querySelectorAll('.resourceFolder button');
const currentAmount = document.getElementById("currentResourceInput");
let resourceInputText = document.getElementById("currentResourceTxt");
let currentResource = "goldenScrap";
let NumberFormat = "";

let amountToGet = null;
let currStrState = null;
let amountCurrentlyLeft = null;
let conversionFailed = false;

currencyButtons.forEach(button => {
    button.addEventListener('click', () => {
        changeResourceText(button.name);
    });
});

// Getting the barrel positions input for both sides
const inputDivs = document.querySelectorAll('.barrelPositions div');
const preInputValues = [];
const postInputValues = [];

inputDivs.forEach(div => {
    const input = div.querySelector('input[type="number"]');;
    input.value = 0;

    if (input.id.slice(0,-2) === "numberP"){
        preInputValues.push(input);

        input.addEventListener('input', () => {
            calculate();
        });
       }
    else if (input.id.slice(0,-2) === "numberT"){
        postInputValues.push(input);
        input.addEventListener('input', () => {
            calculate();
        });
       }
});

// get the change row, change colums
const changeColumnDiv = document.querySelectorAll('.changeColumns div');
const changeRowDiv = document.querySelectorAll('.changeRows div');

changeColumnDiv.forEach(div => {
    changeRowColmnConnection(div);
});

changeRowDiv.forEach(div => {
    changeRowColmnConnection(div);
});

// get set all button
const controlsButtonsDiv = document.querySelectorAll('.controls button');
const setAllDiv = document.querySelectorAll('#CC1');

setAllDiv.forEach(div => {
    const button = div.querySelector('button');
    const input = div.querySelector('input');
    input.value = 0;
    button.addEventListener('click', () => {
      changeAllLevels(button.id,input.value,"PSA");
    });
})

// loop through control buttons
controlsButtonsDiv.forEach(button => {
    // reset buttons
    if(button.name === "PCC2" || button.name === "POCC2"){
        button.addEventListener('click', () => {
            resetAllLevels(button.name);
        })
    }
    else if(button.name === "PCC3" || button.name === "POCC3"){
        button.addEventListener('click', () => {
            decrementAllLevels(button.name);
        })
    }
    else if(button.name === "PCC4" || button.name === "POCC4"){
        button.addEventListener('click', () => {
            incrementAllLevels(button.name);
        })
    }
})

// calculate button
const resultsText = document.getElementById("resultsText");
const calculateButton = document.getElementById("calculate");
calculateButton.addEventListener('click', () => {
    calculate();
});

// Number formatting
const Numberformat = document.querySelectorAll("#NumberformatDiv button");

Numberformat.forEach(input => {
    input.addEventListener('click', () => {
        changeNumberFormat(input.id);
    })
})

function updateStatus(str,color){
    const statusText = document.getElementById("statusText");
    statusText.innerText = "Status: " + str;
    statusText.style.color = color;
}

function changeNumberFormat(name){
    const numberFormatTxt = document.getElementById("numberFormatTxt");
    numberFormatTxt.innerText = "Number format: " + name;

    // change number format
    NumberFormat = name;
    upgradeLogic.changeNumberFormatValue(NumberFormat);
    displayResults();
}

// current amount connection
currentAmount.addEventListener('input', () => {
    calculate();
})

function changeRowColmnConnection(div){
    const input = div.querySelector('input[type="number"]');;
    const button = div.querySelector('button');
    input.value = 0;
    button.addEventListener('click', () => {
        changeRowColumnLevelPosition(input.id,input.value);
    });
};

function changeResourceText(name) {
    upgradeLogic.savePositionLevels(currentResource);

    currentResource = name;
    resourceInputText.innerText = "Current Resource: " + name;
    resultsText.innerText = "";

    // change image
    const image = document.getElementById("resultsImg");
    image.src = "/images/" + name + ".png";
    
    const color = (name === "Golden Scrap") ? "orange" : (name === "Star Fragments") ? "yellow" : (name === "Mastery Tokens") ? "orange" : (name === "Magnets") ? "red" : (name === "Wrench") ? "gray" : "white";
    // change the input color (DO LATER)
    preInputValues.forEach(input => {
        input.style.color = color;
    })
    postInputValues.forEach(input => {
        input.style.color = color;
    })

    resetAllLevels("PCC2");
    resetAllLevels("POCC2");

    amountToGet = 0;
    upgradeLogic.loadPositionLevels(name);
    calculate();
}   

// Core functions
function changePositionLevel(object,value){
    object.innerText = Number(value);
    object.value = Number(value);
}
// Change row/column levels
function changeRowColumnLevelPosition(id, value){
    // Changes a level position from row or column
    // precolumn PRC#
    // pre row PR#
    // post column POC#
    // post row POR#

    let number = id.charAt(id.length - 1);

    function stringsMatch(id,string){
        return id.slice(0,-1) === string;
    }

    function funnelInputs(tbl,str){
        tbl.forEach(input => {
            let inputId = input.id.slice(-2);
            if (str === "PRC" || str === "POC"){
                if (inputId === "0" + number || inputId === "1" + number || inputId === "2" + number  || inputId === "3" + number || inputId === "4" + number){
                    changePositionLevel(input,value);
                }
            }
            else if (str === "PR" || str === "POR"){
                if (inputId === number + "0" || inputId === number + "1" || inputId === number + "2" || inputId === number + "3" || inputId === number + "4"){
                    changePositionLevel(input,value);
                }
            }  
        })
    }

    let tbl = (stringsMatch(id, "PRC") || (stringsMatch(id, "PR"))) ? preInputValues : postInputValues
    funnelInputs(tbl,id.slice(0,-1));

    calculate();
}

function changeAllLevels(id,level,preStr){
    let tbl = (id === preStr) ? preInputValues : postInputValues
    tbl.forEach(input => {
        changePositionLevel(input,level);
    })    

    calculate();
}

function resetAllLevels(id){
   changeAllLevels(id,0,"PCC2");
}

function incrementAllLevels(id){
    let tbl = (id === "PCC4") ? preInputValues : postInputValues
    tbl.forEach(input => {
        const value = Number(input.value) + 1
        changePositionLevel(input,value);
    })  
    
    calculate();
}

function decrementAllLevels(id){
    let tbl = (id === "PCC3") ? preInputValues : postInputValues
    tbl.forEach(input => {
        if (input.value -1 >= 0){
            changePositionLevel(input,input.value - 1);
        }
    })    

    calculate();
}

function displayResults(){
    if ((currStrState == "level error")){
        updateStatus("Current Position level is higher than Target Position Level!","red");
    }
    else if (conversionFailed == true){
        updateStatus("Invalid amount input!", "red")
    }
    else {
        updateStatus("Good", "lime");
    }

    
    const extraTxt = document.getElementById("totalAmountText");
    const responseTxt = document.getElementById("enoughTxt");
    responseTxt.innerText = (currStrState === "enough") ? "You have enough!" : (currStrState === "more") ? "Total cost: " + upgradeLogic.convertNumberIntoText(amountToGet) + " " + currentResource : "";
    if (currStrState === "enough" && amountToGet > 0){
        extraTxt.innerText = "Total cost: " + upgradeLogic.convertNumberIntoText(amountToGet) + " " + currentResource;
    }
    else{
        extraTxt.innerText = "";
    }

    if (amountCurrentlyLeft != null && currStrState !== "enough" && amountToGet > 0){
        resultsText.innerText = "You need: " + upgradeLogic.convertNumberIntoText(amountCurrentlyLeft) + " more";
    }
    else if (currStrState === "enough" && amountToGet > 0){
        resultsText.innerText = "You have: " + upgradeLogic.convertNumberIntoText(amountCurrentlyLeft) + " extra";
    }
    else if (amountToGet > 0){
        resultsText.innerText = "You need: " + upgradeLogic.convertNumberIntoText(amountToGet);
    }
    else{
        resultsText.innerText = "";
    }
}

function resetDisplay(){
    const extraTxt = document.getElementById("totalAmountText");
    const responseTxt = document.getElementById("enoughTxt");

    resultsText.innerText = "";
    extraTxt.innerText = "";
    responseTxt.innerText = "";
    updateStatus("Good", "Clean");

    if ((currStrState == "level error")){
        updateStatus("Current Position level is higher than Target Position Level!","red");
    }
    else if (conversionFailed == true){
        updateStatus("Invalid amount input!", "red")
    }
    else {
        updateStatus("Good", "lime");
    }
}

function calculate(){
    const details = upgradeLogic.calculate(currentResource,currentAmount.value,preInputValues,postInputValues);
    const price = details.amount;
    const amountLeft = details.currentAmmountLeft;
    const str = details.str;
    const conversionError = details.conversionFailed;

    conversionFailed = (conversionError == true) ? true : false;
    amountToGet = price;
    amountCurrentlyLeft = amountLeft;
    currStrState = str;

    displayResults();
}

updateStatus("Good", "Clean");
changeNumberFormat("Suffix");
upgradeLogic.initiate(preInputValues,postInputValues);
changeResourceText(currentResource);
