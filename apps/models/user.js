var mongoose = require('mongoose');
var Schema = mongoose.Schema;
/*const eachInStreamPlugin= require('../plugin/eachInStreamPlugin');
Schema.plugin()
*/
module.exports = mongoose.model('User', new Schema({
	emp_id : String,
	address : String,
	pubkey : String,
	privkey : String,
	last_login : Date,
	active : Boolean,
	admin : Boolean
}));
