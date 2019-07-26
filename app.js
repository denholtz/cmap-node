const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('./middleware/passport');

const userRoutes = require('./routes/user');
const dataRetrievalRoutes = require('./routes/dataRetrieval');
const catalogRoutes = require('./routes/catalog');

const ApiCallDetails = require('./models/ApiCallDetail');

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors({origin:true, credentials:true}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
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

// This is a high-maintenance  and potentially inaccurete way of serving the 
// app on routes managed by the front end router like /visualize. We should 
// come up with a better solution.
app.get('*', (req, res, next) => {
    console.log(req.path);
    if(req.path.search('user') === -1 && req.path.search('dataretrieval') === -1 && req.path.search('catalog') === -1){
        console.log('Met condition');
        res.sendFile(__dirname + '/public/index.html');
        return next();
    }
    return next();
})

// Usage metrics logging
app.use((req, res, next) => {
    req.cmapApiCallDetails.save();
    next();
});

app.use((err, req, res, next) => {
    console.log('Error handler!');
    console.log(err);
    if(!res.headersSent) res.status(500).send();
})

var server = app.listen(port, ()=>{console.log(`listening on port ${port}`)});

// Super long timeout for testing
server.timeout = 84000000;