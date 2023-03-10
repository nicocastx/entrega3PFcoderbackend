//#region Importaciones
//imports de express
import express from "express";
import { createServer } from "http";

//imports de manejo de DB
import { contenedorDBMA } from "./src/persistencia/contenedorDBMA.js";
import { conexionMADB } from "./optionsDBMA.js";
import {userModel} from './src/models/usuarios.js'
import { prodModel } from "./src/models/productos.js";
import {contenedorCarrito} from './src/persistencia/contenedorCart.js'
import multer from 'multer'
import path from "path";


//!ojo que creo que no hay hacer front
//imports de handlebars
import { engine as exphbs } from "express-handlebars";

//imports sobre sesiones
import session from "express-session";
import passport from "passport";
import { Strategy as localStrategy } from "passport-local";
import bcrypt from "bcrypt";
import MongoStore from "connect-mongo";

//importacion de procesos
import dotenv from "dotenv";
import cluster from "cluster";
import os from "os";

//import de loggers
//import logger from "./logger.js";

//importacion de dirname
import * as url from "url";

//Configuracion de dirname
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
//Configuracion dotenv
dotenv.config({path: __dirname + '/.env'})

//#endregion Importaciones

//Servidor mongoose
conexionMADB

//#region Variables
//Manejo de colecciones
const cUsers = new contenedorDBMA(userModel)
const cProds = new contenedorDBMA(prodModel)
const cCarrito = new contenedorCarrito()

//Configuracion multer
const userStorage = multer.diskStorage({
  destination: "public/avatars",
  filename: function (req, file, cb) {
    cb(null, req.body.username + path.extname(file.originalname));
  }
})

const userDestino = multer({
  storage: userStorage,
  onFileUploadStart: function () {
    console.log(username + " upload user profile is starting ...");
  },
});

//Configuracion de mongoStore
const advOptionsMongo = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

//inicializacion express
const app = express();

const MODO = "fork";
const PORT = process.env.PORT || 8080;

let usuarios = []
cUsers.getAll()
.then(users => usuarios = users)

const numCPUs = os.cpus().length
//#endregion Variables

//#region Configuracion de app
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./public"));
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.URLDB,
      mongoOptions: advOptionsMongo,
      ttl: 60,
      autoRemove: "native",
    }),
    cookie: {
      maxAge: 10 * 60 * 1000,
    },
    secret: process.env.SECRETSESSION,
    resave: false,
    saveUnitialized: false,
  })
);
//#endregion Configuracion de app

//#region Configuracion de passport
passport.use(
  "register",
  new localStrategy({
    passReqToCallback: true,
  },
  (req, username, password, done) =>{

    const usuario = usuarios.find(usuario => usuario.email == username)
    if (usuario){
      console.log('el usuario ya existe');
      return done(null, false)
    }
    
    const newUser = {
      email: username,
      password: createHash(password),
      nombre: req.body.nombre,
      direccion:req.body.direccion,
      edad:req.body.edad,
      nroTelefono:req.body.nroTelefono,
      urlAvatar: '/avatars/' + req.file.filename,
    }

    usuarios.push(newUser)
    cUsers.save(newUser).then(() =>{
      console.log('se creo el usuario');
      return done(null, newUser)
    })
  })
);

passport.use('login', new localStrategy(
  (email, password, done) =>{
    const usuario = usuarios.find(usuario => usuario.email == email)
    if(!usuario) {
      console.log('no se encontro el usuario');
      return done(null, false)
    }
    if(!validPassword(usuario, password)){
      console.log('contraseña invalida');
      return done(null, false)
    }

    return done(null, usuario)
  }))

  //serializacion y deserializacion
  passport.serializeUser((user, done) =>{
    done(null, user.email)
  })

  passport.deserializeUser((email, done) =>{
    const usuario = usuarios.find(usuario => usuario.email == email)
    done(null, usuario)
  })

//inicio de passport en app
app.use(passport.initialize());
app.use(passport.session());
//#endregion Configuracion de passport

//#region Funciones necesarios
//Funciones de bcrypt
function createHash(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
}

function validPassword(user, password){
  return bcrypt.compareSync(password, user.password)
}
//#endregion Funciones necesarios

//#region Middlewares
function isAuth(req, res, next){
  if(req.isAuthenticated()){
    next()
  } else{
    res.redirect('/login')
  }
}
//#endregion Middlewares

//#region Servidor
if (MODO === "cluster" && cluster.isPrimary) {
  console.log(`Maestro ejecutado con el ID: ${process.pid}`); //! reemplazar por logger
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker) => {
    console.log(
      `Worker ${worker.process.pid} died: ${new Date().toLocaleString()}`
    );
  });
} else {
  console.log(`El proceso worker se inicio en ${process.pid}`); //! reemplazar por logger
  //#region Enrutamiento

  app.get('/login', (req, res) =>{
    res.send('Bienvenido al logeo')
  })

  app.get('/register', (req, res) =>{
    res.send('Bienvenido al registro')
  })

  app.post("/login", passport.authenticate('login', {
    failureRedirect: '/loginerror',
    successRedirect: '/'
  }));

  app.post("/register", userDestino.single('avatar') ,passport.authenticate('register', {
    failureRedirect: '/failregister',
    successRedirect: '/'
  }));

  app.get("/", isAuth, (req, res) => {
    cProds.getAll()
    .then(prods =>{
      const infoUser = usuarios.find(usuario => usuario.email == req.session.passport.user)
      cCarrito.getByClient(infoUser.email)
      .then(carrito =>{
        res.send([prods, infoUser, carrito])
      })
    })
  });

  app.get('/loginerror', (req, res) =>{
    res.send('problemita al loguearse')
  })

  app.get('/desloguear', (req, res) =>{

  })



  //#endregion Enrutamiento
  app.listen(PORT, (err) => {
    console.log(`Servidor escuchando en ${PORT}`);
  });
}
//#endregion Servidor
