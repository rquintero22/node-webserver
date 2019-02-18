require('./config/config');

const express = require('express');
const mongoose = require('mongoose');
const colors = require('colors');
const path = require('path');

const app = express();
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

// habilitar la carpeta public
app.use( express.static( path.resolve( __dirname, '../public' ) ) );
 
// configuración global de rutas
app.use( require('./routes/index') );

/**
 * Conexión a mongoose
 */
// mongoose.connect('mongodb://localhost:27017/cafe', (err, res) => {
mongoose.connect(process.env.urlDB, (err, res) => {
    if (err) throw err.red;

    console.log('Base de datos Online'.green);
    
});

/**
 * Escuchando servidor en el puerto indicado
 */
app.listen(process.env.PORT, () => {
    console.log('Escuchando el puerto '.green, process.env.PORT);
});