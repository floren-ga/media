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

            // Función para devolver el nº de registros
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
    // Utilizar 'body' requiere importar y configurar body-parser
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, saltRounds),
        role: body.role
    });

    // El parámetro usuarioDB es el usuario devuelto al finalizar el callback (al grabar en MongoDB)
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

    // Se usa la librería 'underscore', con el método 'pick' para filtrar los campos
    //  El primer parámetro será el 'body', con TODOS los campos, y como segundo parámetro se le pasa un array con los campos a actualizar.
    let body = _.pick(req.body, ['nombre', 'emil', 'img', , 'role', 'estado']);

    // Buscar usuario:
    // En el tercer parámetro podemos añadir opciones;
    //   new:true -> devuelve el usuario, una vez ha sido actualizado
    //  runValidators: true -> aplica las validaciones definidas en el Schema; en este caso, impide grabar cualquier role distinto a los predefinidos
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
    // Usuario.findByIdAndRemove -> si queremos eliminar 'definitivamente' el registro de la bbdd

    // O, más en la línea actual, cambiar el estado a los registros que se envíen a eliminar
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