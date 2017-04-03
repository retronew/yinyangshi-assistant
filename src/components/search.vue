<template>
    <div id="search">
        <h1>{{ tips.list[tips.index] }}</h1>
        <div id="keyword">
            <mu-auto-complete hintText="请随便输入点啥" :dataSource="searchKeySource" v-model="searchKey" class="text-center" />
            <div class="help" @mouseenter="help.show = true" @mouseleave="help.show = false">
                <transition name="fade">
                    <div class="content" v-show="help.show">
                        <p class="title">常用命令</p>
                        <p v-for="item in help.list">{{ item }}</p>
                    </div>
                </transition>
                <i class="icon">?</i>
            </div>
        </div>
        <div id="result">
            <transition-group name="fade">
                <div class="wrap" v-for="(keyword, index) in filteredKeyword" v-if="sliceAtBefore(searchKey) != ''" :key="index">
                    <!-- 式神和神秘妖怪 -->
                    <div v-if="query.type == 0 || query.type == 1">
                        <div class="target">{{ targetToShikigami(keyword.target).name }}</div>
                        <div class="local" v-if="query.order == 0">
                            <span v-for="local in targetToShikigami(keyword.target).local">
                                <span class="hover" @click="setSearchKey(localToMap(local))">
                                    <span>{{ localToMap(local) }}</span>
                                    <span>({{ local[2] }})</span><!-- 妖怪总数 -->
                                </span>
                            </span>
                        </div>
                        <div class="skill center" v-if="query.order == 1">
                            <div class="detail" v-for="skill in targetToShikigami(keyword.target).skills">
                                <mu-flexbox class="header text-center">
                                    <mu-flexbox-item>技能名</mu-flexbox-item>
                                    <mu-flexbox-item>消耗鬼火</mu-flexbox-item>
                                    <mu-flexbox-item>技能升级</mu-flexbox-item>
                                    <mu-flexbox-item>效果</mu-flexbox-item>
                                </mu-flexbox>
                                <mu-flexbox class="body text-center">
                                    <mu-flexbox-item>{{ skill.name }}</mu-flexbox-item>
                                    <mu-flexbox-item>{{ skill.cost }}</mu-flexbox-item>
                                    <mu-flexbox-item><ul><li v-for="level in skill.level">{{ level }}</li></ul></mu-flexbox-item>
                                    <mu-flexbox-item>{{ skill.description }}</mu-flexbox-item>
                                </mu-flexbox>
                            </div>
                        </div>
                        <div class="soul center" v-if="query.order == 2">
                            <div class="line" v-if="targetToShikigami(keyword.target).soul != null">
                                <div v-for="soul in targetToShikigami(keyword.target).soul">
                                    <span class="detail" v-for="target in soul">{{ target[0] + 'x' + target[1] }}</span>
                                </div>
                            </div>
                            <div v-else>暂无数据</div>
                        </div>
                        <div class="awakening center" v-if="query.order == 3">
                            <div class="line">
                                觉醒强化：
                                <span>{{ targetToShikigami(keyword.target).awakening.description }}</span>
                            </div>
                            <div class="line">
                                觉醒材料：
                                <span class="material" v-for="material in targetToShikigami(keyword.target).awakening.material">{{ targetToMaterial(material) }}({{ material[2] }})</span>
                            </div>
                        </div>
                    </div>
                    <!-- 地图 -->
                    <div v-if="query.type == 2">
                        <div class="map">
                            <div class="target">{{ keyword.name }}</div>
                            <div class="floor" v-if="keyword.type == 0" v-for="(floor, index) in keyword.target">
                                {{ floor.name }}：<span v-for="target in floor.content" @click="setSearchKey(target[0])" class="hover">{{ target[0] + 'x' + target[1] }}</span>
                            </div>
                            <div class="floor" v-if="keyword.type == 1 || keyword.type == 2" v-for="(floor, index) in keyword.target">
                                第{{ translateNumber(index + 1) }}回合：<span v-for="target in floor.content" @click="setSearchKey(target[0])" class="hover">{{ target[0] + 'x' + target[1] }}</span>
                            </div>
                            <div class="floor" v-if="keyword.type == 3">
                                层数：{{ keyword.target }}
                            </div>
                        </div>
                    </div>
                    <div v-if="query.type == 3">
                        <div class="soul">
                            <div v-if="keyword.target.length > 2">
                                <div v-for="soul in keyword.target">{{ soul }}</div>
                            </div>
                            <div v-else>
                                <div class="type">{{ database.soul.list[keyword.target[0]].type }}型御魂</div>
                                <div class="effect" v-for="(effect, index) in database.soul.list[keyword.target[0]].sets[keyword.target[1]].special">{{ translateNumber((index + 1) * 2) }}件套效果：{{ effect }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </transition-group>
        </div>
    </div>
</template>

<script>
import database from '../assets/database.json'

var newDatabase = {}
for (var item of database) {
    newDatabase[item.field] = item.content
}

export default {
    data () {
        return {
            tips: {
                index: null,
                list: [
                    '酋长带你去打猎了',
                    '醒醒，这个游戏没有SSR',
                    '朋友一生一起走啊，谁出SSR谁是狗啊',
                    '551草爹在召唤你',
                    '听说你肝脏强健？',
                    '出了ssr，你就比丁磊还屌了',
                    '据说ssr概率是0.46%，100抽20%不出，1000抽1%不出'
                ]
            },
            help: {
                show: false,
                list: [
                    '式神名',
                    '式神名@技能|觉醒|御魂',
                    '御魂名',
                    '御魂属性',
                    '御魂第一层',
                    '探索副本第一章',
                    '妖气封印#妖怪名',
                    '神秘妖怪出现地点'
                ]
            },
            searchKey: '',
            query: {
                type: 0,// 查询类型，式神为0，神秘妖怪为1，地点为2
                order: 0 // 查询命令，标识符为@，地点为0，技能为1，御魂为2，觉醒为3
            },
            database: newDatabase
        }
    },
    computed: {
        keywords() {
            return this.allMysteries.concat(this.allShikigamis, this.allLocals, this.allSouls)
        },
        allMysteries() {
            var self = this
            return this.database.mystery.map(function(item) {
                return {
                    key: item.key,
                    target: self.shikigamiKeyToTarget(item.target) // 神秘妖怪相当于式神，需要将式神名转换成对应坐标
                }
            })
        },
        allShikigamis() {
            return this.database.shikigami.map(function(items, parentIndex) {
                return items.sets.map(function(item, index) {
                    return {
                        key: item.name,
                        target: [parentIndex, index]
                    }
                })
            }).reduce(function(pre, cur) {
                return pre.concat(cur)
            })
        },
        allLocals() {
            var self = this
            var map = this.database.mapGroup.map(function(items, parentIndex) {
                return items.sets.map(function(item, index) { // type属性：0为探索副本，1为妖气封印，2为御魂和秘闻，3为觉醒和御灵
                    if (parentIndex == 0) { // 探索副本
                        if (item.main == true) { // 主线副本
                            return {
                                key: items.name + '第' + self.translateNumber(item.id) + '章',
                                name: item.name,
                                type: 0,
                                target: item.sets
                            }
                        } else { // 番外
                            return {
                                key: items.name + item.name,
                                name: item.name,
                                type: 0,
                                target: item.sets
                            }
                        }
                    } else if (parentIndex == 1) { // 妖气封印
                        return {
                            key: items.name + '#' + item.name,
                            name: item.name,
                            type: 1,
                            target: item.sets
                        }
                    } else if (parentIndex == 4 || parentIndex == 5) { // 觉醒和御灵
                        return {
                            key: items.name + item.name,
                            name: item.name,
                            type: 3,
                            target: item.round
                        }
                    }
                })
            }).reduce(function(pre, cur) {
                return pre.concat(cur)
            }).filter(function(n) { // remove empty elements
                return n != undefined
            })

            // 御魂和秘闻在结构上多一层，需要单独拿出来遍历
            var map_type2 = this.database.mapGroup.map(function(items, parentIndex) {
                return items.sets.map(function(item, index) {
                    if (parentIndex == 2 || parentIndex == 3) { // 御魂和秘闻
                        return item.sets.map(function(secondFloor) {
                            return {
                                key: items.name + item.name + secondFloor.name,
                                name: item.name,
                                type: 2,
                                target: secondFloor.sets
                            }
                        })
                    } else {
                        return []
                    }
                }).reduce(function(pre, cur) {
                    return pre.concat(cur)
                })
            }).reduce(function(pre, cur) {
                return pre.concat(cur)
            }).filter(function(n) { // remove empty elements
                return n != undefined
            })

            map = map.concat(map_type2)
            return map
        },
        allSouls() {
            var self = this
            var summary = {
                key: '御魂属性',
                target: this.database.soul.position.map(function(item, index) {
                    return '御魂' + self.translateNumber(item.id) + '号位：' + item.statistic
                })
            }
            var souls = this.database.soul.list.map(function(items, parentIndex) {
                return items.sets.map(function(item, index) {
                    return {
                        key: item.name,
                        target: [parentIndex, index]
                    }
                })
            }).reduce(function(pre, cur) {
                return pre.concat(cur)
            })
            souls.push(summary)
            return souls
        },
        allShikigamiKey() {
            return this.allShikigamis.map(function(item) {
                return item.key
            })
        },
        allMysteryKey() {
            return this.allMysteries.map(function(item) {
                return item.key
            })
        },
        allLocalKey() {
            return this.allLocals.map(function(item) {
                return item.key
            })
        },
        allSoulKey() {
            return this.allSouls.map(function(item) {
                return item.key
            })
        },
        filteredKeyword() {
            var self = this
            return this.keywords.filter(function(keyword) {
                return keyword.key == self.sliceAtBefore(self.searchKey)
            })
        },
        searchKeySource() {
            return this.keywords.map(function(item) {
                return item.key
            })
        }
    },
    watch: {
        searchKey: function(val, oldVal) {
            this.query.type = 0
            if (this.allShikigamiKey.indexOf(val) !== -1) {
                this.query.type = 0
            } else if (this.allMysteryKey.indexOf(val) !== -1) {
                this.query.type = 1
            } else if (this.allLocalKey.indexOf(val) !== -1) {
                this.query.type = 2
            } else if (this.allSoulKey.indexOf(val) !== -1) {
                this.query.type = 3
            }

            if (this.sliceAtBefore(val) != '' && this.query.type == 0) {
                var query = this.sliceAtAfter(val)
                switch (query) {
                    case '地点':
                        this.query.order = 0
                        break;
                    case '技能':
                        this.query.order = 1
                        break;
                    case '御魂':
                        this.query.order = 2
                        break;
                    case '觉醒':
                        this.query.order = 3
                        break;
                    default:
                        this.query.order = 0
                }
            } else {
                this.query.order = 0 // reset query order
            }
        }
    },
    methods: {
        shikigamiKeyToTarget(name) {
            var index = this.allShikigamiKey.indexOf(name)
            if (index != -1) {
                return this.allShikigamis[index].target
            } else {
                return null
            }
        },
        targetToShikigami(array) {
            if (Array.isArray(array) && this.database.shikigami.length >= array[0]) {
                return this.database.shikigami[array[0]].sets[array[1]]
            } else {
                return null
            }
        },
        targetToMaterial(array) {
            if (Array.isArray(array)) {
                var material = this.database.material[array[0]]
                return material.type + '·' + material.sets[array[1]]
            } else {
                return null
            }
        },
        localToMap(array) {
            var local = this.database.mapGroup[array[0]]
            if (array[0] == 0) {
                if (local.sets[array[1][0]].main) {
                    return local.name + '第' + this.translateNumber(local.sets[array[1][0]].id) + '章'
                } else {
                    return local.name + local.sets[array[1][0]].name
                }
            } else if (array[0] == 1) {
                return local.name + '#' + local.sets[array[1][0]].name
            } else if (array[0] == 2 || array[0] == 3) {
                return local.name + local.sets[array[1][0]].name + local.sets[array[1][0]].sets[array[1][1]].name
            }
        },
        setSearchKey(string) {
            this.searchKey = string
        },
        sliceAtBefore(string) {
            var index = string.indexOf('@')
            if (index !== -1) {
                return string.slice(0, index).trim()
            } else {
                return string.trim()
            }
        },
        sliceAtAfter(string) {
            var index = string.indexOf('@')
            if (index !== -1) {
                return string.slice(index + 1).trim()
            } else {
                return string.trim()
            }
        },
        sumArray(array) {
            return array.reduce(function(pre, cur) {
                return Number(pre) + Number(cur)
            })
        },
        maxArray(array) {
            return array.reduce(function(pre, cur) {
                return pre > cur ? pre : cur
            })
        },
        minArray(array) {
            return array.reduce(function(pre, cur) {
                return pre > cur ? cur : pre
            })
        },
        fCopy(object) {
            return JSON.parse(JSON.stringify(object))
        },
        translateNumber(numberText) {
            var CHINESE_NEGATIVE = "负",
				CHINESE_ZERO = "零",
				CHINESE_DIGITS = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"],
				CHINESE_UNITS = ["", "十", "百", "千"],
				CHINESE_GROUP_UNITS = ["", "万", "亿", "兆", "京", "垓", "杼", "穰", "溝", "澗", "正", "載", "極"]

            numberText = numberText.toString()
            if (numberText === "") {
                return ""
            }
            numberText = numberText.replace(/^0+/g, "")
            numberText = numberText.replace(/^-0+/g, "-")
            if (numberText === "" || numberText === "-") {
                return CHINESE_ZERO
            }
            var result = ""
            if (numberText[0] === "-") {
                result += CHINESE_NEGATIVE
                numberText = numberText.substring(1)
            }

            var groupIsZero = true
            var needZero = false

            for (var i = 0; i < numberText.length; ++i) {
                var position = numberText.length - 1 - i
                var digit = parseInt(numberText[i])
                var unit = position % CHINESE_UNITS.length
                var group = (position - unit) / CHINESE_UNITS.length

                if (digit !== 0) {
                    if (needZero) {
                        result += CHINESE_ZERO
                    }

                    if (digit !== 1 || unit !== 1 || !groupIsZero || (group === 0 && needZero)) {
                        result += CHINESE_DIGITS[digit]
                    }

                    result += CHINESE_UNITS[unit]
                }

                groupIsZero = groupIsZero && (digit === 0)

                if (unit === 0 && !groupIsZero) {
                    result += CHINESE_GROUP_UNITS[group]
                }

                needZero = (digit === 0 && (unit !== 0 || groupIsZero))

                if (unit === 0) {
                    groupIsZero = true
                }
            }
            return result
        },
        randomInt(num) { // 产生0 - n-1 的整数
            return Math.floor(Math.random() * num)
        }
    },
    created() {
        var self = this

        // 在渲染之前提前算出所有的式神出现场所和数量
        var map = this.database.mapGroup

        for (var index of this.allShikigamis) {
            var name = index.key,
                shikigami = this.targetToShikigami(index.target)

            shikigami.local = map.map(function(items, parentIndex) {
                return items.sets.map(function(item, index) {
                    var secondIndex = null,
                        countArray = []

                    if (parentIndex == 0 || parentIndex == 1) {
                        for (var sets of item.sets) {
                            for (var set of sets.content) {
                                if (set[0] == name) {
                                    countArray.push(set[1])
                                } else {
                                    countArray.push(0)
                                }
                            }
                        }
                    } else if (parentIndex == 2 || parentIndex == 2) {
                        for (var target in item.sets) {
                            secondIndex = target
                            for (var floor of item.sets[target].sets) {
                                for (var result of floor.content) {
                                    if (result[0] == name) {
                                        countArray.push(result[1])
                                    } else {
                                        countArray.push(0)
                                    }
                                }
                            }
                        }
                    }

                    var count = 0
                    if (countArray.length != 0) {
                        count = self.sumArray(countArray)
                    }
                    if (count > 0) {
                        return [parentIndex, [index, secondIndex], count]
                    }
                })
            }).reduce(function(pre, cur) {
                return pre.concat(cur);
            }).filter(function(n) { // remove empty elements
                return n != undefined
            })
        }
    },
    mounted() {
        this.$nextTick(function () {
            var length = this.tips.list.length

			this.tips.index = this.randomInt(length)

            setInterval(() => {
                this.tips.index = this.randomInt(length)
            }, 15000)
        })
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
    font-weight: normal;
}
#keyword {
    margin-bottom: 4rem;
    position: relative;
}
#result .target {
    color: #e53935;
    padding: 1rem;
    margin-bottom: 1rem;
    font-size: 2.5rem;
    font-weight: bold;
}
#result .local {
    color: #e53935
}
#result .local>span {
    margin: .5rem;
    font-size: 1.8rem;
    display: inline-block;
}
#result .skill {
    width: 900px;
    margin-bottom: 6rem;
}
#result .skill .detail {
    margin-bottom: 1rem
}
#result .skill .detail .header {
    border-bottom: 1px dashed #d1d1d1;
}
#result .skill .detail .header>div {
    padding: 12px 5px;
    line-height: 20px;
}
#result .skill ul {
    list-style-type: none;
    padding: 0;
}
#result .awakening,
#result .soul,
#result .floor {
    color: #e53935;
    font-size: 1.6rem;
}
#result .floor,
#result .soul,
#result .awakening .line {
    line-height: 3rem;
}
#result .awakening .material,
#result .soul .detail {
    padding: 0.8rem
}
#result .floor {
    padding: 0.1rem
}
#result .wrap {
    margin-bottom: 1.5rem
}
.help {
    display: inline-block;
    padding: 8px;
    position: absolute;
    top: 16%;
}
.help .title {
    color: #e91e63
}
.help .content {
    width: 200px;
    position: absolute;
    bottom: 98%;
    left: 50%;
    padding-bottom: 2%;
    border-radius: 4px;
    box-shadow: 0 2px 15px rgba(0, 0, 0, .1);
    background: #FFF;
    -webkit-transform: translateX(-50%);
    overflow: hidden;
    pointer-events: none;
}
.help .icon {
    display: block;
    width: 20px;
    height: 20px;
    color: #9e9e9e;
    background: aliceblue;
    text-align: center;
    cursor: pointer;
    font-style: normal;
}
.fade-enter-active,
.fade-leave-active {
    transition: opacity .25s
}
.fade-enter,
.fade-leave-active {
    opacity: 0
}
.center {
    display: block;
    margin-left: auto;
    margin-right: auto;
}
.break {
    white-space: pre-wrap;
}
.inline-block {
    display: inline-block;
}
.text-center {
    text-align: center;
}
.hover {
    cursor: pointer;
    border-radius: 4px;
    background-color: transparent;
    padding: 2px 6px;
    transition: background-color .25s
}
.hover:hover {
    background-color: aliceblue;
}
</style>
