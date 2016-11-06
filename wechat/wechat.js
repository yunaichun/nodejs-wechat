 'use strict'

//promise库
var Promise=require('bluebird');
//request方法有then方法是bluebird进行Promise化之后才有的
var request=Promise.promisify(require('request'));
//微信票据接口API
var prefix='https://api.weixin.qq.com/cgi-bin/';
//通过ticket换取二维码
var mpPrefix = 'https://mp.weixin.qq.com/cgi-bin/';
//语义理解接口【值此一个】
var semanticUrl = 'https://api.weixin.qq.com/semantic/search?';
var api={
  semanticUrl: semanticUrl,
	accessToken:prefix+'token?grant_type=client_credential',/*获取access_token*/
  temporary: {
    upload: prefix + 'media/upload?',/*新增临时素材*/
    fetch: prefix + 'media/get?'/*获取临时素材*/
  },
  permanent: {
    upload: prefix + 'material/add_material?',/*新增其他类型永久素材*/
    fetch: prefix + 'material/get_material?',/*获取永久素材*/
    uploadNews: prefix + 'material/add_news?',/*新增永久图文素材*/
    uploadNewsPic: prefix + 'media/uploadimg?',/*上传图文消息内的图片获取URL*/
    del: prefix + 'material/del_material?',/*删除永久素材*/
    update: prefix + 'material/update_news?',/*更新永久素材*/
    count: prefix + 'material/get_materialcount?',/*获取素材总数*/
    batch: prefix + 'material/batchget_material?'/*获取素材列表*/
  },
  tag: {
    create: prefix + 'tags/create?',//创建标签
    fetch: prefix + 'tags/get?',//查询所有标签
    update: prefix + 'tags/update?',//修改标签
    del: prefix + 'tags/delete?',//删除标签
    getTagUser: prefix + 'user/tag/get?',//获取标签下粉丝列表


    check: prefix + 'tags/getidlist?',//查询用户身上标签列表
    batchupdate: prefix + 'tags/members/batchtagging?',//批量为用户打标签+批量为用户取消标签
    /*move: prefix + 'tags/members/update?',移动用户分组，已经没有了*/
    /*batchupdate: prefix + 'tags/members/batchupdate?',批量移动用户分组，已经没有了*/ 
  },
  group: {
    create: prefix + 'groups/create?',//创建分组
    fetch: prefix + 'groups/get?',//查询所有分组
    check: prefix + 'groups/getid?',//查询用户所在分组
    update: prefix + 'groups/update?',// 修改分组名
    move: prefix + 'groups/members/update?',//移动用户分组
    batchupdate: prefix + 'groups/members/batchupdate?',//批量移动用户分组
    del: prefix + 'groups/delete?'// 删除分组
  },
  user: {
    remark: prefix + 'user/info/updateremark?',//设置用户备注名
    fetch: prefix + 'user/info?',//获取用户基本信息
    batchFetch: prefix + 'user/info/batchget?',//批量获取用户基本信息
    list: prefix + 'user/get?'//获取用户列表 
  },
  mass: {
    group: prefix + 'message/mass/sendall?',//根据分组进行群发【订阅号与服务号认证后均可用】
    openId: prefix + 'message/mass/send?',//根据OpenID列表群发【订阅号不可用，服务号认证后可用】
    del: prefix + 'message/mass/delete?',//删除群发【订阅号与服务号认证后均可用】
    preview: prefix + 'message/mass/preview?',//预览接口【订阅号与服务号认证后均可用】
    check: prefix + 'message/mass/get?'//查询群发消息发送状态【订阅号与服务号认证后均可用】
  },
   menu: {
    create: prefix + 'menu/create?',//自定义菜单创建接口
    get: prefix + 'menu/get?',//自定义菜单查询接口
    del: prefix + 'menu/delete?',//自定义菜单删除接口
    current: prefix + 'get_current_selfmenu_info?'//获取自定义菜单配置接口
  },
  qrcode: {
    create: prefix + 'qrcode/create?',//创建二维码ticket
    show: mpPrefix + 'showqrcode?'//通过ticket换取二维码
  },
  shortUrl: {
    create: prefix + 'shorturl?'//长链接转短链接接口
  },
  ticket: {
    get: prefix + 'ticket/getticket?'//获取jsapi_ticket（有效期7200秒，开发者必须在自己的服务全局缓存jsapi_ticket）
  }
}




