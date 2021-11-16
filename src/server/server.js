/* eslint-disable no-param-reassign */
/**
 * Copyright (c) 2021 Oracle and/or its affiliates.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

/**
 * Server starting point, a simple Express Server.
 */
import 'core-js'; // replacement for babel-polyfill in babel 7.4 & above
import 'regenerator-runtime/runtime'; // replacement for babel-polyfill in babel 7.4 & above

import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import http from 'http';
import https from 'https';
import express from 'express';
import serialize from 'serialize-javascript';
import { renderToString } from '@vue/server-renderer';
import buildApp from '../app';
import { getAuthValue, isAuthNeeded } from '../scripts/server-config-utils';

// parse the .env file
dotenv.config();

// By default Vue assumes the app will be deployed at the root, https://www.host:port/
// If the app is deployed at a path, "publicPath" must be the value of the path, e.g. if
// the app is deployed at https://host:port/my-app the publicPath is set to '/my-app'
// Ensure the BASE_URL does NOT end in a /
let BASE_URL = '';
if (process.env.BASE_URL) {
  BASE_URL = process.env.BASE_URL.toString().trim();
  if (BASE_URL.substr(-1) === '/') {
    BASE_URL = BASE_URL.substr(0, BASE_URL.length - 1);
  }
}

// Create the express app.
const server = express();

// open all the img/js/css folders and favicon file in the "dist" directory to the outside world
const clientDistPath = `./dist/client${BASE_URL}`;
server.use(`${BASE_URL}/img`, express.static(path.join('./', clientDistPath, 'img')));
server.use(`${BASE_URL}/js`, express.static(path.join('./', clientDistPath, 'js')));
server.use(`${BASE_URL}/css`, express.static(path.join('./', clientDistPath, 'css')));
server.use(`${BASE_URL}/favicon.png`, express.static(path.join('./', clientDistPath, 'favicon.png')));

/*
 * Handle the proxy request.
 */
function handleContentRequest(req, res, authValue) {
  // only proxy GET requests, ignore all other requests
  if (req.method !== 'GET') {
    return;
  }

  // build the URL to the real server
  let content = process.env.SERVER_URL.charAt(process.env.SERVER_URL.length - 1) === '/'
    ? 'content' : '/content';
  if (req.url.charAt(0) !== '/') {
    content = `${content}/`;
  }
  const oceUrl = `${process.env.SERVER_URL}${content}${req.url}`;

  // Add the authorization header
  const options = {};
  if (authValue) {
    options.headers = { Authorization: authValue };
  }

  // define a function that writes the proxied content to the response
  const writeProxyContent = (proxyResponse) => {
    res.writeHead(proxyResponse.statusCode, proxyResponse.headers);
    proxyResponse.pipe(res, {
      end: true,
    });
  };

  // based on whether the Content server is HTTP or HTTPS make the request to it
  const proxy = (oceUrl.startsWith('https'))
    ? https.request(oceUrl, options, (proxyResponse) => writeProxyContent(proxyResponse))
    : http.request(oceUrl, options, (proxyResponse) => writeProxyContent(proxyResponse));

  // write the proxied response to this request's response

  req.pipe(proxy, {
    end: true,
  });
}

/*
 * Route handler for requests to '/content/'.
 *
 * When authorization is needed for the calls to Oracle Content
 * - all image requests will be proxied through here regardless of server or client side rendering
 * - browser requests for content are proxied through here (server content requests will never be
 *   proxied)
 * - this server will pass on the call to Oracle Content adding on the authorization headers and
 *   returning the Oracle Content response.
 * This ensures the browser will never have the authorization header visible in its requests.
 *
 * See the following files where proxying is setup
 * - 'src/scripts/server-config-utils.getClient' for the code proxying requests for content
 * - 'src/scripts/utils.getImageUrl' for the code proxying requests for image binaries
 */
server.use('/content/', (req, res) => {
  if (isAuthNeeded()) {
    getAuthValue().then((authValue) => {
      handleContentRequest(req, res, authValue);
    });
  } else {
    handleContentRequest(req, res, '');
  }
});

/*
 * Create a single route handler to listen to all (*) routes of our application
 */
server.get('*', async (req, res) => {
  // create the root app, router and vuex store
  const { app, router, store } = await buildApp(req.url);

  // wait for the router to be ready
  router.push(req.url);
  await router.isReady();

  // get the application content for the current route
  const appContent = await renderToString(app);

  // read the index.html template file
  fs.readFile(path.join('./', clientDistPath, 'index.html'), (err, html) => {
    if (err) {
      throw err;
    }

    // Serialize out the Vuex Store
    const storeData = serialize(store.state);
    const renderState = `
      <script>
        window.INITIAL_DATA = ${storeData}
      </script>`;

    // replace the app tag in the HTML with the app content string and serialized data
    html = html.toString().replace(
      '<div id="app"></div>',
      `<div id="app">${appContent}</div>${renderState}`,
    );

    // set any headers on the response before returning
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });
});

let processEnv = {};
const env = 'env';
// eslint-disable-next-line no-restricted-syntax
for (const a of [env]) {
  processEnv = process[a];
}
const port = processEnv.PORT ? processEnv.PORT : 8080;
server.listen(port, () => {
  if (BASE_URL) {
    console.log(`Application is accesssible on : http://localhost:${port}${BASE_URL}`);
  } else {
    console.log(`Application is accesssible on : http://localhost:${port}`);
  }
});
