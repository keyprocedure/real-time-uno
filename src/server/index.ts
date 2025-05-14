import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import httpErrors from 'http-errors';
import morgan from 'morgan';
import * as middleware from './middleware';
import * as path from 'path';
import { createServer } from 'http';

dotenv.config();

import * as config from './config';
import * as routes from './routes';
import checkAuthentication from './middleware/check-authentication';

const app = express();
const server = createServer(app);
const PORT = parseInt(process.env.PORT || '8080', 10);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

config.session(app);

app.get('/', (req, res) => {
  res.redirect('/lobby');
});
app.use('/lobby', checkAuthentication, routes.mainLobby);
app.use('/auth', routes.auth);
app.use('/games', checkAuthentication, routes.games);
app.use('/chat', checkAuthentication, routes.chat);
app.use('/styles', express.static(path.join(__dirname, 'views', 'styles')));

const staticPath = path.join(process.cwd(), 'src', 'public');
app.use(express.static(staticPath));

config.livereload(app, staticPath);
const sessionMiddleware = config.session(app);
config.configureSocketIO(server, app, sessionMiddleware);

app.use(cookieParser());
app.set('views', path.join(process.cwd(), 'src', 'server', 'views'));
app.set('view engine', 'ejs');

app.use(middleware.chat);

app.use((_request, _response, next) => {
  next(httpErrors(404, 'Page Not Found'));
});

// @ts-ignore
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});