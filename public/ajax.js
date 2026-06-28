'use strict';

// import render from './render.js';
// import dom from './dom.js';

const ajax = {

    getAllPics() {
        return fetch('/getAllPics').then(
            res => res.text()
        )
    },

    saveAllDrinks(dataDrinks) {
        return fetch('/saveAllDrinks', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataDrinks)
        }).then(
            res => res.json()
        )
    },

    saveOneDrink(dataDrink) {
        console.log(dataDrink)
        return fetch('/saveOneDrink', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataDrink)
        }).then(
            res => res.json()
        )
    },

    clearOneDrink(dataDrink) {
        return fetch('/clearOneDrink', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataDrink)
        }).then(
            res => res.json()
        )
    }

}

export default ajax;