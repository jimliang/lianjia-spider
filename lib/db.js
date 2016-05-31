/**
 * Created by jimliang on 2016/5/31 0031.
 */
const mongo = require('mongodb');
const promise = module.exports = mongo.connect("mongodb://localhost:27017/lianjia");

process.on('SIGINT', ()=> {
    promise.then(db=> {
        db.close(()=> {
            console.log('database has closed')
        })
    })
})