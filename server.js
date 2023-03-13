//#region Importaciones
//imports de express
import express from "express";
import { createServer } from "http";

//imports de manejo de DB
import { contenedorDBMA } from "./src/persistencia/contenedorDBMA.js";
import { conexionMADB } from "./optionsDBMA.js";
import { userModel } from "./src/models/usuarios.js";
import { prodModel } from "./src/models/productos.js";
import { contenedorCarrito } from "./src/persistencia/contenedorCart.js";
import multer from "multer";
import path from "path";
import routerCarrito from "./src/routes/carritoRouter.js";
import routerProductos from "./src/routes/productoRouter.js";

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

//importacion modulos de envio de mensajes
import nodemailer from "nodemailer";
import twilio from "twilio";

//import de loggers
import logger from "./logger.js";

//importacion de dirname
import * as url from "url";

//Configuracion de dirname
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
//Configuracion dotenv
dotenv.config({ path: __dirname + "/.env" });

//#endregion Importaciones

//Servidor mongoose
conexionMADB;

//#region Variables
//Manejo de colecciones
const cUsers = new contenedorDBMA(userModel);
const cProds = new contenedorDBMA(prodModel);
const cCarrito = new contenedorCarrito();

//Configuracion multer
const userStorage = multer.diskStorage({
  destination: "public/avatars",
  filename: function (req, file, cb) {
    cb(null, req.body.username + path.extname(file.originalname));
  },
});

const userDestino = multer({
  storage: userStorage,
});

//Configuracion de mongoStore
const advOptionsMongo = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

//variables nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  auth: {
    user: process.env.GMAIL_ADDRESS,
    pass: process.env.GMAIL_PASS,
  },
});

//variables twilio
const twilioClient = twilio(process.env.ACCSID, process.env.AUTHTOK);

//inicializacion express
const app = express();

const MODO = process.env.MODO || "fork";
const PORT = process.env.PORT || 8080;

let usuarios = [];
cUsers.getAll().then((users) => (usuarios = users));

const numCPUs = os.cpus().length;
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
    saveUninitialized: false,
  })
);

//#endregion Configuracion de app

//#region Configuracion de passport
passport.use(
  "register",
  new localStrategy(
    {
      passReqToCallback: true,
    },
    (req, username, password, done) => {
      const usuario = usuarios.find((usuario) => usuario.email == username);
      if (usuario) {
        logger.error("el usuario ya existe");
        return done(null, false);
      }

      let pathFile = "";
      if (req.file) {
        pathFile = "/avatars/" + req.file.filename;
      } else {
        logger.warn("No se ha subido una foto de avatar a los datos");
      }

      const newUser = {
        email: username,
        password: createHash(password),
        nombre: req.body.nombre,
        direccion: req.body.direccion,
        edad: req.body.edad,
        nroTelefono: req.body.nroTelefono,
        urlAvatar: pathFile,
      };

      usuarios.push(newUser);
      cUsers.save(newUser).then(() => {
        logger.info("se creo el usuario");
        return done(null, newUser);
      });

      cCarrito.save(username)

      const contenido = {
        from: "Aviso de registro de nuevo usuario <no-reply@example.com>",
        to: `Muy buenas, administrador <${process.env.GMAIL_ADMIN_ADDRESS}>`,
        subject: `nuevo registro`,
        html: `<h1>AVISO: Se ha registrado el inicio de sesion de un nuevo usuario</h1>
      <h2>El usuario registrado recientemente ha presentado los siguientes datos:</h2>
      <p>${JSON.stringify(newUser)}</p>
      `,
      };
      transporter
        .sendMail(contenido)
        .then((data) => {
          logger.info(data);
        })
        .catch((err) => {
          logger.info(err);
        });
    }
  )
);

passport.use(
  "login",
  new localStrategy((email, password, done) => {
    const usuario = usuarios.find((usuario) => usuario.email == email);
    if (!usuario) {
      logger.error("no se encontro el usuario");
      return done(null, false);
    }
    if (!validPassword(usuario, password)) {
      logger.error("contraseña invalida");
      return done(null, false);
    }

    return done(null, usuario);
  })
);

//serializacion y deserializacion
passport.serializeUser((user, done) => {
  done(null, user.email);
});

passport.deserializeUser((email, done) => {
  const usuario = usuarios.find((usuario) => usuario.email == email);
  done(null, usuario);
});

//inicio de passport en app
app.use(passport.initialize());
app.use(passport.session());

//#endregion Configuracion de passport

