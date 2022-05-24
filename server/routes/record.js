const express = require("express");


// Wird genutzt um die API Endpoint Routen zu setzen und sich zu verbinden
const recordRoutes = express.Router();

// DB Connection
const dbo = require("../db/conn");

// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;


// Alle Datenbank Einträge werden mittels GET zurückgegeben
recordRoutes.route("/getAll").get(function (req, res) {
  let db_connect = dbo.getDb("VMQ");
  db_connect
    .collection("Music")
    .find().sort({game: 1}).collation({locale: "en"})
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});

recordRoutes.route("/getGames").get(function (req, res) {
  let db_connect = dbo.getDb("VMQ");
  db_connect
    .collection("Music")
    .find().sort({game: 1}).project({game:1, _id:0})
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});

// POST request um Datenbankeinträge hinzuzufügen
recordRoutes.route("/addMusic").post(function (req, response) {
    let db_connect = dbo.getDb();
    let musicObj = {
      //Strings
      game: req.body.game,
      series: req.body.series,

      //Songs Object
      songs: req.body.songs,

      //Arrays
      platforms: req.body.platforms,
      genres: req.body.genres,

      //Strings + Boolean
      publisher: req.body.publisher,
      developer: req.body.developer,
      approved: false

    };
    db_connect.collection("Music").insertOne(musicObj, function (err, res) {
      if (err) throw err;
      response.json(res);
    });
  });

  recordRoutes.route("/update").post(function (req, response) {
    let db_connect = dbo.getDb();
    let myquery = { game: req.body.game};
    let newvalues = {
      $push: {
        songs: req.body.songs
      },
    };
    db_connect
      .collection("Music")
      .updateOne(myquery, newvalues, function (err, res) {
        if (err) throw err;
        console.log("1 document updated");
        response.json(res);
      });
  });

  recordRoutes.route("/approveGame").post(function (req, response) {
    let db_connect = dbo.getDb();
    let myquery = { approved: false};
    let newvalues = {
      $set: {
        approved: true
      },
    };
    db_connect
      .collection("Music")
      .updateMany(myquery, newvalues, function (err, res) {
        if (err) throw err;
        console.log(res.modifiedCount + " games succesfully approved");
        response.json(res);
      });
  });

  recordRoutes.route("/del").delete((req, response) => {
    let db_connect = dbo.getDb();
    let myquery = { approved: false};
    db_connect.collection("Music").deleteMany(myquery, function (err, obj) {
      if (err) throw err;
      console.log("1 document deleted");
      response.json(obj);
    });
  });

  

module.exports = recordRoutes;