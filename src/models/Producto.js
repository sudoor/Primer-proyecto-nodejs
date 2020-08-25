const mongoose = require('mongoose');
const { Schema } = mongoose;// solo se mecesita el esquema del mongoose

const ProductoSchema = new Schema({ // Se guardan los tipos de datos que tendran las notas
	nombre: { 
		type: String,
		required: true 
	},
	tipo: {
		type: String,
		required: true
	},
	cantidad: {
		type: Number,
		required: true
	},
	precioCompra: {
		type: Number,
		required: true
	},
	precioVenta: {
		type: Number,
		required: true
	},
	descripcion: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		default: Date.now
	},
	user: {
		type: String,
		required: true
	}
});


module.exports = mongoose.model('Producto', ProductoSchema);