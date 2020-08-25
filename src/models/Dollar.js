const mongoose = require('mongoose');
const { Schema } = mongoose;// solo se mecesita el esquema del mongoose

const DollarSchema = new Schema({ // Se guardan los tipos de datos que tendra el dollar
	monto: {
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


module.exports = mongoose.model('Dollar', DollarSchema);