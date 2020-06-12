// Required - Librerias necesarias para montar el servidor
var express = require('express');

// Inicializar variables 
var app = express();

// Rutas
app.get('/', (req, resp, next) => {

    resp.status(200).json({
        ok: true,
        mensaje: 'petición realizada correctamente'
    });

});

module.exports = app;