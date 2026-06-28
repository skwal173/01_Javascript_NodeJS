'use strict';

// import components from './components.js';
import "./drinks.js";

const domgeneratetable = {

    generateTableHead (table, data, offset) {
        let i = offset;
        let thead = table.createTHead();
        let row = thead.insertRow();
        for (let key in data) {
            if (i <= 0) {
                let th = document.createElement("th");
                let text = document.createTextNode(data[key]);
                th.appendChild(text);
                row.appendChild(th);
            }
            i--;
        }
    },
    
    generateTable (table, data, offset) {
        // Wir sammeln alle Keys, zwingen _id und _rev aber nach ganz vorne,
        // damit Ihr offset von 2 immer exakt diese beiden Spalten ausblendet!
        let allKeys = ["_id", "_rev"];
        
        for (let element of data) {
            for (let key in element) {
                if (!allKeys.includes(key)) {
                    allKeys.push(key);
                }
            }
        }

        for (let element of data) {
            let i = offset;
            let row = table.insertRow();
            
            // Wir gehen exakt die perfekt sortierten Keys durch
            for (let key of allKeys) {
                if (i <= 0) {
                    let cell = row.insertCell();
                    // Wenn ein Drink kein _id oder _rev hat, bleibt die Zelle unsichtbar leer
                    let wert = element[key] !== undefined ? element[key] : "";
                    let text = document.createTextNode(wert);
                    cell.appendChild(text);
                }
                i--;
            }
        }
    },
    
    generateTableFoot (table, data) {
        let tfoot = table.createTFoot();
        let row = tfoot.insertRow();
        let td = document.createElement("td");
        let text = document.createTextNode('Neuen Eintrag erstellen');
        td.appendChild(text);
        row.appendChild(td);
    },
    
    /* Ändert die Einträge de Tabellenkopfes */
    changeTableHead () {
        $("thead tr th:contains(name)").text("Name");
        $("thead tr th:contains(kategorie)").text("Kategorie");
        $("thead tr th:contains(anzahlPersonen)").text("Anz.");
        $("thead tr th:contains(datumZubereitung)").text("Zubereitung");
        $("thead tr th:contains(informationen)").text("Informationen");
        $("thead tr th:contains(dateiName)").text("Dateiname");
        $('thead').addClass("w3-teal w3-cursive w3-xlarge");
    },

    /* Filtert die Tabellen-Einträge */
    filterTable () {
        $("#search").on("keyup", function () {
            let value = $(this).val().toLowerCase();
            $("tbody tr").filter(function () {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            });
        });
    }

}

export default domgeneratetable;
