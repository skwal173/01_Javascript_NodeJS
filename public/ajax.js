'use strict';

// 🔌 IHRE CLOUD-VERBINDUNG (Fügen Sie hier Ihre Schlüssel ein!)
const SUPABASE_URL = "https://purqftxginscinsrrezf.supabase.co/rest/v1/";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1cnFmdHhnaW5zY2luc3JyZXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NjkyMTMsImV4cCI6MjA5ODI0NTIxM30.UBXrrFBWGq_q84FJ6GQgj1ZOMO1WiipcqXdOJZJr44Y";

const HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

const ajax = {

    getAllPics() {
        return fetch('/getAllPics').then(
            res => res.text()
        ).catch(() => "[]");
    },

    // 📥 ALLE DRINKS AUS SUPABASE LADEN
    // Wird von Ihrem Frontend aufgerufen, um die Tabelle zu füllen
    getAllDrinks() {
        return fetch(`${SUPABASE_URL}/rest/v1/drinks?select=*`, {
            method: 'GET',
            headers: HEADERS
        }).then(
            res => res.json()
        );
    },

    // 💾 ALLE DRINKS SPEICHERN (Falls Ihr Code das als Backup nutzt)
    saveAllDrinks(dataDrinks) {
        // Supabase kann ganze Arrays auf einmal speichern!
        const payload = dataDrinks.map(drink => ({
            name: drink.name,
            kategorie: drink.kategorie,
            anzahlPersonen: drink.anzahlPersonen || 0,
            datumZubereitung: drink.datumZubereitung || null,
            informationen: drink.informationen || "",
            dateiname: drink.dateiName || ""
        }));

        return fetch(`${SUPABASE_URL}/rest/v1/drinks`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(payload)
        }).then(
            res => res.json()
        );
    },

    // 📝 EINEN EINZELNEN COCKTAIL SPEICHERN ODER ÄNDERN
    saveOneDrink(dataDrink) {
        console.log("Sende an Supabase:", dataDrink);
        
        // Wir mappen die Felder exakt auf Ihre Supabase-Spalten
        const payload = {
            name: dataDrink.name,
            kategorie: dataDrink.kategorie,
            anzahlPersonen: dataDrink.anzahlPersonen || 0,
            datumZubereitung: dataDrink.datumZubereitung || null,
            informationen: dataDrink.informationen || "",
            dateiname: dataDrink.dateiName || ""
        };

        let url = `${SUPABASE_URL}/rest/v1/drinks`;
        let method = 'POST';

        // Wenn der Drink bereits existiert (id vorhanden), machen wir ein Update (PATCH)
        if (dataDrink.id || dataDrink._id) {
            const currentId = dataDrink.id || dataDrink._id;
            url += `?id=eq.${currentId}`;
            method = 'PATCH';
        }

        return fetch(url, {
            method: method,
            headers: HEADERS,
            body: JSON.stringify(payload)
        }).then(
            res => res.json()
        );
    },

    // 🪓 EINEN COCKTAIL LÖSCHEN
    clearOneDrink(dataDrink) {
        const currentId = dataDrink.id || dataDrink._id;
        return fetch(`${SUPABASE_URL}/rest/v1/drinks?id=eq.${currentId}`, {
            method: 'DELETE',
            headers: HEADERS
        }).then(
            () => ({ status: "ok", deleted: true, _id: currentId })
        );
    }

}

export default ajax;
