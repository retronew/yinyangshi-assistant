<template>
    <footer>
        <ul>
            <li v-for="person in weibo">
                <a v-bind:href="person.url" v-bind:title="person.job" target="_blank">@{{ person.name }}</a>
            </li>
        </ul>
    </footer>
</template>
<script>
export default {
    name: 'footer',
    data () {
        return {
            weibo: [
                {
                    name: '银河喵喵',
                    job: '程序',
                    url: 'http://weibo.com/BlossomPlus'
                },
                {
                    name: 'Ryran',
                    job: '数据',
                    url: 'http://weibo.com/u/5700026526'
                }
            ]
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
footer{
    position: fixed;
    bottom: 0;
    right: 0;
    padding: .6rem
}
footer ul{
    list-style: none;
    padding: 0;
    margin: 0;
    text-align: right;
}
footer a{
    padding: 0 .6rem;
}
</style>
