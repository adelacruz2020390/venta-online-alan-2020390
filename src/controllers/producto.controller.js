const Producto = require('../models/productos.model');
const Categorias = require('../models/categorias.model');


function AgregarProductos(req, res) {
    var parametros = req.body;
    var modeloProductos = new Producto();

    if (req.user.rol !== "ROL_ADMIN") {
        return res.status(500).send({ mensaje: 'no tiene los permisos para agregar productos' })
    }


    if (parametros.nombre && parametros.precio && parametros.stock && parametros.Categoria) {

        Producto.find({ nombre: parametros.nombre }, (err, ProductoEncontrado) => {
            if (ProductoEncontrado.length > 0) {
                return res.status(500)
                    .send({ mensaje: "este producto ya se encuentre registrado" })
            } else {
                Categorias.findOne({ nombre: parametros.Categoria }, (err, categoriaEncontrada) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                    if (categoriaEncontrada) {
                        modeloProductos.nombre = parametros.nombre;
                        modeloProductos.precio = parametros.precio;
                        modeloProductos.stock = parametros.stock;
                        modeloProductos.idCategoria = categoriaEncontrada._id;
                        modeloProductos.Categoria = categoriaEncontrada.nombre;

                        modeloProductos.save((err, productoGuardado) => {
                            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                            if (!productoGuardado) return res.status(500).send({ mensaje: 'Error al guardar el producto' })

                            return res.send({ productos: productoGuardado });

                        });

                    } else {
                        return res.status(500)
                            .send({ mensaje: 'la categoria no se pudo encontrar' })

                    }
                })
            }
        })

    } else {
        return res.send({ mensaje: "Debe enviar los parametros obligatorios." })
    }

}



function editarProducto(req, res) {
    var idproduc = req.params.idProducto;
    var parametros = req.body;

    // BORRAR LA PROPIEDAD DE PASSWORD EN EL BODY



    if (req.user.rol !== "ROL_ADMIN") {
        return res.status(500).send({ mensaje: 'No tiene los permisos para editar productos.' });
    }

    Categorias.findOne({ nombre: parametros.categoria }, (err, categoriaEncotrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en  la peticion de categoria encadra' });

        if( categoriaEncotrada){
            console.log(categoriaEncotrada._id);
            Producto.findByIdAndUpdate(idproduc, {$set: {Categoria : parametros.categoria, 
                idCategoria: categoriaEncotrada._id , nombre: parametros.nombre , precio: parametros.precio, stock: parametros.stock }} 
                ,{ new: true }, (err, productoEditado) => {
                if (err) return res.status(500).send({ mensaje: 'Error en  la peticion de producto' });
                if (!productoEditado) return res.status(500).send({ mensaje: 'Error al editar el Usuario' });
    
                return res.status(200).send({ productoEditados: productoEditado });
            })
        }else {
            return res.status(500)
            .send({ mensaje: 'la categoria no se pudo encontrar' })
        }



    })
}



function EliminarProductos(req, res) {
    var idProd = req.params.idProducto;

    if (req.user.rol !== "ROL_ADMIN") {
        return res.status(500).send({ mensaje: 'No tiene los permisos para eliminar productos.' });
    }
    
    Producto.findByIdAndDelete(idProd, (err, productoEliminado)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if(!productoEliminado) return res.status(500)
            .send({ mensaje: 'Error al eliminar el producto' })

        return res.status(200).send({ producto: productoEliminado });
    })
}

function stockProducto(req, res) {
    const productoid = req.params.idProducto;
    const parametros = req.body;

    
    if (req.user.rol !== "ROL_ADMIN") {
        return res.status(500).send({ mensaje: 'No tiene los permisos para editar productos.' });
    }

    
    Producto.findOne({ _id: productoid } , (err, ProductoEncotrado) =>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion'});

        if( parseInt(ProductoEncotrado.stock) + parseInt( parametros.stock ) >= 0 )   {
  
            Producto.findByIdAndUpdate(productoid, {$inc: { stock: parametros.stock } }, { new : true } ,
                (err, modoificadostock) =>{
                    if(err) return res.status(500).send( { mensaje: 'error en la peticion' });
                    if(!modoificadostock) return res.status(500).send( {mensaje: 'error al incrementar la cantida del prodcuto'});
        
                    return res.status(200).send( { producto: modoificadostock } )
        
                })

        } else{
 
            return res.status(500).send( { mensaje: 'estas quitando mas de lo devido' });
        }

    })


}


function VerProductos(req, res) {

    Producto.find({}, (err, ProductosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: 'Error en  la peticion' });
        if (!ProductosEncontrados) return res.status(500)
            .send({ mensaje: 'Error al obtener los Productos' })

        return res.status(200).send({ Productos: ProductosEncontrados })
    })
}


function BuscarProductosPorNombre(req, res) {
    var nombreProduco = req.params.nombre;

    Producto.find({  nombre: { $regex: nombreProduco, $options: "i" }  }, (err, ProductosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: 'Error en  la peticion' });
        if (!ProductosEncontrados) return res.status(500)
            .send({ mensaje: 'Error al obtener los Productos' })

        return res.status(200).send({ Productos: ProductosEncontrados })
    })
}


function BuscarProductosPorCategoria(req, res) {
    var categoriaProduco = req.params.Categoria;

    Producto.find({  Categoria: { $regex: categoriaProduco, $options: "i" }  }, (err, ProductosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: 'Error en  la peticion' });
        if (!ProductosEncontrados) return res.status(500)
            .send({ mensaje: 'Error al obtener los Productos' })

        return res.status(200).send({ Productos: ProductosEncontrados })
    })
}



module.exports = {
    AgregarProductos,
    editarProducto,
    EliminarProductos,
    VerProductos,
    stockProducto,
    BuscarProductosPorNombre,
    BuscarProductosPorCategoria

}