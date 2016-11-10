var config=require('./config');
var App = require('alidayu-node');
var app = new App(config.appKey, config.appSecret);

function sendMessage(param){
	app.smsSend({
		sms_type:'normal',
	    sms_free_sign_name: '取消订阅通知', //短信签名，参考这里 http://www.alidayu.com/admin/service/sign
	    sms_param: param,//短信变量，对应短信模板里面的变量
	    rec_num: '13132290863', //接收短信的手机号
	    sms_template_code: 'SMS_25710606' //短信模板，参考这里 http://www.alidayu.com/admin/service/tpl
	},function(err,info){
		if(err){
	        return console.log(err);
	    }
	    console.log(info);
	});
} 
//[注册验证]验证码123456，您正在注册成为测试网站用户，感谢您的支持！
module.exports=sendMessage;