const express = require('express');
const router = express.Router(); // Permite la creación de rutas
const Producto = require('../models/Producto.js'); // Modelo de datos de los productos
const Dollar = require('../models/Dollar.js'); // registro del precio del dollar
const Ingreso = require('../models/Ingreso.js'); // Modelo de datos de los Ingresos
const User = require('../models/user.js'); // Modelo de usuarios
const Carrito = require('../models/Carrito.js');
const DatosGlobales = require('../models/datosGlobales.js');
const Facturas = require('../models/facturas.js');
const numeroVisual = require('../helpers/funciones'); // colocar los puntos en los miles de los numeros altos
const { isAuthenticated } = require('../helpers/auth');

//------------------------------------ VENDER PRODUCTO -------------------------------------------------------

router.get('/ventaProducto', isAuthenticated, async (req,res) => { // isAuthenticated verifica si esta logueado para seguir con la funcion
	const Productos = await Producto.find({user: req.user.id}).sort({ nombre: 'asc' });// es asincrona por eso el await y ordenar de forma descendente
	//el req.user.id es para buscar los productos del usuario logueado
	var ProductosVender = [];
	var decimales;
	Productos.forEach( Productos=>{ // recorrer el array de una forma mas ordenada
		if (Productos.tipo=="Kg") { decimales=true; }else{ decimales=null; };
		ProductosVender.push({
			nombre: Productos.nombre,
			cantidad: Productos.cantidad,
			tipo: Productos.tipo,
			decimales: decimales,
			precioVenta: numeroVisual.aplicar(Productos.precioVenta),
			precioDollar: ((Productos.precioVenta)/(req.user.dollar)).toFixed(2),
			descripcion: Productos.descripcion,
			date: Productos.date,
			id: Productos.id
		})
	});
	res.render('productos/ventaProducto', { ProductosVender }); // le pasa todos los datos, nodes entre corchetes es como un get
}); // cuando visiten la página enviar el mensaje

// ------------------------------- VISTA DE CARRITO -------------------------------------------------------

router.get('/carrito', isAuthenticated, async (req,res) => { // isAuthenticated verifica si esta logueado para seguir con la funcion
	const ProductosCarrito = await Carrito.find({user: req.user.id}).sort({ date: 'desc' });// es asincrona por eso el await y ordenar de forma descendente
	//el req.user.id es para buscar los productos del usuario logueado
	var MostrarCarrito = [];
	var cantidadDecorada, monto;
	total = 0;
	ProductosCarrito.forEach( ProductosCarrito=>{ // recorrer el array de una forma mas ordenada
		if (ProductosCarrito.monto) {
			monto = numeroVisual.aplicar(ProductosCarrito.monto);
			total = total + ProductosCarrito.monto;
		}
		else{
			monto=null;
		}
		if (ProductosCarrito.tipo=="Kg") {
			cantidadDecorada = true;
		}
		else{
			cantidadDecorada = null;
		}
		MostrarCarrito.push({
			nombre: ProductosCarrito.nombre,
			cantidad: ProductosCarrito.cantidad,
			cantidadDisponible: ProductosCarrito.cantidadDisponible,
			tipo: ProductosCarrito.tipo,
			precio: numeroVisual.aplicar(ProductosCarrito.precio),
			date: ProductosCarrito.date,
			id: ProductosCarrito.id,
			cantidadDecorada: cantidadDecorada,
			monto: monto
		})
	});
	const BuscarFactura = await Facturas.find({user: req.user.id});
	if (BuscarFactura) {
		if (total==0) {
			total=null;
			await Facturas.findByIdAndDelete(BuscarFactura.id); //eliminar
			req.flash('success_msg','Producto eliminado sastifactoriamente');
		}
		else{
			await Facturas.findByIdAndUpdate(BuscarFactura[0].id, { total: total }); // codigo para actualizar en mongodb
		}
	}
	const datosGlobales = await DatosGlobales.find({user: req.user.id});
	var sumatorioa = 0;
	datosGlobales.forEach( datosGlobales=>{ // recorrer el array de una forma mas ordenada
		sumatorioa = sumatorioa+datosGlobales.ganancia;
	});
	console.log(sumatorioa);
	res.render('productos/carrito',{ MostrarCarrito, total });
}); // cuando visiten la página enviar el mensaje


// ------------------------------------ AGREGAR A CARRITO ----------------------------------------------

