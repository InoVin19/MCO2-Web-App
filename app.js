// import mysql from 'mysql2'

// const pool = mysql.createPool({
//     host: '127.0.0.1',
//     user: 'root',
//     password: '',
//     database: 'mco2'
// }).promise()

// const [result] = await pool.query("SELECT * FROM test_db LIMIT 1")
// console.log(result[0])

/*

    CODE DUMP

    app.get('/add', async (req, res) => {
    try {
        const data = 1;
        const secondaryNodeConnection = await util.promisify(secondaryNode.getConnection).bind(secondaryNode)();
        const query = util.promisify(secondaryNodeConnection.query).bind(secondaryNodeConnection);
        
        // Start transaction
        var log = { message: 'Starting Transaction', timestamp: new Date() };
        addToLog(log);
        console.log(log);
        await query('START TRANSACTION');
        
        const result = await query('INSERT INTO test_table (test_column) VALUES (?)', (data));
        log = { message: 'Inserting', timestamp: new Date() };
        addToLog(log);
        console.log('Inserting data:', data);
        
        // Commit transaction
        console.log('Committing transaction');
        await query('COMMIT');
        log = { message: 'Committing Transaction', timestamp: new Date() };
        addToLog(log);
        
        secondaryNodeConnection.release();
        
        if (result.affectedRows === 1) {
            console.log('Data inserted successfully');
            res.status(200).json({ message: 'Data inserted successfully' });
        } else {
            console.log('Failed to insert data');
            res.status(500).json({ message: 'Failed to insert data' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    console.log('Query uncommitted');
    });


    app.get('/appointments', async (req, res) => {
    try {
        const { region } = req.query;
        let node;
        if (region === 'visayas' || region === 'mindanao') {
            node = visayasMindanaoNode;
        } else if (region === 'luzon') {
            node = centralNode;
        } else {
            res.status(400).json({ message: 'Invalid region' });
            return;
        }
        const connection = await util.promisify(node.getConnection).bind(node)();
        const query = util.promisify(connection.query).bind(connection);
        const result = await query('SELECT * FROM appointments WHERE region = ?', region);
        connection.release();
        res.status(200).json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.post('/add', async (req, res) => {
    try {
        await addDataToTable(req, res, 'central');

    } catch (error) {

        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    console.log('Query uncommitted');
});

app.patch('/edit/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, region } = req.body;
        let node;
        if (region === 'visayas' || region === 'mindanao') {
            updateDataInTable(req, res, 'visayas-mindanao', id, data);
            updateDataInTable (req, res, 'central', id, data);
        } else if (region === 'luzon') {
            updateDataInTable(req, res, 'luzon', id, data);
            updateDataInTable(req, res, 'central', id, data);
        } else {
            console.log('Invalid region');
            res.status(400).json({ message: 'Invalid region' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await deleteDataFromTable(req, res, 'central', id);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

*/

// IMPORTS
import util from 'util';
import express from 'express';
import { createPool } from 'mysql2';
import { connect } from 'http2';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
const port = 3000;

// DATABASE CONNECTIONS
// central node database connection
const centralNode = createPool({
    connectionLimit: 10,
    host: 'ccscloud.dlsu.edu.ph',
    port: '20042',
    user: 'root',
    password: '12345678',
    database: 'appointments'
});

// visayas-mindanao database connection
const luzonNode = createPool({
    connectionLimit: 10,
    host: 'ccscloud.dlsu.edu.ph',
    port: '20043',
    user: 'root',
    password: '12345678',
    database: 'test_schema'
});

const visayasMindanaoNode = createPool({
    connectionLimit: 10,
    host: 'ccscloud.dlsu.edu.ph',
    port: '20044',
    user: 'root',
    password: '12345678',
    database: 'test_schema'
});

// APP ACTION FUNCTIONS

async function testConnections() {
    // test connection to centralNode pool
    const centralNodeConnection = util.promisify(centralNode.getConnection).bind(centralNode);
    try {
        const connection = await centralNodeConnection();
        console.log('Connected to centralNode pool');
        connection.release();
    } catch (err) {
        console.error('Error connecting to centralNode pool:', err);
    }

    // test connection to secondaryNode pool
    const secondaryNodeConnection = util.promisify(secondaryNode.getConnection).bind(secondaryNode);
    try {
        const connection = await secondaryNodeConnection();
        console.log('Connected to secondaryNode pool');
        connection.release();
    } catch (err) {
        console.error('Error connecting to secondaryNode pool:', err);
    }
}

