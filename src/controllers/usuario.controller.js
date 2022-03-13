const Usuario = require('../models/usuario.model');
const Producto = require('../models/productos.model')
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');


function RegistrarAdmin() {

  var modeloUsuario = new Usuario();

  Usuario.find({ email: "ADMIN" }, (err, usuarioEncontrado) => {
    if (usuarioEncontrado.length > 0) {
      return console.log("El ADMIN Ya se A Registrado");
    } else {
      modeloUsuario.nombre = "ADMIN";
      modeloUsuario.email = "ADMIN";
      modeloUsuario.rol = "ROL_ADMIN";
      modeloUsuario.carrito = [];
      modeloUsuario.totalCArrito = 0;

      bcrypt.hash("123456", null, null, (err, passwordEncriptada) => {
        modeloUsuario.password = passwordEncriptada;

        modeloUsuario.save((err, usuarioGuardado) => {
          if (err) return console.log("error en la peticion");
          if (!usuarioGuardado) return console.log("error al registra al ADMIN");

          return console.log({ usuario: usuarioGuardado });
        });
      })


    }
  });
}


function Login(req, res) {
  var parametros = req.body;
  // BUSCAMOS EL CORREO
  Usuario.findOne({ email: parametros.email }, (err, usuarioEncontrado) => {
    if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
    if (usuarioEncontrado) {
      // COMPARAMOS CONTRASENA SIN ENCRIPTAR CON LA ENCRIPTADA
      bcrypt.compare(parametros.password, usuarioEncontrado.password,
        (err, verificacionPassword) => {//TRUE OR FALSE
          if (verificacionPassword) {
            return res.status(200)
              .send({ token: jwt.crearToken(usuarioEncontrado) })
          } else {
            return res.status(500)
              .send({ mensaje: 'La contrasena no coincide.' })
          }
        })
    } else {
      return res.status(500)
        .send({ mensaje: 'El usuario, no se ha podido identificar' })
    }
  })
}


function Registrar(req, res) {

  var parametros = req.body;
  var modeloUsuario = new Usuario();

  if (parametros.nombre && parametros.email && parametros.password) {

    Usuario.find({ email: parametros.email }, (err, usuarioEncontrado) => {
      if (usuarioEncontrado.length > 0) {
        return res.status(500).send({ mensaje: "este correo ya se encuetra utilizo" });
      } else {
        modeloUsuario.nombre = parametros.nombre;
        modeloUsuario.email = parametros.email;
        modeloUsuario.rol = "ROL_CLIENTE";
        modeloUsuario.carrito = [];
        modeloUsuario.totalCArrito = 0.00;

        bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada) => {
          modeloUsuario.password = passwordEncriptada;

          modeloUsuario.save((err, usuarioGuardado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
            if (!usuarioGuardado) return res.status(500).send({ mensaje: 'Error al guardar el Usuario' })

            return res.status(200).send({ usuario: usuarioGuardado })
          });
        })


      }
    });
  } else {

    return res.status(404)
      .send({ mensaje: 'Debe ingresar los parametros obligatorios' })

  }
}


function editarUsuario(req, res) {
  var idUser = req.params.idUsuario;
  var parametros = req.body;

  if (req.user.rol !== "ROL_ADMIN") {

    if (req.user.sub !== idUser) {
      return res.status(500).send({ mensaje: 'No tiene los permisos para editar este Usuario.' });

    }

    // BORRAR LA PROPIEDAD DE PASSWORD EN EL BODY
    delete parametros.password;
    delete parametros.rol;

    Usuario.findByIdAndUpdate(idUser, parametros, { new: true }, (err, usuarioEditado) => {
      if (err) return res.status(500).send({ mensaje: 'Error en  la peticion' });
      if (!usuarioEditado) return res.status(500).send({ mensaje: 'Error al editar el Usuario' });

      return res.status(200).send({ usuario: usuarioEditado });
    })

  } else {
    delete parametros.password;

    Usuario.findByIdAndUpdate(idUser, parametros, { new: true }, (err, usuarioEditado) => {
      if (err) return res.status(500).send({ mensaje: 'Error en  la peticion' });
      if (!usuarioEditado) return res.status(500).send({ mensaje: 'Error al editar el Usuario' });

      return res.status(200).send({ usuario: usuarioEditado });
    })
  }
}


