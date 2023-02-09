const MyServer = require('./MyServer').MyServer;

const port = 9016; //And 9016+1

let server = new MyServer();

server.listen(port);