const express = require('express');
const ProductoController = require('../controllers/producto.controller');

const md_autenticacion = require('../middlewares/autenticacion');

const api = express.Router();


api.post('/agregarProducto' , md_autenticacion.Auth , ProductoController.AgregarProductos);
api.get('/verProductos' ,ProductoController.VerProductos);
api.get('/BuscarProductosPorCategoria/:Categoria', ProductoController.BuscarProductosPorCategoria)

api.get('/BuscarProductosPorNombre/:nombre', ProductoController.BuscarProductosPorNombre)
api.put('/editarProducto/:idProducto' ,md_autenticacion.Auth, ProductoController.editarProducto)
api.delete('/eliminarProducto/:idProducto', md_autenticacion.Auth , ProductoController.EliminarProductos)
api.put('/controstock/:idProducto' , md_autenticacion.Auth , ProductoController.stockProducto)


module.exports = api;