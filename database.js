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

    async function addRegistration(reg, prefix){
        if(reg.startsWith(prefix)){
            await database.none(`INSERT INTO registrations (registration, town_id) VALUES($1, $2)`, [reg, await getTownId(prefix)]);
        }
    }

    async function getTownId(prefix){
        let town = await database.oneOrNone('SELECT id FROM towns WHERE reg_prefix=$1', [prefix.toUpperCase()]);
        return town.id;
    }


    return{
        viewAllPlates,
        viewAllFromTown,
        addRegistration,
        getTownId
    }
}