import connectPgSimple from 'connect-pg-simple';
import type { Express, RequestHandler } from 'express';
import flash from 'express-flash';
import session from 'express-session';
import pg from 'pg';

if (process.env.NODE_ENV === 'production') {
  pg.defaults.ssl = { rejectUnauthorized: false };
}

let sessionMiddleware: RequestHandler | undefined = undefined;

export default (app: Express): RequestHandler => {
  if (sessionMiddleware === undefined) {
    sessionMiddleware = session({
      store: new (connectPgSimple(session))({
        createTableIfMissing: true,
        conString: process.env.DATABASE_URL,
      }),
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
    });

    app.use(sessionMiddleware);
    app.use(flash());
  }

  return sessionMiddleware;
};
