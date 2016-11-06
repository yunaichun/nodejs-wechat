'use strict'

//xml转为js模块
var xml2js = require('xml2js');
/*Promise库*/
var Promise = require('bluebird');


/* 原始xml数据
<xml>
<ToUserName><![CDATA[gh_59afc6824fb7]]></ToUserName>   开发者微信号
<FromUserName><![CDATA[o3RrdwYGA_Y_rCv6Cbs5vxuovbuU]]></FromUserName>  发送方账号
<CreateTime>1477560418</CreateTime>                    创建时间
<MsgType><![CDATA[event]]></MsgType>                   事件类型
<Event><![CDATA[subscribe]]></Event>                   事件名称
<EventKey><![CDATA[]]></EventKey>                      内容
</xml>
*/
//解析xml数据
exports.parseXMLAsync = function(xml) {
  //返回Promise对象
  return new Promise(function(resolve, reject) {
    //解析原始XML数据，返回解析后的XML对象
    xml2js.parseString(xml, {trim: true}, function(err, content) {
        if (err) {
          reject(err);
        }else {
          //向下传递
          resolve(content);
        }
    })
  })
}
/* xml2js转换成js对象之后的数据：value值是数组，而且数组中有可能嵌套对象，数组也有可能为空
{ xml:
   { ToUserName: [ 'gh_59afc6824fb7' ],
     FromUserName: [ 'o3RrdwYGA_Y_rCv6Cbs5vxuovbuU' ],
     CreateTime: [ '1477561203' ],
     MsgType: [ 'event' ],
     Event: [ 'subscribe' ],
     EventKey: [ '' ] 
   } 
}
*/



//解析对象，拿到标准的key:value对象字面量【传入content.xml对象】
function formatMessage(result) {
  //定义空对象作为返回对象
  var message = {};
  /*如果是object对象的话*/
  if (typeof result === 'object') {
    //获取对象的所有keys
    var keys = Object.keys(result);
    //遍历object对象的keys
    for (var i = 0; i < keys.length; i++) {
      //拿到每一个key对应的value【这个value值一般都是数组的形式】
      var item = result[keys[i]];
      //拿到当前key
      var key = keys[i];
      //value值不是数组或者长度为0，直接跳出循环【那就是标准的key:value】
      if (!(item instanceof Array) || item.length === 0) {
        continue;
      }
      //value值是数组且长度为1，拿到这个值
      if (item.length === 1) {
          //拿到这个value值
          var val = item[0];
          //如果这个值是一个object对象的话
          if (typeof val === 'object') {
            //进一步遍历：进行循环
            message[key] = formatMessage(val);
          //如果这个值不是对象
          }else {
            //将这个值放在message对象中【去掉首尾的空格】
            message[key] = (val || '').trim();
          }
      //长度既不是0也不是0的情况：是数组的情况
      }else {
          //初始设置
          message[key] = [];
          //对数组中的每一项进行遍历
          for (var j = 0, k = item.length; j < k; j++) {
            //对数组中的每一项值进行format，再将其作为数组中的一个嵌套对象
            message[key].push(formatMessage(item[j]));
          }
      }
    }
  }
  return message;
}
exports.formatMessage = formatMessage;
/* formatMessage之后的数据格式
{ ToUserName: 'gh_59afc6824fb7',
  FromUserName: 'o3RrdwXX38cGs4674a-YFbrhdM68',
  CreateTime: '1477562377',
  MsgType: 'event',
  Event: 'subscribe',
  EventKey: ''
}
*/





/*引入模板*/
var tpl = require('./tpl');
/*返回编译好的用户发送的消息：事件推送+普通消息*/
/*
  content是页面body的响应【 var content = this.body;】
  message是用户发送的xml
*/
exports.tpl = function(content, message) {
  /*申明info对象，存储临时的内容*/
  var info = {};
  /*默认消息类型是文本*/
  var type = 'text';
  /* 来自谁*/
  var fromUserName = message.FromUserName;
  /*发给谁*/
  var toUserName = message.ToUserName;

  /* 图文消息*/
  if (Array.isArray(content)) {
    type = 'news';
  }

  /*无任何消息*/
  if (!content) {
    content = 'Empty news';
  }

  type = content.type || type;
  

  /*把内容复制给临时info*/
  info.content = content;
  /*创建时间*/
  info.createTime = new Date().getTime();
  /*消息类型*/
  info.msgType = type;
  /*来自谁*/
  info.toUserName = fromUserName;
  /*发自谁*/
  info.fromUserName = toUserName;

  /*返回编译好的信息*/
  /*tpl是编译好的模板，传入info*/
  return tpl.compiled(info);
}



