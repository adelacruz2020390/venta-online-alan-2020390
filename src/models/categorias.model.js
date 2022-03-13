const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategoriaSchema = new Schema({
    nombre: String,
    descripcion: String

})

module.exports = mongoose.model('Categorias', CategoriaSchema)