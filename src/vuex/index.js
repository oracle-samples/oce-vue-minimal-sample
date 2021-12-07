/* eslint-disable no-param-reassign */
/**
 * Copyright (c) 2021 Oracle and/or its affiliates.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

/**
 * The VUEX store containing all the data this application uses.
 */
import Vuex from 'vuex';

import { fetchOceMinimalMain, fetchPage, getRenditionURLs } from '../scripts/services';

import fetchPeopleData from '../scripts/graphql-service';

export default Vuex.createStore({
  // wrap state in a function so that it does not leak into other server runs
  state() {
    return {
      minimalMainData: {},
      pageData: {},
      renditionURLs: {},
      peoplePageData: {},
    };
  },

  actions: {
    // get the root data for MinimalMain
    fetchOceMinimalMain({ commit }) {
      return fetchOceMinimalMain().then((data) => {
        commit('setMinimalMainData', data);
      });
    },

    // get the data for MinimalPage given its slug
    fetchPage({ commit }, pageSlug) {
      return fetchPage(pageSlug).then((data) => {
        commit('setPageData', data);
      });
    },

    // get the data for MinimalPage given its slug
    fetchPeoplePage({ commit }, pageSlug) {
      return fetchPeopleData(pageSlug).then((data) => {
        commit('setPeoplePageData', data);
      });
    },

    // get the RenditionURLs for any image that may be present in a section
    getRenditionURLs({ commit }, id) {
      return getRenditionURLs(id).then((data) => {
        commit('setRenditionURLs', { id, data });
      });
    },
  },

  // mutations have to be synchronous.
  mutations: {
    setMinimalMainData(state, data) {
      state.minimalMainData = data;
    },

    setPageData(state, data) {
      state.pageData = data;
    },

    setPeoplePageData(state, data) {
      state.peoplePageData = data;
    },

    setRenditionURLs(state, data) {
      state.renditionURLs[data.id] = data.data;
    },
  },
});
