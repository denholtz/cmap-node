// Read-only access. Used for all access except to user table.
module.exports.dataRetrievalConfig = {
    server: "128.208.239.15",
    port: 1433,
    database: "Opedia",
    user: "ArmLab",
    password: "ArmLab2018",
    connectionTimeout: 50000,
    requestTimeout: 50000,
    pool: {
        idleTimeoutMillis: 50000,
        max: 100
    }
}

module.exports.userTableConfig = {
    server: "128.208.239.15",
    port: 1433,
    database: "Opedia",
    user: "Sa",
    password: "Jazireie08",
    connectionTimeout: 50000,
    requestTimeout: 50000,
    pool: {
        idleTimeoutMillis: 50000,
        max: 100
    }
}