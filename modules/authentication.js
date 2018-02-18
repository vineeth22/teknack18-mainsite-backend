'use strict';

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017';
const dbName = 'teknack';
const assert = require('assert');
const bcrypt = require('bcrypt');
const saltRounds = 12;

// helper functions

// returns true if username exists
const usernameValid = username => new Promise((resolve, reject) => {
  MongoClient.connect(url).then(conn => {
    const db = conn.db(dbName);
    db.collection('users').find({ username: username }).toArray()
      .then((result) => {
        resolve(result.length === 0);
        conn.close();
      });
  }).catch(reject);
});

// returns true if code exists and code not already used
const codeValid = code => new Promise((resolve, reject) => {
  MongoClient.connect(url).then(conn => {
    const db = conn.db(dbName);
    db.collection('users').find({ code: code }).toArray()
      .then((result) => {
        resolve(result.length === 1 && !result[0].username);
        conn.close();
      });
  }).catch(reject);
});

// returns true if password matches
const passwordMatch = (password, passwordConf) => new Promise((resolve) => {
  resolve(password === passwordConf);
});

const insertUser = user => new Promise((resolve, reject) => {
  bcrypt.hash(user.password, saltRounds).then((hash) => {
    MongoClient.connect(url).then(conn => {
      const db = conn.db(dbName);
      db.collection('users').updateOne(
        { code: user.code },
        { $set: { username: user.username, email: user.email, password: hash } }
      ).then(r => {
        assert.equal(1, r.matchedCount);
        assert.equal(1, r.modifiedCount);
        resolve();
        conn.close();
      }).catch(reject);
    });
  });
});

// main functions

const register = user => new Promise((resolve, reject) => {
  if (user.code &&
    user.username &&
    user.email &&
    user.password &&
    user.passwordConf) {
    Promise.all([passwordMatch(user.password, user.passwordConf),
      codeValid(user.code),
      usernameValid(user.username)])
      .then((result) => {
        if (!result.includes(false)) {
          insertUser(user).then(resolve('Registration successful')).catch(reject);
        } else if (result[0] === false) {
          resolve('Passwords do not match');
        } else if (result[1] === false) {
          resolve('Code used or does not exist');
        } else if (result[2] === false) {
          resolve('Username exists');
        }
      })
      .catch(reject);
  } else {
    resolve('Incomplete data');
  }
});

const login = user => new Promise((resolve, reject) => {
  if (user.username && user.password) {
    MongoClient.connect(url).then(conn => {
      const db = conn.db(dbName);
      db.collection('users').find({ username: user.username }).toArray().then((result) => {
        if (result.length === 1) {
          bcrypt.compare(user.password, result[0].password).then((res) => {
            if (res === true) {
              resolve('Login Successful');
            } else {
              resolve('Username or password incorrect');
            }
          }).catch(reject);
        } else {
          resolve('Username or password incorrect');
        }
        conn.close();
      })
        .catch(reject);
    }).catch(reject);
  } else {
    resolve('Incomplete data');
  }
});

// testing
/*
const user = {
  code: 'ASDFK',
  username: 'testing',
  email: 'asd@asd.com',
  password: 'asdfg',
  passwordConf: 'asdfg'
};
*/
/*
login(user).then((result) => {
  console.log(result); }).catch((result) => { console.log(result); });
insertUser(user).then((result) => {
  console.log(result); }).catch((result) => { console.log(result); })
register(user).then((result) => { console.log(result); }).catch((err) => { console.log(err); });

promiseall.then((result) => { console.log(result) });
usernameExists('testname').then((result) => console.log(result));
codeValid('ASDFG').then((result) => console.log(result));
*/
module.exports.register = register;
module.exports.login = login;
