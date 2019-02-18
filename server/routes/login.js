const express = require('express');
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const jwt = require('jsonwebtoken');

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

app.post('/google',  (req, res) => {
    let token = req.body.idtoken;
    res.json({
        body: req.body
    });
});

module.exports = app;
