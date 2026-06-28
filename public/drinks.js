'use strict';


import ajax from './ajax.js';
import domoptions from './domoptions.js';
import domgeneratetable from './domgeneratetable.js';


// KONSTANTEN / VARIABLEN
const elements = {};
let path = 'data/drinks.json';
let dataDrinks = [];
let offset = 0;            /* 0 = Local Storage / 2 = Couch DB (ersten beiden Wertpaare werden in der Tabelle nicht mit angezeigt */
let allMyDrinksPics = [];

// FUNKTIONEN

/* ------------------------------------ TABELLE ------------------------------------ */

/* Zeigt die Tabelle mit allen Einträgen */
const showTable = () => {

    /* erzeugt ein Eingabefeld zum filtern der Tabelle */
    $('<input>', { id: 'search', class: 'w3-input w3-opacity-min w3-third w3-middle', title: '', placeholder: 'Search..' }).appendTo('#id00');

    domgeneratetable.filterTable();

    /* erzeugt die Tabelle */
    $('<table>', { id: '', class: '', title: 'dblclick to load this drink' }).appendTo('#id00');
    let table = document.querySelector("table");
    //KI meint anders
    //let data = Object.keys(dataDrinks[0]);   //element -- ACHTUNG: ein Element muß vorhanden sein
    /* Erzeugt die Spalten-Reihenfolge krisenfest fürs Auge (Offset schneidet _id und _rev ab) */
    let data = ['_id', '_rev', 'name', 'kategorie', 'anzahlPersonen', 'datumZubereitung', 'informationen', 'dateiName'];

    domgeneratetable.generateTable(table, dataDrinks, offset);
    domgeneratetable.generateTableHead(table, data, offset);
    domgeneratetable.generateTableFoot(table, data);
    domgeneratetable.changeTableHead();

    /* Für Testzwecke */
    // console.log("Länge: " + dataDrinks.length);
    // // $("tr").click(function () {
    // //     $("tr").each(function () {
    // //         alert($(this).text())
    // //     });
    // // });

    let trEl = -1; /* Dieser Wert würde einen neuen Eintrag erzeugen. */

    $('#imgBG').addClass("w3-opacity-max");
    $('table').addClass("w3-table w3-striped w3-white w3-opacity-min");
    $('tbody tr, tfoot tr').addClass("w3-hover-yellow");
    //$('thead').css({ "background-color": "teal", "color": "white", "font-size": "110%" });

    $('tbody tr').click(function () {
        $('tbody tr, tfoot tr').css({ "background-color": "", "font-size": "" });

        $(this).css({ "background-color": "yellow" });
        trEl = $(this).index(); // für spätere Tastaturanbindung
        //console.log('click:' + trEl);
        console.log('click:', dataDrinks[trEl]);
    });

    $('tfoot tr').click(function () {
        $('tbody tr, tfoot tr').css({ "background-color": "", "font-size": "" });

        $(this).css({ "background-color": "yellow" });
        trEl = -1;
        console.log('click:' + trEl); // für spätere Tastaturanbindung
    });

    $("tbody tr").dblclick(function () {
        //$('#id01').style.display='block';
        $('#id01').css({ "display": "block" });
        $('table').addClass("w3-hide");
        $('#search').addClass("w3-hide");
        // $("tr").each(function () {
        //     alert($(this).text())
        // });
        trEl = $(this).index();
        console.log('dblclick:' + trEl);
        fillModal(trEl);
    });

    $("tfoot tr").dblclick(function () {
        $('#id01').css({ "display": "block" });
        $('table').addClass("w3-hide");
        $('#search').addClass("w3-hide");
        trEl = -1;
        console.log('dblclick:' + trEl);
        fillModal(trEl);
    });

    $("#greatButton").removeClass("w3-teal");

    $('tfoot td').attr({ "colspan": "6", "align": "center" });
    $('tfoot').addClass("w3-centered w3-gray");
}

/* Löscht die Tabelle */
const handleClickAndClear = () => {

    dataDrinks = [];
    const elmnt = document.querySelector('table');

    elmnt.remove();

    $("#search").remove();
}


/* ------------------------------------ MODAL ------------------------------------ */

/* Füllt das Modal-Fenster (Detailansicht) */
const fillModal = trEl => {
    if (trEl >= 0) {
        for (let attr in dataDrinks[trEl]) {
            let elInput = $(`[name="${attr}"]`);
            if (elInput) elInput.val(dataDrinks[trEl][attr]);
        }
    } else {
        $('input, textarea').val('');

    }

    /* Anhand des des Dateinamens im entsprechenden Inputfeldes wird wird entschieden,
    was für Detailbild dargestellt wird und welche Vorauswahl im Optionsfeld angezeigt wird */
    let detailPicName = $("#fromFileInput").val();
    // console.log(detailPicName);
    if (detailPicName) {
        $("#detailPic").attr("src", "pics/" + detailPicName);
        $("#bildAuswahl").val(detailPicName);
    }
    else {
        $("#detailPic").attr("src", "pics/" + 'default.jpg');
        $("#bildAuswahl").val('default.jpg');
    }
    appendModalEventlisteners(trEl);
}

