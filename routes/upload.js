// Required - Librerias necesarias para montar el servidor
var express = require('express');

// Inicializar variables 
var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

var fileUpload = require('express-fileupload');
var fs = require('fs');

// default options
app.use(fileUpload());



// Rutas
app.put('/:tipo/:id', (req, resp, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Validar tipo
    var tiposValidos = ['hospitales','usuarios','medicos'];

    if ( tiposValidos.indexOf(tipo) < 0){

        return resp.status(400).json({
            ok: false,
            mensaje: 'El tipo de archivo no es valido',
            errors: {
                mensaje: 'Debe ser un tipo de arhivos valido:' + tiposValidos.join(', ')
            }
        });

    }

    if (!req.files){

        return resp.status(400).json({
            ok: false,
            mensaje: 'La petición no contiene ningún archivo',
            errors: {
                mensaje: 'La petición no contiene ningún archivo',
            }
        });

    }

    // obtener el nombre de la imagen 
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extension = nombreCortado[nombreCortado.length - 1];

    // Extensiones permitidas
    var extensionesValidas = ['png','jpg','gif','jpeg'];

    if (extensionesValidas.indexOf( extension) < 0){

        return resp.status(400).json({
            ok: false,
            mensaje: 'El archivo no es una imagen válida',
            errors: {
                mensaje: 'Debe ser un archivo con una de las siguientes extensiones: ' + extensionesValidas.join(','),
            }
        });

    }

    // nombre de archivo personalizado.
    var nombreArchivo = `${ id }${ new Date().getMilliseconds()}.${ extension}`;

    //mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${nombreArchivo}`;

    archivo.mv( path, (err) => {

        if (err) {

            return resp.status(500).json({
                ok: false,
                mensaje: 'No se ha podido subir el archivo',
                errors: err
            });

        }

        subirPorTipo( tipo, id, nombreArchivo, resp);
        
        // resp.status(200).json({
        //     ok: true,
        //     mensaje: 'archivo movido',
        //     nombreCortado: nombreCortado,
        //     extension: extension
        // });

    });


});

function subirPorTipo( tipo, id, nombreArchivo, resp){

    if( tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {

                return resp.status(400).json({
                    ok: false,
                    mensaje: 'No existe el usuario',
                    error: {
                        mensaje: 'No existe el usuario con el id ' + id
                    }
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe un fichero anterior asociado al usuario lo borramos
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err, fic) => {
                       // fichero borrado 
                });
            }

            usuario.img = nombreArchivo;

            usuario.save( (err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                return resp.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });

            });

        });
    }

    if( tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if (!medico) {

                return resp.status(400).json({
                    ok: false,
                    mensaje: 'No existe el medico',
                    error: {
                        mensaje: 'No existe el medico con el id ' + id
                    }
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            // Si existe un fichero anterior asociado al medico lo borramos
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err, fic) => {
                       // fichero borrado 
                });
            }

            medico.img = nombreArchivo;

            medico.save( (err, medicoActualizado) => {

                return resp.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });

            });

        });
    }

    if( tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {


            if (!hospital) {

                return resp.status(400).json({
                    ok: false,
                    mensaje: 'No existe el hospital',
                    error: {
                        mensaje: 'No existe el hospital con el id ' + id
                    }
                });
            }


            var pathViejo = './uploads/hospitales/' + hospital.img;

            // Si existe un fichero anterior asociado al hospital lo borramos
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err, fic) => {
                       // fichero borrado 
                });
            }

            hospital.img = nombreArchivo;

            hospital.save( (err, hospitalActualizado) => {

                return resp.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });

            });

        });
        
    }



}

module.exports = app;