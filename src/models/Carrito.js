const mongoose = require('mongoose');
const { Schema } = mongoose;// solo se mecesita el esquema del mongoose

const CarritoSchema = new Schema({ // Se guardan los tipos de datos que tendra el Carrito
	nombre: {
		type: String,
		required: true
	},
	precio: {
		type: Number,
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
	cantidadDisponible: {
		type: Number,
		required: true
	},
	monto: {
		type: Number,
		required: true
	},
	idProducto: {
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


module.exports = mongoose.model('Carrito', CarritoSchema);