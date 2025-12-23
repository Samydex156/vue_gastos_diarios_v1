<script setup>

</script>

<template>
  <router-view />
</template>

<style>
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color-scheme: light;
  color: #213547;
  background-color: #f0f2f5;
}

body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  display: block;
}

*, *::before, *::after {
  box-sizing: border-box;
}

#app {
  max-width: none;
  margin: 0;
  padding: 0;
  text-align: left;
}
</style>