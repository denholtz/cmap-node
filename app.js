const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./routes/user');
const dataRetrievalRoutes = require('./routes/dataRetrieval');
const catalogRoutes = require('./routes/catalog');
const cookieParser = require('cookie-parser');
const sql = require('mssql');
const dbConfig = require('./config/dbConfig');

const app = express();
const port = process.env.PORT || 8080;

const passport = require('./middleware/passport');
const ApiCallDetails = require('./models/ApiCallDetail');

module.exports.pool = new sql.ConnectionPool(dbConfig.dataRetrievalConfig).connect();

app.use(cors({origin:true, credentials:true}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());

// Redirect www.simonscmap.io to simonscmap.io
app.use((req, res, next) => {
    if (req.headers.host.slice(0, 4) === 'www.') {
        console.log('redirected www');
        var newHost = req.headers.host.slice(4);
        return res.redirect(302, req.protocol + '://' + newHost + req.originalUrl);
    }
    next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

// Attaching call details to request object for usage tracking
app.use((req, res, next) => {
    req.cmapApiCallDetails = new ApiCallDetails(req);
    next();
})

// Routes
app.use('/user', userRoutes);
app.use('/dataretrieval', passport.authenticate(['headerapikey', 'jwt'], {session: false}), dataRetrievalRoutes);
app.use('/catalog', catalogRoutes);
app.use('/authtest', passport.authenticate(['local', 'headerapikey', 'jwt'], {session:false}), (req, res, next) => {res.json(req.user); next()});

// Add usage metrics logging middleware
app.use((req, res, next) => {
    req.cmapApiCallDetails.save();
});

// Add custom error-handling with Winston logging

console.log('testing');
app.listen(port, ()=>{console.log(`listening on port ${port}`)});