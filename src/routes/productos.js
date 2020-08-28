const express = require('express');
const app = express();
const router = express.Router(); // Permite la creación de rutas
const Producto = require('../models/Producto.js'); // Modelo de datos de los productos
const { isAuthenticated } = require('../helpers/auth');
const numeroVisual = require('../helpers/funciones'); // colocar los puntos en los miles de los numeros altos
//--------------------------- AGREGAR PRODUCTO --------------------------------
router.post('/nuevoProducto',isAuthenticated, async (req,res) => { // RECIBE DATOS POR POST
	// El async es una funcion de js que indica que este proceso tendra procesos asincronos menos importantes
	const { nombre, cantidad1, cantidad2, precioCompra, precioVenta, descripcion, tipo } = (req.body); // Recibe los datos del view newNote
	//valores convertidos a numeros
	var NPrecioCompra=numeroVisual.quitar(precioCompra);
	var NPrecioVenta=numeroVisual.quitar(precioVenta);
	//convertir a entero cantidad
	if (cantidad1) {
		NCantidad=numeroVisual.quitar(cantidad1);
	}
	else if(cantidad2){
		NCantidad=numeroVisual.quitar(cantidad2);
	}
	const errors = [] // Array que va a guardar los errores
	if (!tipo) {
		errors.push({ text: "Debe seleccionar el tipo del producto (unidad, Kg)." });
	}
	if (cantidad1&&cantidad2) {
		errors.push({ text: "No se puede llenar los dos campos de cantidad, escriba en unidad o en peso." });
	}
	if (!nombre) {
		errors.push({ text: "Debe ingresar un nombre." });
	}
	if (!cantidad1&&!cantidad2) {
		errors.push({ text: "Debe ingresar una cantidad." });
	}
	if (!precioCompra) {
		errors.push({ text: "Debe ingresar el precio de compra." });
	}
	if (!precioVenta) {
		errors.push({ text: "Debe ingresar el precio de venta." });
	}
	if (!descripcion) {
		errors.push({ text: "Debe ingresar una descripción." });
	}
	if (isNaN(NPrecioVenta)||isNaN(NPrecioCompra)||isNaN(NCantidad)){
		errors.push({ text: "Los valores de los precios y la cantidad deben ser números." });
	}
	if (!tipo) {
		errors.push({ text: "No ha seleccionado el tipo del Producto." });
	}
	if (errors.length > 0) {
		res.render('productos/nuevoProducto', {
			errors,
			nombre,
			cantidad1,
			cantidad2,
			tipo,
			precioCompra,
			precioVenta,
			descripcion
		});
	}
	else{
		const NuevoProducto = Producto({ // Crea el producto con los datos recibidos
			nombre,
			cantidad: NCantidad,
			tipo,
			precioCompra: NPrecioCompra,
			precioVenta: NPrecioVenta,
			descripcion
		});
		NuevoProducto.user = req.user.id; // para guardar la id del usuario en el producto
		await NuevoProducto.save(); // guarda en la base de datos y el AWAIT indica que este es el proceso menos importante
		req.flash("success_msg","Has ingresado el producto sastifactoriamente");
		res.redirect('/productos');// Redireccionar a otra ruta de routes
	}
}); // cuando visiten la página enviar el mensaje
//---------------------- FORMULARIO PARA NUEVO PRODUCTO ---------------------------
router.get('/formAgregarProductos', isAuthenticated, (req,res) => { // isAuthenticated verifica si esta logueado para seguir con la funcion
	res.render('productos/nuevoProducto');
}); // cuando visiten la página enviar el mensaje
//--------------------- VER LOS PRODUCTOS -----------------------
router.get('/productos', isAuthenticated, async (req,res) => { //consultar los producto de la base de datos
	const Productos = await Producto.find({user: req.user.id}).sort({ nombre: 'asc' });// es asincrona por eso el await y ordenar de forma descendente
	//el req.user.id es para buscar los productos del usuario logueado
	var ProductoSend = [];
	Productos.forEach( Productos=>{ // recorrer el array de una forma mas ordenada
		ProductoSend.push({
			nombre: Productos.nombre,
			cantidad: Productos.cantidad,
			tipo: Productos.tipo,
			precioCompra: Productos.precioCompra,
			precioVenta: Productos.precioVenta,
			descripcion: Productos.descripcion,
			date: Productos.date,
			id: Productos.id
		})
	});
	res.render('productos/verProductos', { ProductoSend }); // le pasa todos los datos, nodes entre corchetes es como un get
	//res.json({ NotesSend }); //Esto mustra la informacion a travez de un json en el navegador no es necesario ver la consola
}); // cuando visiten la página enviar el mensaje
//--------------------- VER LOS PRODUCTOS DE OTRA FORMA -----------------------
//esto es para ver los productos en distintos tipos de vista
router.get('/productos/:vista', isAuthenticated, async (req,res) => { //consultar los producto de la base de datos
	const Productos = await Producto.find({user: req.user.id}).sort({ date: 'desc' });// es asincrona por eso el await y ordenar de forma descendente
	//el req.user.id es para buscar los productos del usuario logueado
	var ProductoSend2 = [];
	Productos.forEach( Productos=>{ // recorrer el array de una forma mas ordenada
		ProductoSend2.push({
			nombre: Productos.nombre,
			cantidad: Productos.cantidad,
			tipo: Productos.tipo,
			precioCompra: numeroVisual.aplicar(Productos.precioCompra),
			precioVenta: numeroVisual.aplicar(Productos.precioVenta),
			descripcion: Productos.descripcion,
			date: Productos.date,
			id: Productos.id
		})
	});
	res.render('productos/verProductos', { ProductoSend2 }); // le pasa todos los datos, nodes entre corchetes es como un get
}); // cuando visiten la página enviar el mensaje
// ------------------- Enviar a link para editar producto ---------------------------------
router.get('/productos/editar/:id', isAuthenticated, async (req,res) => { // :id es el dato que está recibiendo
	const Search = await Producto.findById(req.params.id);
	var EditarProducto = {
			nombre: Search.nombre,
			cantidad: Search.cantidad,
			precioCompra: Search.precioCompra,
			precioVenta: Search.precioVenta,
			descripcion: Search.descripcion,
			id: Search.id
	};
	res.render('productos/editarProducto', { EditarProducto});
}); // cuando visiten la página enviar el mensaje
//------------------------ EDITAR EL PRODUCTO ---------------------------------------------
router.put('/productos/editarProducto/:id', isAuthenticated, async (req,res) => { // :id es el dato que está recibiendo por put
	const { nombre, cantidad, precioCompra, precioVenta, descripcion } = req.body;
	await Producto.findByIdAndUpdate(req.params.id, { nombre, cantidad: numeroVisual.quitar(cantidad), precioCompra: numeroVisual.quitar(precioCompra), precioVenta: numeroVisual.quitar(precioVenta), descripcion }); // codigo para actualizar en mongodb
	req.flash('success_msg','Producto actualizado sastifactoriamente');
	res.redirect('/productos');
}); // cuando visiten la página enviar el mensaje
//--------------------------------  ELIMINAR PRODUCTO ---------------------------------------
router.delete('/productos/borrar/:id', isAuthenticated, async(req, res) => { // metodo delete
	await Producto.findByIdAndDelete(req.params.id); //eliminar
	req.flash('success_msg','Producto eliminado sastifactoriamente');
	res.redirect('/productos');
});
//-------------------------------  GRAFICAR PRODUCTOS  ----------------------------------------
router.get('/graficosProductos', isAuthenticated, async (req,res) => { // isAuthenticated verifica si esta logueado para seguir con la funcion
	const Productos = await Producto.find({user: req.user.id}).sort({ date: 'desc' });// es asincrona por eso el await y ordenar de forma descendente
	//el req.user.id es para buscar los productos del usuario logueado
	var ProductosTodos = [];
	Productos.forEach( Productos=>{ // recorrer el array de una forma mas ordenada
		ProductosTodos.push({
			nombre: Productos.nombre,
			cantidad: Productos.cantidad,
			tipo: Productos.tipo,
			precioCompra: Productos.precioCompra,
			precioVenta: Productos.precioVenta,
			descripcion: Productos.descripcion,
			date: Productos.date,
			id: Productos.id
		})
	});
	res.render('productos/graficosProductos', { ProductosTodos });// redirecciona y envia el objeto
});
//------------------------------------ BUSCAR PRODUCTO CON AJAX -------------------------------------------------------
router.get('/productos/ajax/:buscar', isAuthenticated, async (req,res) => { 
	var texto=req.params.buscar; //texto a buscar
	const reg = new RegExp(texto, 'i'); // Expresion regular
	const Productos = await Producto.find({user: req.user.id, nombre: reg }).sort({ date: 'desc' });// es asincrona por eso el await y ordenar de forma descendente
	//el req.user.id es para buscar los productos del usuario logueado
	var ProductoSend = [];
	Productos.forEach( Productos=>{ // recorrer el array de una forma mas ordenada
		ProductoSend.push({
			nombre: Productos.nombre,
			cantidad: Productos.cantidad,
			tipo: Productos.tipo,
			precioCompra: Productos.precioCompra,
			precioVenta: Productos.precioVenta,
			descripcion: Productos.descripcion,
			date: Productos.date,
			id: Productos.id
		})
	});
	res.json({ProductoSend}); // Enviar datos encontrados mediante json
});


module.exports = router;