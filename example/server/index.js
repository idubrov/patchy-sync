import express from 'express';
import webpack from 'webpack';
import compression from 'compression';
import path from 'path';
import webpackDevMiddleware from 'webpack-dev-middleware';
import bodyParser from 'body-parser';
import webpackConfig from '../webpack.config.babel';
import documents from './documents';

const compiler = webpack(webpackConfig);

const app = express();
app.use(compression());
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.json({ type: 'application/json-patch+json' }));
app.use(webpackDevMiddleware(compiler, {}));
app.use(express.static(path.resolve(__dirname, '../public')));
app.use('/documents', documents);
app.listen(4000);
