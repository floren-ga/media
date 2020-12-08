const express = require('express');
const fileUpload = require('express-fileupload');
const Usuario = require('../models/usuario');

const app = express();

// default options
//  Todo lo que se suba lo lleva a req.files
app.use(fileUpload());

app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo; //usuarios, productos...
    let id = req.params.id;

    let tiposValidos = ['productos', 'usuarios'];

    // Verificar si el tipo es válido
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipo válidos son: ' + tiposValidos.join(', '),
                tipo
            }
        })
    }

    //Si no ha seleccionado ninún fichero
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: "No ha seleccionado ningún archivo"
            }
        });
    }

    // El name del input (ej.: "archivo") 
    let archivo = req.files.archivo;

    // archivo tiene, entre otros, estos atributos: name, data, size, encoding,temFilePath,truncated,mimetype,md5,mv

    // Extraer la extensión del archivo:

    let arrArchivo = archivo.name.split('.');
    // la extensión será el último elemento del Array
    extension = arrArchivo[arrArchivo.length - 1];

    // Definir las extensiones permitidas
    let extensiones = ['jpg', 'jpeg', 'png', 'gif'];

    // Verificar si la extensión del archivo está entre las permitidas
    if (extensiones.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones válidas son: ' + extensiones.join(', '),
                ext: extension
            }
        })
    }

    // Renombrar archivo según el id
    // let nombreArchivo = `${id}.${extension}`;
    let nombreArchivo = `${id}-${ new Date().getMilliseconds() }.${extension}`;



    // Usar el método  mv() para mover el archivo a la carpeta de destino
    // Además, la guarda en la carpeta definida por $tipo
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });

        res.json({
            ok: true,
            message: "El archivo se guardó correctamente."
        });
    });
});

module.exports = app;