//微信票据对象
function Wechat(opts){
	var that=this;
	this.appID=opts.appID;
	this.appSecret=opts.appSecret;
	//获取票据的方法
	this.getAccessToken=opts.getAccessToken;
	//存储票据的方法
	this.saveAccessToken=opts.saveAccessToken;

  //获取jsapi_ticket
  this.getTicket = opts.getTicket;
  //存储jsapi_ticket
  this.saveTicket = opts.saveTicket;


  // 获取票据
  this.fetchAccessToken();
}
/*获取全局票据*/
Wechat.prototype.fetchAccessToken = function() {
  var that = this;
  //如果存在token并且在有效期，还是合法的token
  if(this.access_token&&this.expires_in){
    if(this.isValidAccessToken(this)){
      return Promise.resolve(this);
    }
  }
  //获取全局票据【通过读取文件的方式】
  return this.getAccessToken()
    .then(function(data) {
      try {
        //转为js对象
        data = JSON.parse(data);
      }
      catch(e) {
        //本地没有的话更新票据
        return that.updateAccessToken();
      }
      //票据合法
      if (that.isValidAccessToken(data)) {
        //向下传递
        return Promise.resolve(data);
      }
      //票据不合法
      else {
        //更新票据
        return that.updateAccessToken();
      }
    })
    .then(function(data) {
        // that.access_token=data.access_token;
        // that.expires_in=dasta.expires_in;
      //保存票据
      that.saveAccessToken(data);
      //向下传递
      return Promise.resolve(data);
    });
};
//票据是否合法
Wechat.prototype.isValidAccessToken=function(data){
	//如果data不存在、access_token不存在、有效期字段不存在
	if(!data||data.access_token||!data.expires_in){
		return false;
	}
	//拿到票据
	var access_token=data.access_token;
	//拿到过期时间
	var expires_in=data.expires_in;
	//拿到当前时间
	var now=(new Date().getTime());
	//判断当前时间是否小于过期时间
	if(now<expires_in){
		return true;
	}else{
		return false;
	}
};
//更新票据
Wechat.prototype.updateAccessToken=function(data){
	//拿到appID
	var appID=this.appID;
	//拿到appSecret
	var appSecret=this.appSecret;
	//拿到url:请求票据地址
	/* 
		grant_type	是	获取access_token填写client_credential
		appid	是	第三方用户唯一凭证
		secret	是	第三方用户唯一凭证密钥，即appsecret
		返回：{"access_token":"ACCESS_TOKEN","expires_in":7200}
	*/
	var url=api.accessToken+'&appid='+appID+'&secret='+appSecret;
	//return Promise对象可以向下传递
	return new Promise(function(resolve,reject){//判断成功还是失败
		// 用get请求【通过请求地址的方式】
		request({
			url:url,
			json:true,
		}).then(function(response){
			//拿到response数组里面第二个结果
			var data=response.body;
			console.log('获取到微信服务器最初的token:',data);
			//拿到当前时间
			var now=(new Date().getTime());
			//生成一个新的过期时间(当前时间+返回的过去时间)【提前20s刷新】
			//getTime() 方法可返回距 1970 年 1 月 1 日之间的毫秒数。
			var expires_in=now+(data.expires_in-20)*1000;
			//把新的票据时间赋值给data对象
			data.expires_in=expires_in;
      //向下传递
			resolve(data);
		});
	});
};





/*获取jsapi_ticket*/
Wechat.prototype.fetchTicket = function(access_token) {
  var that = this;
  //读取文件
  return this.getTicket()
    .then(function(data) {
      try {
        //转为js对象
        data = JSON.parse(data);
      }
      catch(e) {
        //本地没有的话更新票据
        return that.updateTicket(access_token);
      }
      //票据合法
      if (that.isValidTicket(data)) {
        //向下传递
        return Promise.resolve(data);
      }
      //票据不合法
      else {
        //更新票据
        return that.updateTicket(access_token);
      }
    })
    .then(function(data) {
      //保存票据
      that.saveTicket(data);
      //向下传递
      return Promise.resolve(data);
    });
};
/*判断jsapi_ticket是否合法*/
Wechat.prototype.isValidTicket = function(data) {
  //如果data不存在、jsapi_ticket不存在、有效期字段不存在
  if (!data || !data.ticket || !data.expires_in) {
    return false;
  }
  //拿到jsapi_ticket
  var ticket = data.ticket;
  //拿到过期时间
  var expires_in = data.expires_in;
  //拿到当前时间
  var now = (new Date().getTime());
  //当前时间小于过期时间并且票据还存在的话
  if (ticket && now < expires_in) {
    return true;
  }
  else {
    return false;
  }
};
/*更新jsapi_ticket*/
Wechat.prototype.updateTicket = function(access_token) {
  //接口地址
  var url = api.ticket.get + '&access_token=' + access_token + '&type=jsapi';
  return new Promise(function(resolve, reject) {
    //get请求
    request({url: url, json: true}).then(function(response) {
      var data = response.body;
      //拿到当前时间
      var now = (new Date().getTime());
      //生成一个新的过期时间(当前时间+返回的过去时间)【提前20s刷新】
      //getTime() 方法可返回距 1970 年 1 月 1 日之间的毫秒数。
      var expires_in = now + (data.expires_in - 20) * 1000;
      //把新的票据时间赋值给data对象
      data.expires_in = expires_in;
      //向下传递
      resolve(data);
    });
  });
};





