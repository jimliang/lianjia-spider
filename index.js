/**
 * Created by jimliang on 2016/5/30 0030.
 */
const fetch = require('node-fetch')

const parse = require('./lib/parse')

const dbPromise = require('./lib/db');

const save = (items)=> {
    return new Promise((resolve, reject)=> {
        dbPromise.then(db=> {
            let house = db.collection('house')
            let num = items.length, updates = 0, inserts = 0

            for (let item of items) {
                let _id = item._id;
                if (!_id) return reject(new Error('_id is null: ' + JSON.stringify(item)))
                delete item._id;
                house.updateOne({_id: _id}, {$set: item}, {w: 1, upsert: true}, (err, result)=> {
                    if (err) console.warn(err)
                    else result.result.nModified == 1 ? updates++ : inserts++
                    if (--num === 0) {
                        resolve({inserts, updates})
                    }
                })
            }
        })
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
    let tags = []
    let page = 0, tagIndex = 0;

    Object.keys(data).forEach(key=> {
        tags = tags.concat(Object.keys(data[key].childs))
    })

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