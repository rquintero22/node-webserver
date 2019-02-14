const express = require('express');
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const _ = require('underscore');

const app = express();

/**
 * Obtiene los usuarios registrados de forma paginada
 */
app.get('/usuario', function (req, res) {

    let desde = req.query.desde || 0;
    let limite = req.query.limite || 5;
    let estado = req.query.estado || true;

    desde = Number(desde);
    limite = Number(limite);

    Usuario.find({ estado: estado }, 'nombre email estado role img google')
        .skip(desde)  // ejecuta desde esta registro
        .limit(limite) // limita el número de registro que se desea mostrar
        .exec( (err, usuarios ) => {

            if ( err ){
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Usuario.count({estado: estado}, (err, total ) =>{
                res.json({
                    ok: true,
                    usuarios,
                    total
                });
            });
           
        } );
});
   
/**
 * Da de alta al usuario
 */
app.post('/usuario', function (req, res) {
      let body = req.body;
      
      let usuario = new Usuario({
          nombre: body.nombre,
          email: body.email,
          password: bcrypt.hashSync( body.password, 10 ),
          role: body.role,
      });

      usuario.save( (err, usuarioDB) => {

        if ( err ) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // usuarioDB.password = ':)';

        res.json({
            ok: true,
            usuario: usuarioDB
        });

      } );   
     
  });
        
/**
 * Modifica el usuario
 * se le debe enviar el id del usuario
 */
app.put('/usuario/:id', function (req, res) {
      let id = req.params.id;
      let body = _.pick( req.body, [ 'nombre', 'email', 'img', 'role', 'estado' ] );   
            
      Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true}, (err, usuarioDB) => {
        
        if ( err ) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });

      });
    
  });
  
  /**
   * Elimina el usuario según el id
   */
  /*
  app.delete('/usuario/:id', function (req, res) {      
    let id = req.params.id;

    Usuario.findByIdAndRemove( id, (err, usuarioDB) =>{
        if ( err ) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if ( !usuarioDB  ) {
            return res.status(400).json({
                ok: false,
                err: { message: 'Usuario no encontrado'}
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    } );
       
 });
 */

 /**
  * Da de baja al usuario indicado
  */
 app.delete('/usuario/:id', function (req, res) {      
    let id = req.params.id;

    let cambioEstado = {
        estado: false
    }

   Usuario.findByIdAndUpdate(id, cambioEstado, { new: true }, (err, usuarioDB) => {
        
    if ( err ) {
        return res.status(400).json({
            ok: false,
            err
        });
    }   

    if ( !usuarioDB  ) {
        return res.status(400).json({
            ok: false,
            err: { message: 'Usuario no encontrado'}
        });
    }


    res.json({
        ok: true,
        usuario: usuarioDB
    });

  });
 });

module.exports = app;