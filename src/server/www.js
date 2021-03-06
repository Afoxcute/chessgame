#!/usr/bin/env node

const app = require('./app');
const logger = require('./logger');
const http = require('http');

const serverPort = require('./config').serverPort;

function normalizePort(val) {
	const portParsed = parseInt(val);
	if (isNaN(portParsed)) {
		return val;
	}
	if (portParsed >= 0) {
		return portParsed;
	}
	return false;
}

const port = normalizePort(serverPort || '3001');
app.set('port', port);

const server = http.createServer(app);

const io = require('socket.io')(server);
require('./services/socket')(io);

function onError(error) {
	if (error.syscall !== 'listen') {
		throw error;
	}

	const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`;

	switch (error.code) {
		case 'EACCES':
			console.error(`${bind} requires elevated privileges`);
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(`${bind} is already in use`);
			process.exit(1);
			break;
		default:
			throw error;
	}
}

function onListening() {
	const addr = server.address();
	const bind = typeof addr === 'string'
    ? `pipe ${addr}`
    : `port ${addr.port}`;
	logger.log(`Listening on ${bind}`);
}

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
