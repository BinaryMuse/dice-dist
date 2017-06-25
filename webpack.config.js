var webpack = require("webpack");

module.exports = {
  cache: true,
  entry: {
    app: "./index.js"
  },
  output: {
    path: __dirname,
    filename: "bundle.js"
  },
  devtool: "eval-source-map",
  module: {
    loaders: [
      { test: /\.jsx?$/, loader: "babel?stage=1" }
    ]
  }
};
