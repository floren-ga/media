const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const Usuario = require('../models/usuario');

const app = express();

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Comprobar si existe el usuario...
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El usuario o la constraseña no son correctos'
                }
            });
        }

        // Comprobar si coincide la contraseña...
        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El usuario o la constraseña no son correctos'
                }
            });
        }

        let token = jwt.sign({
            usuario: usuarioBD
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.json({
            ok: true,
            usuario: usuarioBD,
            token
        });

    });
});

module.exports = app;