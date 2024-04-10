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


SAMPLE JSON FOR...

ADD CHANGE RECOVERY

[{
    "action": "add",
    "pxid": "sample_pxid",
    "clinicid": "sample_clinicid",
    "doctorid": "sample_doctorid",
    "apptid": "321",
    "status": "sample_status",
    "TimeQueued": "sample_timeQueued",
    "QueueDate": "sample_QueueDate",
    "StartTime": "sample_StartTime",
    "EndTime": "sample_EndTime",
    "type": "sample_type",
    "isVirtual": "1",
    "island": "visayas",
    "clinic": "sample_clinic",
    "region": "sample_region"
}, 
{
    "action": "add",
    "pxid": "sample_pxid",
    "clinicid": "sample_clinicid",
    "doctorid": "sample_doctorid",
    "apptid": "456",
    "status": "sample_status",
    "TimeQueued": "sample_timeQueued",
    "QueueDate": "sample_QueueDate",
    "StartTime": "sample_StartTime",
    "EndTime": "sample_EndTime",
    "type": "sample_type",
    "isVirtual": "1",
    "island": "visayas",
    "clinic": "sample_clinic",
    "region": "sample_region"
}
]

EDIT CHANGE RECOVERY

[{
    "action": "edit",
    "type": "QWEQWE",
    "status": "abc",
    "isVirtual": "0",
    "apptid": "456",
    "island": "visayas"
}
]

DELETE CHANGE RECOVERY
[
{
    "action": "delete",
    "apptid": "456",
    "island": "visayas"
}
]

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
    database: 'log_test'
});

// visayas-mindanao database connection
const luzonNode = createPool({
    connectionLimit: 10,
    host: 'ccscloud.dlsu.edu.ph',
    port: '20043',
    user: 'root',
    password: '12345678',
    database: 'log_test'
});

const visayasMindanaoNode = createPool({
    connectionLimit: 10,
    host: 'ccscloud.dlsu.edu.ph',
    port: '20044',
    user: 'root',
    password: '12345678',
    database: 'log_test'
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
            const logIndexes = [];
            
            //might have a shitty O() complexity
            for (const log of logs) {
                let result = await redoTransaction(log, log.island);
                if (result) {
                    logIndexes.push(logs.indexOf(log));
                }
            }

            // Remove log indexes
            for (let i = logIndexes.length - 1; i >= 0; i--) {
                const index = logIndexes[i];
                logs.splice(index, 1);
            }

            // Save the updated logs to log.json
            fs.writeFile(filePath, JSON.stringify(logs), (err) => {
                if (err) {
                    console.error('Error writing to log file:', err);
                } else {
                    console.log('Recovery complete');
                }
            });

        });
    } catch (error) {
        console.error('Error during recovery:', error);
    }
}

