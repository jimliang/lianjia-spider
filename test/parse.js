/**
 * Created by jimliang on 2016/5/31 0031.
 */

const fs = require('fs')
const path = require('path')
const parse = require('../lib/parse')
const assert = require('assert')


describe('parse', ()=> {

    it('parse items', ()=> {
        assert.equal(parse(fs.readFileSync(path.join(__dirname, 'test.html'))).length, 30)
    })

    it('parse empty item', ()=> {
        assert.equal(parse(fs.readFileSync(path.join(__dirname, 'test2.html'))).length, 0)
    })
})