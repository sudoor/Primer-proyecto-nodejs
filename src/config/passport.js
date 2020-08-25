const passport = require('passport'); //guarda una sesion
const LocalStrategy = require('passport-local'); // Guarda una sesion local
const User = require('../models/user.js');

passport.use(new LocalStrategy({ 
	usernameField: 'email' 
}, async (email, password, done) => { // Done es para terminar el proceso de autenticacion
	const user = await User.findOne({ email: email });
	if (!user) {
		return done(null, false, {message: 'Usuario no ha sido encontrado'});
		// null que no hay error, false que no hay usuarios, mensaje que va a enviar
	}else{
		const match = await user.matchPassword(password); // verifica la contraseña
		if (match) {
			return done(null, user); // nyll no hay error, user los datos del usuario
		}else{
			return done(null, false, {message: 'Contraseña incorrecta'});
		}
	}
}));

// almacenar la id para que el usuario no se tenga que volver a autenticar

passport.serializeUser((user, done) => {
	done(null, user.id); //almacena la id del usuario logueado
});

// Buscar la información del usuario segun la id

passport.deserializeUser((id, done) => {
	User.findById(id, (err, user) => { // Busca la id y devuelve un error o el usuario
		done(err, user); //Devuelve un error si lo hay y el usuario que posee la id
	});
});