# RaumplanX backend

![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)

There are two version of the backend:

## Local data-hosting or SQL-database

The standard version (configured in the .env file) is a local data-hosting.

## Frontend hosting

The frontend is served from the same server. All requests that do not have the `/api` prefix are served from the frontend (build).
