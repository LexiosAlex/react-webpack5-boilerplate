import * as path from "path";
import dotenv from "dotenv";
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import CompressionPlugin from "compression-webpack-plugin";
import Dotenv from 'dotenv-webpack';

const __dirname = path.resolve(path.dirname(''));
const _env = dotenv.config({ path: path.resolve(__dirname, "./.env") });
const env = _env.parsed;
if (_env.error instanceof Error) {
  throw _env.error;
}
const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});
const isDevelopment = process.env.NODE_ENV === "development";
const outputDir = process.env.OUTPUT_DIR || "dist";

const config = {
  mode: isDevelopment ? "development" : "production",
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"],
    plugins: [new TsconfigPathsPlugin({})],
  },
  devServer: {
    compress: true,
    port: env.DEV_SERVER_PORT || 3000,
    historyApiFallback: true,
    liveReload: true,
    open: true,
    hot: false
  },
  optimization: {
    moduleIds: "deterministic",
    runtimeChunk: "single",
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
  },
  devtool: isDevelopment && "inline-source-map",
  entry: path.resolve(__dirname, "src", "index.tsx"),
  output: {
    filename: "[name].[contenthash].bundle.js",
    path: path.resolve(__dirname, outputDir),
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.js(x?)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        loader: "awesome-typescript-loader",
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "@svgr/webpack",
          },
          {
            loader: "file-loader",
            options: {
              name: isDevelopment
                ? "[name]__[contenthash].[ext]"
                : "[contenthash].[ext]",
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: isDevelopment
                ? "[name]__[contenthash].[ext]"
                : "[contenthash].[ext]",
            },
          },
        ],
      },
      {
        test: /\.(woff|woff2)$/,
        use: {
          loader: "url-loader",
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "index.html"),
      chunks: "main",
    }),
    new webpack.DefinePlugin(envKeys),
    new Dotenv({
      systemvars: true,
    }),
    new CompressionPlugin({
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
    }),
  ],
};

export default config;
