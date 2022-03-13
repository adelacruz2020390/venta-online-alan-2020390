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

    if (req.user.rol !== "ROL_ADMIN") { // verirficamos el rol si es admin


      if (req.user.sub !== idUsua) { // verificamos que el id sea igual a id del cliente

        return res.status(500).send({ mensaje: 'no tienes permiso de eliminar este usuario' });

      } else { // else del id igaulid de cliente

        Usuario.findByIdAndDelete(req.user.sub, (err, UsuarioEliminado) => {
          if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
          if (!UsuarioEliminado) return res.status(500)
            .send({ mensaje: 'Error al eliminar el producto' })

          return res.status(200).send({ usuario: UsuarioEliminado });

        })
      }
    } else { // else de verificacion de rol admin

      if (usuarioencotrado.rol !== "ROL_ADMIN") { // aqui verificamos si el rol es de un admin si se deasea eliminar

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

    Usuario.findOne({ _id: req.user.sub, carrito: { $elemMatch: { nombreProducto: parametros.nombreProducto } } }, (err, usuarioEncontrado) => {
      if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });

      // if(!usuarioEncontrado) return res.status(500).send({ mensaje: 'vacio' });

      if (parametros.eliminar == "si") {

        Usuario.findOneAndUpdate({ _id: req.user.sub, carrito: { $elemMatch: { nombreProducto: parametros.nombreProducto } } }
          , { $pull: { carrito: { nombreProducto: parametros.nombreProducto } } }, { new: true }, (err, NombreCarritoEliminado) => {
            if (err) return res.status(500).send({ mensaje: 'error en la peticion del eliminar el carrito' });
            if (!NombreCarritoEliminado) return res.status(500).send({ mensaje: 'error al eliminar el producto al carrito' })


            let totallocal = 0;
            let subTotalLocal = [];
            let cantidaActualiza = 0;
            for (let i = 0; i < NombreCarritoEliminado.carrito.length; i++) {

              subTotalLocal.push(NombreCarritoEliminado.carrito[i].cantidadComprada * NombreCarritoEliminado.carrito[i].precioUnitario);
            }

            for (let i = 0; i < subTotalLocal.length; i++) {
              totallocal += subTotalLocal[i];
            }

            Usuario.findOneAndUpdate({ _id: req.user.sub },
              { totalCArrito: totallocal }, { new: true },
              (err, totalActualizado) => {
                if (err) return res.status(500).send({ mensaje: 'error en la peticion Totla carrito ' });
                if (!totalActualizado) return res.status(500).send({ mensaje: 'error al actualiaar el total del carrito' });

                return res.status(200).send({ carritoActualizadoDespuesEliminar: totalActualizado })

              })

          })

      } else { // no deseo eliminar ningun producto de la tienda


        if (parametros.cantidad && parametros.nombreProducto) { //parametros obligatorios
          if (parametros.cantidad > 0) { //no pueden mandar numeros negativos o el cero

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
                  let subTotalLocal = [];
                  for (let i = 0; i < productoAgregadoCarrito.carrito.length; i++) {
                    subTotalLocal.push(productoAgregadoCarrito.carrito[i].cantidadComprada * productoAgregadoCarrito.carrito[i].precioUnitario);
                  }

                  for (let i = 0; i < subTotalLocal.length; i++) {
                    totallocal += subTotalLocal[i];
                  }

                  console.log(subTotalLocal);
                  console.log(totallocal)

                  Usuario.findByIdAndUpdate(req.user.sub, { totalCArrito: totallocal }, { new: true },
                    (err, totalActualizado) => {
                      if (err) return res.status(500).send({ mensaje: 'error en la peticion Totla carrito ' });
                      if (!totalActualizado) return res.status(500).send({ mensaje: 'error al actualiaar el total del carrito' });

                      return res.status(200).send({ usuario: totalActualizado })
                    })
                })

            } else {

              Usuario.findOneAndUpdate({ _id: req.user.sub, carrito: { $elemMatch: { nombreProducto: parametros.nombreProducto } } },
                { $inc: { "carrito.$.cantidadComprada": parametros.cantidad } }, { new: true },
                (err, Aumentodecantidad) => {

                  if (!Aumentodecantidad) return res.status(500).send({ mensaje: 'error en al actualizar cantida de actualizar ' });

                  if (err) return res.status(500).send({ mensaje: 'error en la petcion de actualizar ' });

                  let totallocal = 0;
                  let subTotalLocal = [];
                  let cantidaActualiza = 0;
                  for (let i = 0; i < Aumentodecantidad.carrito.length; i++) {
                    cantidaActualiza = Aumentodecantidad.carrito[i].cantidadComprada;
                    subTotalLocal.push(Aumentodecantidad.carrito[i].cantidadComprada * Aumentodecantidad.carrito[i].precioUnitario);
                  }

                  for (let i = 0; i < subTotalLocal.length; i++) {
                    totallocal += subTotalLocal[i];
                  }

                  Usuario.findOneAndUpdate({ _id: req.user.sub, carrito: { $elemMatch: { nombreProducto: parametros.nombreProducto } } },
                    { totalCArrito: totallocal, "carrito.$.subTotal": cantidaActualiza * productoEncontrado.precio }, { new: true },
                    (err, totalActualizado) => {
                      if (err) return res.status(500).send({ mensaje: 'error en la peticion Totla carrito ' });
                      if (!totalActualizado) return res.status(500).send({ mensaje: 'error al actualiaar el total del carrito' });

                      return res.status(200).send({ carrito: totalActualizado })

                    })

                })

            }

          } else {

            console.log(parametros.cantidad + "numeros negativos o igual a cero")
            return res.status(500).send({ mensaje: 'no puedes mandar numeros negativos o el cero ' });
          }

        } else {
          res.status(500).send({ mensaje: 'debe mandar parametros obligatorios' });
        }


      }





    })
  })
}

