const express = require('express');
const Producto = require('../models/producto');
const { verificaToken } = require('../middelwares/autenticacion');

const app = express();

// Definir rutas

// Mostrar todos los productos
app.get('/producto', verificaToken, async(req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    desde = Number(limite);

    try {
        let productos = await Producto.find({ disponible: true })
            // .skip(desde)
            // .limit(limite)
            .sort('descripcion')
            .populate({ path: 'usuario', select: ['nombre'] })
            .populate({ path: 'categoria', select: 'descripcion' });

        res.json(productos);
    } catch (error) {
        return res.status(400).json({
            mensaje: 'Ha ocurrido un error.',
            error
        })
    }
});

// Mostrar un producto por id
app.get('/producto/:id', verificaToken, async(req, res) => {
    try {

        let id = req.params.id;
        const producto = await Producto.findById(id).populate('usuario', 'nombre').populate('categoria', 'descripcion');

        if (!producto) {
            return res.status(400), json({
                mensaje: "No se ha encontrado el producto.",
                error
            })
        }
        res.json(producto)
    } catch (error) {
        return res.status(400).json({
            mensaje: "Ha ocurrido un error.",
            error
        })
    }
});

// Crear nuevo producto
app.post('/producto', verificaToken, async(req, res) => {
    try {
        const body = req.body;
        const producto = await Producto.create({
            nombre: body.nombre,
            precioUni: body.precioUni,
            descripcion: body.descripcion,
            disponible: body.disponible,
            categoria: body.categoria,
            usuario: req.usuario._id
        });
        res.json(producto);

    } catch (error) {
        return res.status(500).json({
            mensaje: "Ha ocurrido un error.",
            error
        })
    }
});

// Actualizar un producto por id
app.put('/producto/:id', verificaToken, async(req, res) => {
    // Actualizar solo la descripción de la categoría
    const id = req.params.id;
    const body = req.body;
    try {
        const producto = await Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        res.json(producto);
    } catch (error) {
        return res.status(400).json({
            mensaje: "Ha ocurrido un error.",
            error
        })
    }
});

// Eliminar producto 
//  -> Cambiar el campos "disponible" a false
app.delete('/producto/:id', verificaToken, async(req, res) => {
    const id = req.params.id;
    try {
        const producto = await Producto.findById(id);
        if (!producto) {
            return res.status(400).json({
                mensaje: 'No se encontró la categoría a eliminar.',
                error
            })
        }

        // Cambiar la disponibilidad
        producto.disponible = false;

        const productoBorrado = await producto.save();
        if (!productoBorrado) {
            return res.status(400).json({
                mensaje: 'No se ha podido eliminar el producto.',
                error
            })
        }

        res.json(productoBorrado);

    } catch (error) {
        return res.status(500).json({
            mensaje: "Ha ocurrido un error.",
            error
        })
    }
});

// Exportación
module.exports = app;