async function redoAddTransaction(transaction, region) {
    return new Promise(async (resolve, reject) => {
        try {

            let primaryNodeConnection;
            let secondaryNodeConnection;
            let result;
            // CONNECT TO DATABASES
            try {
                primaryNodeConnection = await util.promisify(centralNode.getConnection).bind(centralNode)();
                // Rest of the code...
            } catch (error) {
                console.log('Failed to connect to primary node database');
                console.log(error);
                resolve(false);
            }

            try {
                console.log("region: " + region);
                if (region === 'luzon') {
                    secondaryNodeConnection = await util.promisify(luzonNode.getConnection).bind(luzonNode)();
                } else if (region === 'visayas' || region === 'mindanao') {
                    secondaryNodeConnection = await util.promisify(visayasMindanaoNode.getConnection).bind(visayasMindanaoNode)();
                }
            } catch (error) {
                console.log('Failed to connect to secondary node database');
                console.log(error);
                resolve(false);
            }

            console.log(transaction);
            
            
            
            try {
                // check check primary node
                const queryPrimary = util.promisify(primaryNodeConnection.query).bind(primaryNodeConnection);
                result = await queryPrimary(
                    'SELECT * FROM appointments WHERE apptid = ?', transaction.apptid);

                if (result.length > 0) {
                    console.log('Rows returned:', result.length);
                    resolve(true);
                } else {
                    console.log('No rows returned');
                    result = await Promise.all([
                        queryPrimary('START TRANSACTION'),
                        queryPrimary('INSERT INTO appointments (pxid, clinicid, doctorid, apptid, status, TimeQueued, QueueDate, StartTime, EndTime, type, isVirtual, island, clinic, region) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                            [
                                transaction.pxid,
                                transaction.clinicid,
                                transaction.doctorid,
                                transaction.apptid,
                                transaction.status,
                                transaction.TimeQueued,
                                transaction.QueueDate,
                                transaction.StartTime,
                                transaction.EndTime,
                                transaction.type,
                                transaction.isVirtual,
                                transaction.island,
                                transaction.clinic,
                                transaction.region
                            ]),
                        queryPrimary('COMMIT')
                    ]);
                }
            } catch (error) {
                console.log('Failed to check primary node');
                console.log(error);
                resolve(false);
            }

            try {
                // check secondary node
                const querySecondary = util.promisify(secondaryNodeConnection.query).bind(secondaryNodeConnection);
                result = await querySecondary('SELECT * FROM appointments_visayas_mindanao WHERE apptid = ?', transaction.apptid)

                if (result.length > 0) {
                    console.log('Rows returned:', result.length);
                    resolve(true);
                } 
                else {{
                    console.log('No rows returned');
                    result = await Promise.all([
                        querySecondary('START TRANSACTION'),
                        querySecondary('INSERT INTO appointments_visayas_mindanao (pxid, clinicid, doctorid, apptid, status, TimeQueued, QueueDate, StartTime, EndTime, type, isVirtual, island, clinic, region) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
                        [
                            transaction.pxid, 
                            transaction.clinicid, 
                            transaction.doctorid, 
                            transaction.apptid, 
                            transaction.status,
                            transaction.TimeQueued, 
                            transaction.QueueDate, 
                            transaction.StartTime, 
                            transaction.EndTime,
                            transaction.type,
                            transaction.isVirtual, 
                            transaction.island, 
                            transaction.clinic,
                            transaction.region
                        ]),
                        querySecondary('COMMIT')
                    ]);
                }}
            } catch (error) {
                console.log('Failed to check secondary node');
                console.log(error);
                resolve(false);
            }

            let finalResultPrimary = await queryPrimary(
                'SELECT * FROM appointments WHERE pxid = ? AND clinicid = ? AND doctorid = ? AND apptid = ? AND status = ? AND TimeQueued = ? AND QueueDate = ? AND StartTime = ? AND EndTime = ? AND type = ? AND isVirtual = ? AND island = ? AND clinic = ? AND region = ?',
                [
                    transaction.pxid, 
                    transaction.clinicid, 
                    transaction.doctorid, 
                    transaction.apptid, 
                    transaction.status,
                    transaction.TimeQueued, 
                    transaction.QueueDate, 
                    transaction.StartTime, 
                    transaction.EndTime,
                    transaction.type,
                    transaction.isVirtual, 
                    transaction.island, 
                    transaction.clinic,
                    transaction.region
                ]
            )

            let finalResultSecondary = await querySecondary(
                'SELECT * FROM appointments_visayas_mindanao WHERE pxid = ? AND clinicid = ? AND doctorid = ? AND apptid = ? AND status = ? AND TimeQueued = ? AND QueueDate = ? AND StartTime = ? AND EndTime = ? AND type = ? AND isVirtual = ? AND island = ? AND clinic = ? AND region = ?',
                [
                    transaction.pxid, 
                    transaction.clinicid, 
                    transaction.doctorid, 
                    transaction.apptid, 
                    transaction.status,
                    transaction.TimeQueued, 
                    transaction.QueueDate, 
                    transaction.StartTime, 
                    transaction.EndTime,
                    transaction.type,
                    transaction.isVirtual, 
                    transaction.island, 
                    transaction.clinic,
                    transaction.region
                ]
            )

            if (finalResultPrimary.length > 0 && finalResultSecondary.length > 0) {
                console.log('Successfully Recovered Add Transaction Change');
                resolve(true);
            }
            else {
                console.log('Failed to recover Add Transaction Change');
                resolve(false);
            }

            primaryNodeConnection.release();
            secondaryNodeConnection.release();
            
        } catch (error) {
            resolve(false);
            console.log('Failed to recover Add Transaction Change');
            console.log(error);
        }
    });
}