/*引入工具函数：回复消息*/
var util=require('./util');
/*消息回复*/
Wechat.prototype.reply = function() {
  /*yield handler.call(this,next);wechat.reply.call(this);*/
  /*--------先执行weixin.js，this.body是回复内容----------*/
  /*var content = this.body;var xml = util.tpl(content, message);this.body = xml;*/
  /*--------最后才去执行wechat.js的reply方法--------------*/
  var content = this.body;
  console.log('content=this.body到底是啥：',content);
  /*拿到微信消息：事件推送+普通消息【用户发送过来的】*/
  var message = this.weixin;
  console.log('message=this.weixin到底是啥：',message);
  /*拿到微信回复的xml：普通消息+事件推送*/
  /*
	  content是页面body的响应【 var content = this.body;】
	  message是用户发送的xml
  */
  var xml = util.tpl(content, message);



  /* 返回状态码*/
  this.status = 200;
  /* 消息类型*/
  this.type = 'application/xml';
  /* 接收到用户的普通消息+事件推送之后的响应*/
  /* 返回编译好的模板消息 */
  this.body = xml;
}







var fs =require('fs');
//相当于underscore
var _=require('lodash');
/*上传临时素材*/
Wechat.prototype.uploadMaterial = function(type, material,permanent) {
  var that = this;
  //定义表单
  var form={};
  //默认上传临时素材
  var uploadUrl=api.temporary.upload;
  //如果传入第三个参数，上传永久素材
  if(permanent){
    uploadUrl=api.permanent.upload;
    //兼容所有上传类型，包括图文消息，继承permanet对象
    _.extend(form,permanent);
  }


  //图文消息上传的图片：在图文消息的具体内容中，将过滤外部的图片链接，开发者可以通过接口上传图片得到URL，放到图文内容中使用
  if(type==='pic'){
    uploadUrl=api.permanent.uploadNewsPic;
  }

  //图文
  if(type==='news'){
    uploadUrl=api.permanent.uploadNews;
    //如果是图文的话素材就是传进来的数组
    form=material;
  }
  //不是图文的话就是文件路径
  else{
    //--------media是post数据的参数---------//
    form.media=fs.createReadStream(material);
  }

  return new Promise(function(resolve, reject) {
    that
      //拿到全局票据
      .fetchAccessToken()
      .then(function(data) {
          console.log('获取token之后的返回',data);
          //上传地址
          var url=uploadUrl+'access_token='+data.access_token;

          //上传临时素材，
          if(!permanent){
            //需要在url中追加type
            url+='&type='+type;
          }
          //上传永久素材
          else{
            //--------access_token是post数据的参数---------//
            //--------还有一个type的字段，通过传入参数---------//
            form.access_token=data.access_token;
          }

          //定义上传的参数
          var options = {
            method: 'POST',
            url: url,
            json: true
          };

          //上传图文消息
          if (type === 'news') {
            //将对象交给body
            options.body = form;
          }
          //否则是multipart-data数据
          else {
            //将对象交给formData
            options.formData = form;/*表单数据*/
          }

          // 用get请求
          request(options).then(function(response){
            //拿到响应值
            var _data=response.body;

            //有响应数据的话
            if(_data){
               //向下传递
               resolve(_data);
            }else{
              throw new Error('Upload material fail');
            }
          }).catch(function(err){
            // 抛出异常
            reject(err);
          })
      });
  });
};
/*获取素材*/
Wechat.prototype.fetchMaterial = function(mediaId, type, permanent) {
  var that = this;
  //默认下载临时素材
  var fetchUrl = api.temporary.fetch;
  //永久素材
  if (permanent) {
    fetchUrl = api.permanent.fetch;
  }

  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        //接口api
        var url = fetchUrl + 'access_token=' + data.access_token;
        //form表单
        var form = {};
        //options请求配置
        var options = {method: 'POST', url: url, json: true};

        //永久素材：追加在post参数中
        if (permanent) {
          form.media_id = mediaId;
          form.access_token = data.access_token;
          
          //永久素材请求主体：form交给body
          options.body = form;
        }
        //临时素材：追加在url中
        else {
          //视频
          if (type === 'video') {
            //需要用http协议
            url = url.replace('https://', 'http://');
          }
          //-----------url中追加media_id,传进来的参数-------//
          url += '&media_id=' + mediaId;
        }

        //如果是图文或者视频：临时素材无法通过本接口获取
        if (type === 'news' || type === 'video') {
          //请求数据
          request(options).then(function(response) {
            var _data = response.body;
            if (_data) {
              resolve(_data);
            }
            else {
              throw new Error('fetch material fails');
            }
          })
          .catch(function(err) {
            reject(err);
          });
        }
        else {
          //否则直接拿url
          resolve(url);
        }
      });
  });
};
//删除永久素材
Wechat.prototype.deleteMaterial = function(mediaId) {
  var that = this;
  //post参数，只有一个
  var form = {
    media_id: mediaId
  };

  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        //接口api
        var url = api.permanent.del + 'access_token=' + data.access_token + '&media_id=' + mediaId;
        //post请求
        request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
          //返回数据
          var _data = response.body;
          if (_data) {
            resolve(_data);
          }
          else {
            throw new Error('Delete material fails');
          }
        })
        .catch(function(err) {
          reject(err);
        });
      });
  });
};
//更新永久素材
Wechat.prototype.updateMaterial = function(mediaId, news) {
  var that = this;
  var form = {
    //更新哪个素材
    media_id: mediaId
  };
  //将news扩展到form中
  _.extend(form, news);
  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        //接口api
        var url = api.permanent.update + 'access_token=' + data.access_token + '&media_id=' + mediaId;
        //注意此处请求参数：为body，区别formData
        request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
          //返回数据
          var _data = response.body;
          if (_data) {
            resolve(_data);
          }
          else {
            throw new Error('Delete material fails');
          }
        })
        .catch(function(err) {
          reject(err);
        });
      });
  });
};
//获取素材总数
Wechat.prototype.countMaterial = function() {
  var that = this;
  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        //接口api
        var url = api.permanent.count + 'access_token=' + data.access_token;
        //请求方法是get
        request({method: 'GET', url: url, json: true}).then(function(response) {
          //返回数据
          var _data = response.body;
          if (_data) {
            resolve(_data);
          }
          else {
            throw new Error('Count material fails');
          }
        })
        .catch(function(err) {
          reject(err);
        });
      });
  });
};
//获取素材列表
Wechat.prototype.batchMaterial = function(options) {
  var that = this;
  //返回素材类型，不传返回图片素材
  options.type = options.type || 'image';
  //位置偏移量，不传从第一个位置开始
  options.offset = options.offset || 0;
  //返回素材数量，不传返回一个素材
  options.count = options.count || 1;
  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        //接口api
        var url = api.permanent.batch + 'access_token=' + data.access_token;
        //post方法，传入options
        request({method: 'POST', url: url, body: options, json: true}).then(function(response) {
          //返回数据
          var _data = response.body;
          if (_data) {
            resolve(_data);
          }
          else {
            throw new Error('batch material fails');
          }
        })
        .catch(function(err) {
          reject(err);
        });
      });
  });
};





