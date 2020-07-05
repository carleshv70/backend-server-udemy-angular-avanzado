// Required - Librerias necesarias para montar el servidor
var express = require('express');

// Inicializar variables 
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// Busqueda por coleccion
app.get('/coleccion/:tabla/:busqueda', (req, resp, next) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp( busqueda, 'i');
    var promise;

    switch(tabla){
        case 'hospitales':
            promise = buscarHospitales(busqueda, regex);
            break;
        
        case 'usuarios':
            promise = buscarUsuario(busqueda, regex);
            break;
            
        case 'medicos':
            promise = buscarMedicos(busqueda, regex);
            break;
        
            default:
                return resp.status(400).json({
                    ok: false,
                    mensaje: 'La tabla debe ser hospitales, usuarios o medicos',
                    errors: {
                        mensaje: 'La tabla debe ser hospitales, usuarios o medicos',
                    }
                });
        
                
    }
    
    promise.then( data => {

        return resp.status(200).json({
            ok: true,
            [tabla]: data
        });
    });
});


// Rutas
app.get('/todo/:busqueda', (req, resp, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp( busqueda, 'i');

    Promise.all( [ 
        buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuario(busqueda, regex)
    ]).then( respuestas => {

        resp.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });

    });
});


function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex})
            .populate('usuario', 'nombre email')
            .exec( (err, hospitales) => {
    
            if (err) {
                reject('Error al cargar hospitales', err);
            } else {
                resolve(hospitales);
            }
        });

    });

}


function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex})
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec( (err, medicos) => {
    
            if (err) {
                reject('Error al cargar medicos', err);
            } else {
                resolve(medicos);
            }
        });

    });

}


function buscarUsuario(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role img')
            .or([
                { 'nombre': regex },
                { 'email': regex }
            ])
            .exec( (err, usuarios) => {

                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }

            });

    });

}
module.exports = app;