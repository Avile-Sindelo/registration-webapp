import express from 'express';
import { engine } from 'express-handlebars';
import bodyParser from 'body-parser';
import pgp from 'pg-promise';
import Database from './database.js';

const app = express();
const connectionString = process.env.DATABASE_URL || 'postgres://wfvgcjkj:yf-poQPnYsVABiOj7y8wd1aDj3I7Qv2V@trumpet.db.elephantsql.com/wfvgcjkj?ssl=true';
const postgresP = pgp();
const db = postgresP(connectionString);
const database = Database(db);


app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));


app.get('/', async function(req, res){
    
    res.render('index');
});

const port = 3000;
app.listen(port, function(){
    console.log(`Server running at port : ${port}`)
});