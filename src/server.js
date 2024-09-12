const e = require('express');
const bodyParser = require('body-parser')
const server = e();

const apiRouter = require('./routers/apiRouter');
const indnexRouter = require('./routers/indexRouter');

server.use(bodyParser.urlencoded({ extended: false }))
server.use(bodyParser.json())

server.set('view engine', 'ejs');
server.set('views', __dirname + '/views')

// routers
server.use('/api', apiRouter);
server.use('/', indnexRouter);


server.listen(4000, () => {
    console.log(`Server is running on http://localhost:${4000}`);
});