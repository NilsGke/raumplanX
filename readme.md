# Raumplan 2.0

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![SASS](https://img.shields.io/badge/SASS-hotpink.svg?style=for-the-badge&logo=SASS&logoColor=white)

<br>

![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)

[![Node.js CI](https://github.com/NilsGke/raumplanX/actions/workflows/node.js.yml/badge.svg)](https://github.com/NilsGke/raumplanX/actions/workflows/node.js.yml)

## What is the "RaumplanX"

The RaumplanX is a web-based application that allows you to have an overview of your office and the desks. You can assign people to the desks, edit and move them around relatively easily, create meeting rooms (with google calendar integration), and more.

## Whats different to the first version?

The new version is written in react and uses an express server as a backend, whereas the old version was written in plain javascript and used php for backend stuff. The new version also adapts to an SQL database, whereas the old version used json-files.
Design wise the new version is more modern and has a more modern look (including dark and light themes).

## Local setup

### Automated setup (recommended)

```
git clone https://github.com/NilsGke/raumplanX.git
cd ./raumplanX
npm run firstSetup

```

### Manual setup

```
git clone https://github.com/NilsGke/raumplanX.git

cd ./raumplanX/client/
npm install
npm run build

cd ..
npm install
npm run start
```
