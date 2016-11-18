<template>
    <div id="footer">
        <a v-bind:href="weibo.url" v-bind:title="weibo.name" target="_blank">@{{ weibo.name }}</a>
    </div>
</template>
<script>
export default {
    name: 'footer',
    data () {
        return {
            weibo: {
                name: '银河喵喵',
                url: 'http://weibo.com/BlossomPlus'
            }
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#footer{
    position: absolute;
    bottom: 0;
    right: 0;
    padding: .6rem
}
#footer a{
    margin: .6rem
}
</style>
