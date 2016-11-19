<template>
    <div id="search">
        <h1>{{ tips.content[tips.index] }}</h1>
        <div id="keyword">
            <mu-auto-complete hintText="请随便输入点啥" @input="handleInput" :dataSource="dataSource" v-model="searchKey" class="text-center"/>
            <div class="help" @mouseenter="help.show = true" @mouseleave="help.show = false">
                <transition name="fade">
                    <div class="content" v-show="help.show">
                        <p style="color:#e91e63">常用命令</p>
                        <p v-for="item in help.list">{{ item }}</p>
                    </div>
                </transition>
                <i class="icon">?</i>
            </div>
        </div>
        <div id="result">
            <transition-group name="fade">
                <div class="wrap" v-for="(keyword, index) in filteredKeyword" v-if="sliceAtBefore(searchKey) != ''" :key="index">
                    <div v-if="query.type == 0 || query.type == 1">
                        <div class="target">{{ targetToShikigami(keyword.target).name }}</div>
                        <div class="local" v-if="query.order == 0">
                            <span v-for="local in targetToShikigami(keyword.target).local">
                                <span @click="input(localToMap(local))">{{ localToMap(local) }}</span><span>({{ amount(local[2]) }})</span>
                            </span>
                            <div class="plan">
                                <div>最省体力方案：<span @click="input(localToMap(saveAP(targetToShikigami(keyword.target))))">{{ localToMap(saveAP(targetToShikigami(keyword.target))) }}</span></div>
                            </div>
                        </div>
                        <div class="skill center" v-if="query.order == 1">
                            <div class="detail" v-for="skill in targetToShikigami(keyword.target).skills">
                                <mu-flexbox class="header text-center">
                                    <mu-flexbox-item>消耗鬼火</mu-flexbox-item>
                                    <mu-flexbox-item>技能升级</mu-flexbox-item>
                                    <mu-flexbox-item>效果</mu-flexbox-item>
                                </mu-flexbox>
                                <mu-flexbox class="body text-center">
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
                            <div class="line">觉醒强化：<span v-if="targetToShikigami(keyword.target).awakening.description != null">{{ targetToShikigami(keyword.target).awakening.description }}</span></div>
                            <div class="line">觉醒材料：<span v-if="targetToShikigami(keyword.target).awakening.material != null" class="material" v-for="material in targetToShikigami(keyword.target).awakening.material">{{ targetToMaterial(material) }}({{ material[2] }})</span></div>
                        </div>
                    </div>
                    <div v-if="query.type == 2">
                        <div class="floor" v-if="keyword.type == 0" v-for="(floor, index) in keyword.target">
                            {{ floor.name }}：<span v-for="target in floor.content" @click="input(target[0])">{{ target[0] + 'x' + target[1] }}</span>
                        </div>
                        <div class="floor" v-if="keyword.type == 1" v-for="(floor, index) in keyword.target">
                            第{{ translateNumber(index + 1) }}回合：<span v-for="target in floor.content" @click="input(target[0])">{{ target[0] + 'x' + target[1] }}</span>
                        </div>
                        <div class="floor" v-if="keyword.type == 2" v-for="(floor, index) in keyword.target">
                            第{{ translateNumber(index + 1) }}回合：<span v-for="target in floor.content" @click="input(target[0])">{{ target[0] + 'x' + target[1] }}</span>
                        </div>
                    </div>
                    <div v-if="query.type == 3">
                        <div class="soul">
                            <div v-if="keyword.target.length > 2">
                                <div v-for="soul in keyword.target">{{ soul }}</div>
                            </div>
                            <div v-else>
                                <div class="type">{{ database.soul.type[keyword.target[0]].main }}型御魂</div>
                                <div class="effect" v-for="(effect, index) in database.soul.type[keyword.target[0]].sets[keyword.target[1]].special">{{ translateNumber((index + 1) * 2) }}件套效果：{{ effect }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>

<script>
import Database from '../assets/database.json'

export default {
    name: 'hello',
    data () {
        return {
            tips: {
                index: null,
                content: [
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
                    '妖气封印',
                    '神秘妖怪出现地点'
                ]
            },
            dataSource: [],
            searchKey: '',
            query: {
                type: 0,// 查询类型，式神为0，神秘妖怪为1，地点为2
                order: 0 // 查询命令，标识符为@，地点为0，技能为1，御魂为2，觉醒为3
            },
            database: Database
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
                    target: self.nameToArray(item.target)
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
                return pre.concat(cur);
            })
        },
        allLocals() {
            var self = this
            return this.database.map.map(function(items, parentIndex) {
                if (items.sets != null) {
                    return items.sets.map(function(item, index) {
                        if (parentIndex == 0) { //探索
                            return {
                                key: items.name + '第' + self.translateNumber(item.id) + '章',
                                type: 0,
                                target: item.sets
                            }
                        } else if (parentIndex == 1) { //妖气封印
                            return {
                                key: items.name + '#' + item.name,
                                type: 1,
                                target: item.sets
                            }
                        } else if (parentIndex == 2) { //御魂
                            return {
                                key: items.name + '第' + self.translateNumber(item.id) + '层',
                                type: 2,
                                target: item.sets
                            }
                        } else if (parentIndex == 3) { //觉醒
                            return {
                                key: items.name + item.type,
                                type: 3,
                                target: item.sets
                            }
                        }
                    })
                } else {
                    return [{
                        key: items.name,
                        target: null
                    }]
                }
            }).reduce(function(pre, cur) {
                return pre.concat(cur);
            })
        },
        allSouls() {
            var self = this
            var summary = {
                key: '御魂属性',
                target: this.database.soul.special.map(function(item, index) {
                    return '御魂' + self.translateNumber(item.id) + '号位：' + item.statistic
                })
            }
            var souls = this.database.soul.type.map(function(items, parentIndex) {
                return items.sets.map(function(item, index) {
                    return {
                        key: item.name,
                        target: [parentIndex, index]
                    }
                })
            }).reduce(function(pre, cur) {
                return pre.concat(cur);
            })
            souls.push(summary)
            return souls
        },
        allShikigamiNameArray() {
            return this.allShikigamis.map(function(item) {
                return item.key
            })
        },
        allMysteryArray() {
            return this.allMysteries.map(function(item) {
                return item.key
            })
        },
        allLocalArray() {
            return this.allLocals.map(function(item) {
                return item.key
            })
        },
        allSoulArray() {
            return this.allSouls.map(function(item) {
                return item.key
            })
        },
        filteredKeyword() {
            var self = this
            return self.keywords.filter(function(keyword) {
                return keyword.key.indexOf(self.sliceAtBefore(self.searchKey).trim()) !== -1
            })
        }
    },
    watch: {
        searchKey: function(val, oldVal) {
            if (this.allShikigamiNameArray.indexOf(val) !== -1) {
                this.query.type = 0
            } else if (this.allMysteryArray.indexOf(val) !== -1) {
                this.query.type = 1
            } else if (this.allLocalArray.indexOf(val) !== -1) {
                this.query.type = 2
            } else if (this.allSoulArray.indexOf(val) !== -1) {
                this.query.type = 3
            } else {
                this.query.type = 0
            }

            var index = val.indexOf('@')
            if (index !== -1 && this.query.type == 0) {
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
            }
        }
    },
    methods: {
        input(string) {
            this.searchKey = string
        },
        sliceAtBefore(string) {
            var index = string.indexOf('@')
            if (index !== -1) {
                return string.slice(0, index)
            } else {
                return string
            }
        },
        sliceAtAfter(string) {
            var index = string.indexOf('@')
            if (index !== -1) {
                return string.slice(index + 1)
            } else {
                return string
            }
        },
        nameToArray(name) {
            var index = this.allShikigamiNameArray.indexOf(name)
            if (index != -1) {
                return this.allShikigamis[index].target
            } else {
                return null
            }
        },
        targetToShikigami(array) {
            if (this.isArray(array) && this.database.shikigami[array[0]]) {
                return this.database.shikigami[array[0]].sets[array[1]]
            } else {
                return {name: null, local: null}
            }
        },
        targetToMaterial(array) {
            if (this.isArray(array)) {
                var material = this.database.material[array[0]]
                return material.type + '·' + material.sets[array[1]]
            } else {
                return null
            }
        },
        isArray(obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        },
        sumArray(array) {
            return array.reduce(function(pre, cur) {
                return pre + cur
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
        amount(num) {
            if (this.isArray(num)) {
                return this.sumArray(num)
            } else {
                return num
            }
        },
        localToMap(array) {
            var local = this.database.map[array[0]]

            if (array[0] == 0) {
                return local.name + '第' + this.translateNumber(local.sets[array[1] - 1].id) + '章'
            } else if (array[0] == 1) {
                return local.name
            } else if (array[0] == 2) {
                return local.name + '第' + this.translateNumber(local.sets[array[1] - 1].id) + '层'
            } else {
                // 觉醒材料四个参数，第三个参数代表觉醒的类型
                return local.name + local.sets[array[1]].type + '第' + this.translateNumber(local.sets[array[1]].sets[array[2] - 1]) + '层'
            }
        },
        saveAP(shikigami) {
            var local = shikigami.local,
                costArray = [],
                max = null

            for (var target of local) {
                var type = target[0],
                    num = target[2],
                    cost = 0

                if (type == 0 || type == 1) {
                    cost = 3
                } else if (type == 2) {
                    cost = 4
                }

                if (this.isArray(num)) {
                    var locals = this.database.map[type].sets[target[1] - 1].sets,
                        lastBoss = locals[locals.length - 1]

                    if (lastBoss.name.indexOf('首领')) {
                        var length = lastBoss.length
                        num.splice(-length, length)
                    }// 去除首领造成的影响

                    num = cost / this.maxArray(num)
                } else {
                    num = cost / num
                }
                costArray.push(num)
            }

            max = this.minArray(costArray)
            var index = costArray.indexOf(max)

            return local[index]
        },
        translateNumber(numberText) {
            var CHINESE_NEGATIVE = "负";
            var CHINESE_ZERO = "零";
            var CHINESE_DIGITS = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
            var CHINESE_UNITS = ["", "十", "百", "千"];
            var CHINESE_GROUP_UNITS = ["", "万", "亿", "兆", "京", "垓", "杼", "穰", "溝", "澗", "正", "載", "極"];
            numberText = numberText.toString()
            if (numberText === "") {
                return "";
            }
            numberText = numberText.replace(/^0+/g, "");
            numberText = numberText.replace(/^-0+/g, "-");
            if (numberText === "" || numberText === "-") {
                return CHINESE_ZERO;
            }
            var result = "";
            if (numberText[0] === "-") {
                result += CHINESE_NEGATIVE;
                numberText = numberText.substring(1);
            }

            var groupIsZero = true;
            var needZero = false;
            for (var i = 0; i < numberText.length; ++i) {
                var position = numberText.length - 1 - i;
                var digit = parseInt(numberText[i]);
                var unit = position % CHINESE_UNITS.length;
                var group = (position - unit) / CHINESE_UNITS.length;

                if (digit !== 0) {
                    if (needZero) {
                        result += CHINESE_ZERO;
                    }

                    if (digit !== 1 || unit !== 1 || !groupIsZero || (group === 0 && needZero)) {
                        result += CHINESE_DIGITS[digit];
                    }

                    result += CHINESE_UNITS[unit];
                }

                groupIsZero = groupIsZero && (digit === 0);

                if (unit === 0 && !groupIsZero) {
                    result += CHINESE_GROUP_UNITS[group];
                }

                needZero = (digit === 0 && (unit !== 0 || groupIsZero));

                if (unit === 0) {
                    groupIsZero = true;
                }
            }
            return result;
        },
        keywordsToArray() {
            return this.keywords.map(function(item) {
                return item.key
            })
        },
        randomInt(num) { // 产生0 - n-1 的整数
            return Math.floor(Math.random() * num)
        },
        changeTips() {
            var self = this,
                length = this.tips.content.length

            setInterval(function() {
                self.tips.index = self.randomInt(length)
            }, 15000)
        },
        handleInput(val) {
            this.dataSource = this.keywordsToArray()
        },
    },
    created: function() {
        var self = this
        // 在渲染之前提前算出所有的式神出现场所和数量
        var map = this.database.map

        for (var index of this.allShikigamis) {
            var name = index.key,
                shikigami = this.targetToShikigami(index.target)

            shikigami.local = map.map(function(items, parentIndex) {
                return items.sets.map(function(item, index) {
                    var count = null,
                        amount = 0

                    if (parentIndex == 0) {
                        var count = []

                        for (var target of item.sets) {
                            for (var floor of target.content) {
                                if (floor[0] == name) {
                                    count.push(floor[1])
                                } else {
                                    count.push(0)
                                }
                            }
                        }
                    } else if (parentIndex == 1) {
                        if (item.name == name) {
                            item.sets.map(function(target, childIndex) {
                                for (var floor of target.content) {
                                    if (floor[0] == name) {
                                        count += floor[1]
                                    }
                                }
                            })
                        }
                    } else if (parentIndex == 2) {
                        for (var target of item.sets) {
                            for (var floor of target.content) {
                                if (floor[0] == name) {
                                    count += floor[1]
                                }
                            }
                        }
                    }

                    amount = self.amount(count)

                    if (amount > 0) {
                        return [parentIndex, index + 1, count]
                    }
                })
            }).reduce(function(pre, cur) {
                return pre.concat(cur);
            }).filter(function(n) { // remove empty elements
                return n != undefined
            })
        }
    },
    mounted: function() {
        this.$nextTick(function () {
            this.changeTips()

            this.tips.index = this.randomInt(this.tips.content.length)
        })
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
#keyword{
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
#result  .plan{
    font-size: 1.8rem;
    margin-top: 1.5rem
}
#result .local {
    color: #e53935
}

#result .local>span {
    padding: 0.5rem;
    font-size: 1.8rem;
}
#result .skill{
    width: 900px;
    margin-bottom: 6rem;
}
#result .skill .detail{
    margin-bottom: 1rem
}
#result .skill .detail .header{
    border-bottom: 1px dashed #d1d1d1;
}
#result .skill .detail .header>div{
    padding: 12px 5px;
    line-height: 20px;
}