async function redoEditTransaction(transaction, region) {
    return new Promise(async (resolve, reject) => {
        try {

            let primaryNodeConnection;
            let secondaryNodeConnection;
            let result;
            // CONNECT TO DATABASES
            try {
                primaryNodeConnection = await util.promisify(centralNode.getConnection).bind(centralNode)();
            } catch (error) {
                console.log('Failed to connect to the central node database');
                console.log(error);
                resolve(false);
            }

            
            try {
                console.log("region: " + region);
                if (region === 'luzon') {
                    secondaryNodeConnection = await util.promisify(luzonNode.getConnection).bind(luzonNode)();
                } else if (region === 'visayas' || region === 'mindanao') {
                    secondaryNodeConnection = await util.promisify(visayasMindanaoNode.getConnection).bind(visayasMindanaoNode)();
                }
            } catch (error) {
                console.log('Failed to connect to the secondary node database');
                console.log(error);
                resolve(false);
            }

            console.log(transaction);
            
            
            
            // check check primary node
            try {
                const queryPrimary = util.promisify(primaryNodeConnection.query).bind(primaryNodeConnection);
                let finalResultPrimary = await queryPrimary(
                    'UPDATE appointments SET region = ?, type = ?, status = ?, isVirtual = ? WHERE apptid = ?',
                    [
                        transaction.region,
                        transaction.type,
                        transaction.status,
                        transaction.isVirtual,
                        transaction.apptid
                    ]
                );
                if (finalResultPrimary.affectedRows > 0) {
                    console.log(finalResultPrimary.message);
                    console.log('Successfully Recovered Edit Transaction Change');
                    resolve(true);
                } else {
                    console.log(finalResultPrimary.message);
                    console.log('Failed to recover Edit Transaction Change');
                    resolve(false);
                }
            } catch (error) {
                resolve(false);
                console.log('Failed to recover Edit Transaction Change');
                console.log(error);
            }

            try {
                const querySecondary = util.promisify(secondaryNodeConnection.query).bind(secondaryNodeConnection);
                let finalResultSecondary = await querySecondary(
                    'UPDATE appointments_visayas_mindanao SET region = ?, type = ?, status = ?, isVirtual = ? WHERE apptid = ?',
                    [
                        transaction.region,
                        transaction.type,
                        transaction.status,
                        transaction.isVirtual,
                        transaction.apptid
                    ]
                );
                if (finalResultSecondary.affectedRows > 0) {
                    console.log(finalResultSecondary.message);
                    console.log('Successfully Recovered Edit Transaction Change');
                    resolve(true);
                } else {
                    console.log(finalResultSecondary.message);
                    console.log('Failed to recover Edit Transaction Change');
                    resolve(false);
                }
            } catch (error) {
                resolve(false);
                console.log('Failed to recover Edit Transaction Change');
                console.log(error);
            }

            if ((finalResultPrimary.affectedRows > 0) && finalResultSecondary.affectedRows > 0) {
                console.log('Successfully Recovered Edit Transaction Change');
                resolve(true);
            }
            else {
                console.log('Failed to recover Edit Transaction Change');
                resolve(false);
            }

            primaryNodeConnection.release();
            secondaryNodeConnection.release();
            
        } catch (error) {
            resolve(false);
            console.log('Failed to recover Edit Transaction Change');
            console.log(error);
        }
    });
}

