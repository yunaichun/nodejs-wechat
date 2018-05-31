# 简介

最初学习Node.js，结合微信开发文档，实现了一个web页面的简易功能。首先根据用户语音输入，解析出语音内容；再根据语音内容调用豆瓣SDK返回电影的海报图等信息，可预览和分享。同时利用Nodejs相关模块实现用户关注和取消关注公众号时邮件和短信的通知。

## 启动项目
- install dependencies
```sh
$ npm install
```

- start server 
```sh
$ npm run server
```

## 注意
- [微信加密认证](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421135319&token=&lang=zh_CN)   

   1. 将token、timestamp、nonce三个参数进行字典序排序
   2. 将三个参数字符串拼接成一个字符串进行sha1加密
   3. 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
   
- [获取access_token](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140183&token=&lang=zh_CN)

   1. 通过AppID和AppSecret获取
   2. access_token有效期7200s,需要定时去刷新，但是接口还有调用限制，所以得将access_token保存在本地
   
- [通过access_token获取jsapi_ticket,生成签名signature](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115&token=&lang=zh_CN)

   1. noncestr（随机字符串）, 有效的jsapi_ticket, timestamp（时间戳）, url（当前网页的URL，不包含#及其后面部分） 进行字典排序，结果用'&'拼接
   2. 对上述结果进行sha1签名，得到signature
   
- [JSSDK使用步骤](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115&token=&lang=zh_CN)
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
