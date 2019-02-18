const express = require('express');
const Producto = require('../models/producto');

const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();

/**
 * Buscar productos
 */
app.get('/productos/buscar/:termino', verificaToken,  (req, res) =>{

    let termino = req.params.termino;

    let regex = new RegExp( termino, 'i');

    Producto.find({ nombre: regex })
        .populate('Usuario', 'nombre role estado google email')
        .populate('categoria', 'descripcion')
        .exec( (err, productos ) => {
            if ( err ){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });
        } );
});

/**
 * Obtener todos los productos
 */
app.get('/productos', verificaToken,  (req, res) =>{
    //Traer todos los productos
    //Cargas categorias y usuarios
    //paginado
    let desde = req.query.desde || 0;
    let limite = req.query.limite || 5;
    let disponible = req.query.disponible || true;

    desde = Number(desde);
    limite = Number(limite);

    Producto.find({disponible: disponible}, )
        .sort('descripcion')
        .skip(desde)  // ejecuta desde esta registro
        .limit(limite) // limita el número de registro que se desea mostrar
        .populate('Usuario', 'nombre role estado google email')
        .populate('categoria', 'descripcion')
        .exec( (err, productoDB ) => {

            if ( err ){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if ( !productoDB ){
                return res.status(400).json({
                    ok: false,
                    err: { message: 'Id no registrado' }
                });
            }

            Producto.count({disponible: true}, (err, total ) =>{
                res.json({
                    ok: true,
                    productos: productoDB,
                    total
                });
            });
           
        } );
});

/**
 * Obtener producto por id
 */
app.get('/productos/:id', verificaToken, (req, res) =>{

    const id = req.params.id;

    Producto.findById(id)
        .populate('Usuario', 'nombre role estado google email')
        .populate('categoria', 'descripcion')
        .exec( (err, producto) => {
            if (err ) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto
            });
        } );
});

/**
 * Dar de alta a un producto
 */
app.post('/productos', verificaToken, (req, res) =>{
    //Grabar el usuario
    //Graba una categoria del listado
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save( (err, productoDB) => {
        if ( err ) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        });

    } );

});

/**
 * Modifica un producto
 */
app.put('/productos/:id', verificaToken, (req, res) =>{
    //actualizar el usuario
    //Graba una categoria del listado

    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {
        if ( err ) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if ( !productoDB ) {
            return res.status(500).json({
                ok: false,
                err: { message: 'El producto no se encuentra registrado'}
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.descripcion;

        productoDB.save( (err, productoGuardado ) =>{

            if ( err ) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.status(201).json({
                ok: true,
                producto: productoGuardado
            });

        } );

      
    });
   
});

/**
 * Dar de baja de un producto
 */
app.delete('/productos/:id', verificaToken, (req, res) =>{
    //actualizar el usuario
    //Graba una categoria del listado
    let id = req.params.id;

    Producto.findById(id, (err, productoDB) => {
        if ( err ) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if ( !productoDB ) {
            return res.status(400).json({
                ok: false,
                err: { message: 'El producto no se encuentra registrado'}
            });
        }

        productoDB.disponible = false;

        productoDB.save( (err, productoEliminado) =>{
            if ( err ) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
    
            res.json({
                ok: true,
                producto: productoEliminado,
                mensake: 'Producto eliminado'
            })
    
        } )
    });

});

module.exports = app;
