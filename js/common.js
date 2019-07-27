//Post
function Post(url,jsonObj,callBack,errBack){//
	$.ajax({
        crossDomain: true,
        xhrFields:{
            withCredentials:true
		},
		type:"POST",
		url:url,
		data:JSON.stringify(jsonObj),
		contentType : "application/json",  
		dataType : "json",
		complete:callBack,
		error:errBack?errBack:function(e){
			
		}
	});
}
//Get
function Get(b,c){
    $.ajax({
        url:b,
        crossDomain:true,
        xhrFields:{
            withCredentials:true
        },
        success:function(a){
            c(a);
        }
	});
}
//上传
function UploadFile(url,inputId,info,progressHandlingFunction,successHandleFunction,errorHandleFunction){
	var fd=new FormData();
	fd.append("info",JSON.stringify(info));
    fd.append("file", $('#'+inputId).get(0).files[0]);
    $.ajax({
        url: url,
        crossDomain: true,
        xhrFields:{
            withCredentials:true
        },
        type: "POST",
        data: fd,
        contentType: false,//必须false才会自动加上正确的Content-Type
        processData: false,//必须false才会避开jQuery对 formdata 的默认处理
        xhr: function(){ //获取ajaxSettings中的xhr对象，为它的upload属性绑定progress事件的处理函数
            fXhr = $.ajaxSettings.xhr();
            if(fXhr.upload){ //检查upload属性是否存在
                //绑定progress事件的回调函数
                fXhr.upload.addEventListener('progress',progressHandlingFunction, false);
            }
            return fXhr; //xhr对象返回给jQuery使用
        },
        success : successHandleFunction,
		error : errorHandleFunction
    });
}

// 格式化时间
function DateFormat(oDate, fmt) {
	var o = {
		"M+": oDate.getMonth() + 1, //月份
		"d+": oDate.getDate(), //日
		"h+": oDate.getHours(), //小时
		"m+": oDate.getMinutes(), //分
		"s+": oDate.getSeconds(), //秒
		"q+": Math.floor((oDate.getMonth() + 3) / 3), //季度
		"S": oDate.getMilliseconds()//毫秒
	};
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (oDate.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
}

//设置Cookies
function SetCookie(key,ckval,cktime){
	var exp = new Date();
	exp.setTime(exp.getTime() + (cktime * 24 * 60 * 60 * 1000));
	document.cookie = key + "=" + ckval + "; expires=" + exp.toGMTString() + "; path=/" + "; domain="+URLConfigure.Localhost;
}
//获取Cookie
function GetCookie(key){
	var arr,reg=new RegExp("(^| )"+key+"=([^;]*)(;|$)");
	if(arr=document.cookie.match(reg)){
		return unescape(arr[2]);
	}
	else{
		return null;
	}
}

function Dictionary(){
	this.Item = new Array();
	
	var that=this;
	this.GetValue=function(key){
		if(that.ContainsKey(key)){
			return that.Item[key];
		}else{
			return null;
		}
	};
	this.Add=function(key,val){
		if(!that.ContainsKey(key)){
			that.Item[key]=val;
		}
	};
	
	this.Remove=function(key){
		if(that.ContainsKey(key)){
			delete that.Item[key];
		}
	};
	
	this.Clear=function(){
		for(var key in that.Item){
			delete that.Item[key];
		}
	};
	
	this.Count=function(){
		var n = 0;
		for(var key in Object.keys(that.Item)){
			++n;
		}
		return n;
	};
	
	this.ContainsKey=function(key){
		if(that.Item[key]){
			return true;
		}else{
			return false;
		}
	};
}

function SortBy(filed, rev, primer){//排序
    rev = (rev) ? -1 : 1;
    return function (a, b){
        a = a[filed];
        b = b[filed];
        if (typeof (primer) != 'undefined') {
            a = primer(a);
            b = primer(b);
        }
        if (a < b) { return rev * -1; }
        if (a > b) { return rev * 1; }
        return 1;
    }
}
var ArrayIndexOf = function(arr,val) { 
	for (var i = 0; i < arr.length; i++) { 
		if (arr[i] == val) return i; 
	} 
	return -1; 
};
var ArrayRemove = function(arr,val) { 
	var index = ArrayIndexOf(arr,val); 
	if (index > -1) { 
		arr.splice(index, 1); 
	} 
};

function WebSocketClient(webSocketURL){
	var that=this;
    var websocket = null;
    this.ready="disconnect";
    this.onmessage=null;
    this.NeedRelink=false;
    this.Init=function (callback) {//WebSocket
        try {
            websocket = new WebSocket(webSocketURL);
            websocket.onopen = function (evt) {//连接成功
                if (websocket.readyState == 1) {//握手成功
                    that.ready = "connected";
                    if(callback){callback();}
                } else {
                    //ReLinkThread = setTimeout(function(){that.WebSocket.Init();},5000);
                }
            };
            websocket.onmessage = function (evt) {//收到数据
                if (evt.data) {
                    try {
                    	if(that.onmessage) {
                            that.onmessage(JSON.parse(evt.data));//解析json
                        }
                    } catch (excp) {

                    }
                }
            };
            websocket.onclose = function (evt) {//关闭Socket
                websocket = null;
                that.ready = "disconnect";
                if (that.NeedRelink) {
                    setTimeout(function () {
                        that.WebSocket.Init();
                    }, 5000);
                }
            };
            websocket.onerror = function (evt) {//socket出错
                that.ready = "error";
            };
        } catch (excp) {

        }
    };
    this.SendMessage=function (message) {
        if (websocket && that.ready == "connected") {
            websocket.send(message);
        }
    }
}

$('.layui-nav-tree>.layui-nav-item').click(function () {
    $('.layui-nav-tree>.layui-nav-item').removeClass('layui-nav-itemed');
    $(this).addClass('layui-nav-itemed');
});

$('document').ready(function () {
    $('.panel-body').css({"height":"calc(100% - "+($('.panel-head').height()+21)+"px)","overflow":"auto"});
    $(window).resize(function () {
        $('.panel-body').css({"height":"calc(100% - "+($('.panel-head').height()+21)+"px)","overflow":"auto"});
    });
});
