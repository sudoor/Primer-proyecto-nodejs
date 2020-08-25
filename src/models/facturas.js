const mongoose = require('mongoose');
const { Schema } = mongoose;// solo se mecesita el esquema del mongoose

const FacturasSchema = new Schema({ // Se guardan los tipos de datos que tendra el Facturas
	total: {
		type: Number,
		required: true
	},
	estado: {
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


module.exports = mongoose.model('Facturas', FacturasSchema);