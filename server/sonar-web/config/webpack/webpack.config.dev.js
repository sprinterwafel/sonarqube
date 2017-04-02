/*
 * SonarQube
 * Copyright (C) 2009-2016 SonarSource SA
 * mailto:contact AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const paths = require('../paths');
const config = require('./webpack.config.base');

module.exports = Object.assign({}, config, {
  devtool: 'eval',

  entry: Object.assign({}, config.entry, {
    vendor: ['react-dev-utils/webpackHotDevClient', ...config.entry.vendor]
  }),

  output: Object.assign({}, config.output, {
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].chunk.js',
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: true
  }),

  // First, run the linter.
  // It's important to do this before Babel processes the JS.
  module: Object.assign({}, config.module, {
    rules: [
      { test: /\.js$/, enforce: 'pre', loader: 'eslint-loader', include: paths.appSrc },
      ...config.module.rules
    ]
  }),

  plugins: [
    ...config.plugins,
    new ExtractTextPlugin({ filename: 'css/sonar.css', allChunks: true }),
    new InterpolateHtmlPlugin({ WEB_CONTEXT: '' }),
    new HtmlWebpackPlugin({ inject: false, template: paths.appHtml }),
    new webpack.HotModuleReplacementPlugin()
  ]
});
