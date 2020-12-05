const express = require('express');
const Usuario = require('../models/usuario');

// Encriptar la contraseña
const bcrypt = require('bcrypt');
const _ = require('underscore');
const app = express();

const saltRounds = 10;


app.get('/usuario', function(req, res) {
    res.render('usuarios');
});

app.post('/usuario', (req, res) => {
    // Para utilizar body necesito importar body-parser y configurarlo
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, saltRounds),
        role: body.role
    });

    // usuarioDB -> El usuario devuelto al grabar en MongoDB
    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

app.put('/usuario/:id', function(req, res) {
    let id = req.params.id;

    // Se usa la librería underscore, con el método pick para filtrar qué campos queremos usar (el resto no entrarían);
    //  El primer parámetro sería el body, con TODOS los campos, y como segundo parámetro se le pasa un array con los campos que se quieran actualizar.
    let body = _.pick(req.body, ['nombre', 'emil', 'img', , 'role', 'estado']);

    // Encontrar el usuario
    // En el tercer parámetro podemos añadir opciones;
    //   new -> devuelve la información ctualizada del usuario; si no ponemos esta opción, usuarioDB contendría los valores    previos a la actualización
    //  runValidators: aplica las validaciones definidas en el Schema; en este caso, al hacer una put podríamos pasar un role que no esté entre los definidos en la enumeración: podrían poner cualquier valor y "tragaría"
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        })
    });
});
app.delete('/usuario', function(req, res) {
    res.json('delete Usuario');
});

module.exports = app;