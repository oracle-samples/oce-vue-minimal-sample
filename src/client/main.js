/**
 * Copyright (c) 2021 Oracle and/or its affiliates.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

/**
 * Entry point for the client side application.
 *
 * Build the Vue app using the helper function and mount it.
 */
import 'core-js'; // replacement for babel-polyfill in babel 7.4 & above
import 'regenerator-runtime/runtime'; // replacement for babel-polyfill in babel 7.4 & above

import buildApp from '../app';
import '../assets/global.css';

const { app, router, store } = buildApp();

// Initialize the client store state with the data injected from the server
const storeInitialState = window.INITIAL_DATA;
if (storeInitialState) {
  store.replaceState(storeInitialState);
}

router.isReady()
  .then(() => {
    app.mount('#app', true);
  });