/* 
  //创建标签
  Wechat.prototype.createTag = function(name) {
    var that = this;
    return new Promise(function(resolve, reject) {
      that
        .fetchAccessToken()
        .then(function(data) {
          //接口api
          var url = api.tag.create + 'access_token=' + data.access_token;
          //post数据
          var form = {
            tag: {
              name: name
            }
          };
          //如果不是视频，图片，就用body，否则用formData
          request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
            var _data = response.body;
            if (_data) {
              resolve(_data);
            }
            else {
              throw new Error('create tag material fails');
            }
          })
          .catch(function(err) {
            reject(err);
          });
        });
    });
  };
  //查询所有标签
  Wechat.prototype.fetchTags = function(name) {
    var that = this;
    return new Promise(function(resolve, reject) {
      that
        .fetchAccessToken()
        .then(function(data) {
          //接口api
          var url = api.tag.fetch + 'access_token=' + data.access_token;
          //get请求
          request({url: url, json: true}).then(function(response) {
            var _data = response.body;
            if (_data) {
              resolve(_data);
            }
            else {
              throw new Error('Fetch tag fails');
            }
          })
          .catch(function(err) {
            reject(err);
          });
        });
    });
  };
  //修改标签
  Wechat.prototype.updateTag = function(id, name) {
    var that = this;
    return new Promise(function(resolve, reject) {
      that
        .fetchAccessToken()
        .then(function(data) {
          //接口api
          var url = api.tag.update + 'access_token=' + data.access_token;
          //post表单数据
          var form = {
            tag: {
              id: id,//分组id
              name: name//分组名称
            }
          };
          //post方法
          request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
            var _data = response.body;

            if (_data) {
              resolve(_data);
            }
            else {
              throw new Error('Update tag fails');
            }
          })
          .catch(function(err) {
            reject(err);
          });
        });
    });
  };
  //删除标签
  Wechat.prototype.deleteTag = function(id) {
    var that = this;
    return new Promise(function(resolve, reject) {
      that
        .fetchAccessToken()
        .then(function(data) {
          //接口api
          var url = api.tag.del + 'access_token=' + data.access_token;
          //post数据
          var form = {
            tag: {
              id: id//标签id
            }
          };
          //post方法
          request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
            var _data = response.body;

            if (_data) {
              resolve(_data);
            }
            else {
              throw new Error('Delete tag fails');
            }
          })
          .catch(function(err) {
            reject(err);
          });
        });
    });
  };
  //获取标签下粉丝列表
  Wechat.prototype.getTagUser = function(tagid,next_openid) {
    var that = this;
    return new Promise(function(resolve, reject) {
      that
        .fetchAccessToken()
        .then(function(data) {
          //接口api
          var url = api.tag.getTagUser + 'access_token=' + data.access_token;
          //不传默认从第一个开始
          next_openid=next_openid||'';
          //post数据
          var form = {
            tag: {
              tagid:tagid,//标签id
              next_openid: next_openid//第一个拉取的OPENID，不填默认从头开始拉取
            }
          };
          //post方法
          request({method: 'GET', url: url, body: form, json: true}).then(function(response) {
            var _data = response.body;

            if (_data) {
              resolve(_data);
            }
            else {
              throw new Error('GettagUser tag fails');
            }
          })
          .catch(function(err) {
            reject(err);
          });
        });
    });
  };

  //批量为用户打标签+批量为用户取消标签【取消标签将tagid改为空，为单个用户打标签传入数组个人为1就可以了】
  Wechat.prototype.moveTag = function(openIds, to) {
    var that = this;
    return new Promise(function(resolve, reject) {
      that
        .fetchAccessToken()
        .then(function(data) {
          //定义url
          var url=api.tag.batchupdate + 'access_token=' + data.access_token;;
          //form表单
          var form = {
            openid_list:openIds,//用户列表，是一个数组
            tagid: to//移动到哪个分组
          };
          //post请求
          request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
            var _data = response.body;
            if (_data) {
              resolve(_data);
            }
            else {
              throw new Error('Move tag fails');
            }
          })
          .catch(function(err) {
            reject(err);
          });
        });
    });
  };
  //查询用户身上标签列表
  Wechat.prototype.checkTag = function(openId) {
    var that = this;
    return new Promise(function(resolve, reject) {
      that
        .fetchAccessToken()
        .then(function(data) {
          //接口api
          var url = api.tag.check + 'access_token=' + data.access_token;
          //post数据参数
          var form = {
            openid: openId
          };
          //post请求
          request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
            var _data = response.body;
            if (_data) {
              resolve(_data);
            }
            else {
              throw new Error('Check tag fails');
            }
          })
          .catch(function(err) {
            reject(err);
          });
        });
    });
  };
*/
//创建分组
Wechat.prototype.createGroup = function(name) {
  var that = this;
  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        //接口api
        var url = api.group.create + 'access_token=' + data.access_token;
        //form表单
        var form = {
          group: {
            name: name
          }
        };
        //post请求
        request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
          var _data = response.body;
          if (_data) {
            resolve(_data);
          }
          else {
            throw new Error('create group material fails');
          }
        })
        .catch(function(err) {
          reject(err);
        });
      });
  });
};
//查询所有分组
Wechat.prototype.fetchGroups = function(name) {
  var that = this;
  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        //接口api
        var url = api.group.fetch + 'access_token=' + data.access_token;
        //get请求
        request({url: url, json: true}).then(function(response) {
          var _data = response.body;
          if (_data) {
            resolve(_data);
          }
          else {
            throw new Error('Fetch group fails');
          }
        })
        .catch(function(err) {
          reject(err);
        });
      });
  });
};
//查询用户所在分组
Wechat.prototype.checkGroup = function(openId) {
  var that = this;
  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        //接口api
        var url = api.group.check + 'access_token=' + data.access_token;
        //post表单数据
        var form = {
          openid: openId//用户的OpenID
        };
        //post请求
        request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
          var _data = response.body;
          if (_data) {
            resolve(_data);
          }
          else {
            throw new Error('Check group fails');
          }
        })
        .catch(function(err) {
          reject(err);
        });
      });
  });
};
//修改分组名
Wechat.prototype.updateGroup = function(id, name) {
  var that = this;
  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        //接口api
        var url = api.group.update + 'access_token=' + data.access_token;
        //form表单数据
        var form = {
          group: {
            id: id,// 分组id，由微信分配
            name: name//分组名字（30个字符以内）
          }
        };
        request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
          var _data = response.body;
          if (_data) {
            resolve(_data);
          }
          else {
            throw new Error('Update group fails');
          }
        })
        .catch(function(err) {
          reject(err);
        });
      });
  });
};
//移动用户分组+批量移动用户分组
Wechat.prototype.moveGroup = function(openIds, to) {
  var that = this;
  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        var url;
        var form = {
          to_groupid: to//移动到的-->分组id
        };
        //批量移动分组
        if (_.isArray(openIds)) {
          //接口api
          url = api.group.batchupdate + 'access_token=' + data.access_token;
          //用户唯一标识符openid的列表（size不能超过50）
          form.openid_list = openIds;
        }
        //移动单个用户分组
        else {
          //接口api
          url = api.group.move + 'access_token=' + data.access_token;
          //用户唯一标识符
          form.openid = openIds;
        }
        //POST请求
        request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
          var _data = response.body;
          if (_data) {
            resolve(_data);
          }
          else {
            throw new Error('Move group fails');
          }
        })
        .catch(function(err) {
          reject(err);
        });
      });
  });
};
//删除分组
Wechat.prototype.deleteGroup = function(id) {
  var that = this;
  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        //接口api
        var url = api.group.del + 'access_token=' + data.access_token;
        //post表单数据
        var form = {
          group: {
            id: id//分组的id
          }
        };
        //post请求
        request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
          var _data = response.body;
          if (_data) {
            resolve(_data);
          }
          else {
            throw new Error('Delete group fails');
          }
        })
        .catch(function(err) {
          reject(err);
        });
      });
  });
};








