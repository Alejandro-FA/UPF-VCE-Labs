const fs = require("fs");

const databaseFile = "./database.json";

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
	return JSON.parse(fs.readFileSync(databaseFile, "utf-8"));
}

function writeToDatabaseFile(data) {
	fs.writeFileSync(databaseFile, JSON.stringify(data));
}

function addUser(username, password, room, position) {
	if (!doesFileExist()) {
    	createDatabase();
  	}

  	let data = readData();
  	data[username] = { password, room, position };
  	writeToDatabaseFile(data);
}

function getPassword(username) {
  	if (!doesFileExist()) {
    	return null;
  	}

  	let data = readData();
  	return data[username] ? data[username].password : null;
}

function getRoom(username) {
  	if (!doesFileExist()) {
    	return null;
  	}

  	let data = readData();
  	return data[username] ? data[username].room : null;
}

function getPosition(username) {
  	if (!doesFileExist()) {
    	return null;
  	}

  	let data = readData();
  	return data[username] ? data[username].position : null;
}

module.exports = { addUser, getPassword, getRoom, getPosition };
