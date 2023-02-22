const fs = require("fs");
const crypto = require("crypto")

const databaseFile = "database.json";

function createDatabase() {
	fs.writeFileSync(databaseFile, JSON.stringify({}), { flag: "wx" });
}

function doesFileExist() {
	try {
    	fs.accessSync(databaseFile, fs.constants.F_OK);
    	return true;
  	} catch (error) {
    	return false;
  	}
}

function readData() {
	let data = fs.readFileSync(databaseFile, "utf-8")
	return JSON.parse(data);
}

function writeToDatabaseFile(data) {
	fs.writeFileSync(databaseFile, JSON.stringify(data));
}

function setUser(username, password) {
	if (!doesFileExist()) {
    	createDatabase();
  	}

  	let data = readData();
	let encodedPassword = encrypt(password);
  	data[username] = encodedPassword;
  	writeToDatabaseFile(data);
}

function getPassword(username) {
  	if (!doesFileExist()) {
    	return null;
  	}

	let data = readData();
  	return data[username] ? decrypt(data[username]) : null;
}

function encrypt(text){
	var cipher = crypto.createCipher('aes-256-cbc','d6F3Efeq');
	var crypted = cipher.update(text,'utf8','hex');
	crypted += cipher.final('hex');
	return crypted;
}
  
function decrypt(text){
	var decipher = crypto.createDecipher('aes-256-cbc','d6F3Efeq');
	var dec = decipher.update(text,'hex','utf8');
	dec += decipher.final('utf8');
	return dec;
}

module.exports = { setUser, getPassword };
