// this script inserts codes to db
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://127.0.0.1:27017';
const dbName = 'teknack';

let codes = fs.readFileSync('Teknack-codes.csv');
codes = codes.toString().split('\n');
codes.forEach((code, i) => {
  codes[i] = {};
  codes[i].code = code;
});


MongoClient.connect(url).then(conn => {
  const db = conn.db(dbName);
  db.collection('users').insertMany(codes).then(r => {
    assert.equal(codes.length, r.insertedCount);
    conn.close();
    console.log('Done');
  }).catch((err)=> console.log(err));
});
