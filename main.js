import * as upgradeLogic from "./upgradeLogic.js";

// Current resource logic
const currencyButtons = document.querySelectorAll('.resourceFolder div');
const currentAmount = document.getElementById("currentResourceInput");
const saveDataRadio = document.getElementById("saveData");

let resourceInputText = document.getElementById("currentResourceTxt");
let currentResource = "goldenScrap";
let NumberFormat = "";

let amountToGet = null;
let currStrState = null;
let amountCurrentlyLeft = null;
let conversionFailed = false;

currencyButtons.forEach(div => {
    const button = div.querySelector('button');
    const img = div.querySelector('img');

    button.addEventListener('click', () => {
        changeResourceText(button.name, img.alt);
    });
});

// Getting the barrel positions input for both sides
const inputDivs = document.querySelectorAll('.barrelPositions div');
const preInputValues = [];
const postInputValues = [];

inputDivs.forEach(div => {
    const input = div.querySelector('input[type="number"]');;
    input.value = null;

    if (input.id.slice(0,-2) === "numberP"){
        preInputValues.push(input);

        input.addEventListener('input', () => {
            if (input.value == 0){
                input.value = null
            }
            calculate();
        });
       }
    else if (input.id.slice(0,-2) === "numberT"){
        postInputValues.push(input);
        input.addEventListener('input', () => {
            if (input.value == 0){
                input.value = null
            }
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

    input.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            changeAllLevels(button.id,input.value,"PSA");
        }
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

function resetButtonInputs(){
    setAllDiv.forEach(div => {
        const input = div.querySelector('input');
        input.value = null;
    })

    changeColumnDiv.forEach(div => {
        const input = div.querySelector('input[type="number"]');;
        input.value = null;
    });
    
    changeRowDiv.forEach(div => {
        const input = div.querySelector('input[type="number"]');;
        input.value = null;
    });
    
}

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
    input.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            changeRowColumnLevelPosition(input.id,input.value);
        }
    });
};

function changeResourceText(name, imgAlt) {
    upgradeLogic.savePositionLevels(currentResource,currentAmount.value);
    // reset all input buttons values
    resetButtonInputs();

    currentResource = imgAlt;
    resourceInputText.innerText = "Current Resource: " + imgAlt;
    resultsText.innerText = "";

    // change image
    const imagePath = "./images/" + name + ".png"
    const image = document.getElementById("resultsImg");
    image.src = imagePath;
    image.alt = imgAlt;
    
    const color = (currentResource === "Golden Scrap") ? "orange" : (currentResource === "Star Fragments") ? "yellow" : (currentResource === "Mastery Tokens") ? "orange" : (currentResource === "Magnets") ? "red" : (currentResource === "Wrench") ? "lightgray" : "white";
    preInputValues.forEach(input => {
        input.style.color = color;
        input.style.setProperty('--placeholder-color', color);
        const css = "input[type='number'][id='" + input.id + "']::placeholder { color: " + color + "; }";
        const style = document.createElement('style');
        style.textContent = css;
        document.head.append(style);
    })
    postInputValues.forEach(input => {
        input.style.color = color;
        input.style.setProperty('--placeholder-color', color);
        const css = "input[type='number'][id='" + input.id + "']::placeholder { color: " + color + "; }";
        const style = document.createElement('style');
        style.textContent = css;
        document.head.append(style);
    })

    resetAllLevels("PCC2");
    resetAllLevels("POCC2");

    amountToGet = 0;
    upgradeLogic.loadPositionLevels(imgAlt);
    const resourceinputValue = upgradeLogic.getResourceInput(currentResource);
    currentAmount.value = resourceinputValue;
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

    if (amountToGet != null && amountToGet > 0){
        responseTxt.innerText = (currStrState === "enough") ? "You have enough!" : (currStrState === "more") ? "Total cost: " + upgradeLogic.convertNumberIntoText(amountToGet) + " " + currentResource : "";
    }
    else{
        responseTxt.innerText = "";
    }

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

function loadData(){
    var data = JSON.parse(localStorage.getItem("data"));
    if (data != null){
        upgradeLogic.updatePositionLevels(data);

        if (data.SaveData != null && data.SaveData != undefined){
            saveDataRadio.checked = data.SaveData;
        }
        else{
            data.SaveData = saveDataRadio.checked;
        }
    }
    else{
        data = {"SaveData": saveDataRadio.checked};
    }

    saveDataRadio.addEventListener("change", () => {
        data.SaveData = saveDataRadio.checked;
    })
}

loadData();

updateStatus("Good", "Clean");
changeNumberFormat("Suffix");
upgradeLogic.initiate(preInputValues,postInputValues);
changeResourceText(currentResource, "Golden Scrap");


window.addEventListener("beforeunload", () => {
    if (saveDataRadio.checked == true){
        let positionlev = upgradeLogic.getPositionLevels();
        positionlev.SaveData = saveDataRadio.checked;
        upgradeLogic.updatePositionLevels(positionlev);

        upgradeLogic.savePositionLevels(currentResource);
    }
    else{
        // delete data 
        localStorage.removeItem("data");
    }
});
