const sql = require('mssql');
const dbConfig = require('../config/dbConfig');
const JsonTransformStream = require('../models/JsonTransformStream');

const Transform = require('stream').Transform
const ndjson = require('ndjson');

// Calls stored named procedure with the supplied parameters, and streams response to client.

class CustomTransform extends Transform {
    constructor(){
        super();
        this._customBuffer = '';
        this.flag = false;
    }


    _transform(chunk, encoding, done) {
        this._customBuffer += chunk.toString();
        if(this._customBuffer.length >= 500){            
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

module.exports =  async (argSet, res) => { 
    let pool = await new sql.ConnectionPool(dbConfig.dataRetrievalConfig).connect();
    let request = await new sql.Request(pool);

    let ndjsonStream = ndjson.serialize();
    let transformer = new CustomTransform();

    request.pipe(ndjsonStream)
        .pipe(transformer)
        .pipe(res)

    // let jsonTransformStream = new JsonTransformStream(res);

    // request.pipe(jsonTransformStream);
    request.input('tableName', sql.NVarChar, argSet.tableName);
    request.input('fields', sql.NVarChar, argSet.fields);
    request.input('dt1', sql.NVarChar, argSet.dt1);
    request.input('dt2', sql.NVarChar, argSet.dt2);
    request.input('lat1', sql.NVarChar, argSet.lat1);
    request.input('lat2', sql.NVarChar, argSet.lat2);
    request.input('lon1', sql.NVarChar, argSet.lon1);
    request.input('lon2', sql.NVarChar, argSet.lon2);
    request.input('depth1', sql.NVarChar, argSet.depth1);
    request.input('depth2', sql.NVarChar, argSet.depth2);

    request.execute(argSet.spName);
    request.on('error', err => res.end(JSON.stringify(err)));

    // await jsonTransformStream.awaitableStreamEnd;
};