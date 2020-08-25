const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash'); //middleware para mostrar mensajes
const passport = require('passport');

var fecha;
var tiempoEscribir;
var tiempo = setInterval(async function(){
	fecha = new Date();
	tiempoEscribir = await fecha.getHours()+":"+fecha.getMinutes()+":"+fecha.getSeconds();
},1000);


function contar(){
	return tiempoEscribir;
}

// Inicializaciones

const app = express();
require('./database');
require('./config/passport.js');

// HELPERS ------------------------- funciones de ayuda

const numeroVisual = require('./helpers/funciones'); // colocar los puntos en los miles de los numeros altos

// Settings ...................... configuraciones


app.set('port', process.env.PORT || 3000); // Establecer puerto 3000 o uno dado por la nube
app.set('views', path.join(__dirname, 'views')); // Le indico a nodejs donde se encuentra la carpeta views
app.engine('.hbs', exphbs({ //configurar los handlebars hbs
	defaultLayout: 'main', // Nombre del archivo principal de layouts
	layoutsDir: path.join(app.get('views'),'layouts'), // Ubicacion de la carpeta layouts
	partialsDir: path.join(app.get('views'),'partials'), // Ubica la carpeta partials por lo tanto se llamaran solo los archivos
	extname: '.hbs' //extension de los archivos
}));
app.set('view engine', '.hbs');

// Middlewares ...................   funciones que van a ser ejecutadas antes de pasar por el servidor

app.use(express.urlencoded({ extended: false })); // Verifica que solo se reciban datos y no archivos con extensiones
app.use(methodOverride('_method')); // Para que los formularios puedan enviar otros tipos de metodos que GET Y POST (_metod)
app.use(session({ 
	secret:'mysecretapp', // una frase secreta y los otros dos campos son por defecto
	resave: true,
	saveUninitialized: true
}));
// este modulo passport debe ir siempre despues de app.use session
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); // Para enviar mensajes

// Global variables ...................variables globales

app.use((req, res, next)=>{ // es importante el next para que la pagina no se quede trabada
	res.locals.success_msg = req.flash("success_msg");
	res.locals.error_msg = req.flash("error_msg");
	res.locals.error = req.flash("error");
	//Obtener datos del usuario actual
	const userActual = req.user || null;
	if (userActual) {
		res.locals.userName = {
			name: userActual.name,
			id: userActual.id,
			money: userActual.money,
			moneyV: numeroVisual.aplicar((userActual.money).toFixed(2)),
		};//en caso de querer ver mas información colocar los parametros por separados porque al colocarlos juntos handlebars da acceso denegado
		if (userActual.dollar) {
			res.locals.userName.dollar = userActual.dollar,
			res.locals.userName.dollarV = numeroVisual.aplicar(userActual.dollar),
			res.locals.userName.dollarBalance = (userActual.money / userActual.dollar) || null,
			res.locals.userName.dollarBalanceV = (numeroVisual.aplicar((userActual.money / userActual.dollar).toFixed(2))) || null
		}
	}
	next(); // se coloca esto para que salte y no se quede en esta funcion
});

// Routes ............................. rutas

app.use(require('./routes/index'));
app.use(require('./routes/productos'));
app.use(require('./routes/users'));
app.use(require('./routes/reportes'));
app.use(require('./routes/ventas'));

// Static files ............................ archivos estaticos

app.use(express.static(path.join(__dirname, 'public'))); // todo lo que esté dentro de la carpeta public es público
//como css, js, img, entre otros. por lo tanto esta es la pagina principal de localhost:3000

// Server is listening ........................ iniciacion de server

app.listen(app.get('port'),() => {
	console.log('Servidor iniciado en puerto', app.get('port'));
});

exports.contar = contar;