/* Setzt (bzw. beendet) für das Modal-Fenster (Detailansicht) entsprechende Eventlisteners */
const appendModalEventlisteners = trEl => {

    /* Modal: Button zum Speichern
    const btnSpeichern = document.querySelector('#btnSpeichern');
    btnSpeichern.addEventListener('click', handleSpeichern(trEl)); */
    $('#btnSpeichern').unbind();
    $('#btnSpeichern').click(function () {
        handleSpeichern(trEl);
    });

    /* Modal: Button zum Löschen */
    $('#btnLoeschen').unbind();
    $('#btnLoeschen').click(function () {
        handleLoeschen(trEl);
    });

    // /* Modal: Opazität verändern bei hover */        // deaktiviert
    // $('#id01').hover(function () {
    //     $(this).removeClass("w3-opacity-min");
    // }, function () {
    //     $(this).addClass("w3-opacity-min");
    // });

    /* Modal: Bild vergrößern */
    $('#detailPic').hover(function () {
        let detailPicEl = $(this).attr("style");
        $(this).removeAttr("style");
        $(this).css({ "max-height": "750px" });
        $(this).removeClass("w3-hover-opacity w3-display-middle");
        $(this).addClass("w3-display-topmiddle w3-image");
        //$(this).attr({ "z-index": "400" });
        $("#id01").removeClass("w3-opacity-min");
        $("#fileInputLabel, #fileInput, #dateien, #dateienLabel, #fromFileInput, #fromFileInputLabel").addClass("w3-hide");
        //$('#detailPic').css({ "height": "auto" }); //"background-color": "teal", 
    }, function () {
        $(this).removeAttr("style");
        $(this).css({ "height": "100px" });
        $(this).addClass("w3-hover-opacity w3-display-middle");
        $(this).removeClass("w3-display-topmiddle w3-image");
        $("#id01").addClass("w3-opacity-min");
        $("#fileInputLabel, #fileInput, #dateien, #dateienLabel, #fromFileInput, #fromFileInputLabel").removeClass("w3-hide");
    });
}

/* Verbirgt das Modalfenster (Detailansicht) */
const closeModal = () => {
    document.getElementById('id01').style.display = 'none';
    $('table').removeClass("w3-hide");
    $('#search').removeClass("w3-hide");
}

/* ungenutzt */
const fillInputs = (trEl, drinkString) => {
    //for (let key in element) {
    for (let key of drinkString) {
        let cell = row.insertCell();
        let text = document.createTextNode(element[key]);   //
        cell.appendChild(text);
    }
    //}
}

/* Name der ausgewählten Datei wird in das entsprechende Eingabefeld geschrieben */
const showname = () => {
    let name = document.getElementById('fileInput');
    $("#fromFileInput").val(name.files.item(0).name);  // addClass("w3-black")
    //   alert('Selected file: ' + name.files.item(0).name);
    //   alert('Selected file: ' + name.files.item(0).size);
    //   alert('Selected file: ' + name.files.item(0).type);
};

/* Name des ausgewählten Dateinamens des Optionsfeldes wird in das entsprechende Eingabefeld geschrieben */
const showOptionName = () => {
    let name = document.getElementById('bildAuswahl');
    console.log('name.val: ' + name.value)
    $("#fromFileInput").val(name.value);  // addClass("w3-black")
};


/* ------------------------------------ LOCAL STORAGE ------------------------------------ */

/* geladene Daten aus externer Datei - Datenumwandlung */
const handleLoaded = xhr => {
    // Daten umwandeln, um damit arbeiten zu können
    dataDrinks = JSON.parse(xhr.responseText);
    console.log(dataDrinks);

    showTable();
}

/* Daten aus externer Datei laden */
const loadData = () => {
    const xhr = new XMLHttpRequest();
    xhr.open('get', path);
    xhr.addEventListener('load', () => {
        if (xhr.status == 200) handleLoaded(xhr);
        else console.warn(`Error: ${path} kann nicht geladen werden. ${xhr.status}`);
    });
    xhr.send();
}

/*Daten ins Local Storage schreiben */
const handleClickAndSaveLS = () => {

    let drinksString = JSON.stringify(dataDrinks);
    console.log(drinksString);

    localStorage.setItem('drinks', drinksString);
}

/*Daten aus Local Storage ziehen */
const handleClickAndLoadLS = () => {

    let drinksString = localStorage.getItem('drinks');
    /*Überprüfung: drinkstring wäre leer, wenn in Local Storage nichts gespeichert ist */
    if (!drinksString == 0) {
        dataDrinks = JSON.parse(drinksString);
        showTable();
    }
}

