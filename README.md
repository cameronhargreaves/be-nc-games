Hello :)

Creating the Environment Variables

Summary of what the project is :
This project is an example backend for a video game reviewing site, where users can set a review and comment on that review with their own comments, and can vote positively or negatively on each.

Install Instructions:

Git clone https://github.com/cameronhargreaves/be-nc-games

“Npm init -y” - Initialised NPM
“Npm I” - Installs all NPM Packages
“Npm run setup-dbs” - Initialises DB
“Npm run seed” - Seeds DB
“Npm t” - Runs Jest Tests

Environment files :
Create 2 files

- .env.development
- .env.test

The files should contain :
.env.test - ‘PGDATABASE=nc_games_test’
.env.development - ‘PGDATABASE=nc_games’

With the database names being appropriate for the testing and actual databases.

Minimum Node and Postgres Version :
This program was created with Node version 8.19.2 and Postgres version 14.5
