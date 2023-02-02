const path = require('path');
const express = require('express');
//import express session
const session = require('express-session');
const exphbs = require('express-handlebars');
const helpers = require('./utils/helpers');

const app = express();
const PORT = process.env.PORT || 3001;

const sequelize = require('./config/connection');
//set up sessions
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const sess = {
    secret: 'super secret secret',
    cookie: {},
    resave: false,
    saveUninitialized: true,
    store: new SequelizeStore({
        db: sequelize,
    })
};

app.use(session(sess));

//handlebars
const hbs = exphbs.create({helpers});

//express which template engine to use
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(require('./controllers'))

app.listen(PORT, () => {
    console.log(`App now listening on port ${PORT}!`)
    sequelize.sync({ force: false })
    .then(function(err) {
        console.log('It worked!');
      }, function (err) { 
             console.log('An error occurred while creating the table:', err);
})});