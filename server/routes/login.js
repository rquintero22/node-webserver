const express = require('express');
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const app = express();

app.post('/login',  (req, res) => {

    let body = req.body;
   
    Usuario.findOne({email: body.email}, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña inválida!'                    
                }
            });
        }

        if ( !bcrypt.compareSync( body.password, usuarioDB.password ) ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) inválida!'
                }
            });
        }

        // Configura el token
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });

    });
   
});

/**
 * Configuraciones de google
 */
async function verify( token ) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID
    });
    const payload = ticket.getPayload();
   
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }

}


app.post('/google', async (req, res) => {
    let token = req.body.idtoken;

    let googleUser = await verify( token )
                            .catch(e => {
                                return res.status(403).json({
                                    ok: false,
                                    err: e
                                });
                            });
                            
    Usuario.findOne( { email: googleUser.email }, ( err, usuarioDB ) =>{
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if( usuarioDB ) {
            if ( usuarioDB.google === false ) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe utilizar la autenticación normal'
                    }
                });  
            } else {
                // Configura el token
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else {
            // si el usuario no existe, sería un nuevo usuario
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.picture;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save( (err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                 // Configura el token
                 let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
                
            } );
        }
    } );

    /* res.json({
        usuario: googleUser
    }); */
});

module.exports = app;
