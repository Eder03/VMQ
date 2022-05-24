const { MongoClient } = require("mongodb");
const Db = process.env.ATLAS_URI;

//MongoDB Connection mit der Datenbank URL in der.env Datei wird erstellt
const client = new MongoClient(Db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
 
var _db;
 
module.exports = {
    //Verbindung zu Datenbank wird hergestellt
  connectToServer: function (callback) {
    client.connect(function (err, db) {
      // Überprüfung ob die DB existiert
      if (db)
      {
        _db = db.db("VMQ");
        console.log("Successfully connected to MongoDB."); 
      }
      return callback(err);
         });
  },
 
  getDb: function () {
    return _db;
  },
};