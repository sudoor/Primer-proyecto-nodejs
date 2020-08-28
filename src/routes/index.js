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
		var inicioInfo = { // Información de inicio rápida
			dollarBalance: numeroVisual.aplicar((Number(req.user.money) / Number(req.user.dollar)).toFixed(4)),
			dollar: numeroVisual.aplicar(Number(req.user.dollar).toFixed(2))
		};
	}
	const Dolares = await Dollar.find({user: req.user.id}).sort({date:'desc'}).limit(10);
	var dollarInfo = [];
	Dolares.forEach( Dolares=>{ // recorrer el array de una forma mas ordenada
		var fecha = Dolares.date+"";// Fecha que se mostrará en la gráfica
		var arrayFecha = fecha.split(" ");
		dollarInfo.push({ //Datos para la grafica
			monto: Number(Dolares.monto).toFixed(2),
			date: arrayFecha[1]+"-"+arrayFecha[2],
			id: Dolares.id
		})
	});	
	res.render('inicio', { inicioInfo, dollarInfo });
});


// -------------------------------- ACOMODAR MONTO CON AJAX -------------------------------------

router.get('/sugaar/ajaxNumeroInput/:buscar/:tecla/:decimales', isAuthenticated, (req,res) => {
	var teclasPermitidas = [8,37,38,39,40,96,97,98,99,100,101,102,103,104,105,229]; // teclas que no son numeros pero estan permitidas 
	var teclasDenegadas = [32,111]; // Teclas que js toma como números pero causan error en el codigo
	const texto= req.params.buscar; // monto recibido sin editar
	const tecla = req.params.tecla; // tecla presionada
	const verificarDecimales = req.params.decimales; // decimales que tendrá el input
	// verificar si la tecla presionada está entre las permitidas y denegadas
	var teclasPermitidas = teclasPermitidas.find(buscando => buscando==tecla);
	var teclasDenegadas = teclasDenegadas.find(buscando => buscando==tecla);
	//Comprueba de que sea un numero la tecla
	if (isNaN(String.fromCharCode(tecla))==true && (teclasPermitidas==undefined || teclasDenegadas!=undefined)) {
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
		if (isNaN(respuesta)) { // si el monto no es un número
			var respuesta="letra";
			res.json({respuesta});	
		}
		else{ // envial el monto de respuesta decorado para ser recibido
			respuesta = numeroVisual.aplicar(respuesta);
			res.json({respuesta});
		}
	}
});

module.exports = router;