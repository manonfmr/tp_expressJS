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
    database: 'bdnodejs'
});

const twoHours = 1000*60*60*1;// sessions de 1h

app.use(sessions({
    secret: '123456789',
    saveUninitialized: true,
    cookies : { maxAge : twoHours},
    resave: false
}));

app.use(express.urlencoded({extended: true}));

baseDeDonnee.connect(function(err, next){
    if (err) next(err);
    app.get('/index.html', function(req, res){
        let login = req.query.login;
        let sql = 'SELECT * FROM personne where login = ? ;';
        baseDeDonnee.query(sql, [login], function(err, resultat){
            if (err) next(err);
            if (resultat.length === 0){
                res.redirect('/connexion.html');
            }
            else{
                req.session.login = login;
                fileSystem.readFile(__dirname + '/index.html', 'utf8', function(err, data) {
                    if (err) next(err);
                    data = data.replace('{{login}}', login);
                    res.send(data);
                });
            }
        });       
    })
});

app.get('/connexion.html', function(req, res){
    res.sendFile(__dirname+'/connexion.html');
})

app.use(express.static(path.join(__dirname, '/asset')));
app.use(express.static(path.join(__dirname, '/asset/img')));

app.get('/', function(req, res){
    res.sendFile(__dirname+'/connexion.html');
})

app.get('/logout', function(req, res){
    req.session.destroy(function(err) {
        if (err) next(err);
        res.redirect('/connexion.html');
    });
});

app.use((err, req, res, next) => {
    console.error("Erreur :", err);
    res.status(500).send("Une erreur est survenue.");
});

app.listen(8080, function(){
    console.log("ecoute sur le port 8080");
})