// Required - Librerias necesarias para montar el servidor
var express = require('express');

var mdAutentification = require('./../middlewares/autentification');

// Inicializar variables 
var app = express();

var Hospital = require('../models/hospital');

// Obtener todos los usuarios
app.get('/', (req, resp, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .limit(5)
        .skip(desde)
        .populate('usuario', 'nombre email')
        .exec(
        
        (err, hospitales) => {

        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error en la base de datos',
                errors: err
            });
        }
        
        Hospital.count({}, (err, conteo) => {

            resp.status(200).json({
                ok: true,
                hospitales: hospitales,
                total: conteo
            });
    
        })
    });

});

// Actualizar hospital
app.put( '/:id', mdAutentification.verificaToken, (req, resp) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'No existe el hospital con el id ' + id,
                errors: {
                    mensaje: 'No existe el hospital con el id ' + id
                }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save( (err, hospitalGuardado) => {

            if (err) {
                return resp.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            resp.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
});

// Crear un nuevo hospital
app.post('/', mdAutentification.verificaToken, (req, resp) => {

    var body = req.body;
    
    hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save( (err, hospitalGuardado) => {

        if (err) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Error al crear el hospital',
                errors: err
            });
        }

        resp.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });

    } );
    
});

// Borrar un hospital por el id
app.delete('/:id', mdAutentification.verificaToken, (req, resp) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con el id' + id,
                errors: {
                    mensaje: 'No existe un hospital con el id' + id
                }
            });
        }


        resp.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });

});

module.exports = app;