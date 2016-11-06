 'use strict'

/*模板引擎:渲染模板*/
 var ejs=require('ejs');
/*大段拼接字符串：模板文件*/
 var heredoc=require('heredoc');


/*消息类型判断*/
/*forEach  循环*/
/*if       判断*/
/*<% %>    传入变量*/
var tpl = heredoc(function() {/*
  <xml>
  <ToUserName><![CDATA[<%= toUserName %>]]></ToUserName>
  <FromUserName><![CDATA[<%= fromUserName %>]]></FromUserName>
  <CreateTime><%= createTime %></CreateTime>
  <MsgType><![CDATA[<%= msgType %>]]></MsgType>
 
  <% if (msgType === 'text') { %>
    <Content><![CDATA[<%- content %>]]></Content>
  <% } else if (msgType === 'image') { %>
    <Image>
      <MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>
    </Image>
  <% } else if (msgType === 'voice') { %>
    <Voice>
      <MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>
    </Voice>
  <% } else if (msgType === 'video') { %>
    <Video>
      <MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>
      <Title><![CDATA[<%= content.title %>]]></Title>
      <Description><![CDATA[<%= content.description %>]]></Description>
    </Video>
  <% } else if (msgType === 'music') { %>
    <Music>
      <Title><![CDATA[<%= content.title %>]]></Title>
      <Description><![CDATA[<%= content.description %>]]></Description>
      <MusicUrl><![CDATA[<%= content.musicUrl %>]]></MusicUrl>
      <HQMusicUrl><![CDATA[<%= content.hqMusicUrl %>]]></HQMusicUrl>
      <ThumbMediaId><![CDATA[<%= content.thumbMediaId %>]]></ThumbMediaId>
    </Music>
  <% } else if (msgType === 'news') { %>
    <ArticleCount><%= content.length %></ArticleCount>
    <Articles>
    <% content.forEach(function(item) { %>
      <item>
        <Title><![CDATA[<%= item.title %>]]></Title>
        <Description><![CDATA[<%= item.description %>]]></Description>
        <PicUrl><![CDATA[<%= item.picUrl %>]]></PicUrl>
        <Url><![CDATA[<%= item.url %>]]></Url>
      </item>
    <% }) %>
    </Articles>
  <% } %>
  </xml>
*/});

/*通过ejs编译模板*/
var compiled = ejs.compile(tpl);


/*暴露此模板：暴露对象*/
exports = module.exports = {
  compiled: compiled
};