function EliminarUsuario(req, res) {
  var idUsua = req.params.idUsuario;

  Usuario.findOne({ _id: idUsua }, (err, usuarioencotrado) => {

    if (req.user.rol !== "ROL_ADMIN") {

      if (req.user.sub !== idUsua) {

        return res.status(500).send({ mensaje: 'no tienes permiso de eliminar este usuario' });

      } else {
        Usuario.findByIdAndDelete(req.user.sub, (err, UsuarioEliminado) => {
          if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
          if (!UsuarioEliminado) return res.status(500)
            .send({ mensaje: 'Error al eliminar el producto' })

          return res.status(200).send({ usuario: UsuarioEliminado });

        })
      }
    } else {

      if (usuarioencotrado.rol !== "ROL_ADMIN") {

        Usuario.findByIdAndDelete(idUsua, (err, UsuarioEliminado) => {
          if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
          if (!UsuarioEliminado) return res.status(500)
            .send({ mensaje: 'Error al eliminar el producto' })

          return res.status(200).send({ usuario: UsuarioEliminado });
        })

      } else {
        return res.status(500).send({ mensaje: 'no puedes eliminar a un admin' });
      }
    }
  })
}



//agregar al carrito 

function agregarCarrito(req, res) {
  const parametros = req.body;

  Producto.findOne({ nombre: parametros.nombreProducto }, (err, productoEncontrado) => {

    if (err) return res.status(500).send({ mensaje: 'error en la peticion de producto' })
    if (!productoEncontrado) return res.status(500).send
      ({ mensaje: 'error  al buscar el producto' });

    Usuario.findOne({ _id: req.user.sub, "carrito.nombreProducto": parametros.nombreProducto }, (err, usuarioEncontrado) => {
      if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });

      if (parametros.cantidad && parametros.nombreProducto) {

        if (!usuarioEncontrado) {

          Usuario.findByIdAndUpdate(req.user.sub, {
            $push: {
              carrito: {
                nombreProducto: parametros.nombreProducto,
                cantidadComprada: parametros.cantidad,
                precioUnitario: productoEncontrado.precio, subTotal: parametros.cantidad * productoEncontrado.precio
              }
            }
          }, { new: true },
            (err, productoAgregadoCarrito) => {
              if (err) return res.status(500).send({ mensaje: 'error en la peticion del agregar el carrito' });
              if (!productoAgregadoCarrito) return res.status(500).send({ mensaje: 'error al agregar el producto al carrito' })

              let totallocal = 0;
              let subTotalLocal = 0;
              for (let i = 0; i < productoAgregadoCarrito.carrito.length; i++) {
                subTotalLocal = productoAgregadoCarrito.carrito[i].cantidadComprada * productoAgregadoCarrito.carrito[i].precioUnitario;
                totallocal += subTotalLocal;
              }

              Usuario.findByIdAndUpdate(req.user.sub, { subTotal: subTotalLocal, totalCArrito: totallocal }, { new: true },
                (err, totalActualizado) => {
                  if (err) return res.status(500).send({ mensaje: 'error en la peticion Totla carrito ' });
                  if (!totalActualizado) return res.status(500).send({ mensaje: 'error al actualiaar el total del carrito' });

                  return res.status(200).send({ usuario: totalActualizado })
                })
            })

        } else {
          return res.status(500).send({ mensaje: 'ya esta registrado' });
        }

      } else {
        res.status(500).send({ mensaje: 'debe mandar parametros obligatorios' });
      }
    })
  })
}



module.exports = {
  RegistrarAdmin,
  Login,
  Registrar,
  editarUsuario,
  EliminarUsuario,
  agregarCarrito,
}