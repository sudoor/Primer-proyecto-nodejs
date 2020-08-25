const express = require('express');
const router = express.Router(); // Permite la creación de rutas
const Producto = require('../models/Producto.js'); // Modelo de datos de los productos
const Dollar = require('../models/Dollar.js'); // registro del precio del dollar
const Ingreso = require('../models/Ingreso.js'); // Modelo de datos de los Ingresos
const User = require('../models/user.js'); // Modelo de usuarios
const Carrito = require('../models/Carrito.js'); // Modelo del carrito
const DatosGlobales = require('../models/datosGlobales.js');// Modelo de las ventas y ganancias
const Facturas = require('../models/facturas.js'); // modelo de la suma total de las facturas
const numeroVisual = require('../helpers/funciones'); // colocar los puntos en los miles de los numeros altos
const { isAuthenticated } = require('../helpers/auth'); // Verifica que el usuario esté conectado

//------------------------------------ VENDER PRODUCTO -------------------------------------------------------

router.get('/ventaProducto', isAuthenticated, async (req,res) => { 
	const Productos = await Producto.find({user: req.user.id}).sort({ nombre: 'asc' });// Busca los productos que se mostraran
	//array que sera enviado por handlebars
	var ProductosVender = [];
	//define si la cantidad requiere decimales o no
	var decimales;
	Productos.forEach( Productos=>{ // recorrer el array de una forma mas ordenada
		//verifica el tipo de producto para ver si requiere decimales
		if (Productos.tipo=="Kg") { decimales=true; }else{ decimales=null; };
		ProductosVender.push({
			nombre: Productos.nombre,
			cantidad: Productos.cantidad,
			tipo: Productos.tipo,
			decimales: decimales,
			precioVenta: numeroVisual.aplicar(Productos.precioVenta),
			precioDollar: ((Productos.precioVenta)/(req.user.dollar)).toFixed(2),//monto de la venta en dolares
			descripcion: Productos.descripcion,
			date: Productos.date,
			id: Productos.id
		})
	});
	res.render('productos/ventaProducto', { ProductosVender }); // le pasa todos los datos, nodes entre corchetes es como un get
});

// ------------------------------- VISTA DE CARRITO -------------------------------------------------------

