/**
  *
  *@author Franz Weidmann https://github.com/Aequalitas
  *
  */


"use strict";

const PORT = 50022;
const http = require("http");
const express = require("express");

const app = express();
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));

require("./router.js")(app);

http.createServer(app).listen(PORT, "127.0.0.1", err => {
    if (err)
        throw err;
    else
        console.log(`Server started on http://127.0.0.1:${PORT}...`);
});
