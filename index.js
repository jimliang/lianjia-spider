/**
 * Created by jimliang on 2016/5/30 0030.
 */
const cheerio = require('cheerio')
const fetch = require('node-fetch')
const mongo = require('mongodb');

const parse = html=> {
    const $ = cheerio.load(html)
    const houseList = $('ul#house-lst li').get().map(li=> {
        let $li = $(li);
        let title = $li.find('.info-panel h2 a')
        let con = $li.find('.con').text()  // "华强南租房/中楼层(共34层)/板塔结合"

        return {
            _id: $li.attr('data-id'),
            link: title.attr('href'),
            title: title.text(),
            region: $li.find('.region').text().trim(), // 京基御景华城
            zone: $li.find('.zone').text().trim(), // 1室1厅
            meters: parseInt($li.find('.meters').text().trim()),//.replace(/平米/,''), // xx平米
            direction: $li.find('.where span').last().text().trim(),
            con: con,
            where: con.split('/')[0].replace(/租房/, ''), // 华强南租房
            chanquan: $li.find('.chanquan [class$=-ex]').get().map((node)=>$(node).text()),
            price: parseInt($li.find('.price .num').text()), // 租金 元/月
            pricePre: $li.find('.price-pre').text().replace(/更新/, '').trim(), // price更新时间
            caputureTime: +new Date
        }
    })
    return houseList
}


const dbPromise = mongo.connect("mongodb://localhost:27017/lianjia");
const save = (items)=> {
    return dbPromise
        .then(db=> {
            let house = db.collection('house')
            return Promise.all(items.map(item=>house.insertOne(item, {w: 1, upsert: true})))
        })

}
process.on('SIGINT', ()=> {
    dbPromise.then(db=> {
        db.close(()=> {
            console.log('database has closed')
        })
    })
})

const capture = (tag = '/zufang/', page = 1, next)=> {

    fetch(`http://sz.lianjia.com${tag}pg${page}/`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.63 Safari/537.36'
        }
    }).then(res=>res.text())
        .then(parse)
        .then(save)
        .then(()=> {
            console.log(`page ${page},tag ${tag}: insert`)
            next()
        })
        .catch((err)=> {
            console.error(page, tag, err.message)
            next(err)
        })

}
function main() {


    let data = require('./data')
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