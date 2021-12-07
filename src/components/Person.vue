<!--
  Copyright (c) 2021 Oracle and/or its affiliates.
  Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
-->

<!-- Component for the People Page.  -->

<template>
  <div >
    <section  class="announcement">
        <div>
      <picture v-if="gqldata.announcement.image && renditionURLs">
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
          <div class="textcontent">
            <h1>{{gqldata.announcement.heading}}</h1>
          </div>
          <div class="text">
            <div v-html=cleanContent></div>
          </div>
        </div>
    </section>
      <div class="all_people">
      <div v-for="person in gqldata.people" :key="person.id" >
        <section className="person">
          <img className="profile_picture"
          :src="person.fields.renditions[0].file.url" :alt="person.fields.fullname" />
          <div className="profile">
            <div className="profile_name">{{person.fields.fullname}}</div>
            <div className="profile_position">{{person.fields.title}}</div>
            <div className="profile_description">{{person.fields.biodata}}</div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import filterXSS from 'xss';

export default {
  name: 'Person',
  props: ['gqldata'],
  computed: {
    cleanContent() {
      const content = this.gqldata.announcement.body;
      const options = {
        stripIgnoreTag: true, // filter out all HTML not in the whitelist
        stripIgnoreTagBody: ['script'], // the script tag is a special case, we need
        // to filter out its content
      };
      return filterXSS(content, options);
    },
    renditionURLs() {
      return this.$store.state.renditionURLs[this.gqldata.announcement.image.id];
    },
  },
  // Client-side only : get data if its not already been obtained
  mounted() {
    if (!this.gqldata.announcement.image || this.gqldata.announcement.renditionURLs) return;
    this.loading = true;
    this.fetchData()
      .then(() => {
        this.loading = false;
      });
  },

  methods: {
    fetchData() {
      // return the Promise from the action
      return this.$store.dispatch('getRenditionURLs', this.gqldata.announcement.image.id);
    },
  },

};
</script>
