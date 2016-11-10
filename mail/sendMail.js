var nodemailer = require('nodemailer');
var config = require('./config');
var transporter = nodemailer.createTransport(config);


function sendMail(data) {
    // send mail with defined transport object
	transporter.sendMail(data, function(error, info){
	    if(error){
	        return console.log(error);
	    }
	    console.log('Message sent: ' + info.response);
	});
};

module.exports=sendMail;