// 设置用户备注名【只对认证的公众号有权限】
Wechat.prototype.remarkUser = function(openId, remark) {
  var that = this;
  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
          //接口api
          var url = api.user.remark + 'access_token=' + data.access_token;
          var form = {
            openid: openId,//用户标识
            remark: remark//新的备注名，长度必须小于30字符 
          };
          //post请求
          request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
          var _data = response.body;
          if (_data) {
            resolve(_data);
          }
          else {
            throw new Error('Remark user fails');
          }
        })
        .catch(function(err) {
          reject(err);
        });
      });
  });
};
// 获取用户基本信息(UnionID机制)
Wechat.prototype.fetchUsers = function(openIds, lang) {
  var that = this;
  //语言标识 
  lang = lang || 'zh_CN';
  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        //配置post参数
        var options = {
          json: true
        };
        //批量获取用户信息
        if (_.isArray(openIds)) {
          //接口api
          options.url = api.user.batchFetch + 'access_token=' + data.access_token;
          //post参数，用户列表
          options.body = {
            user_list: openIds
          };
          //post请求方法
          options.method = 'POST';
        }
        else {
          //接口api，参数拼接在url中
          options.url = api.user.fetch + 'access_token=' + data.access_token + '&openid=' + openIds + '&lang=' + lang;
          //get请求方法
          options.method = 'GET';
        }
        //请求方法
        request(options).then(function(response) {
          var _data = response.body;
          if (_data) {
            resolve(_data);
          }
          else {
            throw new Error('Fetch user fails');
          }
        })
        .catch(function(err) {
          reject(err);
        });
      });
  });
};
// 获取用户列表
Wechat.prototype.listUsers = function(openId) {
  var that = this;
  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        //接口api
        var url = api.user.list + 'access_token=' + data.access_token;
        //传入的话，才去拼接。否则从第一个开始拉取
        if (openId) {
          url += '&next_openid=' + openId;下一个openId
        }
        //Get请求
        request({url: url, json: true}).then(function(response) {
          var _data = response.body;
          if (_data) {
            resolve(_data);
          }
          else {
            throw new Error('List user fails');
          }
        })
        .catch(function(err) {
          reject(err);
        });
      });
  });
};









