const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');

const { verificaTokenImg } = require('../middlewares/autenticacion');

const app = express();

app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {
    let tipo = req.params.tipo;
    let img = req.params.img;
  
    let pathImagen = path.resolve( __dirname, `../../uploads/${ tipo }/${ img }` );

    if ( fs.existsSync( pathImagen ) ) {
        console.log(pathImagen);
        res.sendFile(pathImagen);
    } else {
        console.log(noImagePath);
        let noImagePath = path.resolve( __dirname, '../assets/no-image.jpg');
        res.sendFile(noImagePath);
    }
    

} )

module.exports = app;
