// Required - Librerias necesarias para montar el servidor
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('./../config/config').SEED;

// Inicializar variables 
var app = express();
var Usuario = require('../models/usuario');

// Google
var CLIENT_ID = require('./../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// autentificacion de google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    
    
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true

    }
  }

app.post('/google', async (req, resp) => {

    let token = req.body.token;

    let googleUser = await verify(token)
        .catch( (e ) => {
            resp.status(403).json({
                ok: false,
                mensaje: 'No se ha podido validar el usuario',
                error: {
                    mensaje: 'El token del usuario no es valido'
                }
            });
        });


        // Comprobamos si el usuario de google ya existe en nuestra 
        // colección de usuarios.
        Usuario.findOne({email: googleUser.email}, (err, usuarioDB ) => {

            if (err) {
                return resp.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar usuario',
                    errors: err
                });
            }

            if (usuarioDB) {

                if (usuarioDB.google === false ){
                    return resp.status(400).json({
                        ok: false,
                        mensaje: 'Debe usar su autentificación normal',
                        errors: err
                    });
                } else {

                    // Generar token
                    var token = jwt.sign(
                        { usuario: usuarioDB }, 
                        SEED,
                        { expiresIn: 14400}  );
                    
                    resp.status(200).json({
                        ok: true,
                        usuario: usuarioDB,
                        id: usuarioDB.id,
                        token: token,
                        menu: obtenerMenu(usuarioDB.role)
                    });

                }

            } else {
                // el usuario no existe, hay que crearlo
                var usuario = new Usuario();

                usuario.nombre = googleUser.nombre;
                usuario.email = googleUser.email;
                usuario.img = googleUser.img;
                usuario.google = true,
                usuario.password = ':)';

                usuario.save( (err, usuarioDB) => {

                    if (err) {

                        return resp.status(500).json({
                            ok: false,
                            mensaje: 'Error al grabar usuario',
                            errors: err
                        });
                    }

                    // Generar token
                    var token = jwt.sign(
                        { usuario: usuarioDB }, 
                        SEED,
                        { expiresIn: 14400}  );

                    resp.status(200).json({
                        ok: true,
                        usuario: usuarioDB,
                        id: usuarioDB.id,
                        token: token,
                        menu: obtenerMenu(usuario.role)
                    });

                        
                });
            }


        })



    res.status(200).json({
        ok: true,
        mensaje: "Ok!",
        googleUser: googleUser
    });

});


// Autentificación normal
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

            return resp.status(401).json({
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
            token: token,
            menu: obtenerMenu(usuarioDB.role)
        });
        
    });
});

function obtenerMenu( ROLE ){

    var menu = [
        {
          titulo: 'Principal',
          icono: 'mdi mdi-gauge',
          submenu: [
            { titulo: 'Dashboard', url: '/dashboard' },
            { titulo: 'ProgressBar', url: '/progress' },
            { titulo: 'Graficas', url: '/grafica1' },
            { titulo: 'Promesas', url: '/promesas' },
            { titulo: 'Rxjs', url: '/rxjs' }
          ]
        },
        {
          titulo: 'Mantenimientos',
          icono: 'mdi mdi-folder-lock-open',
          submenu: [
            { titulo: 'Hospitales', url: '/hospitales'},
            { titulo: 'Medicos', url: '/medicos'},
          ]
        }
      ];

      if (ROLE === 'ADMIN_ROLE') {
          // unshift -> añade el elemento al principio
          menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios'});
      }
      return menu;
}



module.exports = app;