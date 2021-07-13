<!--
  Copyright (c) 2021 Oracle and/or its affiliates.
  Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
-->

<!-- Component for the Articles List Page. -->
<template>
  <div>
    <picture v-if="section.fields.image && renditionURLs">
      <source type="image/webp" :srcSet="renditionURLs.srcset" />
      <source :srcSet="renditionURLs.jpgSrcset" />
      <img
        id="header-image"
        :src="renditionURLs.large"
        alt="Company Logo"
        :width="renditionURLs.width"
        :height="renditionURLs.height"
      />
    </picture>
    <div>
      <h1>{{ section.fields.heading }}</h1>
      <div className="text">
        <div v-html=cleanContent></div>
      </div>
      <div v-if="section.fields.actions">
        <div v-for="(action, i) in section.fields.actions" v-bind:key="i">
          <a class="button" :href="action.link">
            {{action.name}}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import any components this page uses here
import filterXSS from 'xss';

export default {
  name: 'Section',
  // properties passed into the component in HTML
  props: ['section'],
  computed: {
    cleanContent() {
      const content = this.section.fields.body;
      const options = {
        stripIgnoreTag: true, // filter out all HTML not in the whitelist
        stripIgnoreTagBody: ['script'], // the script tag is a special case, we need
        // to filter out its content
      };
      return filterXSS(content, options);
    },
    renditionURLs() {
      return this.$store.state.renditionURLs[this.section.fields.image.id];
    },
  },
  // Client-side only : get data if its not already been obtained
  mounted() {
    if (!this.section.fields.image || this.section.renditionURLs) return;
    this.loading = true;
    this.fetchData()
      .then(() => {
        this.loading = false;
      });
  },

  methods: {
    fetchData() {
      // return the Promise from the action
      return this.$store.dispatch('getRenditionURLs', this.section.fields.image.id);
    },
  },

};
</script>