const PdfkitConstruct = require('pdfkit-construct');
const fs = require('fs');
const doc = new PdfkitConstruct;

function creaFactura(req, res) {
  var idUsua = req.user.sub
var hoy = new Date();
var fecha = hoy.getDate() + '-' + ( hoy.getMonth() + 1 ) + '-' + hoy.getFullYear();
var hora = hoy.getHours() + ':' + hoy.getMinutes() + ':' + hoy.getSeconds();
var fechaYHora = fecha + ' ' + hora;

console.log( fechaYHora)

  Usuario.findOne({ _id: idUsua }, (err, usuarioEncontrado) => {





    doc.pipe(fs.createWriteStream(`${usuarioEncontrado._id}.pdf`))


    let count = 1;
    const registros = usuarioEncontrado.carrito.map((prueba) => {
      const registro = {

        Num: count,
        nombre: prueba.nombreProducto,
        precio: prueba.precioUnitario,
        cantidad: prueba.cantidadComprada,
        subtotal: prueba.subTotal

      }
      count++;
      return registro;
    })
  

    doc.setDocumentHeader({
      height: '22%',
      marginLeft: 45,
      marginRight: 45,
    }, () => {

      //doc.image(imagen, 450, 10, { scale: 0.20 })

      doc.fontSize(35).text(' FACTURA', {
        width: 420,
        align: 'center'
      })

      doc.fontSize(15);

      doc.text(`id : ${usuarioEncontrado._id}`, {
        width: 420,
        align: 'left'
      })

      doc.text(`Sr(a):${usuarioEncontrado.nombre}`, {
        width: 420,
        align: 'left'
      })

      doc.text(`fecha: ${fecha} `, {
        width: 420,
        align: 'left'
      })

      
      doc.text(`Hora: ${hora} `, {
        width: 420,
        align: 'left'
      })


    });

    doc.addTable(
      [
        { key: 'Num', label: 'Num', align: 'center' },
        { key: 'nombre', label: 'Productos', align: 'center' },
        { key: 'precio', label: 'Precio', align: 'center' },
        { key: 'cantidad', label: 'Cantidad', align: 'center' },
        { key: 'subtotal', label: 'Subtotal Q', align: 'center' }
      ],
      registros, {
      border: null,
      width: "fill_body",
      striped: true,
      stripedColors: ["#DADADA", "#B3D6FF"],
      cellsPadding: 10,
      headBackground: `#000000`,
      headColor: '#FFFFFF',
      marginLeft: 45,
      marginRight: 45,
      headFontSize: 10,
      cellsFontSize: 10,
      headAlign: 'center'
    });

    doc.setDocumentFooter({
      height: '20%',
      marginLeft: 45,
      marginRight: 45,
 
    }, () => {




      doc.lineJoin('miter')
      .rect(0, doc.footer.y, doc.page.width, doc.footer.options.heightNumber).fill("#128AB0");



      doc.fill("#FFFFFF").fontSize(25).text(`Total: ${usuarioEncontrado.totalCArrito} Quetzales`, doc.footer.x + 110, doc.footer.y + 25, {
        align: 'right',
        
      });

    })


    doc.render();

    doc.end();


    return res.status(200).send({ mensaje: 'creado pdf de cliente' + usuarioEncontrado._id });

  })




}



module.exports = {
  RegistrarAdmin,
  Login,
  Registrar,
  editarUsuario,
  EliminarUsuario,
  agregarCarrito,
  creaFactura
}