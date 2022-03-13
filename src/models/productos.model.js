const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductoSchema = new Schema({
    nombre: String,
    precio: Number,
    stock: Number,
    idCategoria: { type: Schema.Types.ObjectId, ref: 'Categorias' },
    Categoria: String
})

module.exports = mongoose.model('Productos', ProductoSchema)