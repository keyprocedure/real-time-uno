import type { Express } from 'express';

export default (app: Express, staticPath: string) => {
  if (process.env.NODE_ENV === 'development') {
    const livereload = require('livereload');
    const connectLiveReload = require('connect-livereload');

    const reloadServer = livereload.createServer();
    reloadServer.watch(staticPath);
    reloadServer.server.once('connection', () => {
      setTimeout(() => reloadServer.refresh('/'), 100);
    });

    app.use(connectLiveReload());
  }
};
