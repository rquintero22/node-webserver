const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

// Modelos
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

// default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    // validar tipo
    let tiposValidos = ['productos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0 ) {
        return res.status(400).json({
            ok: false,
            err: { message: 'Los tipo permitidos son: ' + tiposValidos.join(', ')},
            tipo
        });
    }

    if ( !req.files ) {
        return res.status(400).json({
            ok: false,
            err: { message: 'No se ha seleccionado ningún archivo.'}
      });

    };

    let archivo = req.files.archivo;

    // Extensiones válidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    let nombreCortado = archivo.name.split('.');

    let extension = nombreCortado[nombreCortado.length -1];
   
    if ( extensionesValidas.indexOf( extension ) < 0 ) {
        return res.status(400).json({
            ok: false,
            err: { message: 'Las extensiones permitidas son: ' + extensionesValidas.join(', ')},
            ext: extension
        });
    }

    // Cambiar el nombre del archivo
    let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;


    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => {
        if (err) {
          return res.status(500).json({
              ok: false,
              err
          });
        }

        // Imágen está en mi file system
        switch(tipo) {
            case 'usuarios':
                imagenUsuario(id, res, nombreArchivo);
                break;
            case 'productos':
                imagenProducto(id, res, nombreArchivo);
                break;
        }        
      
      });
    
});

/**
 * Guarda la imágen del usuario en la base de datos
 */
function imagenUsuario( id, res, nombreArchivo ) {
    Usuario.findById(id, (err, usuarioDB ) => {
        if (err) {
            // Borrar archivo
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if ( !usuarioDB ) {
            if (err) {
                // Borrar archivo
                borraArchivo(nombreArchivo, 'usuarios');
                return res.status(400).json({
                    ok: false,
                    err: { message: 'Usuario no registrado'}
                });
            }
        }

        // Borrar archivo
        borraArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;

        usuarioDB.save( (err, usuarioGuardado) => {
             res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });
        } );      

    })
}

/**
 * Guarda la imágen del producto en la base de datos
 */
function imagenProducto( id, res, nombreArchivo ) {
    Producto.findById(id, (err, productoDB ) => {
        if (err) {
            // Borrar archivo
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if ( !productoDB ) {
            if (err) {
                // Borrar archivo
                borraArchivo(nombreArchivo, 'productos');
                return res.status(400).json({
                    ok: false,
                    err: { message: 'Producto no registrado'}
                });
            }
        }

        // Borrar archivo
        borraArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;

        productoDB.save( (err, productoGuardado) => {
             res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });
        } );      

    })
}

/**
 * elimina la imágen fisico para actualizar
 */
function borraArchivo( nombreImagen, tipo ) {
    // verificar la ruta del archivo
    let pathImagen = path.resolve( __dirname, `../../uploads/${ tipo }/${ nombreImagen }` );
    if ( fs.existsSync( pathImagen ) ) {
        fs.unlinkSync( pathImagen );
    }
};

module.exports = app;
