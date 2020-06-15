// Required - Librerias necesarias para montar el servidor
var express = require('express');

var mdAutentification = require('./../middlewares/autentification');

// Inicializar variables 
var app = express();

var Medico = require('../models/medico');

// Obtener todos los medicos
app.get('/', (req, resp, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
        
        (err, medicos) => {

        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error en la base de datos',
                errors: err
            });
        }

        Medico.count({}, (err, conteo ) => {

            if (err) {
                return resp.status(500).json({
                    ok: false,
                    mensaje: 'Error en la base de datos',
                    errors: err
                });
            }

            resp.status(200).json({
                ok: true,
                medicos: medicos,
                total: conteo
            });
        });
        
    });

});

// Actualizar medico
app.put( '/:id', mdAutentification.verificaToken, (req, resp) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al buscar médico',
                errors: err
            });
        }

        if (!medico) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'No existe un médico con el id ' + id,
                errors: {
                    mensaje: 'No existe un médico con el id ' + id
                }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital

        medico.save( (err, medicoGuardado) => {

            if (err) {
                return resp.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar médico',
                    errors: err
                });
            }

            resp.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});

// Crear un nuevo medico
app.post('/', mdAutentification.verificaToken, (req, resp) => {

    var body = req.body;
    
    medico = new Medico({
        nombre: body.nombre,
        hospital: body.hospital,
        usuario: req.usuario._id
    });

    medico.save( (err, medicoGuardado) => {

        if (err) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Error al crear el médico',
                errors: err
            });
        }

        resp.status(201).json({
            ok: true,
            medico: medicoGuardado
        });

    } );
    
});

// Borrar un medico por el id
app.delete('/:id', mdAutentification.verificaToken, (req, resp) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con el id' + id,
                errors: {
                    mensaje: 'No existe un medico con el id' + id
                }
            });
        }


        resp.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });

});

module.exports = app;