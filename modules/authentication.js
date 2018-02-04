'use strict';

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'teknack';
const assert = require('assert');
const bcrypt = require('bcrypt');
const saltRounds = 12;

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
        resolve('User inserted');
        conn.close();
      }).catch(reject);
    });
  });
});

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
          insertUser(user).then(resolve).catch(reject);
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

const user = {
  code: 'ASDFJ',
  username: 'testna',
  email: 'asd@asd.com',
  password: 'qwert',
  passwordConf: 'qwert'
};

// insertUser(user).then((result) => { console.log(result); }).catch((result) => { console.log(result); })
// register(user).then((result) => { console.log(result); }).catch((err) => { console.log(err); });

// promiseall.then((result) => { console.log(result) });
// usernameExists('testname').then((result) => console.log(result));
// codeValid('ASDFG').then((result) => console.log(result));
