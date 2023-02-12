const fs = require("fs");

const databaseFile = "./database.json";

function createDatabaseFile() {
  fs.writeFileSync(databaseFile, JSON.stringify({}), { flag: "wx" });
};

function checkIfDatabaseFileExists() {
  try {
    fs.accessSync(databaseFile, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
};

function readDatabaseFile() {
  return JSON.parse(fs.readFileSync(databaseFile, "utf-8"));
};

function writeToDatabaseFile(data) {
  fs.writeFileSync(databaseFile, JSON.stringify(data));
};

function addUser(username, password, position) {
  if (!checkIfDatabaseFileExists()) {
    createDatabaseFile();
  }

  let data = readDatabaseFile();
  data[username] = { password, position };
  writeToDatabaseFile(data);
};

function getPassword(username) {
  if (!checkIfDatabaseFileExists()) {
    return null;
  }

  let data = readDatabaseFile();
  return data[username] ? data[username].password : null;
};

function getPosition(username) {
  if (!checkIfDatabaseFileExists()) {
    return null;
  }

  let data = readDatabaseFile();
  return data[username] ? data[username].position : null;
};

module.exports = {addUser, getPassword, getPosition};