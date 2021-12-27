"use strict";

const path = require("path");
const express = require("express");

const app = express();

app.use(express.static(__dirname));
app.get("*", (req, res) => res.sendFile(path.join(__dirname + "/main.html")));
app.listen(4622);