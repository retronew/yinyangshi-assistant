<template>
    <div id="edit">
        <div class="title">编辑器</div>
        <div class="content">
            
        </div>
        <div class="operate">
            <input class="input-file" id="input-file" type="file" v-on:change="handleFileSelect($event)">
            <mu-raised-button label="读取文件" class="demo-raised-button" v-on:click="clickInput('input-file')" primary/>
        </div>
    </div>
</template>
<script>
export default {
    name: 'footer',
    data () {
        return {
            database: {}
        }
    },
    methods: {
        clickInput(id) {
			document.getElementById(id).click()
		},
        handleFileSelect(event) {
			var self = this,
				files = event.target.files[0] // FileList object

			var reader = new FileReader()
			reader.onload = function() {
				self.database = JSON.parse(this.result)
			}

			reader.readAsText(files)
		},
		saveFile(data, name) {
			var name = name || 'data',
				json = JSON.stringify(data),
				blob = new Blob([json], {type: 'application/json'}),
				url  = URL.createObjectURL(blob)

			var a = document.createElement('a')
			a.download = name + '.json'
			a.href = url
			a.click()
		},
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.title {
    font-size: 26px;
    color: #F44336;
    font-weight: bold;
}
.input-file{
    display: none
}
</style>
