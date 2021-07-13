<!--
  Copyright (c) 2021 Oracle and/or its affiliates.
  Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
-->

<!-- Component for the footer. -->

<template>
  <footer id="footer">
    <!-- Logo -->
    <picture v-if="footerRenditionURLs">
      <source type="image/webp" :srcSet="footerRenditionURLs.srcset" sizes="300px" />
      <img
        id="footer-image"
        alt="Footer Logo"
        :src="footerRenditionURLs.native"
        :width="footerRenditionURLs.width"
        :height="footerRenditionURLs.height"
      />
    </picture>

    <!-- Social Media Icons -->
    <div class="social-media-menu">
      <a href="https://www.facebook.com/Oracle/"><img :src="facebook" alt="Facebook"/></a>
      <a href="https://www.linkedin.com/company/oracle/"><img :src="linkedin" alt="Linked In"/></a>
      <a href="https://twitter.com/Oracle"><img :src="twitter" alt="Twitter"/></a>
      <a href="https://www.youtube.com/oracle/"><img :src="youtube" alt="You Tube"/></a>
    </div>
  </footer>
</template>

<script>
import facebook from '../assets/facebook.png';
import linkedin from '../assets/linkedin.png';
import twitter from '../assets/twitter.png';
import youtube from '../assets/youtube.png';

export default {
  // properties passed into the component in HTML
  props: ['footerRenditionURLs'],
  // make the image available as variables
  data() {
    return {
      facebook,
      linkedin,
      twitter,
      youtube,
    };
  },
};
</script>
