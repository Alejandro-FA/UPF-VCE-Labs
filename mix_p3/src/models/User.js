const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema ({
    username: {type: String, required: true},
    password: {type: String, required: true},
    date:  {type: Date, default: Date.now}
});

//----------- Methods -----------

//Encriptar password
UserSchema.methods.encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = bcrypt.hash(password, salt);
    return hash;
};

//Comparar password ingresada vs hash password original
UserSchema.methods.matchPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

module.exports = mongoose.model('User', UserSchema);