//#region Funciones necesarios
//Funciones de bcrypt
function createHash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

function validPassword(user, password) {
  return bcrypt.compareSync(password, user.password);
}
//#endregion Funciones necesarios

//#region Middlewares
function isAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/login");
  }
}
//#endregion Middlewares

//#region Servidor
if (MODO === "cluster" && cluster.isPrimary) {
  logger.info(`Maestro ejecutado con el ID: ${process.pid}`);
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker) => {
    logger.warn(
      `Worker ${worker.process.pid} died: ${new Date().toLocaleString()}`
    );
  });
} else {
  logger.info(`El proceso worker se inicio en ${process.pid}`);
  //#region Enrutamiento

  //rutas manejo de carritos y productos
  app.use("/productos", isAuth, routerProductos.routerProductos);
  app.use("/carritos", isAuth, routerCarrito.routerCarrito);

  app.get("/login", (req, res) => {
    res.send("Bienvenido al logeo");
  });

  app.get("/register", (req, res) => {
    res.send("Bienvenido al registro");
  });

  app.post(
    "/login",
    passport.authenticate("login", {
      failureRedirect: "/loginerror",
      successRedirect: "/",
    })
  );

  app.post(
    "/register",
    userDestino.single("avatar"),
    passport.authenticate("register", {
      failureRedirect: "/failregister",
      successRedirect: "/",
    })
  );

    //!reponer isauth y borrar supuesto cliente
  app.get("/",isAuth, (req, res) => {
    cProds.getAll().then((prods) => {
      const infoUser = usuarios.find(
        (usuario) => usuario.email == req.session.passport.user
      );
      cCarrito.getByClient(infoUser.email).then((carrito) => {
        res.send([prods, infoUser, carrito]);
      });
    });
  });

  app.get("/loginerror", (req, res) => {
    res.send("problemita al loguearse");
  });

  app.get("/logout", (req, res) => {
    req.logout((err) => {
      res.redirect("/login");
    });
  });

  app.get("/carrito", isAuth, (req, res) => {
    cCarrito.getByClient(req.session.passport.user).then((cart) => {
      res.send(cart);
    });
  });

  app.post("/carrito", isAuth, (req, res) => {
    const emailCliente = req.session.passport.user;
    let productos = "";
    cCarrito.getByClient(emailCliente).then((cart) => {
      if(cart[0]){
        cart[0].productos.forEach((prod) => {
          productos += `<p>${JSON.stringify(prod)}</p>`;
        });
      
      const cliente = usuarios.find((usuario) => {
        return usuario.email === emailCliente
      });

      //envio de mail al administrador
      const contenido = {
        from: "Aviso de registro de compra de nuevo usuario <no-reply@example.com>",
        to: `Nuevo Pedido: de ${cliente.nombre} email ${emailCliente}<${process.env.GMAIL_ADMIN_ADDRESS}>`,
        subject: `Se ha registado una nueva compra!`,
        html: `<h1>Se ha registrado la compra del siguiente usuario:</h1>
        <h2>${emailCliente}</h2>
        <h3>Los productos que compro fueron:</h3>
        ${productos}
        `,
      };
      transporter
        .sendMail(contenido)
        .then((data) => {
          logger.info(data);
        })
        .catch((err) => {
          logger.error(err);
        });
      
      //envio del mensaje a whatsapp al administrador
      twilioClient.messages
        .create({
          body: `Nuevo pedido de ${emailCliente}
              concepto: ${JSON.stringify(cart[0].productos)}
            `,
          from: process.env.TWILIO_NUMBER,
          to: process.env.ADMIN_NUMBER,
        })
        .then((data) => logger.info(data));

      //envio de mensaje wsp al cliente con estado de su pedido
      twilioClient.messages 
      .create({ 
         body: 'Su pedido esta siendo procesado exitosamente!',  
         messagingServiceSid: 'MG60f6c5140ed9522c87c29256c8c9862e',      
         to: cliente.nroTelefono
       }) 
      .then(data => logger.info(data))
      cCarrito.deleteByEmailC(emailCliente)
      cCarrito.save(emailCliente)
    }
    });
    res.redirect('/')
  });

  app.get("*", (req, res) => {
    logger.error(
      `La ruta ${req.path} metodo ${req.method} no esta implementada`
    );
    res.send(`La ruta ${req.path} metodo ${req.method} no esta implementada`);
  });

  //#endregion Enrutamiento
  app.listen(PORT, (err) => {
    logger.info(`Servidor escuchando en ${PORT}`);
  });
}
//#endregion Servidor
