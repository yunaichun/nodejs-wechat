var http = require('http');
var url = require('url');
var util = require('util');
var  crypto = require('crypto')

function sort_2(a,b){
	var l;
	if(a.length>b.length){
		l=b.length;
		if(b==a.slice(0,b.length))
			return 1;
	}else if(a.length<b.length){
		if(a==b.slice(0,a.length))
			return 0;
		l=a.length;
	}else{
		l=a.length;
	}
	if(a==b){
		return 0;	
	}
	for(var i=0; i<l;i++){
		if(a[i]==b[i]){
			continue;
		}
		if(a[i]>b[i]){
			return 1;
			//break;
		}
		if(a[i]<b[i]){
			return 0;
			//break;
		}
	}
}
function sortDict(arr){
	var t=null;
	for(var i=0; i<arr.length-1;i++){
		for(var j=i+1;j<arr.length;j++){
			//console.log("i="+i+"\n"+"j="+j+"\n"+sort_2(arr[i],arr[j])+"\n");
			if(sort_2(arr[i],arr[j])){
				t=arr[i];
				arr[i]=arr[j];
				arr[j]=t;
				
				t=null;
			}
		}
	}
	return arr;
}

http.createServer(function(request,response){
	response.writeHead(200,{'content-Type':'text/plain'})
	var s=url.parse(request.url,true);
	var signature=s.query.signature;
	var timestamp=s.query.timestamp;
	var nonce=s.query.nonce;
	var echostr = s.query.echostr;
	console.log(signature);	
	console.log(nonce);
	console.log(timestamp);
	console.log(echostr);

	var token="imooc1111";

	var arr=[token, timestamp, nonce];

	var arr_after = sortDict(arr);//zi dian xu pai xu

	var new_str=arr_after[0]+arr_after[1]+arr_after[2];

	var sha1=crypto.createHash('sha1');
	sha1.update(new_str);
	var d=sha1.digest('hex');

	if(d==signature){
		response.write(echostr);
	}
	response.end();
	
}).listen(3001);
console.log('sever is running at port 3001');
