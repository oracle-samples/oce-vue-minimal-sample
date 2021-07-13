<!--
  Copyright (c) 2021 Oracle and/or its affiliates.
  Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
-->

<!-- Component for the Error. -->

<template>
    <div className="error">
      <h1>Error !</h1>
        <p v-if="errorObj.statusCode === 404">
          Sorry, the item you are requesting has not been found.
        </p>
        <p v-else>{{JSON.stringify(errorObj)}}</p>
    </div>
</template>

<script>

export default {
  // properties passed into the component in HTML
  props: ['errorObj'],
};
</script>
