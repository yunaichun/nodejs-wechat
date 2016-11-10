'use strict'

//koa框架
var Koa=require('koa');

//中间件:所有控制逻辑【主调用】
var wechat=require('./wechat/g');


//通过主控制逻辑：获取token中间件
var config=require('./config');
//通过主控制逻辑：回复的中间件
var reply=require('./wx/reply');




//实例化koa
var app=new Koa();




//模板渲染
var ejs=require('ejs');
//模板框架
var heredoc=require('heredoc');
var tpl=heredoc(function(){/*
<!DOCTYPE html>
<html>
    <head>
        <title>搜电影</title>
        <meta name="viewport" content="initial-scale=1,maximum-scale=1,minimum-scale=1">
        <!--最外层样式行内，边框，相对定位-->
        <!--input不可见，绝对定位左上角，宽高撑满-->
        <style>
            .G_upImg{
            	text-align:center;
            }
            .G_upImg .upImg {
			    display: inline-block;
			    border-radius: 4px;
			    border: 1px solid #ccc;
			    font-size: 14px;
			    padding: 6px 12px;
			    cursor: pointer;
			    position: relative;

			}
	        .G_upImg .up {
			    position: absolute;
			    width: 100%;
			    height: 100%;
			    cursor: pointer;
			    opacity: 0;
			    left: 0;
			    top: 0;
			    margin: 0;
			}
			#year {
				word-wrap: break-word;
			    display: block;
			    font-size: 25px;
			    font-weight: bold;
			    color: #494949;
			    margin: 10px auto;
			    padding: 0 0 15px 0;
			    line-height: 1.1;
			}
        </style>
    </head>
    <body>
        <div id="button" class="G_upImg"><span class="upImg">点击按钮，开始录音翻译<input type="button" class="up"></span></div>
        <p id="title"></p>
        <div id="director"></div>
        <div id="year"></div>
        <div id="poster"></div>
        <script src="http://zeptojs.com/zepto-docs.min.js"></script>
        <script src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
        <script>
            //步骤三：通过config接口注入权限验证配置
            wx.config({
			    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
			    appId: 'wx6ad1b2adb57f14be', // 必填，公众号的唯一标识【测试号】wx6ad1b2adb57f14be【我的】wxd6fe6fe1b1cb187a
			    timestamp: '<%= timestamp %>', // 必填，生成签名的时间戳
			    nonceStr: '<%= noncestr %>', // 必填，生成签名的随机串
			    signature: '<%= signature %>',// 必填，签名，见附录1
			    jsApiList: [
				    'startRecord',//开始录音
					'stopRecord',//停止录音
					'onVoiceRecordEnd',//监听录音自动停止接口
					'translateVoice',//翻译录音
					'onMenuShareTimeline',//获取“分享到朋友圈”按钮点击状态及自定义分享内容接口
					'onMenuShareAppMessage',//获取“分享给朋友”按钮点击状态及自定义分享内容接口
					'onMenuShareQQ',//获取“分享到QQ”按钮点击状态及自定义分享内容接口
					'onMenuShareWeibo',//获取“分享到腾讯微博”按钮点击状态及自定义分享内容接口
					'onMenuShareQZone',//获取“分享到QQ空间”按钮点击状态及自定义分享内容接口
					'previewImage'//预览图片接口
			    ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
			});
			//步骤四：通过ready接口处理成功验证
			wx.ready(function(){
			    // config信息验证后会执行ready方法，
			    //所有接口调用都必须在config接口获得结果之后，
			    //config是一个客户端的异步操作，
			    //所以如果需要在页面加载时就调用相关接口，
			    //则须把相关接口放在ready函数中调用来确保正确执行。
			    //对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。

			    //判断当前客户端版本是否支持指定JS接口
				wx.checkJsApi({
				    jsApiList: ['onVoiceRecordEnd'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
				    success: function(res) {
				        // 以键值对的形式返回，可用的api值true，不可用为false
				        // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
				    }
				});

				var shareContent={
					title: '', // 分享标题
				    desc: '', // 分享描述
				    link: '', // 分享链接
				    imgUrl: '', // 分享图标
				    type: '', // 分享类型,music、video或link，不填默认为link
				    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
				    success: function () { 
				        // 用户确认分享后执行的回调函数
				        window.alert('分享成功');
				    },
				    cancel: function (shareContent) { 
				        // 用户取消分享后执行的回调函数
				        window.alert('分享失败');
				    }
				}

				var sliders;
				//点击海报调用预览图片接口
				$('#poster').on('tap',function(){
	                //预览图片接口
					wx.previewImage(sliders);
				})


				var isRecording=false;
				//点击事件【手机点击事件用tap】
				$('#button').on('tap',function(){
					//开始没有录制的情况
					if(!isRecording){
						$('.upImg').text('再次点击，停止录音');
						isRecording=true;
						//开始录音接口【手机弹出录音，会有开启权限的请求】
						wx.startRecord({
							cancel:function(){
								window.alert('那就不能搜了哦');
							}
						});
						return;
					}
					
					//停止录音接口
					wx.stopRecord({
					    success: function (res) {
					    	//再点一次之后停止
					        isRecording=false;

					    	//拿到本地音频路径
					        var localId = res.localId;
					        //识别音频并返回识别结果接口
					        wx.translateVoice({
							   localId: localId, // 需要识别的音频的本地Id，由录音相关接口获得
							    isShowProgressTips: 1, // 默认为1，显示进度提示
							    success: function (res) {
							    	$('.upImg').text('点击按钮，开始录音翻译');

							    	//语音识别的结果
							    	var result=res.translateResult;
							    	$.ajax({
							    		type:'get',
							    		url:'http://api.douban.com/v2/movie/search?q='+result,
							    		dataType:'jsonp',
							    		jsonp:'callback',
							    		crossDomain:true,
							    		cache:true,
							    		success:function(data){
							    			//停止录音，但是翻译出来了
							    			isTranslated=true;
							    			var subject=data.subjects[0];
							    			//标题
							    			$('#title').html(subject.title);
							    			//导演
							    			$('#director').html(subject.directors[0].name);
							    			//年份
							    			$('#year').html(subject.year);
							    			//海报
							    			$('#poster').html('<img src="'+subject.images.large+'"/>');
							    			//分享定制
							    			shareContent={
												title: subject.title, // 分享标题
											    desc: '我分享出来了'+subject.title, // 分享描述
											    link: subject.casts[0].alt, // 分享链接
											    imgUrl: subject.images.large, // 分享图片
											    type: 'link', // 分享类型,music、video或link，不填默认为link
											    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
											    success: function () { 
											        // 用户确认分享后执行的回调函数
											        window.alert('分享成功');
											    },
											    cancel: function (shareContent) { 
											        // 用户取消分享后执行的回调函数
											        window.alert('分享失败');
											    }
											}

											//预览定制
											sliders={
												current:subject.images.large,// 当前显示图片的http链接
												urls: [subject.images.large] // 需要预览的图片http链接列表
											};
											data.subjects.forEach(function(item){
												sliders.urls.push(item.images.large);
											});	
								
											//“分享给朋友”按钮点击状态及自定义分享内容接口
			                            	wx.onMenuShareAppMessage(shareContent);
							    		}
							    	})
							    }
							});
					    }
					});
				})
			});
        </script>
    </body> 
</html>
*/});

