// IMPORTACIONES
const express = require('express');
const cors = require('cors');
var app = express();

//importar rutas

const categoriaRoutes = require('./src/routes/categoria.routes');
const usuarioRoutes = require('./src/routes/usuario.routes');
const productoRoutes = require('./src/routes/producto.routes')

// MIDDLEWARES -> INTERMEDIARIOS
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// CABECERAS
app.use(cors());

// CARGA DE RUTAS localhost:3000/api/obtenerProductos
app.use('/api' , categoriaRoutes, usuarioRoutes, productoRoutes);

module.exports = app;