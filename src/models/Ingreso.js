const mongoose = require('mongoose');
const { Schema } = mongoose;// solo se mecesita el esquema del mongoose

const IngresoSchema = new Schema({ // Se guardan los tipos de datos que tendran las notas
	descripcion: { 
		type: String,
		required: true 
	},
	monto: {
		type: Number,
		required: true
	},
	dollar: {
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


module.exports = mongoose.model('Ingreso', IngresoSchema);