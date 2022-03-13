const express = require('express');
const categoriaController = require('../controllers/categorias.controller');

const md_autenticacion = require('../middlewares/autenticacion');

const api = express.Router();


api.post('/agregarCategorias',md_autenticacion.Auth ,categoriaController.AgregarCategorias);
api.get('/verCategorias' , categoriaController.VerCategorias)
api.put('/editarCategorias/:idCategoria', md_autenticacion.Auth, categoriaController.editarCategorias)
api.delete('/eliminarCategoria/:idCategoria' , md_autenticacion.Auth, categoriaController.EliminarCategorias)
module.exports = api;