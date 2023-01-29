// Import the modules we need
var express = require ('express')
var session = require ('express-session'); 
var ejs = require('ejs')
var bodyParser= require ('body-parser')
const mysql = require('mysql');
var validator = require ('express-validator'); 
const expressSanitizer = require('express-sanitizer'); 

// Create the express application object
const app = express()
const port = 8000
app.use(bodyParser.urlencoded({ extended: true }))

// Set up css
app.use(express.static(__dirname + '/public'));

//express sanitiser
app.use(expressSanitizer());

// Define the database connection
const db = mysql.createConnection ({
    host: 'localhost',
    user: 'root',
    password: 'Lethalzephyr23!',
    database: 'calorieDB'
});
// Connect to the database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});
global.db = db;


//added for session management
app.use (session({
    secret: 'somerandomstuff', //Compulsory parameter- this is used to sign the session ID cookie
    resave: false, //Forces the session to be saved back to the session store
    saveUninitialized: false, //forces unintialized  sessions to be saved at the store
    cookie: {
        expires:600000 //cookie expiration 
    }}));

// Set the directory where Express will pick up HTML files 
// __dirname will get the current directory
app.set('views', __dirname + '/views');

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs');

// Tells Express how we should process html files
// We want to use EJS's rendering engine    
app.engine('html', ejs.renderFile);

// Define our data
var appData = {appName: "Recipe Buddy"}

// Requires the main.js file inside the routes folder passing in the Express app and data as arguments.  All the routes will go in this file
require("./routes/main")(app, appData);

// Start the web app listening
app.listen(port, () => console.log(`Example app listening on port ${port}!`))