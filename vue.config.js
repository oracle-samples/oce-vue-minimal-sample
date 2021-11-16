/**
 * Copyright (c) 2021 Oracle and/or its affiliates.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
/* eslint-disable no-param-reassign */
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const sdkPackage = require('./node_modules/@oracle/content-management-sdk/package.json');

// If the application is to be served at a URL other than the root, then BASE_URL must be specified
// it is needed to specify the URL for the static assets and for the router
// Set up the BASE_URL parameter, ensuring it does not have a trailing /
let BASE_URL = '';
if (process.env.BASE_URL) {
  BASE_URL = process.env.BASE_URL.toString().trim();
  if (BASE_URL.substr(-1) === '/') {
    BASE_URL = BASE_URL.substr(0, BASE_URL.length - 1);
  }
}

const BUILD_TAG = process.env.BUILD_TAG || 'none';
const SDK_VERSION = sdkPackage.version;

module.exports = {
  devServer: {
    overlay: {
      warnings: false,
      errors: false,
    },
  },

  // Specify where the build files are to be placed
  outputDir: process.env.SSR ? (path.resolve(__dirname, 'dist/server')) : (path.resolve(__dirname, 'dist/client')),

  // Project deployment base
  // By default Vue assumes the app will be deployed at the root, https://www.host:port
  // If the app is deployed at a path, "publicPath" must be the value of the path, e.g. if
  // the app is deployed at https://host:port/my-app the publicPath is set to '/my-app'
  publicPath: BASE_URL || '/',

  chainWebpack: (webpackConfig) => {
    // Settings common to both client and server bundles

    webpackConfig.module.rule('vue').uses.delete('cache-loader');
    webpackConfig.module.rule('js').uses.delete('cache-loader');
    webpackConfig.module.rule('ts').uses.delete('cache-loader');
    webpackConfig.module.rule('tsx').uses.delete('cache-loader');

    // enable our environment variables to be available in our application both on client and
    // server (note: environment variables starting with VUE_APP_ are automatically added)
    webpackConfig.plugin('define')
      .tap((args) => {
        args[0] = {
          ...args[0],
          'process.env.BASE_URL': JSON.stringify(BASE_URL),
          'process.env.BUILD_TAG': JSON.stringify(BUILD_TAG),
          'process.env.SDK_VERSION': JSON.stringify(SDK_VERSION),
          'process.env.PREVIEW': JSON.stringify(process.env.PREVIEW),
          'process.env.AUTH': JSON.stringify(process.env.AUTH),
          'process.env.SERVER_URL': JSON.stringify(process.env.SERVER_URL),
          'process.env.API_VERSION': JSON.stringify(process.env.API_VERSION),
          'process.env.CHANNEL_TOKEN': JSON.stringify(process.env.CHANNEL_TOKEN),
          'process.env.CLIENT_ID': JSON.stringify(process.env.CLIENT_ID),
          'process.env.CLIENT_SECRET': JSON.stringify(process.env.CLIENT_SECRET),
          'process.env.CLIENT_SCOPE_URL': JSON.stringify(process.env.CLIENT_SCOPE_URL),
          'process.env.IDCS_URL': JSON.stringify(process.env.IDCS_URL),
          'process.env.LOGO_FILE_NAME': JSON.stringify(process.env.LOGO_FILE_NAME),
          'process.env.FOOTER_LOGO_FILE_NAME': JSON.stringify(process.env.FOOTER_LOGO_FILE_NAME),
          'process.env.HOME_IMAGE_FILE_NAME': JSON.stringify(process.env.HOME_IMAGE_FILE_NAME),
          'process.env.CONTACTUS_IMAGE_FILE_NAME': JSON.stringify(process.env.CONTACTUS_IMAGE_FILE_NAME),
        };
        return args;
      });

    if (!process.env.SSR) {
      // Client side bundle settings

      webpackConfig.devServer.disableHostCheck(true);

      // Specify the root file of the client application
      webpackConfig.entry('app').clear().add('./src/client/main.js');
    } else {
      // Server side bundle settings

      // inform WebPack that we are building a bundle for NodeJS rather
      // than for the browser and to avoid packaging built-ins.
      webpackConfig.target('node');

      // Specify the root file of the server application
      webpackConfig.entry('app').clear().add('./src/server/server.js');

      // specify the name of the built server bundle
      webpackConfig.output.filename('serverBundle.js');

      webpackConfig.output.libraryTarget('commonjs2');

      // Tell WebPack to not bundle any libraries into our output bundle on the server
      // if that library exists in the "node-modules" folder. This is because on the server
      // Node can get the dependencies from node_modules on start up therefore they do not
      // have to be in the bundle
      // (unlike with the client bundle which has to have all the dependencies in it)
      webpackConfig.externals(nodeExternals({ allowlist: /\.(css|vue)$/ }));

      // tell webpack to only output a single javascript bundle (containing the
      // vendor and application JavaScript), by not splitting chunks:
      webpackConfig.optimization.splitChunks(false).minimize(false);

      // remove plugins we do not need in our application
      webpackConfig.plugins.delete('hmr');
      webpackConfig.plugins.delete('preload');
      webpackConfig.plugins.delete('prefetch');
      webpackConfig.plugins.delete('progress');
      webpackConfig.plugins.delete('friendly-errors');

      // console.log(webpackConfig.toConfig());
    }
  },
};
