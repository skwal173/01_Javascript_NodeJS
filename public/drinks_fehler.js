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
server.use(express.static('public', {
    extensions: ['html']
}));
server.use(express.json());
server.use(express.static('public'));

/* Directory-Listing */
const picsFolder = './public/pics/';

server.get('/getAllPics', (req, res) => {
    fs.readdir(picsFolder, (err, files) => {
        res.json(files);
    });
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
                        .map(row => {
                            let doc = row.doc;
                            if (doc) {
                                if (!doc._rev) doc._rev = "1-local"; 
                            }
                            return doc;
                        })
                        .filter(doc => doc && !doc._id.startsWith('_design'));
                        
                    db.insert(docsToInsert, (importErr) => {
                        if (importErr) console.warn('Fehler beim Import:', importErr);
                        else console.log(`${docsToInsert.length} Getränke erfolgreich importiert!`);
                    });
                }
            } catch (jsonErr) {
                console.warn('Backup-Datei konnte nicht gelesen werden:', jsonErr);
            }
        }
    });
};

// KRISENFESTER FORMATIERER: Zwingt JEDEN Datensatz (alt und neu) in die exakte Struktur
const formatForFrontend = (docs) => {
    return docs.map(doc => {
        // 1. Wir legen die Reihenfolge der Spalten felsenfest für das Frontend fest
        // Da Ihr Frontend 'Object.keys(dataDrinks[0])' nutzt, MÜSSEN alle Objekte exakt dieselben Keys in derselben Reihenfolge haben!
        const formatted = {
            _id: doc._id || "",
            _rev: doc._rev || "1-local",
            name: doc.name || "",
            kategorie: doc.kategorie || "",
            anzahlPersonen: doc.anzahlPersonen || "",
            datumZubereitung: doc.datumZubereitung || "",
            informationen: doc.informationen || "",
            dateiName: doc.dateiName || ""
        };
        
        // 2. Falls Sie im Laufe der Zeit noch andere, dynamische Felder hinzugefügt haben, hängen wir sie hinten an
        for (let key in doc) {
            if (!(key in formatted)) {
                formatted[key] = doc[key];
            }
        }
        return formatted;
    });
};

const getAllDrinksFromDB = (res) => {
    // Wir sortieren nach ID, damit die alten CouchDB-Einträge (die mit Nummern anfangen) meistens oben stehen
    db.find({}).sort({ _id: 1 }).exec((err, docs) => {
        if (err) {
            console.warn(err);
            return res.json({ status: 'err', err });
        }
        // Wir senden die perfekt strukturierten Daten an den Browser
        res.json(formatForFrontend(docs));
    });
};

// Löschen eines Datensatzes
server.post('/clearOneDrink', (req, res) => {
    db.remove({ _id: req.body._id }, {}, (err) => {
        if (err) {
            console.warn(err);
            return res.json({ status: 'err', err });
        }
        getAllDrinksFromDB(res);
    });
});

// Speichern des gesamten Datensatzes
server.post('/saveAllDrinks', (req, res) => {
    const drink = req.body;
    
    if (drink._id) {
        drink._rev = "1-update-" + Date.now();
        db.update({ _id: drink._id }, drink, {}, (err) => {
            if (err) console.warn(err);
            getAllDrinksFromDB(res);
        });
    } else {
        drink._rev = "1-local";
        db.insert(drink, (err) => {
            if (err) console.warn(err);
            getAllDrinksFromDB(res);
        });
    }
});

// Lesen aller Datensätze
server.get('/getAllDrinks', (req, res) => {
    getAllDrinksFromDB(res);
});

// Speichern eines einzelnen Datensatzes
server.post('/saveOneDrink', (req, res) => {
    const drink = req.body;
    drink._rev = "1-local";
    
    db.insert(drink, (err) => {
        if (err) {
            console.warn(err);
            return res.json({ status: 'err', err });
        }
        getAllDrinksFromDB(res);
    });
});

/* Fileupload */
const renameMe = file => {
    let renameFrom = file.filepath;
    let renameTo = 'public/pics/' + file.originalFilename;
    fs.rename(renameFrom, renameTo, err => {
        if (err) console.log(err);
    });
};

server.post('/fileupload', (req, res) => {
    const form = formidable({
        uploadDir: 'public/uploads',
        keepExtensions: true,
        maxFileSize: 200 * 1024 * 1024
    });

    form.parse(req, function (err, fields, files) {
        let f = files.filetoupload;
        (Array.isArray(f) ? f : [f]).forEach(renameMe);
        res.send('File uploaded and moved!');
    });
});

const init = () => {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, err => {
        console.log(err || `Server DRINKS-HISTORY läuft auf Port ${PORT}`);
        checkAndImportBackup();
    });
};

init();
