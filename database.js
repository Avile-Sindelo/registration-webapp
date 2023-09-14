export default function Database(database){
    async function viewAllPlates(){
        return await database.manyOrNone('SELECT * FROM registrations')
    }

    async function viewAllFromTown(town){
        return await database.manyOrNone(`SELECT towns.town_name,
                                            registrations.registration
                                            FROM towns
                                            JOIN registrations
                                            ON towns.id=registrations.town_id
                                            WHERE town_name=$1;`, [town]);
    }

    async function duplicate(reg){
        let regCount = await database.one('SELECT count(*) FROM registrations WHERE registration=$1', [reg]);
        if(regCount.count > 0){
            return true;
        } else {
            return false;
        }
    }

    async function addRegistration(reg, prefix){
        if(reg.startsWith(prefix) && await duplicate(reg) == false){
            await database.none(`INSERT INTO registrations (registration, town_id) VALUES($1, $2)`, [reg, await getTownId(prefix)]);
            return 'Registration added successfully.';
        } else if(!(reg.startsWith(prefix))){
            return 'Please make sure the prefix matches the registration';
        } else if(await duplicate(reg)){
            return 'Duplicate records are not allowed';
        }
    }

    async function getTownId(prefix){
        let town = await database.oneOrNone('SELECT id FROM towns WHERE reg_prefix=$1', [prefix.toUpperCase()]);
        if(town != null){
            return town.id;
        } else {
            return 'No town was found for that registration';
        }
    }

    async function allowedPrefix(){
       let prefs = await database.manyOrNone('SELECT reg_prefix FROM towns');
       return prefs;
    }

    async function reset(){
        await database.none('DELETE FROM registrations');
    }

    return{
        viewAllPlates,
        viewAllFromTown,
        addRegistration,
        getTownId,
        duplicate,
        allowedPrefix,
        reset
    }
}