//根据分组进行群发【订阅号与服务号认证后均可用】
Wechat.prototype.sendByGroup = function(type, message, groupId) {
  var that = this;
  //定义post表单
  var msg = {
    filter: {},//用于设定图文消息的接收者
    msgtype: type//群发的消息类型，图文消息为mpnews，文本消息为text，语音为voice，音乐为music，图片为image，视频为video，卡券为wxcard
  };
  //不同类型传入不同参数
  msg[type] = message;
  //如果没有传入分组ID，发给全部
  if (!groupId) {
    msg.filter.is_to_all = true;
  }
  //如果有群组ID
  else {
    msg.filter = {
      is_to_all: false,//用于设定是否向全部用户发送，值为true或false，选择true该消息群发给所有用户，选择false可根据group_id发送给指定群组的用户
      group_id: groupId//群发到的分组的group_id，参加用户管理中用户分组接口，若is_to_all值为true，可不填写group_id
    };
  }
  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        //接口api
        var url = api.mass.group + 'access_token=' + data.access_token;
        //post请求
        request({method: 'POST', url: url, body: msg, json: true}).then(function(response) {
          var _data = response.body;
          if (_data) {
            resolve(_data);
          }
          else {
            throw new Error('Send to group fails');
          }
        })
        .catch(function(err) {
          reject(err);
        });
      });
  });
};
//根据OpenID列表群发【订阅号不可用，服务号认证后可用】
Wechat.prototype.sendByOpenId = function(type, message, openIds) {
  var that = this;
  //定义post表单
  var msg = {
    msgtype: type,//群发的消息类型，图文消息为mpnews，文本消息为text，语音为voice，音乐为music，图片为image，视频为video，卡券为wxcard
    touser: openIds// 填写图文消息的接收者，一串OpenID列表，OpenID最少2个，最多10000个
  };
  //不同类型传入不同参数
  msg[type] = message;
  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        //接口api
        var url = api.mass.openId + 'access_token=' + data.access_token;
        //pos请求
        request({method: 'POST', url: url, body: msg, json: true}).then(function(response) {
          var _data = response.body;
          if (_data) {
            resolve(_data);
          }
          else {
            throw new Error('Send By Openid fails');
          }
        })
        .catch(function(err) {
          reject(err);
        });
      });
  });
};
// 删除群发【订阅号与服务号认证后均可用】由于技术限制，群发只有在刚发出的半小时内可以删除，发出半小时之后将无法被删除
Wechat.prototype.deleteMass = function(msgId) {
  var that = this;
  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        //接口api
        var url = api.mass.del + 'access_token=' + data.access_token;
        //post表单
        var form = {
          msg_id: msgId//发送出去的消息ID
        };
        //post请求
        request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
          var _data = response.body;
          if (_data) {
            resolve(_data);
          }
          else {
            throw new Error('Delete mass fails');
          }
        })
        .catch(function(err) {
          reject(err);
        });
      });
  });
};
//预览接口【订阅号与服务号认证后均可用】【一天100次】
Wechat.prototype.previewMass = function(type, message, openId) {
  var that = this;
  //post表单
  var msg = {
    msgtype: type,//  群发的消息类型，图文消息为mpnews，文本消息为text，语音为voice，音乐为music，图片为image，视频为video，卡券为wxcard
    touser: openId//接收消息用户对应该公众号的openid，该字段也可以改为towxname，以实现对微信号的预览
  };
  msg[type] = message;//消息主体
  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        //接口api
        var url = api.mass.preview + 'access_token=' + data.access_token;
        //post请求
        request({method: 'POST', url: url, body: msg, json: true}).then(function(response) {
          var _data = response.body;
          if (_data) {
            resolve(_data);
          }
          else {
            throw new Error('Preview mass fails');
          }
        })
        .catch(function(err) {
          reject(err);
        });
      });
  });
};
//查询群发消息发送状态【订阅号与服务号认证后均可用】
Wechat.prototype.checkMass = function(msgId) {
  var that = this;
  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        //接口api
        var url = api.mass.check + 'access_token=' + data.access_token;
        //postform表单
        var form = {
          msg_id: msgId//群发消息后返回的消息id
        };
        //post请求
        request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
          var _data = response.body;

          if (_data) {
            resolve(_data);
          }
          else {
            throw new Error('Check mass fails');
          }
        })
        .catch(function(err) {
          reject(err);
        });
      });
  });
};









