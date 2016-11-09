'use strict'
//获取token
var config=require('../config');
//引入对象
var Wechat=require('../wechat/wechat');
//实例化对象
var wechatApi = new Wechat(config.wechat);
//菜单
var menu=require('./menu');
//路径
var path=require('path');

//创建菜单
// wechatApi.deleteMenu().then(function(){
// 	wechatApi.createMenu(menu);
// }).then(function(msg){
// 	console.log('生成菜单',msg);
// })
/*消息自动回复*/
exports.reply=function* (next){
	/*拿到微信消息：事件推送+普通消息【用户在干的事情】*/
	var message=this.weixin;
	//接收事件推送消息
	if(message.MsgType==='event'){
		/*订阅事件*/
		if(message.Event==='subscribe'){
			//扫码关注
			if(message.EventKey){
				console.log('扫二维码进来关注：' + message.EventKey + ' ' + message.Ticket);
			}else{
				console.log('您不是扫描二维码关注的');
			}
			/*这是公众号发给用户的响应*/
			this.body='哈哈，您订阅了这个号，先点击搜电影试试看';
		}
		/*取消关注*/
		else if (message.Event === 'unsubscribe') {
	        console.log('无情取消');
	        this.body = '';
	    }
	    /*上报地理位置*/ 
	    else if (message.Event === 'LOCATION') {
	        this.body = '您上报的位置是： ' + message.Latitude + '/' + message.Longitude + '-' + message.Precision;
	        console.log('您上报了地理位置');
	    }
	    /*点击菜单*/
	    else if (message.Event === 'CLICK'){
	    	this.body = '您点击了菜单:'+message.EventKey;
	    	console.log('您点击了菜单');
	    }
	    /*点击菜单链接*/
	    else if (message.Event === 'VIEW'){
	        // this.body = '您点击了菜单中的链接:'+message.EventKey;
	        this.body = '';
	    	console.log('您点击了菜单中的链接');
	    }
	    /*关注后扫描二维码*/
	    else if (message.Event === 'SCAN'){
	        console.log('关注后扫二维码' + message.EventKey + ' ' + message.Ticket);
            this.body = '看到你扫了一下哦';
	    }
	    //扫码推事件:用户点击按钮后，微信客户端将调起扫一扫工具，
	    else if (message.Event === 'scancode_push') {
	      //扫描类型，一般是qrcode
	      console.log(message.ScanCodeInfo.ScanType);
	      //扫描结果，即二维码对应的字符串信息
	      console.log(message.ScanCodeInfo.ScanResult);
	      //事件KEY值，由开发者在创建菜单时设定
	      this.body = '您点击了菜单中 ： ' + message.EventKey;
	    }
	    //扫码推事件且弹出“消息接收中”提示框:后弹出“消息接收中”提示框，随后可能会收到开发者下发的消息。
	    else if (message.Event === 'scancode_waitmsg') {
	      console.log(message.ScanCodeInfo.ScanType);
	      console.log(message.ScanCodeInfo.ScanResult);
	      this.body = '您点击了菜单中 ： ' + message.EventKey;
	    }
	    //弹出系统拍照发图:用户点击按钮后，微信客户端将调起系统相机
	    else if (message.Event === 'pic_sysphoto') {
	      //图片列表
	      console.log(message.SendPicsInfo.PicList);
          //发送的图片数量
	      console.log(message.SendPicsInfo.Count);
	      this.body = '您点击了菜单中 ： ' + message.EventKey;
	    }
	    //弹出拍照或者相册发图:用户点击按钮后，微信客户端将弹出选择器供用户选择“拍照”或者“从手机相册选择”
	    else if (message.Event === 'pic_photo_or_album') {
	      console.log(message.SendPicsInfo.PicList);
	      console.log(message.SendPicsInfo.Count);
	      this.body = '您点击了菜单中 ： ' + message.EventKey;
	    }
	    //弹出微信相册发图器；用户点击按钮后，微信客户端将调起微信相册
	    else if (message.Event === 'pic_weixin') {
	      console.log(message.SendPicsInfo.PicList);
	      console.log(message.SendPicsInfo.Count);
	      this.body = '您点击了菜单中 ： ' + message.EventKey;
	    }
	    //弹出地理位置选择器:用户点击按钮后，微信客户端将调起地理位置选择工具
	    else if (message.Event === 'location_select') {
	      //X坐标信息
	      console.log(message.SendLocationInfo.Location_X);
	      //Y坐标信息
	      console.log(message.SendLocationInfo.Location_Y);
	      //精度，可理解为精度或者比例尺、越精细的话 scale越高
	      console.log(message.SendLocationInfo.Scale);
	      //地理位置的字符串信息
	      console.log(message.SendLocationInfo.Label);
	      //朋友圈POI的名字，可能为空
	      console.log(message.SendLocationInfo.Poiname);
	      this.body = '您点击了菜单中 ： ' + message.EventKey;
	    }
	}
	//接收普通消息
	else if(message.MsgType === 'text'){
		//接收到的消息
		var content = message.Content;
		//回复内容
        var reply = '额，你说的 ' + message.Content + ' 太复杂了';
        /*回复策略*/
        if (content === '1') {
	      reply = '天下第一吃大米';
	    }
	    else if (content === '2') {
	      reply = '天下第二吃豆腐';
	    }
	    else if (content === '3') {
	      reply = '天下第三吃仙丹';
	    }
	    /*回复图文消息*/
	    else if (content === '4') {
	      reply = [{
	        title: '技术改变世界',
	        description: '只是个描述而已',
	        picUrl: 'http://res.cloudinary.com/moveha/image/upload/v1441184110/assets/images/Mask-min.png',
	        url: 'https://github.com/'
	      },{
	        title: 'Nodejs 开发微信',
	        description: '爽到爆',
	        picUrl: 'https://res.cloudinary.com/moveha/image/upload/v1431337192/index-img2_fvzeow.png',
	        url: 'https://nodejs.org/'
	      }]
	    }
	    /*回复图片素材*/
	    else if (content === '5') {
	      //调用上传素材的方法：图片
	      var data = yield wechatApi.uploadMaterial('image', path.join(__dirname, '../5.jpg'));
	      reply = {
	        type: 'image',
	        mediaId: data.media_id
	      };
	    }
	    /*回复视频素材*/
	    else if (content === '6') {
	      var data = yield wechatApi.uploadMaterial('video', path.join(__dirname, '../6.mp4'));
	      console.log('上传视频素材：',data);
	      reply = {
	        type: 'video',
	        title: '回复视频内容',
	        description: '打个篮球玩玩',
	        mediaId: data.media_id
	      };
	    }
	    /*回复音乐素材[不需要上传]*/
	    else if (content === '7') {
	      var data = yield wechatApi.uploadMaterial('image', path.join(__dirname, '../5.jpg'));
	      reply = {
	        type: 'music',
	        title: '回复音乐内容',
	        description: '放松一下',
	        musicUrl: 'http://mpge.5nd.com/2015/2015-9-12/66325/1.mp3',
	        thumbMediaId: data.media_id
	      };
	    }
	    //回复永久图片素材
	    else if (content === '8') {
	      var data = yield wechatApi.uploadMaterial('image', path.join(__dirname, '../5.jpg'), {type: 'image'});
	      console.log('上传永久图片素材：',data);
	      reply = {
	        type: 'image',
	        mediaId: data.media_id
	      };
	    }
	    //回复永久视频素材
	    else if (content === '9') {
	      //在上传视频素材时需要POST另一个表单，id为description
	      var data = yield wechatApi.uploadMaterial('video', path.join(__dirname, '../6.mp4'), {type: 'video', description: '{"title": "Really a nice place", "introduction": "Never think it so easy"}'});
	      console.log('上传永久视频素材：',data);
	      reply = {
	        type: 'video',
	        title: '回复视频内容',
	        description: '打个篮球玩玩',
	        mediaId: data.media_id
	      };
	    }
	    // 获取永久素材
	    else if (content === '10') {
		      //先上传一个图片资源，传入空对象，不是不传
		      var picData = yield wechatApi.uploadMaterial('image', path.join(__dirname, '../5.jpg'), {type: 'image'});
		      console.log('0000000000000000',picData);
		      //上传图文:上传图片的目的是上传图文
		      var media = {
		        articles: [{
		          title: 'tututu4',
		          thumb_media_id: picData.media_id,//图片链接【图文消息的封面图片素材id（必须是永久mediaID）】
		          author: 'Ncyu',
		          digest: '没有摘要',
		          show_cover_pic: 1,
		          content: '没有内容',
		          content_source_url: 'https://github.com'
		        }, {
		          title: 'tututu5',
		          thumb_media_id: picData.media_id,//图片链接
		          author: 'Ncyu',
		          digest: '没有摘要',
		          show_cover_pic: 1,
		          content: '没有内容',
		          content_source_url: 'https://github.com'
		        }]
		      };
		      //上传图文
		      data = yield wechatApi.uploadMaterial('news', media, {type: 'news'});
		      console.log('11111111111111',data);
		      //获取图文素材：传入刚刚上传的图文素材id
		      data = yield wechatApi.fetchMaterial(data.media_id, 'news', {type: 'news'});

		      console.log('22222222',data);

		      //拿到图文素材的news_item
		      var items = data.news_item;
		      //将news_item存入news
		      var news = [];

		      items.forEach(function(item) {
		        news.push({
		          title: item.title,//标题
		          decription: item.digest,//摘要
		          picUrl: picData.url,//封面图片地址
		          url: item.url//原文链接地址
		        });
		      });
		      //回复主题
		      reply = news;
	    }
	    // 获取素材总数
	    else if (content === '11') {
	      //返回JSON格式，有可能键没有引号
	      var counts = yield wechatApi.countMaterial();
	      //转成标准JSON
	      console.log(JSON.stringify(counts));

	      var results = yield [
	        //获取素材列表：图片
	        wechatApi.batchMaterial({
	          type: 'image',
	          offset: 0,
	          count: 10
	        }),
	        //获取素材列表：视频
	        wechatApi.batchMaterial({
	          type: 'video',
	          offset: 0,
	          count: 10
	        }),
	        //获取素材列表：声音
	        wechatApi.batchMaterial({
	          type: 'voice',
	          offset: 0,
	          count: 10
	        }),
	        //获取素材列表：图文
	        wechatApi.batchMaterial({
	          type: 'news',
	          offset: 0,
	          count: 10
	        })
	      ];
	      //获取图文的id
	      console.log(JSON.stringify(results));
	      //返回总数
	      reply = JSON.stringify(results);
	    }
	    //分组测试
	    else if (content === '12') {
	      //创建分组
	      var group = yield wechatApi.createGroup('wechat7');
	      console.log('新分组 wechat7',group);

	      //查询所有分组
	      var groups = yield wechatApi.fetchGroups();
	      console.log('加了 wechat7 后的分组列表',groups);

	      //查询用户所在分组
	      var group2 = yield wechatApi.checkGroup(message.FromUserName);
	      console.log('查看自己的分组',group2);

	      //移动用户分组
	      var result = yield wechatApi.moveGroup(message.FromUserName, 118);
	      console.log('移动到  115',result);

	      //查询所有分组
	      var groups2 = yield wechatApi.fetchGroups();
	      console.log('移动后的分组列表',groups2);

	      //批量移动用户分组
	      var result2 = yield wechatApi.moveGroup([message.FromUserName], 119);
	      console.log('批量移动到  119',result2);

          //查询所有分组
	      var groups3 = yield wechatApi.fetchGroups();
	      console.log('批量移动后的分组列表',groups3);

	      //修改分组名
	      var result3 = yield wechatApi.updateGroup(117, 'wechat117');
	      console.log('117 wechat2 改名 wechat117',result3);

	      //查询所有分组
	      var groups4 = yield wechatApi.fetchGroups();
	      console.log('改名后的分组列表',groups4);

	      //删除分组
	      var result4 = yield wechatApi.deleteGroup(102);
	      console.log('删除 114 tututu 分组',result4);

	      //查询所有分组
	      var groups5 = yield wechatApi.fetchGroups();
	      console.log('删除 114 后分组列表',groups5);

	      reply = JSON.stringify(groups5);
	    }
	    //获取用户基本信息(UnionID机制)
	    else if (content === '13') {
	      //获取用户基本信息
	      var user = yield wechatApi.fetchUsers(message.FromUserName, 'en');
	      console.log(user);
	      //批量获取用户信息,数组传递
	      var openIds = [
	        {
	          openid: message.FromUserName,
	          lang: 'en'
	        }
	      ];
	      //批量获取
	      var users = yield wechatApi.fetchUsers(openIds);
	      console.log(users);
	      //返回用户信息，JSON格式
	      reply = JSON.stringify(user);
	    }
	    // 获取用户列表
	    else if (content === '14') {
	      // 获取用户列表
	      var userlist = yield wechatApi.listUsers();
	      console.log(userlist);
	      //用户列表长度
	      reply = userlist.total;
	    }
	    //根据分组进行群发【订阅号与服务号认证后均可用】
	    else if (content === '15') {
	      //通过11可以获取图文的id
	      var mpnews = {
	        media_id: 'tWieFbfwczCt3AbOGNzmVzaEHNVZP2--gHMHZ01IAEo'
	      };
	      var text = {
	        'content': 'Hello Wechat'
	      };
	      //发送文本消息【type，message，groupId】
	      var msgData = yield wechatApi.sendByGroup('text', text, 119);
	      console.log(msgData);
	      reply = 'Yeah!';
	    }
	    //预览接口【订阅号与服务号认证后均可用】
	    else if (content === '16') {
	      var mpnews = {
	        media_id: 'tWieFbfwczCt3AbOGNzmVzaEHNVZP2--gHMHZ01IAEo'
	      };
	      // var text = {
	      //   'content': 'Hello Wechat'
	      // }
	      // 预览接口type, message, openId
	      var msgData = yield wechatApi.previewMass('mpnews', mpnews, 'okH-duBePdGVlZ3PyqJsVkBeJspw');
	      console.log(msgData);
	      reply = 'Yeah!';
	    }
	    //查询群发消息发送状态【订阅号与服务号认证后均可用】
	    else if (content === '17') {
	      //传入消息id
	      var msgData = yield wechatApi.checkMass('400958630');
	      console.log(msgData);
	      reply = 'Yeah hah!';
	    }
	    //生成带参数的二维码
	    else if (content === '18') {
	      //生成带参数的二维码:临时
	      // var tempQr = {
	      //   expire_seconds: 400000,//该二维码有效时间，以秒为单位。 最大不超过604800（即7天）
	      //   action_name: 'QR_SCENE',//二维码类型，QR_SCENE为临时,QR_LIMIT_SCENE为永久,QR_LIMIT_STR_SCENE为永久的字符串参数值
	      //   action_info: {//	二维码详细信息
	      //     scene: {
	      //       scene_id: 123
	      //     }
	      //   }
	      // };

	      // 生成带参数的二维码：永久
	      // var permQr = {
	      //   action_name: 'QR_LIMIT_SCENE',
	      //   action_info: {
	      //     scene: {
	      //       scene_id: 123
	      //     }
	      //   }
	      // };

	      // 生成带参数的二维码：永久[string类型]
	      // var permStrQr = {
	      //   action_name: 'QR_LIMIT_STR_SCENE',
	      //   action_info: {
	      //     scene: {
	      //       scene_str: 'abc'
	      //     }
	      //   }
	      // };

	      //var qr1 = yield wechatApi.createQrcode(tempQr);
	      //var qr2 = yield wechatApi.createQrcode(permQr);
	      //var qr3 = yield wechatApi.createQrcode(permStrQr);
	      reply = 'Yeah hah!';
	    }
	    //长链接转短链接接口
	    else if (content === '19') {
	      var longUrl = 'http://www.imooc.com/';
	      var shortData = yield wechatApi.createShorturl(null, longUrl);
	      reply = shortData.short_url;
	    }
	    //语义理解
	    else if (content === '20') {
	      var semanticData = {
	        query: '寻龙诀',//	输入文本串
	        city: '杭州',//城市名称，与经纬度二选一传入【city在region和latitude、longitude省略】
	        category: 'movie',//需要使用的服务类型，多个用“，”隔开，不能为空
	        uid: message.FromUserName//用户唯一id（非开发者id），用户区分公众号下的不同用户（建议填入用户openid），如果为空，则无法使用上下文理解功能。appid和uid同时存在的情况下，才可以使用上下文理解功能
	      };
	      var _semanticData = yield wechatApi.semantic(semanticData);
	      reply = JSON.stringify(_semanticData);
	    }


	    /*content原来在这里啊！！！！！！！！！！！！*/
	    this.body=reply;
	} 
}