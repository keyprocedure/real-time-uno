import dotenv from 'dotenv';
import path from 'path';
import webpack from 'webpack';

dotenv.config();

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

const config: webpack.Configuration = {
  entry: {
    main: path.join(process.cwd(), 'src', 'client', 'main.ts'),
    chat: path.join(process.cwd(), 'src', 'client', 'chat.ts'),
    lobby: path.join(process.cwd(), 'src', 'client', 'lobby.ts'),
  },
  mode,
  output: {
    path: path.join(process.cwd(), 'dist', 'public', 'js'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
};

export default config;
