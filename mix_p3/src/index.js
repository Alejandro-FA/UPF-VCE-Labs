const { server, app } = require('./server.js');

//--------------- SERVER IS LISTENING ---------------
server.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'))
})