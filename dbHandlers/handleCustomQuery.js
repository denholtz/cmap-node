const sql = require('mssql');
const dbConfig = require('../config/dbConfig');
const JsonTransformStream = require('../models/JsonTransformStream');
const ndjson = require('ndjson');
var globalPool = require('../app');
const zlib = require('zlib');
const Transform = require('stream').Transform

class CustomTransform extends Transform {
    constructor(){
        super();
        this._customBuffer = '';
        this.flag = false;
    }


    _transform(chunk, encoding, done) {
        this._customBuffer += chunk.toString();
        if(this._customBuffer.length >= 4500){            
            this.push(this._customBuffer);
            this._customBuffer = '';
        }
        done();
    }

    _flush(done){
        if(this._customBuffer.length > 0) this.push(this._customBuffer);
        done();
    }
}

module.exports =  async (query, res) => { 
    let pool = await globalPool.pool;
    let request = await new sql.Request(pool);

    const ndjsonStream = ndjson.serialize();
    const transformer = new CustomTransform();
    const gzip = zlib.createGzip();

    request.pipe(ndjsonStream)
        .pipe(transformer)
        .pipe(gzip)
        .pipe(res)

    // let jsonTransformStream = new JsonTransformStream(res);

    // request.pipe(jsonTransformStream);

    res.writeHead(200, {
        'Transfer-Encoding': 'chunked',
        'charset' : 'utf-8',
        'Content-Type': 'application/json',      
        'Content-Encoding': 'gzip'            
    })
    
    let start = new Date();
    
    request.query(query);
    request.on('error', err => {res.end(JSON.stringify(err))});
    
    request.on('done', () => {
        console.log(`${query} ---- finished in:`)
        console.log(new Date() - start);
    })
};