router.get('/carrito', isAuthenticated, async (req,res) => { // isAuthenticated verifica si esta logueado para seguir con la funcion
	const ProductosCarrito = await Carrito.find({user: req.user.id}).sort({ date: 'desc' });// es asincrona por eso el await y ordenar de forma descendente
	//array que sera enviado por handlebars
	var MostrarCarrito = [];
	//variables
	var cantidadDecorada, monto, total = 0;
	ProductosCarrito.forEach( ProductosCarrito=>{ // recorrer el array de una forma mas ordenada
		//si existe un monto lo guarda en la variable y suma el monto a la cifra total
		if (ProductosCarrito.monto) {
			monto = numeroVisual.aplicar(ProductosCarrito.monto);
			total = total + ProductosCarrito.monto;
		}
		//en caso de no exitir lo establece a null
		else{
			monto=null;
		}
		//define si se va a decorar la cantidad
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
	//Busca la factura
	const BuscarFactura = await Facturas.find({user: req.user.id});
	if (BuscarFactura) {
		//Si su total es 0 la factura es eliminada sino actualiza el total de la factura a la variable total
		if (total==0) {
			total=null;
			await Facturas.findByIdAndDelete(BuscarFactura.id); //eliminar
		}
		else{
			await Facturas.findByIdAndUpdate(BuscarFactura[0].id, { total: total }); // codigo para actualizar en mongodb
		}
	}
	//Busca las ventas realizadas
	const datosGlobales = await DatosGlobales.find({user: req.user.id});
	var sumatoria = 0;
	//Suma las ventas totales en el día
	datosGlobales.forEach( datosGlobales=>{ // recorrer el array de una forma mas ordenada
		sumatoria = sumatoria+datosGlobales.ganancia;
	});
	res.render('productos/carrito',{ MostrarCarrito, total });
}); // cuando visiten la página enviar el mensaje


// ------------------------------------ AGREGAR A CARRITO ----------------------------------------------

router.post('/AgregarACarrito',isAuthenticated, async (req,res) => { // RECIBE DATOS POR POST
	// El async es una funcion de js que indica que este proceso tendra procesos asincronos menos importantes
	const { idProducto,cantidad,monto } = (req.body); // Recibe los datos de /ventaProductos
	//variables que guardaran los datos en formato de numero
	var cantidadN = 0; 
	var montoN = 0;
	if (cantidad) {
		cantidadN=numeroVisual.quitar(cantidad);
	}
	if (monto) {
		montoN=numeroVisual.quitar(monto);
	}
	const errors = [] // Array que va a guardar los errores
	if (!idProducto) { // Si se ha accedido a esta página sin seleccionar un producto seleccionado ningún producto
		errors.push({ text: "Debe seleccionar un producto" });
	}
	//en caso de que no se ingrese ni monto ni cantidad
	if ((cantidadN==""||cantidadN==0)&&(montoN==""||montoN==0)) { 
		errors.push({ text: "Monto o cantidad no válidos o valores en cero." });
	}
	else if (idProducto) {
		//Busca el producto
		const Search = await Producto.findById(idProducto);
		// calcula el monto o la cantidad a vender
		if (cantidadN) {
			montoN = (cantidadN*Search.precioVenta).toFixed(2);
		}
		else if (montoN) {
			cantidadN = (montoN/numeroVisual.quitar(Search.precioVenta)).toFixed(2);
		}
		// si existe al producto lo agrega al carrito
		if (Search) {
			const AggCarrito = Carrito({ // Crea el producto con los datos buscados
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
			//actualiza el total de la factura en caso de que ya exista
			const BuscarFactura = await Facturas.find({user: req.user.id, estado: 1});
			if (BuscarFactura[0]) {
				var total = Number(BuscarFactura[0].total) + Number(montoN);
				await Facturas.findByIdAndUpdate(BuscarFactura[0].id, { total }); // codigo para actualizar en mongodb
			}
			// si no existe ninguna factura entonces crea una
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
	const BuscarFactura = await Facturas.find({user: req.user.id, estado: 1}); //Busca la factura a procesar
	var monto = BuscarFactura[0].total; // Monto de la factura a procesar
	await Facturas.findByIdAndUpdate(BuscarFactura[0].id, { estado:0 }); // actualiza el estado de la factura
	//Buscar productos de la venta
	const ProductosCarrito = await Carrito.find({user: req.user.id});
	var ProductosDescripcion = "Venta: "; // Descripcion de la venta
	var cantidadActualizada = 0; // variable que calculara la nueva cantidad en inventario
	var ganancia=0; //ganancia por producto
	ProductosCarrito.forEach(async ProductosCarrito=>{ // recorrer el array de una forma mas ordenada
		ProductosDescripcion = ProductosDescripcion+""+ ProductosCarrito.nombre+ ": "+ ProductosCarrito.cantidad+" "+ProductosCarrito.tipo+" = "+numeroVisual.aplicar(ProductosCarrito.monto)+". ";
		var Productos = await Producto.findById(ProductosCarrito.idProducto); //Busca el producto a actualizar
		//actualizar cantidad actual en el inventario
		ganancia=ganancia + (ProductosCarrito.cantidad*(Productos.precioVenta - Productos.precioCompra));
		cantidadActualizada = (Productos.cantidad - ProductosCarrito.cantidad).toFixed(2);
		await Producto.findByIdAndUpdate(ProductosCarrito.idProducto, { cantidad: cantidadActualizada }); // actualizar en mongodb
	});
	await Carrito.remove({ user: req.user.id }); //eliminar productos del carrito
	await Facturas.remove({ user: req.user.id }); //eliminar la factura
	//actualizar saldo
	const Usuario = await User.findById(req.user.id); // codigo para buscar el saldo del usuario
	await User.findByIdAndUpdate(req.user.id, { money: Number(monto) + Number(Usuario.money) }); // actualizar saldo
	//Registrar un ingreso
	const NuevoIngreso = await Ingreso({ // Crea el ingreso con los datos recibidos
		descripcion: ProductosDescripcion,
		monto: monto,
		dollar: Number(monto) / Number(Usuario.dollar),
		user: req.user.id
	});
	await NuevoIngreso.save(); // guarda en la base de datos y el AWAIT indica que este es el proceso menos importante
	//Guarda los datos de la venta de la venta
	const NuevoDato = DatosGlobales({ // Crea el ingreso con los datos recibidos
		venta: monto,
		ganancia: ganancia,
		user: req.user.id
	});
	await NuevoDato.save(); // guarda en la base de datos y el AWAIT indica que este es el proceso menos importante
	res.redirect('/carrito');
}); // cuando visiten la página enviar el mensaje


module.exports = router;