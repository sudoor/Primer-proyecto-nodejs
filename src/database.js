const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/negocio', {
	useCreateIndex: true,
	useNewUrlParser: true,
	useFindAndModify: false,
	useUnifiedTopology:true
}).then(db => console.log('DB esta conectado')).catch(err => console.log(err));