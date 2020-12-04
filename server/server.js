require('./config/config');
const express = require('express');
const mongoose = require('mongoose');
const helpers = require('handlebars');
const bodyParser = require("body-parser");

const app = express();

// create application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({ extended: false }));
// create application/json parser
app.use(bodyParser.json());

app.use(require('./routes/usuario'));

const hbs = require('hbs');
require('../hbs/helpers');

app.use(express.static(__dirname + '../../public'));

// Express HBS
hbs.registerPartials(__dirname + '../../views/partials');
app.set('view engine', 'hbs');


app.get('/', (req, res) => {
    res.render('home', {
        nombre: "biblioteca multimedia de los gonzalez"
    });
});

app.get('/about', (req, res) => {
    res.render('about');
});

mongoose.connect('mongodb://localhost:27017/media', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }, (err, res) => {
    if (err) throw err;
    console.log('Base de datos ONLINE');
});

app.listen(process.env.PORT, () => {
    console.log("Escuchando el puerto 3000");
});