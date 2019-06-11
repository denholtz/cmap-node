const sql = require('mssql');

const mapPathToRouteId = require('../config/routeMapping');
const userDBConfig = require('../config/dbConfig').userTableConfig;

const apiCallsTable = "tblApi_Calls";
const apiCallDetailsTable = "tblApi_Call_Details";

module.exports = class ApiCallRecord{
    constructor(req){
        this.ip = req.ip;
        this.hostName = req.headers.host;
        this.routeID = mapPathToRouteId(req.path);
    }

    // Save the usage details to SQL
    async save(){
        let pool = await new sql.ConnectionPool(userDBConfig).connect();
        let request = await new sql.Request(pool);

        request.input('Ip_Address',sql.VarChar, this.ip);
        request.input('Host_Name', sql.VarChar, this.hostName);
        request.input('User_ID', sql.Int, this.userID);
        request.input('Route_ID', sql.Int, this.routeID);
        request.input('Auth_Method', sql.Int, this.authMethod);
        if(this.apiKeyID) request.input('Api_Key_ID', sql.Int, this.apiKeyID);

        request.on('error', (err) => console.log(err));

        var query = `INSERT INTO ${apiCallsTable} (
            Ip_Address, 
            Host_Name, 
            User_ID, 
            Route_ID, 
            ${this.apiKeyID ? 'Api_Key_ID,' : ''} 
            Auth_Method) VALUES (
                @Ip_Address,
                @Host_Name,
                @User_ID,
                @Route_ID,
                ${this.apiKeyID ? '@Api_Key_ID,' : ''}
                @Auth_Method
            )
            
            SELECT SCOPE_IDENTITY() as id`
        
        try {
            var result = await request.query(query);
            var newRowID = result.recordset[0].id;
        } catch (e) {return console.log(e)}

        // Create call details row on data retrieval routes only
        if(Math.floor(this.routeID / 100) === 3){
            request = await new sql.Request(pool);

            request.input('Sproc_Args', sql.VarChar, this.sprocArgs || null);
            request.input('Query', sql.VarChar, this.query || null);

            request.on('error', (err) => console.log(err));

            query = `INSERT INTO ${apiCallDetailsTable} (
                Api_Call_ID,
                Stored_Procedure_Parameters,
                Query
            ) VALUES (
                ${newRowID},
                @Sproc_Args,
                @Query
            )`

            request.query(query);
        }
    }
}