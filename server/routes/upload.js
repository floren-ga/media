const express = require('express');
const fileUpload = require('express-fileupload');
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');
const app = express();

// default options
//  Todo lo que se suba lo lleva a req.files
app.use(fileUpload());

app.put('/upload/:tipo/:id', function(req, res) {

    //Si no ha seleccionado ninún fichero
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: "No ha seleccionado ningún archivo"
            }
        });
    }


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

        // En este punto la imagen ya se ha subido al servidor

        switch (tipo) {
            case 'usuarios':
                imagenUsuario(id, res, nombreArchivo);
                break;
            case 'productos':
                imagenProducto(id, res, nombreArchivo);
                break;
            default:
                break;
        }

    });
});

function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borrarArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!usuarioDB) {
            borrarArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    message: "El usuario no existe"
                }
            })
        }

        borrarArchivo(usuarioDB.img, 'usuarios');

        // Asignar la imagen al usuario
        usuarioDB.img = nombreArchivo;
        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });
        });
    });

}

function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borrarArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!productoDB) {
            borrarArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                err: {
                    message: "El producto no existe"
                }
            })
        }

        borrarArchivo(productoDB.img, 'productos');

        // Asignar la imagen al producto
        productoDB.img = nombreArchivo;
        productoDB.save((err, productoGuardado) => {
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });
        });
    });

}

function borrarArchivo(nombreImagen, tipo) {
    let pathImg = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    // Si existe una imagen asociada al usuario, se borra
    if (fs.existsSync(pathImg)) {
        fs.unlinkSync(pathImg);
    }

}
module.exports = app;