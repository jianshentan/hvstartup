require('dotenv').config();
var express = require('express');
var router = express.Router();

var documentClient = require('documentdb').DocumentClient;
var client = new documentClient(process.env.DOCUMENT_DB_ENDPOINT, { "masterKey": process.env.DOCUMENT_DB_KEY });

function getCollectionLength(path, cb) {
  client.readDocuments(path).toArray(function(err, results) {
    if (err) {
      console.log(err);
    } else {
      cb(results.length);
    }
  }); 
}

function putDocument(path, index, data, cb) {
  client.createDocument(path, { id: index, content: data }, function(err, doc) {
    if (err) { 
      console.log(err); 
    } else {
      cb(doc);
    }
  }); 
}

/* serve the endpoint /submit */
router.get('/submit', function(req, res) {
  var data = {
    datetime: (new Date()).toString(),
    firstname: req.query.firstname,
    lastname: req.query.lastname,
    email: req.query.email,
    organization: req.query.organization,
    description: req.query.description
  }
  
  var path = 'dbs/hvstartup/colls/form-requests';
  getCollectionLength(path, function(length) {
    putDocument(path, length.toString(), data, function(doc) {
      console.log("successfully added document to collection!");      
      res.sendStatus(200);
    });
  });
 
});

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.mobile == true) {
    res.render('index', { mobile: "true" });
  } else {
    res.render('index', { mobile: "false" });
  }
});

module.exports = router;
