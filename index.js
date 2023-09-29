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

let messages = {
    error: '',
    success: ''
}

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', async function(req, res){
    res.render('index', {regs: await database.viewAllPlates(), success: messages.success, error: messages.error
        });
});

app.post('/add_reg', async function(req, res){
    //Make sure a registration has been entered
    if(req.body.reg){
        //Extract the registration from the request object
        let reg = req.body.reg.toUpperCase();

        //Format testing
        function registrationTest(registrationNumber) {
            const regex = /^C[A-Z]\s\d{3}[-\s]?\d{3}$/ /*|| /^CK\s\d{4}$/ */;
            return regex.test(registrationNumber);
        }
        
        //Extract the prefix from the registration string
        let prefix = reg.substring(0, 2);

        //Check the reg prefix against the "allowedPrefix" method
        let prefixList = await database.allowedPrefix();
        let allowedList = [];
         
        for(let i = 0; i < prefixList.length; i++){
            allowedList.push(prefixList[i].reg_prefix);
        }

        if(registrationTest(reg) && allowedList.includes(prefix)){
            //Populate the database
            let addingResults = await database.addRegistration(reg, prefix);

            if(addingResults == 'Registration added successfully.'){
                messages.success = addingResults;
                messages.error = '';
            } else {
                messages.error = addingResults;
                messages.success = '';
            }
        } else {
            messages.error = 'Invalid registration';
            messages.success = ''; 
        }
         
    } else {
        messages.error = 'Enter a registration please!';
        messages.success = '';
    }
    res.redirect('/');
});

app.post('/town_regs', async function(req, res){
    let town = req.body.town;

    if(town == undefined){
        messages.error = 'Please select a town';
        messages.success = '';
        res.redirect('/');
    } else {
        if(town == 'all'){
            res.render('index', {regs: await database.viewAllPlates()})
        } else { //some town has been passed
            
            let townRegs = await database.viewAllFromTown(town);
            if(townRegs.length == 0){
                messages.error = `No registration from ${town} yet`;
                messages.success = '';
                res.render('index', {regs: townRegs, error: messages.error});
            } else { //At least one registration from this town has been found
                res.render('index', {regs: townRegs});
            }
        }
        
    } 
});

app.get('/reset', async function(req, res){
    await database.reset(); 
    //clear the messages
    messages.error = '';
    messages.success = '';
    res.redirect('/');
});

const port = 3000;
app.listen(port, function(){
    console.log(`Server running at port : ${port}`)
});