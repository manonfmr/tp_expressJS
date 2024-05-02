const express = require("express");
const app = express();
const path = require('path');
let mysql = require('mysql');
let sessions = require('express-session');
let cookieParser = require("cookie-parser");

app.use(cookieParser());

app.use(express.static(path.join(__dirname, '/asset')));
app.use(express.static(path.join(__dirname, '/asset/img')));

let baseDeDonnee = mysql.createConnection({
    host:'lerman.3il-rodez-projets.site',
    port:'3306',
    user: 'root',
    password: 'manon',
    database: 'projetWeb'
});

const twoHours = 1000*60*60*1; // sessions de 1h

app.use(sessions({
    secret: '123456789',
    saveUninitialized: true,
    cookies : { maxAge : twoHours},
    resave: false
}));

app.use(express.urlencoded({extended: true}));

baseDeDonnee.connect(function(err) {
    if (err) {
        console.error("Erreur lors de la connexion à la base de données : ");
        return;
    }

    console.log("Connexion à la base de données réussie.");

    app.post('/ajaxSession.html', function(req, res) {
        let login = req.body.login;
        
        let sql = 'SELECT * FROM personne where login = ? ;';
        baseDeDonnee.query(sql, [login], function(err, resultat) {
            if (err) {
                console.error("Erreur lors du chargement des données : ");
                res.status(500).json({ success: false, error: "Erreur lors du chargement des données." });
                return;
            }
            if (resultat.length === 0 || login === "") {
                res.json({ success: false, login: undefined });
            } else {
                req.session.login = login;
                console.log("success to log")
                res.json({ success: true, login: login });
            }
        });
    });

    app.post('/ajaxAnnonce.html', function(req, res) {
        let sql = 'SELECT * FROM annonce';
        let tabMesAnnonces = [];
        baseDeDonnee.query(sql, function(err, resultat) {
            if (err) {
                console.error("Erreur lors du chargement des données : ");
                res.status(500).json({ success: false, error: "Erreur lors du chargement des données." });
                return;
            }
            if (resultat.length === 0) {
                res.json({ success: false });
            } else {
                for (let i = 0; i < resultat.length; i++) {
                    tabMesAnnonces.push({id: resultat[i].id, nom: resultat[i].nom, lieu: resultat[i].lieu, description: resultat[i].description, url_img: resultat[i].url_img });
                }
                console.log("success to annonce bdd")
                res.json({ success: true, tabMesAnnonces: tabMesAnnonces });
            }
        });
    });
});

app.get('/createcookie.html', function(req, res){
    res.cookie('session', 'cookie créer')
    res.send('Cookie créer');
})

app.get('/clearCookies.html', function(req, res){
    res.clearCookie('selected_annonce_nom');
    res.clearCookie('selected_annonce_lieu');
    res.clearCookie('selected_annonce_description');
    res.clearCookie('selected_annonce_url');
    res.clearCookie('session');
    res.sendFile(__dirname+'/index.html');
})

app.get('/annonce.html', function(req, res){
    console.log("success to go to annonce")
    res.sendFile(__dirname+'/annonce.html');
})

app.get('/index.html', function(req, res){
    res.sendFile(__dirname+'/index.html');
})

app.get('/', function(req, res){
    res.sendFile(__dirname+'/index.html');
})

app.get('/logout', function(req, res){
    req.session.destroy(function(err) {
        if (err) {
            console.error("Erreur lors de la déconnexion : ");
            res.status(500).send("Une erreur est survenue.");
            return;
        } 
        res.redirect('/index.html');
    });
});

// Middleware pour gérer les erreurs
// app.use((err, req, res, next) => {
//     console.error("Erreur :");
//     res.status(500).send("Une erreur est survenue.");
// });

app.listen(8080, function(){
    console.log("Écoute sur le port 8080");
});
