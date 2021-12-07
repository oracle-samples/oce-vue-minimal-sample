<!--
  Copyright (c) 2021 Oracle and/or its affiliates.
  Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
-->

<!-- Component for the Page. -->
<template>
  <div v-if="data.hasError">
    <Error :errorObj="data" />
  </div>
  <div v-else-if="data.slug === 'people'">
    <Person :gqldata ="data"/>
  </div>
  <div v-else>
    <section :class="`content ${section.fields.type}`" :key="section.id"
      v-for="(section) in data.fields.sections">
      <Section :section="section" />
    </section>
  </div>
</template>

<script>
// import any components this page uses here
import Section from '../components/Section.vue';
import Error from '../components/Error.vue';
import Person from '../components/Person.vue';

export default {
  name: 'Page',
  components: {
    Section,
    Error,
    Person,
  },
  data() {
    return {
      // data passed in on the URL
      slug: String,
      // client side rendering only
      loading: false,
    };
  },
  created() {
    // get data passed in on the URL
    this.slug = this.$route.params.slug;
    if (!this.slug) {
      this.slug = this.$store.state.minimalMainData.fields.pages[0].slug;
      this.$router.push({ name: 'page', params: { slug: this.slug } });
    }
  },
  // computed properties will watch for any changes in the data within it,
  // when it changes it will update itself based on some function
  computed: {
    data() {
      if (this.slug === 'people') {
        return this.$store.state.peoplePageData;
      }
      return this.$store.state.pageData;
    },
  },

  // Server-side only: called by server renderer automatically
  serverPrefetch() {
    return this.fetchData();
  },
  beforeRouteUpdate(to, from, next) {
    this.slug = to.params.slug;
    this.fetchData()
      .then(() => {
        document.title = this.data.name;
      });
    next();
  },
  methods: {
    fetchData() {
      let data = {};
      // People is a special case and is handled by GraphQL in the store
      if (this.slug === 'people') {
        data = this.$store.dispatch('fetchPeoplePage', this.slug);
      } else {
      // return the Promise from the action
        data = this.$store.dispatch('fetchPage', this.slug);
      }
      return data;
    },
  },

};
</script>
