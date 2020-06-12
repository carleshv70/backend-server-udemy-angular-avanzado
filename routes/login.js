// Required - Librerias necesarias para montar el servidor
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('./../config/config').SEED;

// Inicializar variables 
var app = express();
var Usuario = require('../models/usuario');

app.post('/', (req, resp) => {

    var body = req.body;

    Usuario.findOne({ email: body.email}, (err, usuarioDB) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioDB) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Error en credenciales - email',
                errors: {
                    mensaje: 'Error en credenciales - email'
                }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {

            return resp.status(400).json({
                ok: false,
                mensaje: 'Error en credenciales - password',
                errors: {
                    mensaje: 'Error en credenciales - password',
                }
            });
        }

        usuarioDB.password = ':)';

        // Generar token
        var token = jwt.sign(
            { usuario: usuarioDB }, 
            SEED,
            { expiresIn: 14400}  );
        
        resp.status(200).json({
            ok: true,
            usuario: usuarioDB,
            id: usuarioDB.id,
            token: token
        });
        
    });
});





module.exports = app;