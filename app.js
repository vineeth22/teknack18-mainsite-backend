const express = require('express');
const app = express();
const auth = require('./modules/authentication.js');

const user = {
  code: 'ASDFK',
  username: 'testing',
  email: 'asd@asd.com',
  password: 'asdfg',
  passwordConf: 'asdfg'
};

app.post('/register', (req, res, next) => {
  auth.register(user)
    .then((result) => {
      res.send(result);
    })
    .catch(next);
});


app.post('/login', (req, res, next) => {
  auth.login(user)
    .then(res.send)
    .catch(next);
});

app.use((err, req, res, next) => {
  //console.log(err);
  //console.log(req);
  //console.log(res);
// console.log(err);
 res.sendStatus(500);
});

app.listen(3000, () => console.log('App listening on port 3000!'));
