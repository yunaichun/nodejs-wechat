'use strict'

module.exports = {
  'button': [{//一级菜单数组，个数应为1~3个
    'name': '排行榜',//菜单标题，不超过16个字节，子菜单不超过40个字节
    'sub_button': [{//二级菜单数组，个数应为1~5个
      'name': '最热的',
      'type': 'click',//菜单的响应动作类型
      'key': 'movie_hot'//传递到后台，知道是点击哪个按钮。菜单KEY值，用于消息接口推送，不超过128字节[click等点击类型必须]
    }, {
      'name': '最冷的',
      'type': 'click',
      'key': 'movie_cold'
    }]
  }, {
    'name': '分类',
    'sub_button': [{
      'name': '犯罪',
      'type': 'click',
      'key': 'movie_crime'
    }, {
      'name': '动画',
      'type': 'click',
      'key': 'movie_cartoon'
    }]
  }, {
    'name': '帮助',
    'type': 'click',
    'key': 'help'
  }]
};