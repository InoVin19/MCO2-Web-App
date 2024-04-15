# SeriousMD Transaction Management Web Application

## Project Details:
This project is an application of learnings in Distributed Database Design, Concurrency Control and Consistency, and Global Failure and recovery. The output is a web application that takes these concepts and implements them in a web application that simulates the management of appointments.

This application is deployed on https://mco2-web-app.onrender.com

Alt link: mco2-web-app-production.up.railway.app

## Technology Stack:
- #### Tailwind CSS
- #### grid.js
- #### Node.js
- #### MySQL

## SeriousMD Dataset:
For this project, the SeriousMD Dataset was used to populate data for transactions in Luzon, Visayas, and Mindanao. From here, the following columns were used/manipulated:
- Appointment ID
- Region
- Schedule
- Appointment Status
- isVirtual
- Island

## The Web Application:
The Transaction Management Application is a simple website that allows users to Create, Search, Update, and Delete appointments. The list of appointments are displayed in a table format and can be filtered through search. From here, appointment details can be updated
such as isVirtual, status, and schedule. New appointments can also be created with a unique appointment ID. Finally, existing appointments can be deleted within the edit menu.

## Distributed Database Design:
The database was fragmented into three separate nodes. For this, Horizontal Fragmentation was used, where the following nodes were set up: One master node containing all rows for appointments, an auxiliary node containing Luzon appointments, and an auxiliary node containing Visayas and Mindanao appointments. As for data replication, a multi-master replication system was employed, allowing users to read and write to all nodes concurrently.

## Concurrency Control and Consistency:
To keep both the master node and the auxiliary nodes updated with each others' values, operations that are run through one web server are also applied in the other web server. This maintains consistency between both nodes. As for concurrency control, the isolation level for all transactions is set to "read committed" as application data is categorical, meaning read and write operations are not reliant on a current value to apply changes. As such, concurrent transactions are resolved by reflecting the later-committed value (With the exception of deleted applications)

## Global Failure and Recovery:
In the case of global failure, an algorithm was designed to adhere to the deferred log-based recovery strategy. This particular variant aims to reduce redundancy by only having to redo changes. It is important to note that subroutines within the algorithm ensure that change redo’s are idempotent. This is done by logging changes onto a JSON file in order, stored within the web server, which also acts as the recovery manager before executing the transactions.Each item in the log file includes the type of change, whether it is add, edit, or delete, as well as the new values for each field or attribute. 

The recovery routine is done every time a transaction request is sent to the web server. It first checks whether the log file is empty. If the log file is empty, it is treated as a checkpoint, meaning the transaction request can proceed immediately. If the log file has changes, the recovery routine is run before the following transaction can proceed

The recovery routine attempts to redo all the changes onto the necessary nodes (central and Luzon nodes for Luzon appointment transaction changes, and central and Visayas-Mindanao nodes for Visayas-Mindanao appointment transaction changes). A redo at- tempt is considered successful if all the necessary queries (including the commit query) are able to be executed without errors in both nodes, which could all be detected by the back-end in the web server. If a redo attempt is successful, that change is removed from the log file, otherwise, it is kept. The same process is done when executing a transaction, if it is detected by the web server as successful, it removes it from the log file, otherwise, it keeps it.

## Credits
This application was developed by the following users:
- @InoVin19
- @nagarerukaze
- @riki-11
- @PJLeonida

## Acknowledgments and Disclaimer
This application is not being used for commercial use. The purpose of this product is purely academic.
