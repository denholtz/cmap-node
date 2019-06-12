// Read-only access. Used for all access except to user table.
module.exports.dataRetrievalConfig = {
    server: process.env.DBIP,
    port: process.env.DBPORT,
    database: "Opedia",
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    connectionTimeout: 50000,
    requestTimeout: 50000,
    pool: {
        idleTimeoutMillis: 50000,
        max: 100
    }
}