// ADD APPOINTMENT
async function addDataToTable(req, res, node) {
  //const data = req.body;   **CHANGE IT TO THIS ONE WHEN THE TIME COMES
    const data = 1;

    if(node == 'central') {
        const nodeConnection = await util.promisify(centralNode.getConnection).bind(secondaryNode)();
    }
    else if(node == 'visayas-mindanao') {
        const nodeConnection = await util.promisify(visayasMindanaoNode.getConnection).bind(visayasMindanaoNode)();
    }
    else {
        const nodeConnection = await util.promisify(luzonNode.getConnection).bind(luzonNode)();
    }

    const query = util.promisify(nodeConnection.query).bind(nodeConnection);

    // add query to set isolation level at some point

    // start transaction
    await query('START TRANSACTION');

    // log start of transaction
    var log = { message: 'Starting Transaction', timestamp: new Date() };
    addToLog(log);
    console.log(log);

    // ** EDIT QUERY WHEN THE TIME COMES
    const result = await query('INSERT INTO test_table (test_column) VALUES (?)', (data));

    // log query
    log = { message: 'Inserting', timestamp: new Date() };
    addToLog(log);
    console.log('Inserting data:', data);

    // commit transaction
    console.log('Committing transaction');
    await query('COMMIT');

    // log commit
    log = { message: 'Committing Transaction', timestamp: new Date() };
    addToLog(log);

    // release connection when finished
    nodeConnection.release();

    if (result.affectedRows === 1) {
        console.log('Data inserted successfully');
        res.status(200).json({ message: 'Data inserted successfully' });
    } else {
        console.log('Failed to insert data');
        res.status(500).json({ message: 'Failed to insert data' });
    }
}

// EDIT APPOINTMENT
async function updateDataInTable(req, res, node, id, data) {
    if (node === 'central') {
        const nodeConnection = await util.promisify(centralNode.getConnection).bind(centralNode)();
    } else if (node === 'visayas-mindanao') {
        const nodeConnection = await util.promisify(visayasMindanaoNode.getConnection).bind(visayasMindanaoNode)();
    } else {
        const nodeConnection = await util.promisify(luzonNode.getConnection).bind(luzonNode)();
    }

    const query = util.promisify(nodeConnection.query).bind(nodeConnection);

    await query('START TRANSACTION');

    const log = { message: 'Starting Transaction', timestamp: new Date() };
    addToLog(log);
    console.log(log);

    const result = await query('UPDATE test_table SET test_column = ? WHERE id = ?', [data, id]);

    log = { message: 'Updating', timestamp: new Date() };
    addToLog(log);
    console.log('Updating data:', data);

    await query('COMMIT');

    console.log('Committing transaction');
    log = { message: 'Committing Transaction', timestamp: new Date() };
    addToLog(log);

    nodeConnection.release();

    if (result.affectedRows === 1) {
        console.log('Data updated successfully');
        res.status(200).json({ message: 'Data updated successfully' });
    } else {
        console.log('Failed to update data');
        res.status(500).json({ message: 'Failed to update data' });
    }
}

// DELETE APPOINTMENT
async function deleteDataFromTable(req, res, node, id) {
    if (node === 'central') {
        const nodeConnection = await util.promisify(centralNode.getConnection).bind(centralNode)();
    } else if (node === 'visayas-mindanao') {
        const nodeConnection = await util.promisify(visayasMindanaoNode.getConnection).bind(visayasMindanaoNode)();
    } else {
        const nodeConnection = await util.promisify(luzonNode.getConnection).bind(luzonNode)();
    }

    const query = util.promisify(nodeConnection.query).bind(nodeConnection);

    await query('START TRANSACTION');

    const log = { message: 'Starting Transaction', timestamp: new Date() };
    addToLog(log);
    console.log(log);

    const result = await query('DELETE FROM test_table WHERE id = ?', id);

    log = { message: 'Deleting', timestamp: new Date() };
    addToLog(log);
    console.log('Deleting data:', id);

    await query('COMMIT');

    console.log('Committing transaction');
    log = { message: 'Committing Transaction', timestamp: new Date() };
    addToLog(log);

    nodeConnection.release();

    if (result.affectedRows === 1) {
        console.log('Data deleted successfully');
        res.status(200).json({ message: 'Data deleted successfully' });
    } else {
        console.log('Failed to delete data');
        res.status(500).json({ message: 'Failed to delete data' });
    }
}



