 'use strict'
/*获取认证：sha1加密*/
var sha1=require('sha1');
/*获取access_token*/
var Wechat=require('./wechat');


/*接收消息：拿到原始xml格式数据*/
var getRawBody=require('raw-body');
/*处理消息：处理成标准的js对象*/
var util=require('./util');




module.exports=function(opts,handler){
	/*获取access_token:我们在传入这个中间件的时候，首先初始化这个 Wechat，获取到一个实例，后面使用*/
	//传入config.js的配置项
	var wechat=new Wechat(opts);
    console.log('事件发生前');

	//生成器函数
	return function *(next) {
		console.log('有事件发生');
		var that=this;
		console.log(this.query);
		//token
		var token=opts.token;
		//时间戳
		var timestamp=this.query.timestamp;
		//随机数
		var nonce=this.query.nonce;
		//拿到签名
		var signature=this.query.signature;
		//随机字符串
		var echostr=this.query.echostr;

		/*第一步：将token、timestamp、nonce字典排序*/
		var str=[token, timestamp, nonce].sort().join('');
		/*第二步：将三个参数字符串拼接成一个字符串进行sha1加密*/
		var sha=sha1(str);
		console.log('sha===signature:',sha===signature);
		/*认证接入：GET请求*/
        if(this.method==='GET'){
        	//第三步：将加密后的字符串与signature对比，如果相同，表示这个请求来自微信，我们直接原样返回echostr参数内容，接入验证成功
			if(sha===signature){
				this.body=echostr+'';
				console.log("认证通过");
			}else{
				this.body='wrong';
				console.log("认证失败");
			}
        }
        /*接收普通消息/接收事件推送消息：用户发送一个消息或者点击事件推送给我们消息*/
        else if(this.method==='POST'){
        	/*也需要验证，有可能是别人来测试我的微信端口*/
        	if(sha!==signature){
				this.body='wrong';
				return false;
			}

			//将原始的xml数据交给raw-body模块
			//yield关键字拿到原始的html数据
			var data=yield getRawBody(this.req,{
				length:this.length,//post数据的长度
				limit:'1mb',//post过来的数据体积限制
				encoding:this.charset//post过来的数据的编码设置
			});
			console.log('原始XML数据：');
			console.log(data.toString());

			//解析xml,将原始XML传给此方法，返回解析后的XML对象
			var content=yield util.parseXMLAsync(data);
			console.log('通过xml2js解析之后的数据：');
			console.log(content);

			//解析js对象：拿到标准的key:value对象字面量：传入对象
			var message=util.formatMessage(content.xml);
			console.log('最终处理的数据格式：');
			console.log(message);

			/*//是否是事件
			if(message.MsgType==='event'){
				//订阅事件
				if(message.Event==='subscribe'){
					//拿到当前时间
					var now=new Date().getTime();

					//设置回复状态
					that.status=200;
					//设置回复类型
					that.type='application/xml';
					//设置回复主题
					//CDATA是xml的CDATA区块，作用是避免区块中的内容被XML的解析器所解析
					var xml='<xml>'+
								'<ToUserName><![CDATA['+message.FromUserName+']]></ToUserName>'+//toUser
								'<FromUserName><![CDATA['+message.ToUserName+']]></FromUserName>'+//fromUser
								'<CreateTime>'+now+'</CreateTime>'+//12345678时间戳
								'<MsgType><![CDATA[text]]></MsgType>'+//回复类型
								'<Content><![CDATA[你好，这是开发者模式发送的]]></Content>'+//回复内容
								'</xml>';
					console.log(xml);
					this.body=xml;
					return;
				}
			}*/

			//将接收到的消息赋值给app.js中的第二个参数，作为回复的处理
			this.weixin=message;
			/*
				以下相对于先执行wechat.js文件中的Wechat.reply方法
				再执行weixin.js文件
			*/
			/*当前对象this调用handler方法，yield指将当前逻辑交给handler处理*/
			/*接收到用户的普通消息++事件推送，之后的回复主题*/
			/*最后再处理消息的回复*/
			yield handler.call(this,next);
			//Wechat的上下文改为this 所以 在WeChat this.weixin 有数据
			/*先处理用户的操作：事件推送+普通消息*/
			wechat.reply.call(this);
        }
	};
};
/* 
generator生成的对象存在一个next函数,的确是需要调用next才会返回yield运算的结果对象,
并停止.再次调用 next，会再次在下一个 yield 处停止，
所以 yield util.parseXMLAsync其实就是等于在这一行代码执行并停止了，
不往下一行代码执行，除非调用 next，那么是哪只无形的手，老是帮我们调用这个 next 呢，
明明我自己没有调用，这就是 koa 框架内部所做的事情，内部的流程控制是依赖于co，
这个 co 的框架会负责把 next 一级一级调用下去，所以这块会一直执行下去。

至于 call，只不过重新定义函数的执行环境，也就是 this 的指向，
把 handler 的 this 指向到了 this 当前的上下文，
并且把 next 也作为参数交给 hander，
所以在 hander 内部，因为 this 指向到了这里的 this, 
才能够在 handler 里面通过 this.weixin 访问到这里处理后的 message
*/
