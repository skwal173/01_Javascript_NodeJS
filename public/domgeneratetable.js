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
        for (let element of data) {
            let i = offset;
            let row = table.insertRow();
            for (let key in element) {
                if (i <= 0) {
                    let cell = row.insertCell();
                    let text = document.createTextNode(element[key]);   //
                    cell.appendChild(text);
                }
                i--;
            }
        }
    },
    
    generateTableFoot (table, data) {
        let tfoot = table.createTFoot();
        let row = tfoot.insertRow();
        //for (let key in data) {
        // let td = document.createElement("td");
        // let text = document.createTextNode(data[key]);
        // td.appendChild(text);
        // row.appendChild(td);
        //     break;
        // }
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
        //$('thead').css({ "background-color": "teal", "color": "white", "font-size": "110%" });
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