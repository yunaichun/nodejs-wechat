# 简介
利用Node.js的Koa框架，结合微信开发文档，实现常用接口Api，主要实现以下接口功能(点击可进入微信开发文档)，由于测试号和个人订阅号未认证，所以有一些接口权限的功能无法完成测试，只是完成了此功能。

- [素材管理](https://mp.weixin.qq.com/wiki/5/963fc70b80dc75483a271298a76a8d59.html)
- [消息管理](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140453&token=&lang=zh_CN)
  - [接收消息](https://mp.weixin.qq.com/wiki/10/79502792eef98d6e0c6e1739da387346.html)
  - [回复消息](https://mp.weixin.qq.com/wiki/14/89b871b5466b19b3efa4ada8e577d45e.html)
- [用户管理](https://mp.weixin.qq.com/wiki/0/56d992c605a97245eb7e617854b169fc.html)
- [账号管理](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1443433542&token=&lang=zh_CN)
- [自定义菜单](https://mp.weixin.qq.com/wiki/13/43de8269be54a0a6f64413e4dfa94f39.html)
- [语义接口](https://mp.weixin.qq.com/wiki/0/0ce78b3c9524811fee34aba3e33f3448.html)
- [JS-SDK](https://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html)

最后利用JS-SDK的 ***基础接口、分享接口、图像接口、音频接口、识别音频并返回识别结果接口*** 实现对电影的查询，通过语音识别结果去请求豆瓣SDK，可以对海报图进行预览，也可以发送给朋友。同时实现用户关注和取消关注时邮件和短信的通知。


## 需要安装以下模块
- koa
```sh
$ npm install koa
```
- Pomise
```sh
$ npm install bluebird
```
- wechat
```sh
$ npm install sha1
$ npm install crypto
$ npm install request
$ npm install lodash
```
- XML
```sh
$ npm install raw-body
$ npm install xml2js
$ npm install ejs
$ npm install heredoc
```
- message
```sh
$ npm install nodemailer
$ npm install alidayu-node
```
## 以下几点需要注意
1. [微信加密认证](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421135319&token=&lang=zh_CN)   

   1. 将token、timestamp、nonce三个参数进行字典序排序
   2. 将三个参数字符串拼接成一个字符串进行sha1加密
   3. 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
   
2. [获取access_token](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140183&token=&lang=zh_CN)

   1. 通过AppID和AppSecret获取
   2. access_token有效期7200s,需要定时去刷新，但是接口还有调用限制，所以得将access_token保存在本地
   
3. [通过access_token获取jsapi_ticket,生成签名signature](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115&token=&lang=zh_CN)

   1. noncestr（随机字符串）, 有效的jsapi_ticket, timestamp（时间戳）, url（当前网页的URL，不包含#及其后面部分） 进行字典排序，结果用'&'拼接
   2. 对上述结果进行sha1签名，得到signature
   
4. [JSSDK使用步骤](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115&token=&lang=zh_CN)
   1. 绑定域名
   2. 引入JS文件
   3. **通过config接口注入权限验证配置***
   
   ```sh
   wx.config({
        debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: '', // 必填，公众号的唯一标识
        timestamp: , // 必填，生成签名的时间戳
        nonceStr: '', // 必填，生成签名的随机串
        signature: '',// 必填，签名，见附录1
        jsApiList: [] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
    });
   ```



