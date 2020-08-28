const express = require('express');
const router = express.Router(); // Permite la creación de rutas
const Ingreso = require('../models/Ingreso.js'); // Modelo de datos de los Ingresos
const Egreso = require('../models/Egreso.js'); // Modelo de datos de los Egresos
const User = require('../models/user.js'); // Modelo de usuarios
const numeroVisual = require('../helpers/funciones'); // colocar los puntos en los miles de los numeros altos
const { isAuthenticated } = require('../helpers/auth');
const Dollar = require('../models/Dollar.js'); // registro del precio del dollar
const conteo = require('../index.js'); // registro de la actualizacion de la fecha


//---------------------- DOLARES ---------------------------

router.get('/dolar', isAuthenticated, async (req,res) => { // isAuthenticated verifica si esta logueado para seguir con la funcion
	const Dolares = await Dollar.find({user: req.user.id}).sort({date:'desc'});
	var dollarInfo =[]; // Array donde se guardara la información del dolar
	Dolares.forEach( Dolares=>{ // recorrer el array de una forma mas ordenada
		var fecha = Dolares.date+""; // Buscar fecha del dolar
		var arrayFecha = fecha.split(" ");// Separar los datos de la fecha
		dollarInfo.push({
			monto: numeroVisual.aplicar(Number(Dolares.monto).toFixed(2)), //convertir tu enemigo en tu hermo
			date: arrayFecha[0]+" "+arrayFecha[1]+"-"+arrayFecha[2]+"-"+arrayFecha[3], //ordenar fecha para grafica
			montoGrafica: Number(Dolares.monto).toFixed(2), // monto a mostrar en grafica
			dateGrafica: arrayFecha[1]+"-"+arrayFecha[2], // fecha a mostrar en grafica
			id: Dolares.id
		})
	});
	res.render('reportes/dolar', {dollarInfo});
}); // cuando visiten la página enviar el mensaje

//----------------------- EDITAR DOLLAR -------------------------------------

router.post('/dolar/editarDollar/:id', isAuthenticated, async (req,res) => { // :id es el dato que está recibiendo por put
	var dollarN = "" + req.body.dollar; // guarda como string el valor del dolar
	dollarN = numeroVisual.quitar(dollarN); // lo convierte a entero
	var separarDecimales = dollarN.split("."); // para verificar posteriormente cuantos decimales hay
	var errors = [];
	if (isNaN(dollarN)) {
		errors.push({text: 'El monto ingresado no es un número'});
	}
	if (separarDecimales.length!=2) {
		errors.push({text: 'Monto inválido'});
	}else{
		if (separarDecimales[1].length!=2) {
			errors.push({text: 'Sólo se permiten 2 decimales'});
		}
	}
	if (errors.length>0) {
		const Dolares = await Dollar.find({user: req.user.id}).sort({date:'desc'}); // Buscar lista de los precios del dolar
		var dollarInfo=[];
		Dolares.forEach( Dolares=>{ // recorrer el array de una forma mas ordenada
			var fecha = Dolares.date+"";
			var arrayFecha = fecha.split(" "); // Separa la fecha de la hora y zona horaria
			dollarInfo.push({ // Se ingresan los datos a mostrar
				monto: numeroVisual.aplicar(Number(Dolares.monto).toFixed(2)),
				date: arrayFecha[0]+" "+arrayFecha[1]+"-"+arrayFecha[2]+"-"+arrayFecha[3],
				montoGrafica: Number(Dolares.monto).toFixed(2),
				dateGrafica: arrayFecha[1]+"-"+arrayFecha[2],
				id: Dolares.id
			})
		});
		res.render('reportes/dolar', {errors, dollarInfo});
	}
	else{
		NuevoDollar = Dollar({ // formato del registro de la tabla dollar
			monto: Number(dollarN)
		});
		NuevoDollar.user = req.params.id;
		await User.findByIdAndUpdate(req.params.id, { dollar: dollarN }); // codigo para actualizar en mongodb
		await NuevoDollar.save();// guarda en el historial del precio del dollar
		req.flash('success_msg','Valor de 1$ ha sido actualizado a ',dollarN,' sastifactoriamente');
		res.redirect('/dolar');
	}
}); // cuando visiten la página enviar el mensaje

//----------------------- ELIMINAR DOLAR -------------------------------------

router.delete('/dolar/borrarDollar/:id', isAuthenticated, async(req, res) => { // metodo delete
	await Dollar.findByIdAndDelete(req.params.id); //eliminar
	if (numeroVisual.aplicar(Number(req.user.dollar).toFixed(2))==req.body.monto) { // si se elimina el ultimo precio fija el dolar a 0
		await User.findByIdAndUpdate(req.user.id, { dollar: 0 });
	}
	req.flash('success_msg','Registro eliminado sastifactoriamente');
	res.redirect('/dolar');
});

//-------------------------------------------- INGRESOS ----------------------------------------------------

//---------------------- Página de ingresos ---------------------------

