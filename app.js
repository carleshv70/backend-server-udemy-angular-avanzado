// Required - Librerias necesarias para montar el servidor
var express = require('express');
var mongoose = require('mongoose');


// Inicializar variables 
var app = express();

// Conexión a la base de datos 
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, resp) => {

    if (err) throw err;

    console.log('Base de datos online');
});

// Rutas
app.get('/', (req, resp, next) => {

    resp.status(200).json({
        ok: true,
        mensaje: 'petición realizada correctamente'
    });

});

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000 online');
});
