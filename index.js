/**
 * Created by jimliang on 2016/5/30 0030.
 */
const fetch = require('node-fetch')

const parse = require('./lib/parse')

const dbPromise = require('./lib/db');

const save = (items) => {
    return dbPromise.then(db => {
        let house = db.collection('house')
        let updates = 0, inserts = 0

        let promises = items.map(item => {
            let _id = item._id
            if (!_id) {
                console.log('_id is null: ' + JSON.stringify(item))
                return
            }
            delete item._id
            return house
                .updateOne({_id: _id}, {$set: item}, {w: 1, upsert: true})
                .then(result => void result.result.nModified == 1 ? updates++ : inserts++)
        })

        return Promise.all(promises).then(() => ({inserts, updates}))
    })
}

const capture = (tag = '/zufang/', page = 1, next)=> {

    fetch(`http://sz.lianjia.com${tag}pg${page}/`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.63 Safari/537.36'
        }
    }).then(res=>res.text())
        .then(parse)
        .then(items=> {
            if (!items || items.length === 0) {
                next()
            } else {
                return save(items).then((obj)=> {
                    console.log(`page ${page},tag ${tag}: insert ${obj.inserts}, update ${obj.updates}`)
                    next()
                })
            }
        })
        .catch((err)=> {
            console.error(page, tag, err.message)
            next(err)
        })

}
function main() {
    let data = require('./lib/data')
    let page = 0, tagIndex = 0
    let tags = Object.keys(data)
        .map(key => Object.keys(data[key].childs))
        .reduce((a,b) => a.concat(b))

    function next() {
        page++;
        if (page > 100) {
            page = 1
            tagIndex++
        }
        if (tags[tagIndex]) {
            setTimeout(()=> {
                capture(tags[tagIndex], page, next)
            }, 0)
        }

    }

    next()

}

main()