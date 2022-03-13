const Categoria = require('../models/categorias.model');
const Producto = require('../models/productos.model');


function AgregarCategorias(req, res) {
    var parametros = req.body;
    var modeloCategoria = new Categoria();

    if (req.user.rol !== "ROL_ADMIN") {
        return res.status(500).send({ mensaje: 'no tiene los permisos para agregar Categorias' })
    }
    if (parametros.nombre) {
        Categoria.find({ nombre: parametros.nombre }, (err, categoriaEncotrada) => {
            if (categoriaEncotrada.length > 0) {
                return res.status(500).send({ mensaje: "esta categoria ya se encuentra registrada" });
            } else {
                modeloCategoria.nombre = parametros.nombre;
                modeloCategoria.descripcion = parametros.descripcion;

                modeloCategoria.save((err, categoriaGuardada) => {
                    if (err) return console.log("error en la peticion");
                    if (!categoriaGuardada) return console.log("error al registra una categoria");

                    return res.send({ Categoria: categoriaGuardada });
                });
            }
        });
    } else {
        return res.send({ mensaje: "Debe enviar los parametros obligatorios." })
    }

}

function editarCategorias(req, res) {
    var idCatego = req.params.idCategoria;
    var parametros = req.body;

    if (req.user.rol !== "ROL_ADMIN") {
        return res.status(500).send({ mensaje: 'no tiene los permisos para Editar Categorias' })
    }

    Categoria.findByIdAndUpdate(idCatego, parametros, { new: true }, (err, CategoriaEditada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en  la peticion' });
        if (!CategoriaEditada) return res.status(500).send({ mensaje: 'Error al editar el categoria' });
        Producto.updateMany({ idCategoria: idCatego }, { $set: { Categoria: CategoriaEditada.nombre } }, { new: true }, (err, Productoeditado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en  la peticion' });
            console.log("actualizadas: ", Productoeditado)
            Producto.find({ Categoria: CategoriaEditada.nombre }, (err, ProductoAfectado) => {


                if (err) return res.status(500).send({ mensaje: 'Error en  la peticion' });



                return res.status(200).send({ Categoria: CategoriaEditada , productoAfectadoporUpdate: ProductoAfectado});

            })
        })

    })
}



function EliminarCategorias(req, res) {
    var idCatego = req.params.idCategoria;

    if (req.user.rol !== "ROL_ADMIN") {
        return res.status(500).send({ mensaje: 'no tiene los permisos para Editar Categorias' })
    }

    Categoria.findByIdAndDelete(idCatego, (er, Categoriaeliminada) => {
        if (er) return res.status(500).send({ mensaje: 'Error en  la peticion categoria elimina' });
        if (!Categoriaeliminada) return res.status(500).send({ mensaje: 'Error al eliminar el categoria' });
        console.log(Categoriaeliminada._id);
        Producto.updateMany({ idCategoria: Categoriaeliminada._id }, { $set: { idCategoria: null ,Categoria: "Categoria por defecto" } }, { new: true }, (error, Productoeditado) => {
            if (error) return res.status(500).send({ mensaje: 'Error en  la peticion al actualizar' });
            if (!Productoeditado) return res.status(500).send({ mensaje: 'Error al  eliminar' });
            console.log("actualizadas: ", Productoeditado)
  


                return res.status(200).send({ CategoriaEliminada: Categoriaeliminada , afectados: Productoeditado});

            
        })

    })
}


function VerCategorias(req, res) {

    Categoria.find({}, (err, CategoriasEncontradas) => {
        if (err) return res.status(500).send({ mensaje: 'Error en  la peticion' });
        if (!CategoriasEncontradas) return res.status(500)
            .send({ mensaje: 'Error al obtener las Categorias' })

        return res.status(200).send({ Categorias: CategoriasEncontradas })
    })
}




module.exports = {
    VerCategorias,
    AgregarCategorias,
    editarCategorias,
    EliminarCategorias
}