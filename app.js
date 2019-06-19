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

//Redirect docs domain to 
app.use((req, res, next) => {
    if(req.subdomains.includes('docs')){
        res.redirect(302, 'https://cmap.readthedocs.io/en/latest/');
    }
    next();
})

// Redirect www.simonscmap.io to simonscmap.io
app.use((req, res, next) => {
    if (req.headers.host.slice(0, 4) === 'www.') {
        var newHost = req.headers.host.slice(4);
        return res.redirect(302, req.protocol + '://' + newHost + req.originalUrl);
    }
    next();
});

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

// Usage metrics logging
app.use((req, res, next) => {
    req.cmapApiCallDetails.save();
});

app.listen(port, ()=>{console.log(`listening on port ${port}`)});