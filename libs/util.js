'use strict'

//引入文件模块
var fs=require('fs');
//引入bluebird
var Promise=require('bluebird');

//暴露异步方法:读取文件
exports.readFileAsync=function(fpath,encoding){
	return new Promise(function(resolve,reject){
		//读取文件：传入文件、编码方式和回调
		fs.readFile(fpath,encoding,function(err,content){
			//如果异常，直接拒绝
			if(err){
				//错误
				reject(err);
			}else{
				//向下传递
				resolve(content);
			}
		});
	});
};


//暴露异步方法:写入文件
exports.writeFileAsync=function(fpath,content){
	return new Promise(function(resolve,reject){
		//读取文件：传入文件、编码方式和回调
		fs.writeFile(fpath,content,function(err){
			//如果异常，直接拒绝
			if(err){
				console.log('未写入票据access_token');
				reject(err);
			}else{
				console.log('已经写入票据access_token');
				resolve();
			}
		});
	});
};