// * may have to add options to write to different log files (we might need 3, one for each database)
function addToLog(log) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const filePath = `${__dirname}/log.json`;
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading log file:', err);
            return;
        }
        
        let logs = [];
        try {
            logs = JSON.parse(data);
        } catch (err) {
            console.error('Error parsing log file:', err);
            return;
        }
        
        logs.push(log);
        
        fs.writeFile(filePath, JSON.stringify(logs), 'utf8', (err) => {
            if (err) {
                console.error('Error writing to log file:', err);
                return;
            }
            
            console.log('Log added to file');
        });
    });
}

// check if log is empty
async function checkLogIsEmpty() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const filePath = `${__dirname}/log.json`;

    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading log file:', err);
                reject(err);
                return;
            }

            let logs = [];
            try {
                logs = JSON.parse(data);
            } catch (parseError) {
                console.error('Error parsing log file:', parseError);
                reject(parseError);
                return;
            }

            console.log('Log size: ' + logs.length);

            if (logs.length > 0) {
                resolve(false);
            } else {
                
                resolve(true);
            }
        });
    });
}

// PERFORM RECOVERY
async function performRecovery() {
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const filePath = `${__dirname}/log.json`;
        
        fs.readFile(filePath, 'utf8', async (err, data) => {
            if (err) {
                console.error('Error reading log file:', err);
                return;
            }
            
            const logs = JSON.parse(data);
            
            //might have a shitty O() complexity
            while (logs.length > 0) {
                const log = logs.shift();
                try {
                    // call redo function here
                    // ...
                    console.log("Redoing " + log.message);
                    // Remove the log from the log file
                    // console.log(logs.length);
                } catch (error) {
                    console.error('Error redoing log:', error);
                }
            }

            // Save the updated logs to log.json
            fs.writeFile(filePath, JSON.stringify(logs), (err) => {
                if (err) {
                    console.error('Error writing to log file:', err);
                }
                else {
                    console.log('Recovery complete');
                }
            });
        });
    } catch (error) {
        console.error('Error during recovery:', error);
    }
}

// ASYNC FUNCTION
async function redoTransaction(transaction, region) {
    return new Promise(async (resolve, reject) => {
        try {
            let primaryNodeConnection;
            let secondaryNodeConnection;

            if (region === 'luzon') {
                primaryNodeConnection = centralNode;
                secondaryNodeConnection = luzonNode;
            } else if (region === 'visayasMindanao') {
                primaryNodeConnection = centralNode;
                secondaryNodeConnection = visayasMindanaoNode;
            }

            const result = await Promise.all([
                primaryNodeConnection.query('START TRANSACTION'),
                secondaryNodeConnection.query('START TRANSACTION'),

                // replace these with proper redo queries
                // ...
                primaryNodeConnection.query('SELECT * FROM appointments WHERE region = ?', region),
                secondaryNodeConnection.query('SELECT * FROM appointments WHERE region = ?', region),

                primaryNodeConnection.query('COMMIT'),
                secondaryNodeConnection.query('COMMIT')
            ]);

            if (result[2] && result[3]) {
                resolve(true);
            } else {
                resolve(false);
            }
        } catch (error) {
            reject(error);
        }
    });
}

// USAGE
/*
try {
    const result = await executeAsyncFunction();
    console.log(result);
} catch (error) {
    console.error("Error:", error);
}
*/

// SERVER ROUTES
/*
    Add Appointment

    Edit Appointment
        - Region
        - Type
        - Status
        - Virtual
    Delete Appointment
*/

// LANDING ROUTE
app.get('/', async (req, res) => {
    try {
        
        const logIsEmpty = await checkLogIsEmpty();
        
        if(logIsEmpty) {
            console.log('Log is empty, no recovery needed. Proceeding with transaction...');
        }
        else {
            console.log('Proceeding with recovery...');
            performRecovery();

            // call actual transaction here
        }
        
        res.send('Welcome to the MCO2 API');
    } catch (error) {
        console.error('Error:', error);
    }
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});