/* Versuch, die Datei vom Local Storage zu laden - kann kein Inhalt geladen - wird von der ext. Datei geladen */
/* momentan ungenutzt, da von der DB geladen wird */
const tryLoading = () => {
    handleClickAndLoadLS();
    console.log("try vor if");
    if (dataDrinks.length === 0) {
        console.log("try");
        loadData();
    };
}


/* ------------------------------------ DB ------------------------------------ */

/* Daten aus DB ziehen */
const handleClickAndLoadDB = () => {
    offset = 2;
    fetch('/getAllDrinks').then(
        response => response.json()
    ).then(
        dataDrinksDB => {
            // dataDrinks = JSON.parse(dataDrinksDB)
            dataDrinks = dataDrinksDB
            //console.log(dataDrinksDB)
        }
    ).then(
        /* showTable() - Klammern sorgen für sofortigen Funktionsaufruf - das wäre zu früh*/
        showTable
    )
    // let drinksString = localStorage.getItem('drinks');
    /*Überprüfung: drinkstring wäre leer, wenn in Local Storage nichts gespeichert ist */
    // if (!drinksString == 0) {
    //     dataDrinks = JSON.parse(drinksString);
    //     showTable();
    // }
}

/* Füllt die DB */
const handleClickAndFillDB = () => {

    // Alle Drinks speichern in DB
    dataDrinks.forEach(element => {
        ajax.saveAllDrinks(element).then(
            res => console.log("DB gefüllt")
            //res => render.renderAllCities(res, elements.main)
        ).catch(
            console.warn
        );
    });
}

/* Füllt die DB mit einem Drink */
const fillOneDrinkInDB = (dataDrink) => {
    console.log("dataDrink ", dataDrink);

    // einen Drink speichern in DB
    ajax.saveOneDrink(dataDrink).then(
        //res => console.log("DB gefüllt"),
        //res => render.renderAllCities(res, elements.main)
        handleClickAndClear
    ).then(
        handleClickAndLoadDB
    ).catch(
        console.warn
    );
}

/* Löscht einen Drink aus der DB */
const clearOneDrinkInDB = (dataDrink) => {
    console.log("dataDrink löschen", dataDrink);
    // einen Drink speichern in DB
    ajax.clearOneDrink(dataDrink).then(
        //res => console.log("DB gefüllt"),
        //res => render.renderAllCities(res, elements.main)
        handleClickAndClear
    ).then(
        handleClickAndLoadDB
    ).catch(
        console.warn
    );
}

/* Regelt das Speichern im Local Storage und DB*/
const handleSpeichern = (trEl) => {
    //console.log("a? " + JSON.stringify(dataDrinks[trEl]));
    /* Ist trEl -1 (Neuer Eintrag) - wird ein Dummy angelegt - dieser wird dann im nächsten Schritt überschrieben */
    if (trEl == -1) {

        dataDrinks.push({
            "name": "default",
            "kategorie": "default",
            "anzahlPersonen": 0,
            "datumZubereitung": "2022-08-04",
            "informationen": "default",
            "dateiName": "default.jpg"
        });
        trEl = dataDrinks.length - 1;
        // for (let attr in dataDrinks[trEl]) {
        //     let elInput = $(`[name="${attr}"]`);
        //     dataDrinks[trEl][attr] = elInput.val();
        // }
    }
    /* Zuordnung: Die Namen der Eingabefelder entsprechen den Schlüsselattributen (keys) des Datenobjektes,
    so wird das Datenobjekt an richtiger Stelle befüllt.*/
    for (let attr in dataDrinks[trEl]) {
        let elInput = $(`[name="${attr}"]`);
        /* If-Anweisung bewirkt, dass _id und _rev erhalten bleiben */
        if (elInput.length) dataDrinks[trEl][attr] = elInput.val();

    }
    // dataDrinks[trEl].name = $("[name='name']").val();

    if (!offset) {
        /* Speichern im Local Storage */
        localStorage.setItem("drinks", JSON.stringify(dataDrinks));
        handleClickAndClear();
        handleClickAndLoadLS();
    } else {
        /* Speichern eines Drinks in der DB */
        fillOneDrinkInDB(dataDrinks[trEl]);
    }
}

/* Löscht das Element (Tabellen-Zeile) anhand desen Index im Local Storage und DB */
const handleLoeschen = (trEl) => {

    //console.log("löschen: " + trEl);
    if (!offset) {
        /* Löschenn im Local Storage */
        dataDrinks.splice(trEl, 1);

        /* Update von dataDrinks */
        localStorage.setItem("drinks", JSON.stringify(dataDrinks));
        /* Tabelle Löschen */
        handleClickAndClear();
        /* Tabelle generieren */
        handleClickAndLoadLS();
    } else {
        /* Löschen eines Drinks in der DB */
        clearOneDrinkInDB(dataDrinks[trEl]);
    }
}


