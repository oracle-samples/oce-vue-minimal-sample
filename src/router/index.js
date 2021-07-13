/**
 * Copyright (c) 2021 Oracle and/or its affiliates.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

/**
 * This file defines the factory function used to create the router.
 */
import { createRouter, createMemoryHistory, createWebHistory } from 'vue-router';

import Page from '../pages/Page.vue';
import PageNotFound from '../components/PageNotFound.vue';

// create the history based on whether being rendered on the server or the client
// if the BASE_URL is a value other than '/' add it as the to the history
// so the router uses the correct path
const isServer = typeof window === 'undefined';
let history;
if (process.env.BASE_URL && !(process.env.BASE_URL === '/')) {
  history = isServer
    ? createMemoryHistory(process.env.BASE_URL)
    : createWebHistory(process.env.BASE_URL);
} else {
  history = isServer ? createMemoryHistory() : createWebHistory();
}

// define the routes for this application
const routes = [
  {
    path: '/:slug?',
    name: 'page',
    component: Page,
  },
  {
    path: '/:pathMatch(.*)*',
    component: PageNotFound,
  },
];

// Create the router for the routes
const router = createRouter({
  history,
  routes,
});

export default router;