#result .skill ul{
    list-style-type: none;
    padding: 0;
}

#result .awakening,
#result .soul,
#result .floor{
    color: #e53935;
    font-size: 1.6rem;
}

#result .floor,
#result .soul,
#result .awakening .line{
    line-height: 3rem;
}
#result .awakening .material,
#result .soul .detail,
#result .floor>span{
    padding: 0.8rem
}

#result .wrap {
    margin-bottom: 1.5rem
}
.help{
    display: inline-block;
    padding: 8px;
    position: absolute;
    top: 16%;
}

.help .content{
    width: 200px;
    position: absolute;
bottom: 98%;
left: 50%;
padding-bottom: 2%;
border-radius: 4px;
box-shadow: 0 2px 15px rgba(0,0,0,.1);
background: #FFF;
-webkit-transform: translateX(-50%);
overflow: hidden;
pointer-events: none;
}
.help .icon{
    display: block;
    width: 20px;
    height: 20px;
    color: #9e9e9e;
    background: aliceblue;
    text-align: center;
    cursor: pointer;
    font-style: normal;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .25s
}
.fade-enter, .fade-leave-active {
  opacity: 0
}
.center{
    display: block;
    margin-left: auto;
    margin-right: auto;
}
.break{
    white-space: pre-wrap;
}
.inline-block{
    display: inline-block;
}
.text-center{
        text-align: center;
}
</style>
