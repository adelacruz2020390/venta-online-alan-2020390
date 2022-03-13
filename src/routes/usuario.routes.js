const express = require('express');
const UsuarioController = require('../controllers/usuario.controller');

const md_autenticacion = require('../middlewares/autenticacion');

const api = express.Router();

api.post('/login', UsuarioController.Login);
api.post('/registrar' , UsuarioController.Registrar);
api.put('/editarUsuario/:idUsuario' , md_autenticacion.Auth , UsuarioController.editarUsuario)
api.delete('/eliminarUsuario/:idUsuario' , md_autenticacion.Auth , UsuarioController.EliminarUsuario)
api.put('/agregarCarrito', md_autenticacion.Auth, UsuarioController.agregarCarrito)

module.exports = api;