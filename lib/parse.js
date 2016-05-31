/**
 * Created by jimliang on 2016/5/31 0031.
 */
const cheerio = require('cheerio')

module.exports = html=> {
    const $ = cheerio.load(html)
    const lis = $('ul#house-lst li');
    if (lis.hasClass('list-no-data')) return [];
    const houseList = lis.get().map(li=> {
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