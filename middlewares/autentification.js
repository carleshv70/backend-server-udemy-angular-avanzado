// Verificar token
var jwt = require('jsonwebtoken');

var SEED = require('./../config/config').SEED;

exports.verificaToken = function(req, resp, next) {
    
    var token = req.query.token;
    
    jwt.verify( token, SEED, (err, decoded) => {
        
        if (err) {
            return resp.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }
        
        req.usuario = decoded.usuario;

        next();

        // resp.status(200).json({
        //     ok: true,
        //     decoded: decoded
        // });
    });
};
    
exports.verificaADMIN_ROLE = function(req, resp, next) {
    
    var usuario = req.usuario;

    if ( usuario.role === 'ADMIN_ROLE') {
        next();        
        return;
    } else {

        return resp.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - no es administrador',
            errors: {
                message: 'El usuario no tiene derechos de administrador.'
            }
        });

    }
};
    
exports.verificaADMIN_o_MismoUsuario = function(req, resp, next) {
    
    var usuario = req.usuario;
    var id = req.params.id;

    if ( usuario.role === 'ADMIN_ROLE' || usuario._id === id ) {
        next();        
        return;
    } else {

        return resp.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - no es administrador ni es el mismo usuario.',
            errors: {
                message: 'El usuario no tiene derechos de administrador.'
            }
        });

    }
};