/* ------------------------------------ MISC ------------------------------------ */

/* Serveranfrage für eine Zusammenstellung aller verwendeten Bilder */
const picsList = () => {
    ajax.getAllPics().then((res) => {
        domoptions.allMyDrinksPicsToOptions(allMyDrinksPics, res);
        // res => console.log(res)

    }).then(
    //     // console.log(allMyDrinksPics)
    //     // res => console.log(res)
    ).catch(
        console.warn
    );
}

const domMapping = () => {
    elements.btnLoad = document.querySelector('#btnLoad');
    elements.greatButton = document.querySelector('#greatButton');
}

const appendEventlisteners = () => {
    elements.btnLoad.addEventListener('click', loadData);
    // elements.greatButton.addEventListener('click', tryLoading); // für Local Storage
    elements.greatButton.addEventListener('click', handleClickAndLoadDB);

    //elements.btnOpenLeftMenu.addEventListener('click', openLeftMenu);
}


/* ------------------------------------ ADMIN ------------------------------------ */

const openLeftMenu = () => { document.getElementById("leftMenu").style.display = "block"; }

const closeLeftMenu = () => { document.getElementById("leftMenu").style.display = "none"; }


const init = () => {
    domMapping();
    appendEventlisteners();

    /* Admin-Console: für Testzwecke */

    /* Admin-Console: Button um ins Local Storage zu schreiben */
    const btnSaveLS = document.querySelector('#btnSaveLS');
    btnSaveLS.addEventListener('click', handleClickAndSaveLS);

    /* Admin-Console: Button um aus dem Local Storage zu Lesen */
    const btnLoadLS = document.querySelector('#btnLoadLS');
    btnLoadLS.addEventListener('click', handleClickAndLoadLS);

    /* Admin-Console: Button um den Array zu leeren */
    const btnClear = document.querySelector('#btnClear');
    btnClear.addEventListener('click', handleClickAndClear);

    /* Admin-Console: Button um die DB zu füllen */
    const btnFillDB = document.querySelector('#btnFillDB');
    btnFillDB.addEventListener('click', handleClickAndFillDB);

    /* Admin-Console: Button um Admin-Console zu öffnen */
    const btnOpenLeftMenu = document.querySelector('#btnOpenLeftMenu');
    btnOpenLeftMenu.addEventListener('click', openLeftMenu);

    /* Admin-Console: Button um Admin-Console zu schließen */
    const btnCloseLeftMenu = document.querySelector('#btnCloseLeftMenu');
    btnCloseLeftMenu.addEventListener('click', closeLeftMenu);

    /* Admin-Console: Button um das Modal-Fenster zu öffnen */
    const btnCloseModal = document.querySelector('#btnCloseModal');
    btnCloseModal.addEventListener('click', closeModal);

    // const btnid01Block = document.querySelector('#btnid01Block');
    // const id01 = document.getElementById('id01').style.display='block';
    // btnid01Block.addEventListener('click', id01);



    /* Inputelement: Bildauswahl (local)*/
    const fileInput = document.querySelector('#fileInput');
    fileInput.addEventListener('change', showname);

    /* Inputelement: Bildauswahl (mit DB) */
    const bildAuswahl = document.querySelector('#bildAuswahl');
    bildAuswahl.addEventListener('change', showOptionName);


    /* Funktion für Dateien hochladen
    ist standardmäßig eingebettet in: window.onload = () => {} */
    dateien.onchange = () => {
        let formular = new FormData(document.querySelector("form"));
        let req = new Request('http://localhost/fileupload', {
            method: 'POST',
            body: formular
        });

        fetch(req).then(
            // data => data.text()
        ).then(
            picsList
            // console.log(data)
        );
    }

    picsList();
}



// INIT
document.addEventListener("DOMContentLoaded", init);



















/* für die mehrfach-Daeiauswahl - mom. ungenutzt */

// document.addEventListener("DOMContentLoaded", function(event) {

//     let single = "Datei Ausgewählt";
//     let multiple = "Datein Ausgewält";

//     fileUploadStyling(single,multiple);

// })

// function fileUploadStyling(single,multiple){
//     let input = document.querySelectorAll("input[type=file]");
//     for (let i = 0; i < input.length; i++) {
//         var inputFile = input[i];
//         inputFile.addEventListener('change',function(e){

//             var label = this.nextElementSibling;

//             if(this.files && this.files.length > 1){
//                 label.innerHTML = this.files.length + ' ' + multiple;
//             }else{
//                 label.innerHTML = this.files[0].name + ' ' + single;
//             }
//         });
//     }
// }