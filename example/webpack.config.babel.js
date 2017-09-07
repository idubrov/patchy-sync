import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const env = process.env.NODE_ENV || 'development;';

export default {
  entry: {
    app: path.resolve(__dirname, 'src/index.js')
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: env === 'production' ? '[name].min.js' : '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.less$/,
        loaders: ['style-loader', 'css-loader', 'less-loader']
      }
    ]
  },

  externals: [],

  plugins: [
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify(env) }
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'index.html'),
      hash: false,
      filename: 'index.html',
      inject: 'body',
      minify: {
        collapseWhitespace: true
      }
    })
  ],

  devtool: 'source-map'
};
