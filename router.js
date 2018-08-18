/**
  *
  *@author Franz Weidmann aequalitas@outlook.de
  *
  */


"use strict";

const fs = require("fs");

module.exports = app => {
  app.get("*", (req, res) => {
    fs.readFile("main.html", "utf8", (err, html) => {
        if (err) {
            console.log("ERROR OPEN PAGE");
            console.log(err);
            res.send("Sorry, something went wrong.");
        } else
            res.send(html);
    })
  });

}
