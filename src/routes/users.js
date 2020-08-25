const express = require('express');
const router = express.Router(); // Permite la creación de rutas
const User = require('../models/user.js');
const passport = require('passport');// Autenticacion
const { isAuthenticated } = require('../helpers/auth');
const numeroVisual = require('../helpers/funciones'); // colocar los puntos en los miles de los numeros altos

router.get('/users/signin', (req,res) => {
	res.render('users/signin');
}); // cuando visiten la página enviar el mensaje

// ----------------------------- VERIFICAR DATOS DE INICIO DE SESIÓN --------------------------------

router.post('/users/signin', passport.authenticate('local', {  // local es una abreviatura de la funcion localStrategy
	successRedirect: '/inicio', // Si ingreso los datos correctos
	failureRedirect: '/users/signin', //sino volver a iniciar
	failureFlash: true // Para enviar mensajes flash en la autenticacion
}));

//--------------- PÁGINA PARA INICIAR SESIÓN --------------------------------

router.get('/users/signup', (req,res) => {
	res.render('users/signup');
});

//--------------- CREAR CUENTA ------------------------------------

router.post('/users/signup', async (req,res) => {
	const { name,email,password,ConfirmPassword } = req.body;
	const errors = [];
	if (!name) {
		errors.push({text: 'Debe ingresar un nombre'});
	}
	if (!email) {
		errors.push({text: 'Debe ingresar un correo'});
	}
	if (!password) {
		errors.push({text: 'No has ingresado una contraseña'});
	}
	if (!ConfirmPassword) {
		errors.push({text: 'Debe confirmar la contraseña'});
	}
	if (password!=ConfirmPassword) {
		errors.push({text: 'Las contraseñas no coinciden'});
	}
	if (password.length<4) {
		errors.push({ text: 'La contraseña debe tener al menos 4 caracteres' });
	}
	if (errors.length>0) {
		res.render('users/signup', {errors, name, email, password, ConfirmPassword});
	}
	else{
		const newUser = User({
			name,
			email,
			password,
			money: 0,
		});
		const emailUser = await User.findOne({ email: email });
		if (emailUser) { //verificar si hay algun email
			req.flash('error_msg','El correo ingresado ya está en uso');
			res.redirect('/users/signup');
		}else{
			//Encrypta la contraseña y Crea el usuario
			newUser.password = await newUser.encryptPassword(password); //encriptar la contraseña
			await newUser.save();
			req.flash('success_msg','Te has registrado correctamente');
			res.redirect('/users/signin');
		}
	}
});

// Cerrar Sesión

router.get('/users/logout', (req,res) => {
	req.logout();
	res.redirect('/');
});



module.exports = router;