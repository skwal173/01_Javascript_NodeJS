'use strict';

// import components from './components.js';

const domoptions = {

    /* Generiert Optionsfelder mit Einträgen der Dateinamen */
    allMyDrinksPicsToOptions(allMyDrinksPics, res) {
        allMyDrinksPics = JSON.parse(res);
        // console.log(allMyDrinksPics);
        $("#bildAuswahl").empty(); // löscht alle Kindelemente
        allMyDrinksPics.forEach(element => {
        $('<option>', { id: '', class: '', value: element, text: element }).appendTo('#bildAuswahl');
            
        });
    }

}

export default domoptions;