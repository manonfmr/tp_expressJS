const express = require("express");
const app = express();
const url = require("url");
const port = 8080;
const path = require('path');
let mysql = require('mysql');
let sessions = require('express-session');
let fileSystem = require('fs');
let cookieParser = require("cookie-parser");

app.use(cookieParser());

let baseDeDonnee = mysql.createConnection({
    host:'localhost',
    user: 'root',
    password: '',
    database: 'projetWeb'
});

const twoHours = 1000*60*60*1;// sessions de 1h

app.use(sessions({
    secret: '123456789',
    saveUninitialized: true,
    cookies : { maxAge : twoHours},
    resave: false
}));

app.use(express.urlencoded({extended: true}));

baseDeDonnee.connect(function(err, next) {
    if (err) next(err);

    app.post('/ajaxSession.html', function(req, res) {
        let login = req.body.login;
        
        let sql = 'SELECT * FROM personne where login = ? ;';
            baseDeDonnee.query(sql, [login], function(err, resultat) {
                if (err) next(err);
                if (resultat.length === 0 || login === "") {
                    res.json({ success: false, login: undefined });
                } else {
                    req.session.login = login;
                    res.json({ success: true, login: login });
                }
            });
    });

    app.post('/ajaxAnnonce.html', function(req, res) {
        if (err) console.log("erreur ajaxAnnonce.html");
        let sql = 'SELECT * FROM annonce';
        let tabMesAnnonces = [];
        baseDeDonnee.query(sql, function(err, resultat) {
            if (err) next(err);
            if (resultat.length === 0) {
                res.json({ success: false });
            } else {
                for (let i = 0; i < resultat.length; i++) {
                    tabMesAnnonces.push({ nom: resultat[i].nom, lieu: resultat[i].lieu, description: resultat[i].description, url_img: resultat[i].url_img });
                }
                res.json({ success: true, tabMesAnnonces: tabMesAnnonces});
            }

        });
    });
});

app.get('/createcookie.html', function(req, res){
    res.cookies('session', 'cookie créer')
    res.sendFile(__dirname+'/index.html');
})



app.get('/clearCookies.html', function(req, res){
    res.clearCookie('selected_annonce_nom');
    res.clearCookie('selected_annonce_lieu');
    res.clearCookie('selected_annonce_description');
    res.clearCookie('selected_annonce_url');
    res.clearCookie('session');
    res.sendFile(__dirname+'/index.html');
})


app.get('/anonce.html', function(req, res){
    res.sendFile(__dirname+'/anonce.html');
})

app.get('/index.html', function(req, res){
    res.sendFile(__dirname+'/index.html');
})

app.use(express.static(path.join(__dirname, '/asset')));
app.use(express.static(path.join(__dirname, '/asset/img')));

app.get('/', function(req, res){
    res.sendFile(__dirname+'/index.html');
})

app.get('/logout', function(req, res){
    req.session.destroy(function(err) {
        if (err) next(err);
        res.redirect('/index.html');
    });
});

app.use((err, req, res, next) => {
    console.error("Erreur :", err);
    res.status(500).send("Une erreur est survenue.");
});

app.listen(8080, function(){
    console.log("ecoute sur le port 8080");
})