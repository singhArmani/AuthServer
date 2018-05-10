// *** this is a very simple jwt authentication based node.js app

const jwt = require("jsonwebtoken");
const auth = require("basic-auth");
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

app.get("/api", (req, res) => {
  res.json({
    text: "my public api"
  });
});

app.use(function (req, res, next) {
  if (!req.headers.authorization) {
    return res.status(403).json({
      error: "No credentials sent!"
    });
  }
  next();
});

app.post("/api/login", (req, res) => {
  const user = auth(req);

  // hardcoded user {name: 'test', pass: 'react'}
  if (user.name === "test" && user.pass === "react") {
    // user is authenticated and now server sends a signed token back to client
    // client can store this token to the local storage and every time client asks for protected api resources,
    // it send token attached in authorization header with 'bearer' authentication scheme.
    const token = jwt.sign({
      user,
    }, "my_secret_key", {
        expiresIn: '2h' // setting the token expiry time to be 2h
      });
    res.json({
      token
    });
  } else {
    res.status(401).json({
      error: "Invalid Credentials"
    });
  }


});

// protected api
app.get("/api/protected", ensureToken, (req, res) => {
  // server verifies the token (verifies the client )
  jwt.verify(req.token, "my_secret_key", (err, data) => {
    if (err) {
      res.status(403).json({
        error: err
      });
    } else {
      res.json({
        text: `this is protected`,
        data: data
      });
    }
  });
});

// Middleware: it reads the token from the authorization header and set to req.token.
function ensureToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];

  if (bearerHeader) {
    req.token = bearerHeader.split(" ")[1];
    next();
  } else {
    return res.status(403).json({
      error: "No credentials sent!"
    });
  }
}

app.listen(8000, () => console.log("App listening on 8000...."));