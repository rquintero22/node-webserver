
/**
 * Puerto
 */
process.env.PORT = process.env.PORT || 3000;

/**
 * Entorno
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

/**
 * Vencimiento del Token
 * 60 segundos
 * 60 minutos
 * 24 horas
 * 30 días
 */
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

 /**
 * SEED de autenticación
 */

 process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo' ;


/**
 * Base de datos
 */

 let urlDB;

   if (process.env.NODE_ENV === 'dev') {
      urlDB = 'mongodb://localhost:27017/cafe';
  } else { 
     urlDB = process.env.MONGO_URI;   
     //urlDB = 'mongodb+srv://cafe:cafe123@cafe-lz6h8.mongodb.net/test?retryWrites=true';
  } 

 process.env.urlDB = urlDB;


 /**
  * Cliente ID Google
  */

 process.env.CLIENT_ID = process.env.CLIENT_ID || '567994918152-fvbta9gkappam6nvm617lt4ei89752kv.apps.googleusercontent.com' ;
    