const sql = require('mssql');
const ndjson = require('ndjson');
const zlib = require('zlib');

var pools = require('./dbPools');
const CustomTransformStream = require('../utility/CustomTransformStream');

// Calls stored named procedure with the supplied parameters, and 
// streams response to as gzipped ndjsonclient.
module.exports =  async (argSet, res) => { 
    let pool = await pools.dataReadOnlyPool;
    let request = await new sql.Request(pool);

    const ndjsonStream = ndjson.serialize();
    const transformer = new CustomTransformStream();
    const gzip = zlib.createGzip();

    res.writeHead(200, {
        'Transfer-Encoding': 'chunked',
        'charset' : 'utf-8',
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip'        
    })

    request.pipe(ndjsonStream)
        .pipe(transformer)
        .pipe(gzip)
        .pipe(res)

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

    // .pipe does not close on error so we need to close all the streams conditionally when the response ends

    request.execute(argSet.spName);
    request.on('error', err => res.end(JSON.stringify(err)));
};