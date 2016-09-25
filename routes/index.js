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
  
  // sendgrid to send email
  var helper = require('sendgrid').mail;
  var from_email = new helper.Email('bot@hellovelocity.com');
  var to_email = new helper.Email('friend@hellovelocity.com');
  var subject = '[testing] New request from design.hellovelocity.com!';
  var body = "You have a new collaboration request! \n\n" + 
             "Name: " + data.firstname + ", " + data.lastname + "\n\n" +
             "Email: " + data.email + "\n\n" +
             "Organization: " + data.organization + "\n\n" +
             "Description: " + data.description + "\n\n" + 
             "-- hv bot <3";
  var content = new helper.Content('text/plain', body);
  var mail = new helper.Mail(from_email, subject, to_email, content);
 
  var sg = require('sendgrid')(process.env.SENDGRID_KEY);
  var request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON(),
  });
  
  sg.API(request, function(error, response) {
    console.log(response.statusCode);
    console.log(response.body);
    console.log(response.headers);
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
