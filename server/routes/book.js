const express = require('express');
const Book = require('../models/books');
const ISBN = require('node-isbn');
const _ = require('underscore');

const app = express();


app.get('/book', (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);


    // El segundo argumento permite seleccionar los campos a devolver
    Book.find({ estado: true }, 'titulo autores paginas idioma')
        .skip(desde)
        .limit(limite)
        .exec((err, books) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            // Función para devolver el nº de registros
            Book.count({ estado: true }, (err, numReg) => {
                res.json({
                    ok: true,
                    books,
                    numReg
                });
            });
        });
});

app.post('/book', (req, res) => {
    // Utilizar 'body' requiere importar y configurar body-parser
    let body = req.body;

    let book = new Book({
        titulo: body.titulo,
        autores: body.autores,
        descripcion: body.descripcion,
        paginas: body.paginas,
        ubicacionId: body.ubicacionId,
        img: body.img,
        imgThumbnail: body.imgThumbnail,
        idioma: body.idioma,
        link: body.link,
        tipo: body.tipo,
        estado: body.estado,
    });

    // El parámetro bookDB es el libro devuelto al finalizar el callback (al grabar en MongoDB)
    book.save((err, bookDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            book: bookDB
        });
    });
});

app.put('/book/:id', (req, res) => {
    let id = req.params.id;

    // Se usa la librería 'underscore', con el método 'pick' para filtrar los campos
    //  El primer parámetro será el 'body', con TODOS los campos, y como segundo parámetro se le pasa un array con los campos a actualizar.
    let body = _.pick(req.body, ['titulo', 'autores', 'descripcion', 'paginas', 'ubicacionId', 'img', 'imgThumbnail', 'idioma', 'link', 'tipo']);

    // Buscar libro:
    // En el tercer parámetro podemos añadir opciones;
    //   new:true -> devuelve el libro, una vez ha sido actualizado
    //  runValidators: true -> aplica las validaciones definidas en el Schema; en este caso, impide grabar cualquier role distinto a los predefinidos
    Book.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, bookDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            book: bookDB
        });
    });
});

app.delete('/book/:id', (req, res) => {
    let id = req.params.id;

    // Se puede utilizar el método: 
    // Book.findByIdAndRemove -> si queremos eliminar 'definitivamente' el registro de la bbdd

    // O, más en la línea actual, cambiar el estado a los registros que se envíen a eliminar
    let cambiaEstado = { estado: false };
    Book.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, bookDelete) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // Si no se encontró el id de usuario:
        if (!bookDelete) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Book no encontrado!"
                }
            });
        }

        res.json({
            ok: true,
            book: bookDelete
        });
    });
});



app.get('/book/isbn/:isbn', (req, res) => {
    let isbn = req.params.isbn;
    if (isbn === null) {
        res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha facilitado un ISBN'
            }
        });
    }

    // Si existe un isbn, recuperar datos del libro
    ISBN.resolve(isbn, function(err, book) {
        if (err) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se ha encontrado un libro con ese ISBN'
                }
            })
        }

        res.json({
            ok: true,
            book
        });
    })
});

// Extraer datos de un libro a partir del isbn
// Utilización de la librería  'node-isbn' 

module.exports = app;