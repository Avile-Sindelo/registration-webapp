import Database from "../database.js";
import assert from 'assert';
import pgp from 'pg-promise';


const connectionString = process.env.DATABASE_URL || 'postgres://wfvgcjkj:yf-poQPnYsVABiOj7y8wd1aDj3I7Qv2V@trumpet.db.elephantsql.com/wfvgcjkj?ssl=true';
const postgresP = pgp();
const db = postgresP(connectionString);

describe('Database tests for the Registration webapp', function(){
    this.timeout(10000);
    beforeEach(async function(){
        // clean the registration table before each test run
        await db.none("delete from registrations;");
    });

    it('should test if the function is able to add a registration in the database', async function(){
        let database = Database(db);
        
        assert.equal('Registration added successfully.', await database.addRegistration('CA 453958', 'CA'));
    });
    
    it('should test if the function returns the appropriate error if the does not match the prefix', async function(){
        let database = Database(db);
        
        assert.equal('Please make sure the prefix matches the registration', await database.addRegistration('Cj 452-054', 'CA'));
    });

    it('should test if the function returns the appropriate error if the registrstion number is not within the supported format', async function(){
        let database = Database(db);
        
        assert.equal('No town was found for that registration', await database.addRegistration('CX 452-054', 'CX'));
    });
    
    it('should test if the function returns the appropriate error if the registrstion number is already in the in database', async function(){
        let database = Database(db);
        await database.addRegistration('CA 453-453', 'CA');
        await database.addRegistration('CA 453-453', 'CA');
        assert.equal('Duplicate records are not allowed', await database.addRegistration('CA 453-453', 'CA'));
    });
    
    it('should test if the function is able to reset the registrations in the database', async function(){
        let database = Database(db);
        await database.addRegistration('CA 453-453', 'CA');
        await database.addRegistration('CJ 093-008', 'CJ');
        await database.addRegistration('CL 003453', 'CL');
        await database.addRegistration('CZ 000 453', 'CZ');
        let allPlatesBeforeReset = await database.viewAllPlates();
        
        assert.equal(4, allPlatesBeforeReset.length);
        
        await database.reset();

        let allPlatesAfterReset = await database.viewAllPlates();
        assert.equal(0, allPlatesAfterReset.length);
    });
});