//自定义菜单创建接口
Wechat.prototype.createMenu = function(menu) {
  var that = this;
  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        //接口api
        var url = api.menu.create + 'access_token=' + data.access_token;
        //pist请求
        request({method: 'POST', url: url, body: menu, json: true}).then(function(response) {
          var _data = response.body;
          if (_data) {
            resolve(_data);
          }
          else {
            throw new Error('Create menu fails');
          }
        })
        .catch(function(err) {
          reject(err);
        });
      });
  });
};
//自定义菜单查询接口
Wechat.prototype.getMenu = function(menu) {
  var that = this;
  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        //接口api
        var url = api.menu.get + 'access_token=' + data.access_token;
        //get请求
        request({url: url, json: true}).then(function(response) {
          var _data = response.body;
          if (_data) {
            resolve(_data);
          }
          else {
            throw new Error('Get menu fails');
          }
        })
        .catch(function(err) {
          reject(err);
        });
      });
  });
};
//自定义菜单删除接口
Wechat.prototype.deleteMenu = function() {
  var that = this;
  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        //接口api
        var url = api.menu.del + 'access_token=' + data.access_token;
        //get请求
        request({url: url, json: true}).then(function(response) {
          var _data = response.body;
          if (_data) {
            resolve(_data);
          }
          else {
            throw new Error('Delete menu fails');
          }
        })
        .catch(function(err) {
          reject(err);
        });
      });
  });
};
//获取自定义菜单配置接口
Wechat.prototype.getCurrentMenu = function() {
  var that = this;
  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        //接口api
        var url = api.menu.current + 'access_token=' + data.access_token;
        //get请求
        request({url: url, json: true}).then(function(response) {
          var _data = response.body;
          if (_data) {
            resolve(_data);
          }
          else {
            throw new Error('Get current menu fails');
          }
        })
        .catch(function(err) {
          reject(err);
        });
      });
  });
};









