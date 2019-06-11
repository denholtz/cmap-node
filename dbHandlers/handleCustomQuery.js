const sql = require('mssql');
const dbConfig = require('../config/dbConfig');
const JsonTransformStream = require('../models/JsonTransformStream');
const ndjson = require('ndjson');

module.exports =  async (query, res) => { 
    let pool = await new sql.ConnectionPool(dbConfig.dataRetrievalConfig).connect();
    let request = await new sql.Request(pool);

    // let jsonTransformStream = new JsonTransformStream(res);

    // request.pipe(jsonTransformStream);

    res.writeHead(200, {
        'Transfer-Encoding': 'chunked',
        'charset' : 'utf-8',
        'Content-Type': 'application/json',            
    })

    let ndjsonStream = ndjson.serialize();

    request.pipe(ndjsonStream);
    ndjsonStream.pipe(res);
    
    request.query(query);
    console.log('send query');
    request.on('error', err => {res.end(JSON.stringify(err))});
    // await jsonTransformStream.awaitableStreamEnd;
};