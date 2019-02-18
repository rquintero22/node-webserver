const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let categoriaSchema = new Schema({
    descripcion: {
        type: String,
        unique: true,
        required: [true, 'La descripción es requerida']
    },
    usuario: {
        String,
        required: false
    }
});

categoriaSchema.plugin(uniqueValidator, {
    message: '{PATH} debe de ser único.'
});

module.exports = mongoose.model( 'Categoria', categoriaSchema );