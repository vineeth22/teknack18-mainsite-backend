const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const sessions = require('client-sessions');
const auth = require('./modules/authentication.js');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const sessionMiddleware = sessions({
  cookieName: 'sess',
  secret: 'dws9iu3r42mx1zvh6k5m',
  duration: 2 * 60 * 60 * 1000,
  activeDuration: 1000 * 60 * 60,
  cookie: {
    domain: 'teknack.in',
    path: '/',
    httpOnly: true, // when true, cookie is not accessible from javascript
    secureProxy: true // when true, cookie will only be sent over SSL.
    // use key 'secureProxy' instead if you handle SSL not in your node process
  }
});

app.use(sessionMiddleware);

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
    .then((result) => {
      if (result === 'Login Successful') {
        req.sess.username = user.username;
      }
      res.send(result);
    })
    .catch((err) => next(err));
});

app.get('/logout', (req, res) => {
  req.sess.username = null;
  res.sendStatus(200);
});

app.use((err, req, res, next) => {
  console.log(err);
  res.sendStatus(500);
  next();
});

app.listen(3000, () => console.log('App listening on port 3000!'));