async function redoDeleteTransaction(transaction, region) {
    return new Promise(async (resolve, reject) => {
        try {

            let primaryNodeConnection;
            let secondaryNodeConnection;
            let result;

            // CONNECT TO DATABASES

            try {
                primaryNodeConnection = await util.promisify(centralNode.getConnection).bind(centralNode)();
            } catch (error) {
                console.log('Failed to connect to the central node database');
                console.log(error);
                resolve(false);
            }

            
            try {
                console.log("region: " + region);
                if (region === 'luzon') {
                    secondaryNodeConnection = await util.promisify(luzonNode.getConnection).bind(luzonNode)();
                } else if (region === 'visayas' || region === 'mindanao') {
                    secondaryNodeConnection = await util.promisify(visayasMindanaoNode.getConnection).bind(visayasMindanaoNode)();
                }
            } catch (error) {
                console.log('Failed to connect to the secondary node database');
                console.log(error);
                resolve(false);
            }

            console.log(transaction);
            
            
            
            // action here
            // ...
            try {
                const queryPrimary = util.promisify(primaryNodeConnection.query).bind(primaryNodeConnection);
                result = await queryPrimary(
                    'SELECT * FROM appointments WHERE apptid = ?', transaction.apptid)

                if (result.length > 0) {
                    console.log('Rows returned:', result.length);
                    result = await Promise.all([
                        queryPrimary('START TRANSACTION'),
                        queryPrimary('DELETE FROM appointments WHERE apptid = ?', transaction.apptid),
                        queryPrimary('COMMIT')
                    ]);
                } 
                else {
                    console.log('No rows returned');
                }
            } catch (error) {
                console.log('Failed to execute primary node query');
                console.log(error);
                resolve(false);
            }

            try {
                const querySecondary = util.promisify(secondaryNodeConnection.query).bind(secondaryNodeConnection);
                result = await querySecondary('SELECT * FROM appointments_visayas_mindanao WHERE apptid = ?', transaction.apptid)

                if (result.length > 0) {
                    console.log('Rows returned:', result.length);
                    result = await Promise.all([
                        querySecondary('START TRANSACTION'),
                        querySecondary('DELETE FROM appointments_visayas_mindanao WHERE apptid = ?', transaction.apptid),
                        querySecondary('COMMIT')
                    ]);
                } 
                else {
                    console.log('No rows returned');
                }
            } catch (error) {
                console.log('Failed to execute secondary node query');
                console.log(error);
                resolve(false);
            }

            //
            let finalResultPrimary = await queryPrimary('SELECT * FROM appointments WHERE apptid = ?', transaction.apptid)
            let finalResultSecondary = await querySecondary('SELECT * FROM appointments_visayas_mindanao WHERE apptid = ?', transaction.apptid)
            
            if(finalResultPrimary == 0 && finalResultSecondary == 0) {
                resolve(true);
            }
            else {
                resolve(false);
            }

            primaryNodeConnection.release();
            secondaryNodeConnection.release();
            
        } catch (error) {
            resolve(false);
            console.log('Failed to recover Edit Transaction Change');
            console.log(error);
        }
    });
}

// redoing Transactions
async function redoTransaction(transaction) {
    return new Promise(async (resolve, reject) => {
        try {
            if(transaction.action == "add"){
                let result = await redoAddTransaction(transaction, transaction.island);
                resolve(result);
            }
            else if(transaction.action == "edit") {
                let result = await redoEditTransaction(transaction, transaction.island);
                resolve(result);
            }
            else if(transaction.action == "delete") {
                let result = await redoDeleteTransaction(transaction, transaction.island);
                resolve(result);
            }
            
        } catch (error) {
            resolve(false);
            console.log('Failed to insert data');
            console.log(error);
        }
    });
}

// LANDING ROUTE
app.get('/', async (req, res) => {
    try {

        const logIsEmpty = await checkLogIsEmpty();
        
        // if i want to do transactions of a visayas appointment

        let nodeConnection;
        

        if(logIsEmpty) {
            console.log('Log is empty, no recovery needed. Proceeding with transaction...');

            // transaction here
            // ... 
        }
        else {
            console.log('Proceeding with recovery...');
            performRecovery();

            // call actual transaction here
            // ...
        }
        
        res.send('Welcome to the MCO2 API');
    } catch (error) {
        console.error('Error:', error);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});