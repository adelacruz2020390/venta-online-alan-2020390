const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FacturaSchema = new Schema({
    idCliente:  { type: Schema.Types.ObjectId, ref: 'Usuarios' },
    nombreUsuario: String

})

module.exports = mongoose.model('Facturas', FacturaSchema)