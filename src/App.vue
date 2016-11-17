<template>
  <div id="app">
    <img src="./assets/logo.png">
    <search></search>
    <FooterComponent></FooterComponent>
  </div>
</template>

<script>
import Search from './components/Search'
import FooterComponent from './components/Footer'

export default {
    name: 'app',
    components: {
        Search,
        FooterComponent
    }
}
</script>

<style>
#app {
  font-family: 'Microsoft Yahei', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.text-center input {
    text-align: center!important;
}
.text-center .mu-text-field-hint {
    left: 50%;
    margin-left: -25%;
}

</style>
