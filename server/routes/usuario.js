const express = require('express');
const app = express();
const Usuario = require('../models/usuario');

app.get('/usuario', function(req, res) {
    res.render('usuarios');
});


app.post('/usuario', (req, res) => {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: body.password,
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
    res.json('put Usuario');
});

app.delete('/usuario', function(req, res) {
    res.json('delete Usuario');
});

module.exports = app;