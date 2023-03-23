const MyServer = require('./MyServer').MyServer;

const port = 9017; //And 9016+1
//const port = 5500;

let server = new MyServer();

server.listen(port);