router.get('/ingresos', isAuthenticated, async (req,res) => { // pagina para mostrar los ingresos
	const Ingresos = await Ingreso.find({user: req.user.id}).sort({ date: 'desc' }); // Buscar los ingresos
	var IngresoSend = [];
	Ingresos.forEach( Ingresos=>{ // recorrer el array de una forma mas ordenada
		var fecha = Ingresos.date+"";
		var arrayFecha = fecha.split(" ");// Separa la fecha en un array
		IngresoSend.push({
			descripcion: Ingresos.descripcion,
			monto: numeroVisual.aplicar(Ingresos.monto),
			dollar: numeroVisual.aplicar(Number(Ingresos.dollar).toFixed(2)),
			descripcion: Ingresos.descripcion,
			date: arrayFecha[1]+"-"+arrayFecha[2]+"-"+arrayFecha[3],
			id: Ingresos.id
		});
	});
	res.render('reportes/ingresos', { IngresoSend }); // le pasa todos los datos, nodes entre corchetes es como un get
}); // cuando visiten la página enviar el mensaje
// Agregar ingreso
router.post('/ingresos/agregar/:id', isAuthenticated, async (req,res) => { // :id es el dato que está recibiendo
	const formulario = req.body;
	const errors = [] // Array que va a guardar los errores
	if (!formulario.money) {
		errors.push({ text: "Debe ingresar un monto." });
	}
	if (!formulario.descripcion) {
		errors.push({ text: "Debe ingresar una descripcion." });
	}
	if (errors.length > 0) {
		res.render('reportes/ingresos', {
			errors,
			money: formulario.money,
			descripcion: formulario.descripcion
		});
	}
	else{
		const Usuario = await User.findById(req.params.id); // codigo para buscar en mongodb
		await User.findByIdAndUpdate(req.params.id, { money: Number(formulario.money) + Number(Usuario.money) }); // actualiza el dinero
		const NuevoIngreso = Ingreso({ // Crea el ingreso con los datos recibidos
			descripcion: formulario.descripcion,
			monto: Number(formulario.money),
			dollar: Number(formulario.money) / Number(Usuario.dollar),
		});
		NuevoIngreso.user = req.user.id; // para guardar la id del usuario en el ingreso
		await NuevoIngreso.save(); // guarda en la base de datos y el AWAIT indica que este es el proceso menos importante
		req.flash('success_msg','Has agregado ',formulario.money,' Bs sastifactoriamente a tu capital');
		res.redirect('/ingresos');
	}
});
//-------------------------------------------- EGRESOS ----------------------------------------------------
//---------------------- Página de ingresos --------------------------
router.get('/egresos', isAuthenticated, async (req,res) => { // isAuthenticated verifica si esta logueado
	const Egresos = await Egreso.find({user: req.user.id}).sort({ date: 'desc' });//ordenar de forma descendente
	//el req.user.id es para buscar los productos del usuario logueado
	var EgresoSend = [];
	Egresos.forEach( Egresos=>{ // recorrer el array de una forma mas ordenada
		var fecha = Egresos.date+"";
		var arrayFecha = fecha.split(" ");
		EgresoSend.push({
			descripcion: Egresos.descripcion,
			monto: numeroVisual.aplicar(Egresos.monto),
			dollar: numeroVisual.aplicar(Number(Egresos.dollar).toFixed(2)),
			descripcion: Egresos.descripcion,
			date: arrayFecha[1]+"-"+arrayFecha[2]+"-"+arrayFecha[3],
			id: Egresos.id
		});
	});
	res.render('reportes/egresos', { EgresoSend }); // le pasa todos los datos, nodes entre corchetes es como un get
}); // cuando visiten la página enviar el mensaje
// Agregar Egreso
router.post('/egresos/agregar/:id', isAuthenticated, async (req,res) => { // :id es el dato que está recibiendo
	const formulario = req.body;
	const errors = [] // Array que va a guardar los errores
	if (!formulario.monto) {
		errors.push({ text: "Debe ingresar un monto." });
	}
	if (!formulario.descripcion) {
		errors.push({ text: "Debe ingresar una descripcion." });
	}
	if (errors.length > 0) {
		res.render('reportes/egresos', {
			errors,
			monto: numeroVisual.quitar(formulario.monto),
			descripcion: formulario.descripcion
		});
	}
	else{
		var moneyN = Number(req.user.money) - Number(numeroVisual.quitar(formulario.monto)); // Calcular nuevo valor de money
		if(moneyN < 0){
			errors.push({ text: "El monto es mayor a su capital disponible." });
			res.render('reportes/egresos', {
				errors,
				monto: numeroVisual.quitar(formulario.monto),
				descripcion: formulario.descripcion
			});
		}
		else{
			await User.findByIdAndUpdate(req.params.id, { money: moneyN }); // actualizar en mongodb
			const NuevoEgreso = Egreso({ // Crea el Egreso con los datos recibidos
				descripcion: formulario.descripcion,
				monto: Number(numeroVisual.quitar(formulario.monto)),
				dollar: Number(numeroVisual.quitar(formulario.monto)) / Number(req.user.dollar),
				user: req.user.id
			});
			await NuevoEgreso.save(); // guarda en la base de datos y el AWAIT indica que este es el proceso menos importante
			req.flash('success_msg','Has retirado ',formulario.monto,' Bs sastifactoriamente de tu capital');
			res.redirect('/egresos');
		}
	}
}); // cuando visiten la página enviar el mensaje
router.get('/conteo/:numero', (req,res) => {
	var contando = conteo.contar();
	res.json({contando});
});
/*RESPUESTA DE RESPALDO AJAX
router.get('/dolar/ajax/:buscar', isAuthenticated, (req,res) => {
	const texto= req.params.buscar;
	var respuesta = numeroVisual.verificar(texto);
	respuesta = numeroVisual.aplicar(respuesta);
	res.json({respuesta});
});
*/
module.exports = router;