<!--
  Copyright (c) 2021 Oracle and/or its affiliates.
  Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
-->

<!-- Component for the header. -->

<template>
  <header id="header">

    <!-- Header Logo -->
    <router-link :to="{ name: 'page', params: { slug: firstPageSlug }} ">
      <picture v-if="headerRenditionURLs">
        <source type="image/webp" :srcSet="headerRenditionURLs.srcset" />
        <img
          id="header-image"
          alt="Company Logo"
          :src="headerRenditionURLs.native"
          :width="headerRenditionURLs.width"
          :height="headerRenditionURLs.height"
        />
      </picture>
    </router-link>

    <!-- Menu : Home | Contact Us -->
    <nav>
      <button id="nav-menu-button" v-on:click="onDropDownMenuButtonClicked">☰</button>
      <ul id="nav-menu-items">
        <li :key="page.slug" v-on:click="onMenuItemClicked(index)" v-for="(page, index) in pages">
          <router-link
            :to="{ name: 'page',
            params: {slug: page.slug} } "
            :class="selectedPageIndex === index ? 'active' : ''"
            style="text-decoration: none;">
            {{page.name}}
          </router-link>
        </li>
      </ul>
    </nav>

  </header>

</template>

<script>
export default {
  // properties passed into the component in HTML
  props: ['headerRenditionURLs', 'pages'],

  data() {
    return {
      selectedPageIndex: Number,
      firstPageSlug: String,
    };
  },

  created() {
    // Set the appropriate initial page index based on the slug in the route param
    let pageslug = this.$route.params.slug;
    this.firstPageSlug = this.$store.state.minimalMainData.fields.pages[0].slug;
    if (!pageslug) {
      pageslug = this.firstPageSlug;
    }
    const { pages } = this.$store.state.minimalMainData.fields;
    this.selectedPageIndex = pages.findIndex((page) => page.slug === pageslug);
  },

  methods: {
    /*
     * Show/hide the drop down menu in narrow screens when the
     * button is clicked and update the button styling.
     */
    onDropDownMenuButtonClicked() {
      const dropDownMenu = document.getElementById('nav-menu-items');
      const menuButton = document.getElementById('nav-menu-button');

      if (dropDownMenu.className === '') {
        dropDownMenu.className = 'displayed';
        menuButton.className = 'active';
      } else {
        dropDownMenu.className = '';
        menuButton.className = '';
      }
    },

    /*
     * Handle an item being clicked on from the menu
     */
    onMenuItemClicked(index) {
      // set the current nav index
      this.selectedPageIndex = index;

      // Close the menu and update the button styling
      const dropDownMenu = document.getElementById('nav-menu-items');
      const menuButton = document.getElementById('nav-menu-button');
      dropDownMenu.className = '';
      menuButton.className = '';
    },

  },
};
</script>
