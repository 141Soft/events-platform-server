# EVENTS PLATFORM SERVER

## This README compliments the frontend instructions

### About
This is the backend server referenced by the project found at https://github.com/141Soft/events-platform
You can use this to provide routes and image storage for the frontend in conjunction with a mySQL database.

### Setup
A basic suite of tests is provided on npm run test which I encourage you to use when you have completed the setup steps to verify the endpoints will work.

Before starting I recommend configuring the following environment variables:
- MYSQL_HOST    the host location for your database
- MYSQL_USER    the username used to login to this database
- MYSQL_PASSWORD    the corresponding password
- MYSQL_DATABASE    the database name for holding events
- MYSQL_SESSION_DB  the database name for managing sessions
- MYSQL_PORT    the port corresponding to your hosted database
- SESSION_KEY   the name to attach to the session token
- SESSION_SECRET    the secret used for the hash
- CORS_ORIGIN   location of your frontend used to allow access
- PORT

To make the next steps easier, first run npm install and ensure you have the necessary packages.

Next I would recommend configuring your databases. You'll need to create a db for the events and the sessions, you can give them those names or something more descriptive if you prefer. The sessions table will be managed automatically providing you pass in the correct db above. To configure the events database you will need to make some tables, an example of the necessary tables can be found in the 'schema.sql' file, you can create these yourself or if you are already connected to the database host you can use the DB_Helper function '.schama(schemapath)' and simply pass in the provided schema.sql.

When your databases are configured you can go ahead and run the test script if you wish, this should test the major endpoints. As a warning, this test script will drop and recreate tables and data, so I would recommend doing this before you begin to insert any data. This script should remove any leftover data in the tables but you should confirm this before moving on, as the leftover data will not work with the frontend.

The last thing you will need to do if you are inserting your own data manually, is to add an admin user to the users table. Follow the schema in schema.sql to do this, the password should be stored as a hash by using the function found in hashing.js, and the isVerified and isAdmin properties should be set to 1.

At this point, if your schema is in place and your tables are empty you can run 'npm start', the server will then begin to listen for requests.

### Usage
If you would like to preconfigure your tables with some data, you'll need to follow the schema. Each event will have an automatically generated id you don't need to worry about, this is used internally to reference the event for future operations. Each event will have up to 3 tags held in the eventTags table as a collection of id and tag pairs. Additionally events have a thumbnail which is relative path to image in the uploads folder it intends to fetch. If you're manually creating events you will need to create an uploads folder at the top level if it does not already exist, and then insert your events with the relative path to the image.jpg file you're placing in there.

A number of methods can be found on the DB_Helper class to help build additional database interactions.

There are some inactive endpoints within this project that correspond to future functionality.

### Version
Tested against Node v23.4.0
