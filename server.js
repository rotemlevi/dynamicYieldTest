const config = require('./src/config');

process.env['PORT'] = process.env['PORT'] || '3000';
process.env['DEBUG_PORT'] = process.env['DEBUG_PORT'] || '9229';
process.env['CACHE_TTL_IN_SECS'] = process.env['CACHE_TTL_IN_SECS'] || config.refreshTokenLife;

const express = require('express');
const app = express();
const apiRouter = require('./src/router/api');
const authRouter = require('./src/router/auth');
const appRouter = require('./src/router/app');
const oAuthRouter = require('./src/router/oAuth');

const ejs = require('ejs');

const path = require('path');
const { PORT = 3000 } = process.env;

app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.set("views", path.join(__dirname, 'src', "views"));

app.use('/api', apiRouter)
app.use('/auth', authRouter)
app.use('/app', appRouter)
app.use('/oAuth', oAuthRouter)
  
const server = app.listen(PORT, () => {
    console.log(`Express running → PORT ${ server.address().port }`);
});

module.exports = app;