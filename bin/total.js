/**
 * Created by jimliang on 2016/6/1 0001.
 */

function dataGroup() {
    return require('../lib/db').then(db=> new Promise((resolve, reject)=> {
        db.collection('house').group({where: 1}, {}, {count: 0}, (curr, result) => {
                result.count++
            }, (err, result)=> {
                db.close()
                err ? reject(err) : resolve(result)
            }
        )
    }))
}

// 布吉=>龙岗
function dataMap() {
    const data = require('../lib/data')
    const t = {}
    Object.keys(data).forEach(key=> {
        let value = data[key]
        if (value.childs) {
            Object.keys(value.childs).forEach(key2=> {
                let value2 = value.childs[key2]
                t[value2] = value.name
            })
        }
    })
    return t
}

// 南山=>233
function total(array) {
    const map = dataMap()
    const t = {}
    array.forEach(obj=> {
        let totalWhere = map[obj.where]
        if (!t[totalWhere]) {
            t[totalWhere] = 0
        }
        t[totalWhere] += obj.count
    })
    return t
}

// [{where:'南山',count:233}]
function total2(d) {
    return Object.keys(d).map(key=> {
        return {where: key, count: d[key]}
    }).sort((a, b)=>b.count - a.count)
}

function totalTable() {
    const a = total2()
    console.log(a.map(obj=>obj.where).join('|'))
    console.log(a.map(obj=>obj.count).join('|'))
}


dataGroup()
    .then(total)
    .then(total2)
    .then(a=> {
        console.log(a.map(obj=>obj.where).join('|'))
        console.log(a.map(obj=>obj.count).join('|'))
    }).catch(err=> {
    console.error(err)
})



