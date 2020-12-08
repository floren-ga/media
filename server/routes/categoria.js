const express = require('express');
const Categoria = require('../models/categoria');
const { verificaToken } = require('../middelwares/autenticacion');

const app = express();

// Definir rutas

// Mostrar todas las categorías
app.get('/categoria', verificaToken, async(req, res) => {

    try {
        let categorias = await Categoria.find()
            .sort('descripcion')
            .populate({
                path: 'usuario',
                select: ['nombre', 'email']
            });
        //res.json(categorias);
        res.sender('home', categorias);
    } catch (error) {
        return res.status(400).json({
            mensaje: 'Ha ocurrido un error.',
            error
        })
    }
});

// Mostrar una categoría por id
app.get('/categoria/:id', verificaToken, async(req, res) => {
    try {
        let id = req.params.id;
        const categoria = await Categoria.findById(id);
        if (!categoria) {
            return res.status(400), json({
                mensaje: "No se han encontrado la categoría.",
                error
            })
        }
        res.json(categoria)
    } catch (error) {
        return res.status(400).json({
            mensaje: "Ha ocurrido un error.",
            error
        })
    }
});

// Crear nueva categoría
app.post('/categoria', verificaToken, async(req, res) => {

    try {
        const body = req.body;
        const categoria = await Categoria.create({ descripcion: body.descripcion, usuario: req.usuario._id });
        res.json(categoria);

    } catch (error) {
        return res.status(500).json({
            mensaje: "Ha ocurrido un error.",
            error
        })
    }
});

// Actualizar una categoría por id
app.put('/categoria/:id', verificaToken, async(req, res) => {
    // Actualizar solo la descripción de la categoría
    const id = req.params.id;
    const body = req.body;
    try {
        const categoria = await Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        res.json(categoria);
    } catch (error) {
        return res.status(400).json({
            mensaje: "Ha ocurrido un error.",
            error
        })
    }
});

// Eliminar categoría
app.delete('/categoria/:id', verificaToken, async(req, res) => {
    const id = req.params.id;

    try {
        const categoria = await Categoria.findByIdAndRemove(id);
        if (!categoria) {
            return res.status(400).json({
                mensaje: 'No se encontró la categoría a eliminar.',
                error
            })
        }
        res.json(categoria);
    } catch (error) {
        return res.status(400).json({
            mensaje: "Ha ocurrido un error.",
            error
        })
    }
});

// Exportación
module.exports = app;