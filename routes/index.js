require('dotenv').config();
var express = require('express');
var router = express.Router();

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
 
  // sendgrid to send email
  var helper = require('sendgrid').mail;
  var from_email = new helper.Email('bot@hellovelocity.com');
  var to_email = new helper.Email('friend@hellovelocity.com');
  var subject = 'New request from design.hellovelocity.com!';
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
