const helpers = {}; //objeto con multiples funciones

helpers.isAuthenticated = (req,res, next) => {
	if (req.isAuthenticated()) { // si el usuario está autenticado esto lo compara automaticament graacias a passport
		return next();
	}else{
		req.flash('error_msg', 'no autorizado');
		res.redirect('/users/signin');
	}
} // Para comprobar si el usuario esta autenticado, un middleware es unas funcion que se ejecuta dependiendo de lo que le pasemos
module.exports = helpers;