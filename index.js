const mongoose = require('mongoose');
const app = require('./app');
const { RegistrarAdmin  } = require('./src/controllers/usuario.controller')

mongoose.Promise = global.Promise;                                                                  //function (){}
mongoose.connect('mongodb://localhost:27017/VentaOnline', { useNewUrlParser: true, useUnifiedTopology: true }).then(()=>{
    console.log("Se encuentra conectado a la base de datos.");

    app.listen(3000, function () {
        console.log("la venta online, esta corriendo en el puerto 3000!")
    })

}).catch(error => console.log(error));

RegistrarAdmin();