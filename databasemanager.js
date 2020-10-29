const Keyv = require("keyv");
const keyvsqlite = require("@keyv/sqlite");
const keyv = new Keyv("sqlite://./database.sqlite");

exports.DB = keyv;