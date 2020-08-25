const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
	name: { type: String, require: true },
	email: { type:String, require: true },
	password: { type: String, require: true },
	money: { type: Number, require: true },
	dollar: { type: Number, require: true },
	date: { type: Date, default: Date.now }
});

userSchema.methods.encryptPassword = async (password)=>{ // Encriptar contraseña
	const salt = await bcrypt.genSalt(10); // genera un algoritmo para encriptar la contraseña (hash)
	const hash = bcrypt.hash(password, salt); //genera el hash o contraseña cifrada
	return hash;
};

userSchema.methods.matchPassword = async function (password){ //se utiliza una funcion normal para poder acceder a this
	return await bcrypt.compare(password, this.password);
	/*con esto compara this.password que es la encriptada con password que es la contraseña original 
	perteneciente a userSchema*/

};
module.exports = mongoose.model('User', userSchema);