router.post('/AgregarACarrito',isAuthenticated, async (req,res) => { // RECIBE DATOS POR POST
	// El async es una funcion de js que indica que este proceso tendra procesos asincronos menos importantes
	const { idProducto,cantidad,monto } = (req.body); // Recibe los datos del view newNote
	//quitar sibolos a numeros
	var cantidadN, montoN;
	if (cantidad) {
		cantidadN=numeroVisual.quitar(cantidad);
	}
	if (monto) {
		montoN=numeroVisual.quitar(monto);
	}
	const errors = [] // Array que va a guardar los errores
	if (!idProducto) {
		errors.push({ text: "No puede ingresar un producto que no existe" });
	}
	if (cantidadN==""||cantidadN==0||montoN==""||montoN==0) {
		errors.push({ text: "Monto o cantidad no válidos o valores en cero." });
	}
	if (idProducto) {
		if (cantidadN||montoN){
			const Search = await Producto.findById(idProducto);
			if (cantidadN) {
				montoN = (cantidadN*Search.precioVenta).toFixed(2);
			}
			else if (montoN) {
				cantidadN = (montoN/numeroVisual.quitar(Search.precioVenta)).toFixed(2);
			}
			if (Search) {
				const AggCarrito = Carrito({ // Crea el producto con los datos recibidos
					nombre: Search.nombre,
					cantidadDisponible: Search.cantidad,
					cantidad: cantidadN,
					monto: montoN,
					tipo: Search.tipo,
					precio: Search.precioVenta,
					idProducto: idProducto
				});
				AggCarrito.user = req.user.id; // para guardar la id del usuario en el producto
				await AggCarrito.save(); // guarda en la base de datos y el AWAIT indica que este es el proceso menos importante
				const BuscarFactura = await Facturas.find({user: req.user.id, estado: 1});
				if (BuscarFactura[0]) {
					var total = Number(BuscarFactura[0].total) + Number(montoN);
					await Facturas.findByIdAndUpdate(BuscarFactura[0].id, { total }); // codigo para actualizar en mongodb
				}
				else{
					const NuevaFactura = Facturas({
						total: montoN,
						estado: 1,
						user: req.user.id
					});
					await NuevaFactura.save();
				}
				req.flash("success_msg","Se ha ingresado "+Search.nombre+" a tu carrito");
				res.redirect('/carrito');// Redireccionar a otra ruta
			}
			else{
				errors.push({ text: "No existe el producto que intenta ingresar." });
			}
		}
		else {
			errors.push({ text: "Los valores de cantidad y monto deben ser numeros" });
		}	
	}
	if (errors.length > 0) {
		res.render('productos/ventaProducto', {
			errors
		});
	}
}); // cuando visiten la página enviar el mensaje

//----------------------------------- ELIMINAR ----------------------------

router.delete('/carrito/borrar/:id', isAuthenticated, async(req, res) => { // metodo delete
	await Carrito.findByIdAndDelete(req.params.id); //eliminar
	req.flash('success_msg','Producto eliminado sastifactoriamente');
	res.redirect('/carrito');
});

//---------------------------- Procesar la venta --------------------------------------

router.get('/procesarCarrito', isAuthenticated, async (req,res) => { // isAuthenticated verifica si esta logueado para seguir con la funcion
	const BuscarFactura = await Facturas.find({user: req.user.id, estado: 1});
	var monto = BuscarFactura[0].total;
	await Facturas.findByIdAndUpdate(BuscarFactura[0].id, { estado:0 }); // codigo para actualizar en mongodb
	//Buscar productos de la venta
	const ProductosCarrito = await Carrito.find({user: req.user.id});
	var ProductosDescripcion = "Venta: ";
	var cantidadActualizada = 0;
	var ganancia=0;
	ProductosCarrito.forEach(async ProductosCarrito=>{ // recorrer el array de una forma mas ordenada
		ProductosDescripcion = ProductosDescripcion+""+ ProductosCarrito.nombre+ ": "+ ProductosCarrito.cantidad+" "+ProductosCarrito.tipo+" = "+numeroVisual.aplicar(ProductosCarrito.monto);
		var Productos = await Producto.findById(ProductosCarrito.idProducto);
		//actualizar cantidad actual en el inventario
		ganancia=ganancia + (ProductosCarrito.cantidad*(Productos.precioVenta - Productos.precioCompra));
		cantidadActualizada = (Productos.cantidad - ProductosCarrito.cantidad).toFixed(2);
		await Producto.findByIdAndUpdate(ProductosCarrito.idProducto, { cantidad: cantidadActualizada }); // actualizar en mongodb
	});
	await Carrito.remove({ user: req.user.id }); //eliminar
	await Facturas.remove({ user: req.user.id }); //eliminar
	//actualizar saldo
	const Usuario = await User.findById(req.user.id); // codigo para buscar en mongodb
	await User.findByIdAndUpdate(req.user.id, { money: Number(monto) + Number(Usuario.money) }); // actualizar en mongodb
	const NuevoIngreso = await Ingreso({ // Crea el ingreso con los datos recibidos
		descripcion: ProductosDescripcion,
		monto: monto,
		dollar: Number(monto) / Number(Usuario.dollar),
		user: req.user.id
	});
	await NuevoIngreso.save(); // guarda en la base de datos y el AWAIT indica que este es el proceso menos importante
	const NuevoDato = DatosGlobales({ // Crea el ingreso con los datos recibidos
		venta: monto,
		ganancia: ganancia,
		user: req.user.id
	});
	await NuevoDato.save(); // guarda en la base de datos y el AWAIT indica que este es el proceso menos importante
	res.redirect('/carrito');
}); // cuando visiten la página enviar el mensaje


module.exports = router;