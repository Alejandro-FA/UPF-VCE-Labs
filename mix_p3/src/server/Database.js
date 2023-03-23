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
	let encodedPassword = password;
  	data[username] = encodedPassword;
  	writeToDatabaseFile(data);
}

function getPassword(username) {
  	if (!doesFileExist()) {
    	return null;
  	}

	let data = readData();
  	return data[username] ? data[username] : null;
}

module.exports = { setUser, getPassword };