//创建二维码ticket
/* 
expire_seconds  该二维码有效时间，以秒为单位。 最大不超过604800（即7天）。
action_name 二维码类型，QR_SCENE为临时,QR_LIMIT_SCENE为永久,QR_LIMIT_STR_SCENE为永久的字符串参数值
action_info 二维码详细信息
scene_id  场景值ID，临时二维码时为32位非0整型，永久二维码时最大值为100000（目前参数只支持1--100000）
scene_str 场景值ID（字符串形式的ID），字符串类型，长度限制为1到64，仅永久二维码支持此字段
*/
Wechat.prototype.createQrcode = function(qr) {
  var that = this;
  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        //接口api
        var url = api.qrcode.create + 'access_token=' + data.access_token;
        //post请求传递参数
        request({method: 'POST', url: url, body: qr, json: true}).then(function(response) {
          var _data = response.body;
          if (_data) {
            resolve(_data);
          }
          else {
            throw new Error('Create qrcode fails');
          }
        })
        .catch(function(err) {
          reject(err);
        });
      });
  });
};
//通过ticket换取二维码
Wechat.prototype.showQrcode = function(ticket) {
  return api.qrcode.show + 'ticket=' + encodeURI(ticket);
};

//长链接转短链接接口
Wechat.prototype.createShorturl = function(action, url) {
  // 此处填long2short，代表长链接转短链接
  action = action || 'long2short';
  var that = this;
  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        //接口api
        var shorurl = api.shortUrl.create + 'access_token=' + data.access_token;
        //post表单
        var form = {
          action: action,//此处填long2short，代表长链接转短链接
          long_url: url//需要转换的长链接，支持http://、https://、weixin://wxpay 格式的url
        };
        //post请求
        request({method: 'POST', url: shorurl, body: form, json: true}).then(function(response) {
          var _data = response.body;
          if (_data) {
            //正常情况下，微信会返回下述JSON数据包给公众号：
            //{"errcode":0,"errmsg":"ok","short_url":"http:\/\/w.url.cn\/s\/AvCo6Ih"}
            resolve(_data);
          }
          else {
            throw new Error('Create shorturl fails');
          }
        })
        .catch(function(err) {
          reject(err);
        });
      });
  });
};







//语义理解
Wechat.prototype.semantic = function(semanticData) {
  var that = this;
  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        //接口api
        var url = api.semanticUrl + 'access_token=' + data.access_token;
        //公众号唯一标识，用于区分公众号开发者
        semanticData.appid = data.appID;
        //post请求：其他参数后台传入配置
        request({method: 'POST', url: url, body: semanticData, json: true}).then(function(response) {
          var _data = response.body;
          if (_data) {
            resolve(_data);
          }
          else {
            throw new Error('Semantic fails');
          }
        })
        .catch(function(err) {
          reject(err);
        });
      });
  });
};


module.exports=Wechat;