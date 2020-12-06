//  Construcción del modelo

const mongoose = require('mongoose');


let tiposValidos = {
    values: ['BOOK', 'CD', 'DVD', 'BLU-RAY', 'VINILO'],
    message: '{VALUE} no es un tipo de medio válido.'
};


let Schema = mongoose.Schema;

let bookSchema = new Schema({

    titulo: {
        type: String,
        required: [true, 'El título es obligatorio']
    },
    autores: {
        type: Array,
        required: false
    },
    descripcion: {
        type: String,
        required: false
    },
    paginas: {
        type: Number,
        required: false
    },
    ubicacionId: {
        type: String,
        required: false
    },
    img: {
        type: String,
        required: false
    },
    imgThumbnail: {
        type: String,
        required: false
    },
    idioma: {
        type: String,
        default: 'es',
    },
    link: {
        type: String,
        required: false
    },
    tipo: {
        type: String,
        required: true,
        enum: tiposValidos
    },
    estado: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Book', bookSchema);