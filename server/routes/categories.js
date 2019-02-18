const express = require('express');
const Categoria = require('../models/categories');

const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();

/**
 * Obtiene las categoriás registrados de forma paginada
 */
app.get('/categoria', (req, res) => {
    let desde = req.query.desde || 0;
    let limite = req.query.limite || 5;
    let estado = req.query.estado || true;

    desde = Number(desde);
    limite = Number(limite);

    Categoria.find({}, )
        .skip(desde)  // ejecuta desde esta registro
        .limit(limite) // limita el número de registro que se desea mostrar
        .populate('Usuario', 'nombre role estado google email')
        .exec( (err, categorias ) => {

            if ( err ){
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Categoria.count({}, (err, total ) =>{
                res.json({
                    ok: true,
                    categorias,
                    total
                });
            });
           
        } );
} );

/**
 * Obtiene la categoriás indicada
 */
app.get('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;    
    let body = req.body; 

    Categoria.findById(id, )
        .skip(desde)  // ejecuta desde esta registro
        .limit(limite) // limita el número de registro que se desea mostrar
        .populate('Usuario', 'nombre role estado google email')
        .exec( (err, categorias ) => {

            if ( err ){
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categorias,
                total
            });
           
        } );
} );

/**
 * Da de alta al usuario
 */
app.post('/categoria', [verificaToken, verificaAdmin_Role], function (req, res) {
    let body = req.body;
      
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save( (err, categoriaDB) => {

      if ( err ) {
          return res.status(400).json({
              ok: false,
              err
          });
      }      

      res.json({
          ok: true,
          categoria: categoriaDB
      });

    } );
   
});

/**
 * Modifica el usuario
 * se le debe enviar el id del usuario
 */
app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], function (req, res) {
    let id = req.params.id;
    let body = req.body;   
          
    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true}, (err, categoriaDB) => {
      
      if ( err ) {
          return res.status(400).json({
              ok: false,
              err
          });
      }

      res.json({
          ok: true,
          categoria: categoriaDB
      });

    });
  
});

 /**
  * Da de baja al usuario indicado
  */
 app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], function (req, res) {      
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
