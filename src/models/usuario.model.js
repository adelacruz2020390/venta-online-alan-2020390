const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsuarioSchema = new Schema({
    nombre: String,
    email: String,
    password: String,
    rol: String,
    carrito: [{
        nombreProducto: String,
        cantidadComprada: Number,
        precioUnitario: Number,
        subTotal:Number,

    }],
    totalCArrito: Number

});

module.exports = mongoose.model('Usuarios', UsuarioSchema);