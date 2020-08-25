const mongoose = require('mongoose');
const { Schema } = mongoose;// solo se mecesita el esquema del mongoose

const datosGlobalesSchema = new Schema({ // Se guardan los tipos de datos que tendra el dollar
	venta: {
		type: Number,
		required: true
	},
	ganancia: {
		type: Number,
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


module.exports = mongoose.model('DatosGlobales', datosGlobalesSchema);