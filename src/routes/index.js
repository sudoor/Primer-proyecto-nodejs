const express = require('express');
const router = express.Router(); // Permite la creación de rutas
const User = require('../models/user.js');
const { isAuthenticated } = require('../helpers/auth');
const Dollar = require('../models/Dollar.js'); // registro del precio del dollar
const numeroVisual = require('../helpers/funciones'); // colocar los puntos en los miles de los numeros altos

router.get('/', (req,res) => {
	// res.send('Index'); para enviar a una ruta a la carpeta principal o res.send('/index')
	res.render('index'); //renderizar
}); // cuando visiten la página enviar el mensaje

// --------------- PAGINA LUEGO DE INICIAR -----------------------------------

router.get('/inicio', isAuthenticated, async (req,res) => {
	if (req.user.dollar) {
		var inicioInfo = {
			dollarBalance: numeroVisual.aplicar((Number(req.user.money) / Number(req.user.dollar)).toFixed(4)),
			dollar: numeroVisual.aplicar(Number(req.user.dollar).toFixed(2))
		};
	}
	const Dolares = await Dollar.find({user: req.user.id}).sort({date:'desc'}).limit(10);
	var dollarInfo = [];
	Dolares.forEach( Dolares=>{ // recorrer el array de una forma mas ordenada
		var fecha = Dolares.date+"";
		var arrayFecha = fecha.split(" ");
		dollarInfo.push({
			monto: Number(Dolares.monto).toFixed(2),
			date: arrayFecha[1]+"-"+arrayFecha[2],
			id: Dolares.id
		})
	});	
	res.render('inicio', { inicioInfo, dollarInfo });
});


// -------------------------------- ACOMODAR MONTO CON AJAX -------------------------------------

router.get('/sugaar/ajaxNumeroInput/:buscar/:tecla/:decimales', isAuthenticated, (req,res) => {
	var teclasPermitidas = [8,37,38,39,40,96,97,98,99,100,101,102,103,104,105,229];
	var teclasDenegadas = [32,111];
	const texto= req.params.buscar;
	const tecla = req.params.tecla;
	const verificarDecimales = req.params.decimales;

	var teclasPermitidas = teclasPermitidas.find(buscando => buscando==tecla);
	var teclasDenegadas = teclasDenegadas.find(buscando => buscando==tecla);
	if (isNaN(String.fromCharCode(tecla))==true && teclasPermitidas==undefined || teclasDenegadas!=undefined) {
		var respuesta="letra";
		res.json({respuesta});	
	}
	else{
		// ordena el monto con la nueva tecla colocada
		if (verificarDecimales==3) {
			var respuesta = numeroVisual.verificar3(texto);
		}
		if (verificarDecimales==2) {
			var respuesta = numeroVisual.verificar(texto);
		}
		if (isNaN(respuesta)) {
			var respuesta="letra";
			res.json({respuesta});	
		}
		else{
			respuesta = numeroVisual.aplicar(respuesta);
			res.json({respuesta});
		}
	}
});

module.exports = router;