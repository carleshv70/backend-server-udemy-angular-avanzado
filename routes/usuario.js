// Required - Librerias necesarias para montar el servidor
var express = require('express');
var bcrypt = require('bcryptjs');

var mdAutentification = require('./../middlewares/autentification');


// Inicializar variables 
var app = express();

var Usuario = require('../models/usuario');

// Obtener todos los usuarios
app.get('/', (req, resp, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role google')
        .skip(desde)
        .limit(5)
        .exec(
        
        (err, usuarios) => {

        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error en la base de datos',
                errors: err
            });
        }
        
        Usuario.count({}, (err, conteo) => {

            if (err) {
                return resp.status(500).json({
                    ok: false,
                    mensaje: 'Error en la base de datos',
                    errors: err
                });
            }

            resp.status(200).json({
                ok: true,
                usuarios: usuarios,
                total: conteo
            });
        });
    });

});



// Actualizar usuario
app.put( '/:id', [mdAutentification.verificaToken, mdAutentification.verificaADMIN_o_MismoUsuario], (req, resp) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'No existe el usuario con el id ' + id,
                errors: {
                    mensaje: 'No existe el usuario con el id ' + id
                }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save( (err, usuarioGuardado) => {

            if (err) {
                return resp.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            resp.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
});


// Crear un nuevo usuario
app.post('/', (req, resp) => {

    var body = req.body;
    
    usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password:  bcrypt.hashSync( body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save( (err, usuarioGuardado) => {

        if (err) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Error al crear el usuario',
                errors: err
            });
        }

        resp.status(201).json({
            ok: true,
            usuario: usuarioGuardado
        });

    } );

    
});

// Borrar un usuario por el id
app.delete('/:id', [mdAutentification.verificaToken, mdAutentification.verificaADMIN_ROLE], (req, resp) => {


    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con el id' + id,
                errors: {
                    mensaje: 'No existe un usuario con el id' + id
                }
            });
        }


        resp.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });


    });


});

module.exports = app;