//生成随机字符串
var createNonce=function(){
	//转换成36进制，一般都是为了生成不重复的随机数才调用的
	return Math.random().toString(36).substr(2,15);
};
//生成时间戳
var createTimestamp=function(){
	return parseInt(new Date().getTime()/1000,10) + '';
};
//获取签名值【jsapi_ticket通过access_token获取】
function sign(ticket,url){
	//参数一：随机数
	var noncestr=createNonce();
	//参数二：时间戳
	var timestamp=createTimestamp();
	//签名值的获取
	var signature=_sign(noncestr,ticket,timestamp,url);
	//返回随机数、时间戳、签名值
	return {
		noncestr:noncestr,
		timestamp:timestamp,
		signature:signature
	};
	//步骤1. 对所有待签名参数按照字段名的ASCII 码从小到大排序（字典序）后，
	//       使用URL键值对的格式（即key1=value1&key2=value2…）拼接成字符串string1：
	//步骤2. 对string1进行sha1签名，得到signature：

}
//实现sha1签名算法
var crypto=require('crypto');
/*获取认证：sha1加密*/
var sha1=require('sha1');
//实现签名算法
function _sign(noncestr,ticket,timestamp,url){
	//步骤1. 对所有待签名参数按照字段名的ASCII 码从小到大排序（字典序）后，
	//       使用URL键值对的格式（即key1=value1&key2=value2…）拼接成字符串string1：
	var params=[
		'noncestr='+noncestr,
		'jsapi_ticket='+ticket,
		'timestamp='+timestamp,
		'url='+url
	];
	//字典排序：ASCII 码从小到大排序，并且用&连接
	var str=params.sort().join('&');
	console.log('字典排序：',str);
	//步骤2. 对string1进行sha1签名，得到signature：
	// var shasum=crypto.createHash('sha1');
	// shasum.update(str);
	// return shasum.digest('hex');
	var signature=sha1(str);
	return signature;
}




var Wechat=require('./wechat/wechat.js')
//引入中间件，返回html页面，用于绑定js
//相当于设置路由，匹配到movie就可以返回页面，然后就可以在页面去绑定js文件
app.use(function *(next){
	//如果请求的地址待了路径。一个请求进来的时候，会拿到一个url地址。
	if(this.url.indexOf('movie')>-1){
		//通过Wechat拿到全局票据access_token。再通过全局票据拿到jsapi_ticket。
		var wechatApi=new Wechat(config.wechat);
		//获取access_token
		var data=yield wechatApi.fetchAccessToken();
		var access_token=data.access_token;
		//获取jsapi_ticket【传入获取的全局票据access_token】
		var ticketData=yield wechatApi.fetchTicket(access_token);
		var ticket=ticketData.ticket;
		//油漆面完成的路径
        var url=this.href;
		//将url和api_ticket传给sign方法
		var params=sign(ticket,url);
		console.log('随机数，时间戳，签名值',params);

		//返回一个页面
		/*this.body='<h1>Hi there!</h1>';*/
		//ejs渲染模板，传入签名值，随机字符串、时间戳
		this.body=ejs.render(tpl,params);
		//不再往下走
		return next;
	}
	//否则继续
	yield next;
});






//koa框架调用主逻辑模块:传入获取access_token方法,微信回复方法
app.use(wechat(config.wechat,reply.reply));
//监听1234端口
app.listen(3001);
console.log('Listen:3001');
