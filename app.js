const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const auth = require('./modules/authentication.js');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


/*
Post data: user.code, user.username, user.email, user.password,
  user.passwordConf
Responses: Incomplete data, Passwords do not match, Code used or does not exist,
  Username exists, Registration successful
*/
app.post('/register', (req, res, next) => {
  const user = req.body.user;
  auth.register(user)
    .then((result) => res.send(result))
    .catch((err) => next(err));
});

/*
Post data: user.username, user.password
Responses: Incomplete data, Login Successful, Username or password incorrect
*/
app.post('/login', (req, res, next) => {
  const user = req.body.user;
  auth.login(user)
    .then((result) => res.send(result))
    .catch((err) => next(err));
});

app.use((err, req, res, next) => {
  console.log(err);
  res.sendStatus(500);
  next();
});

app.listen(3000, () => console.log('App listening on port 3000!'));
