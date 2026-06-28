'use strict';

// VARIABLEN / KONSTANTEN
const dbFile = 'drinks.db';
const backupFile = 'backup.json';

// Module
const Datastore = require('@seald-io/nedb');
const express = require('express');
const formidable = require('formidable');
const fs = require('fs');

// NEUE DATENBANK INITIALISIEREN
const db = new Datastore({ filename: dbFile, autoload: true });

// WEBSERVER
const server = express();

// Middleware: Statische Dateien
server.use(express.static('public', { extensions: ['html'] }));
server.use(express.json());
server.use(express.static('public'));

/* Directory-Listing */
const picsFolder = './public/pics/';
server.get('/getAllPics', (req, res) => {
    fs.readdir(picsFolder, (err, files) => { res.json(files); });
});

// AUTOMATISCHER BACKUP-IMPORT
const checkAndImportBackup = () => {
    db.count({}, (err, count) => {
        if (!err && count === 0 && fs.existsSync(backupFile)) {
            console.log('--- Erster Start: Importiere Daten aus backup.json... ---');
            try {
                const rawData = fs.readFileSync(backupFile, 'utf8');
                const parsedData = JSON.parse(rawData);
                if (parsedData.rows) {
                    const docsToInsert = parsedData.rows
                        .map(row => row.doc)
                        .filter(doc => doc && !doc._id.startsWith('_design'));
                    db.insert(docsToInsert, (importErr) => {
                        if (!importErr) console.log(`${docsToInsert.length} Getränke importiert!`);
                    });
                }
            } catch (e) { console.warn('Import-Fehler:', e); }
        }
    });
};

// DER STRUKTUR-BÜGLER: Sorgt dafür, dass JEDER Drink (alt & neu) exakt dieselbe Schubladen-Reihenfolge hat!
// Das repariert die verschobenen Zeilen in 'domgeneratetable.js', ohne dass wir dort Code ändern müssen.
const formatForFrontend = (docs) => {
    return docs.map(doc => {
        return {
            _id: doc._id || "",
            _rev: doc._rev || "1-local",
            name: doc.name || "",
            kategorie: doc.kategorie || "",
            anzahlPersonen: doc.anzahlPersonen || "",
            datumZubereitung: doc.datumZubereitung || "",
            informationen: doc.informationen || "",
            dateiName: doc.dateiName || ""
        };
    });
};

// Holt alle Dokumente aus der DB und bügelt sie fürs Frontend glatt
const getAllDrinksFromDB = (res) => {
    // Wir sortieren nach Name, damit die Liste im Browser immer schön alphabetisch ist
    db.find({}).sort({ name: 1 }).exec((err, docs) => {
        if (err) return res.json({ status: 'err', err });
        res.json(formatForFrontend(docs));
    });
};

// API-Endpunkte (Routen)
server.post('/clearOneDrink', (req, res) => {
    db.remove({ _id: req.body._id }, {}, (err) => { getAllDrinksFromDB(res); });
});

server.post('/saveAllDrinks', (req, res) => {
    const drink = req.body;
    if (drink._id) {
        db.update({ _id: drink._id }, drink, {}, (err) => { getAllDrinksFromDB(res); });
    } else {
        db.insert(drink, (err) => { getAllDrinksFromDB(res); });
    }
});

server.get('/getAllDrinks', (req, res) => { getAllDrinksFromDB(res); });

server.post('/saveOneDrink', (req, res) => {
    db.insert(req.body, (err) => { getAllDrinksFromDB(res); });
});

/* Fileupload */
const renameMe = file => {
    fs.rename(file.filepath, 'public/pics/' + file.originalFilename, err => { if (err) console.log(err); });
};
server.post('/fileupload', (req, res) => {
    const form = formidable({ uploadDir: 'public/uploads', keepExtensions: true, maxFileSize: 200 * 1024 * 1024 });
    form.parse(req, function (err, fields, files) {
        let f = files.filetoupload;
        (Array.isArray(f) ? f : [f]).forEach(renameMe);
        res.send('File uploaded!');
    });
});

const init = () => {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, err => {
        console.log(err || `Server läuft auf Port ${PORT}`);
        checkAndImportBackup();
    });
};
init();
