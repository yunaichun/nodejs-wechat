'use strict'

//引入path模块
var path=require('path'); 
//引入读写模块
var util=require('./libs/util')

/*//中间件
var wechat=require('./wechat/g');*/

//定义一个文本文件:存储票据【存储在当前目录】
var wechat_file=path.join(__dirname,'./config/wechat.txt');
//定义一个文本文件:存储jsapi_ticket【存储在当前目录】
var wechat_ticket_file=path.join(__dirname,'./config/wechat_ticket.txt');
//注册自带
var config={
	wechat:{
		/*//我的公众号
		appID:'',
		appSecret:'',*/
		 
		//测试公众号
		appID:'wx6ad1b2adb57f14be',
        appSecret:'2df6fc3a133d9c18efdc38dda3591d06',
        
		token:'imooc1111',
		getAccessToken:function(){//获取票据
			//获取票据:返回Promise对象
			return util.readFileAsync(wechat_file);
		},
		saveAccessToken:function(data){//存储票据
			console.log('更新后的js对象格式的token:',data);
			//将data转化成字符串
			data=JSON.stringify(data);
			console.log('转换成JSON对象格式的token:',data);
			//存储票据:返回Promise对象
			return util.writeFileAsync(wechat_file,data);
		},
		getTicket:function(){//获取票据
			//获取票据:返回Promise对象
			return util.readFileAsync(wechat_ticket_file);
		},
		saveTicket:function(data){//存储票据
			console.log('更新后的js对象格式的token:',data);
			//将data转化成字符串
			data=JSON.stringify(data);
			console.log('转换成JSON对象格式的token:',data);
			//存储票据:返回Promise对象
			return util.writeFileAsync(wechat_ticket_file,data);
		}
	}
};

module.exports=config;
