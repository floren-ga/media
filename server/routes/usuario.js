const express = require('express');
const Usuario = require('../models/usuario');

// Encriptar la contraseña
const bcrypt = require('bcrypt');
const _ = require('underscore');
const app = express();

const saltRounds = 10;


app.get('/usuario', function(req, res) {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);


    // El segundo argumento permite seleccionar los campos a devolver
    Usuario.find({ estado: true }, 'nombre email role estado img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            // Devolver el nº de registros
            Usuario.count({ estado: true }, (err, numReg) => {
                res.json({
                    ok: true,
                    usuarios,
                    numReg
                });
            });
        });
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
        });
    });
});

app.delete('/usuario/:id', function(req, res) {
    let id = req.params.id;

    // Se puede utilizar el método: 
    // Usuario.findByIdAndRemove -> si queremos eliminar el registro de la bbdd

    // O, más en la línea actual, cambiar el estado a los registros "eliminados"
    let cambiaEstado = { estado: false };
    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // Si no se encontró el id de usuario:
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Usuario no encontrado!"
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});


module.exports = app;