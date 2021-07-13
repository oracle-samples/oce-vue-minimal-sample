<!--
  Copyright (c) 2021 Oracle and/or its affiliates.
  Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
-->

<!-- Main starting page for the Vue application
     The router will replace the "router-view" component with the required component
     The div with the id of "app" is needed for client side hydration.
-->
<template>
  <div id="app">
    <Header :pages="data.fields.pages" :headerRenditionURLs="data.headerRenditionURLs" />
    <router-view />
    <Footer :footerRenditionURLs="data.footerRenditionURLs" />
  </div>
</template>

<script>

import Footer from '../components/Footer.vue';
import Header from '../components/Header.vue';

export default {
  name: 'app',
  components: {
    Header,
    Footer,
  },

  // computed properties will watch for any changes in the data within it,
  // when it changes it will update itself based on some function
  computed: {
    data() {
      return this.$store.state.minimalMainData;
    },
  },

  // Server-side only: called by server renderer automatically
  serverPrefetch() {
    return this.fetchData();
  },

  methods: {
    fetchData() {
      // return the Promise from the action
      return this.$store.dispatch('fetchOceMinimalMain');
    },
  },

};
</script>
