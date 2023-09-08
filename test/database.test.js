import Database from "../database.js";
import assert from 'assert';
import pgp from 'pg-promise';


const connectionString = process.env.DATABASE_URL || 'postgres://wfvgcjkj:yf-poQPnYsVABiOj7y8wd1aDj3I7Qv2V@trumpet.db.elephantsql.com/wfvgcjkj?ssl=true';
const postgresP = pgp();
const db = postgresP(connectionString);

describe('Database tests for the Registration webapp', function(){
    this.timeout(4000);
    beforeEach(async function(){
        // clean the registration table before each test run
        await db.none("delete from registrations;");
    });

    it('should test if the function is able to add a registration in the database', async function(){
        let database = Database(db);
        await database.addRegistration('CA 453958', 'CA');
        assert.deepEqual(await database.viewAllPlates(), []);
    });
});