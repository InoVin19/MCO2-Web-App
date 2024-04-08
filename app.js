const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const port = 3000;

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'ccscloud.dlsu.edu.ph',
    port: '20043',
    user: 'root',
    password: '12345678',
    database: 'appointments_luzon'
});

app.use(bodyParser.json());


// GET ALL APPOINTMENTS
app.get('/', (req, res) => {
    pool.query('SELECT * FROM appointments_luzon LIMIT 100', (error, results, fields) => {
        if (error) {
          console.error('Error executing query:', error);
          res.status(500).send('Internal Server Error');
          return;
        }
        
        // Render fetched data in a template or send as JSON response
        res.json(results); // Assuming you want to send the fetched data as JSON
    });
});


// GET SPECIFIC APPOINTMENTS
app.get('/:id', (req, res) => {
    const id = req.params.id;
    pool.query('SELECT * FROM appointments_luzon WHERE id = ?', [id], (error, results, fields) => {
        if (error) {
            console.error('Error executing query:', error);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Render fetched data in a template or send as JSON response
        res.json(results); // Assuming you want to send the fetched data as JSON
    });
})


// EDIT APPOINTMENT
app.post('/:id', (req, res) => {
    const id = req.params.id;
    const { pxid, clinicid, doctorid, apptid, status, TimeQueued, QueueDate, StartTime, EndTime, type, isVirtual, island, clinic } = req.body


    // Check if object values have updated values
    // Build SQL script for every value that was edited

    pool.query('UPDATE appointments_luzon SET name = ? WHERE id = ?', [newName, id], (error, results, fields) => {
        if (error) {
            console.error('Error executing query:', error);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Render updated data in a template or send as JSON response
        res.json(results); // Assuming you want to send the updated data as JSON
    });
});


// ADD APPOINTMENT
app.get('/write', (req, res) => {
    pool.query('INSERT INTO test_table (test_column) VALUES (1);', (error, results, fields) => {
        if (error) {
          console.error('Error executing query:', error);
          res.status(500).send('Internal Server Error');
          return;
        }
        
        // Render fetched data in a template or send as JSON response
        res.json(results); // Assuming you want to send the fetched data as JSON
    });
});

app.post('/delete/:id', () => {
    const id = req.params.id;

    pool.query('DELETE FROM appointments_luzon WHERE id = ?', [id], (error, results, fields) => {
        if (error) {
            console.error('Error executing query:', error);
            res.status(500).send('Internal Server Error');
            return;
          }
          
          // Render fetched data in a template or send as JSON response
          res.json(results); // Assuming you want to send the fetched data as JSON
    })


})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});