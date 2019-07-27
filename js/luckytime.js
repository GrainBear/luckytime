/**
 * Name:幸运时光  LuckyTime.js
 * Time:2019.01.06
 * Author:谷物熊  Lucky!Lucky!Lucky!
**/
function LuckyTime(domid){
    var that = this;
	this.isStart=false;
	var sid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {//生成窗口唯一ID
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }).replace(/-/g, '');
	var loading_index = layer.load(1, {
		shade: 0.6
	});
	var currentStatus="pause";
	var ID=domid;
	var num_Name=[{
		n:"一等奖",
		p:"香风智乃手办"
    },{
		n:"二等奖",
		p:"XBoxOne无线游戏手柄"
    },{
		n:"三等奖",
		p:"巧克力与香子兰挂画"
    },{
		n:"幸运奖",
		p:"bilibili大会员1个月"
    }];
	var color=['gray',,'orange','green','cyan','blue'];
	var each_prize_count=[1,3,5,10];//每种奖项的个数
	var lucky_idx = -1;//当前随机数
	var current_prize=0;//当前抽的奖
	var timerHwnd = null;//定时器句柄
	var luckyDraw_List=[];//待抽奖
	var luckyDog_List=[];//已中奖
	var giveUp_List=[];//放弃的
	//初始化
	var Init=function(){
		EventBind();
		Post("./php/LuckyTime.php",{
			Command:"GetInfo"
		},
		function(res){
			if(res.status===200){
				var obj = res.responseJSON;
				if(obj.Type==="LuckyInfo"){
					LoadInfo(obj);
				}
			}else{
				
			}
			
		});
	};
	
	var EventBind=function(){
		$('.button').click(function(){
			switch($(this).attr('id')){
				case "start-stop":{
					StartOrStop();
				}break;
				case "reset":{
					layer.confirm('确定重置所有信息吗？',{
						title:'提示',
						icon:3
					}, function(index){
						ResetInfo();
						layer.close(index);
					});
				}break;
				case "view-lucky":{
					LuckyDialog();
				}break;
				default:break;
			}
			
		});
		$(document).keydown(function(e){
			if(!e) var e = window.event; 
			if(e.keyCode==32){
				StartOrStop();
			}
		});
		
		function StartOrStop(){
			if(!that.isStart){
				if(currentStatus==="next"){
					RefreshCurrentPrize();
					$("#lucky-dog").addClass("hide");
					$('#ticker-tape').addClass("hide");
					$('#ticker-tape').removeClass("zoomIn animated");
					if($("#cover").hasClass("cover_active")){
						$("#cover").removeClass("cover_active");
					}
					$('#start-stop').html("开始抽奖");
				}else{
					if(that.Start()){
						$('#ticker-tape').addClass("hide");
						$('#ticker-tape').removeClass("zoomIn animated");
						$("#lucky-dog").removeClass("hide");
						if(!$("#cover").hasClass("cover_active")){
							$("#cover").addClass("cover_active");
						}
						$('#start-stop').html("停！");
					}
				}
			}else{
				if(that.Stop()){
					if(currentStatus==="next"){
						$('#start-stop').html("下一轮");
					}else{
						$('#start-stop').html("开始抽奖");
					}
				}
			}
		}
	};
	
	var LuckyStart=function(){
		lucky_idx = GetRandom(0,luckyDraw_List.length-1);
		$('#lucky-dog').attr('style','background-image:url(./img/photo/'+luckyDraw_List[lucky_idx].Name+'.jpg)');
		$('#lucky-dog-name').html(luckyDraw_List[lucky_idx].Name);
		timerHwnd = setTimeout(LuckyStart,10);
	};
	//开始抽奖
	this.Start=function(){
		$('#lucky-dog').removeClass("tada animated");
		if(!timerHwnd){
			if(luckyDraw_List.length>0 && current_prize>0){
				console.log("正在抽"+num_Name[current_prize-1].n);
				that.isStart=true;
				LuckyStart();
				return true;
			}else{
				layer.msg("抽奖结束了！",{
					offset: "rt"
				});
				return false;
			}
		}
		return false;
	};
	//停止，产生中奖者
	this.Stop=function(){
		if(timerHwnd){
			clearTimeout(timerHwnd);
			timerHwnd=null;
			var luckyDog = luckyDraw_List[lucky_idx];//产生幸运儿！
			luckyDog.Prize=current_prize;//当前的奖发给他！
			luckyDog_List.push(luckyDog);//加入幸运儿列表
			luckyDraw_List.splice(lucky_idx, 1);//从待抽奖列表中删除
			that.isStart=false;
			$('#lucky-dog').addClass("tada animated");
			$('#ticker-tape').removeClass("hide");
			$('#ticker-tape').addClass("zoomIn animated");
			layer.msg("恭喜 <span style='font-weight:bold;color:skyblue;'>"+luckyDog.Name+"</span> 中了 <br/><span style='font-weight:bold;color:orange;'>"+num_Name[current_prize-1].n+"</span>",{
				offset: "rt"
			});
			$('#lucky-list').prepend(
				'<div class="lucky-dog-list bounceIn animated">'+
					'<div class="lucky-dog-icon" style="background-image:url(./img/photo/'+luckyDog.Name+'.jpg)"></div>'+
					'<div class="lucky-dog-list-name">'+luckyDog.Name+'</div>'+
					'<div class="prize prize_'+luckyDog.Prize+'"><span class="layui-badge layui-bg-'+color[luckyDog.Prize+1]+'">'+num_Name[luckyDog.Prize-1].n+'</span></div>'+
					'<div class="lucky-dog-giveUp layui-btn layui-btn-danger layui-btn-xs" id="giveup-'+luckyDog.ID+'" value="'+luckyDog.ID+'" n="'+luckyDog.Name+'">放弃</div>'+
				'</div>'
			);
			$('#giveup-'+luckyDog.ID).click(function(){
				var the = $(this);
				layer.confirm(the.attr('n')+'，确定放弃奖品吗？',{
					title:'提示',
					icon:3
				}, function(index){
					that.GiveUp(parseInt(the.attr('value')));
					the.parent().children('.prize').html('<span class="layui-badge layui-bg-gray">已放弃</span></div>');
					the.parent().children('.prize').attr('class','prize prize_-1');
					the.remove();
					layer.close(index);
				});
			});
			RefreshCurrentPrize();
			PostCurrentInfo();
			return true;
		}
		return false;
	};
	//放弃
	this.GiveUp=function(id){
		for(var i=0;i<luckyDog_List.length;i++){
			if(luckyDog_List[i].ID===id){
				var giveUp = luckyDog_List[i];
				giveUp.Prize=-1;
				giveUp_List.push(giveUp);
				luckyDog_List.splice(i,1);//从中奖列表删除
				PostCurrentInfo();
				$('#start-stop').html("开始抽奖");
				break;
			}
		}
		RefreshCurrentPrize();
	};
	//恢复到未抽奖队列
	this.ResetLucky=function(id){
		for(var i=0;i<luckyDog_List.length;i++){
			if(luckyDog_List[i].ID===id){
				var resetLucky = luckyDog_List[i];
				resetLucky.Prize=0;
				luckyDraw_List.push(resetLucky);//返回未抽奖列表里
				luckyDog_List.splice(i,1);//从中奖列表删除
				PostCurrentInfo();
				break;
			}
		}
		RefreshCurrentPrize();
	};
	//获取随机数，公平公正
	var GetRandom = function(start, end) {
		var length = end - start + 1;
		var num = parseInt(Math.random() * (length) + start);
		return num;
	};
	//刷新几等奖
	var RefreshCurrentPrize=function(){
		var surplus = 0;
		var current_prize_count=[0,0,0,0];
		var tmp_prize = current_prize;
		for(var i=0;i<luckyDog_List.length;i++){
			current_prize_count[luckyDog_List[i].Prize-1]++;
		}
		for(var i=each_prize_count.length-1;i>=0;i--){
			if(current_prize_count[i]<each_prize_count[i]){//从后往前排，该奖没抽完，继续抽该奖
				current_prize=i+1;
				surplus = each_prize_count[i] - current_prize_count[i];
				break;
			}else{//该奖已经抽完，判断前一个奖
				current_prize=i;
			}
		}
		currentStatus="pause";
		if(tmp_prize!=0){//
			if(tmp_prize>current_prize){
				$('#gift-count').html("本轮剩余名额：0");
				currentStatus="next";
			}
		}
		if(currentStatus==="pause"){
			if(current_prize>0){
				$('#gift-bumber').html(num_Name[current_prize-1].n);
				$('#gift-count').html("本轮剩余名额："+surplus);
				$('#gift-name').html("奖品："+num_Name[current_prize-1].p);
				$('.gift-pic').attr('style','background-image:url(./img/gift/'+num_Name[current_prize-1].p+'.jpg)');
			}else{
				$('#gift-bumber').html('奖品已全部抽完');
				$('#gift-count').html("本轮剩余名额："+surplus);
				$('#gift-name').html('奖品已全部抽完');
				$('.gift-pic').attr('style','background-image:url(./img/gift/end.jpg)');
			}
		}
	};
	//向后端更新信息
	var PostCurrentInfo=function(){
		var info = luckyDraw_List.concat(luckyDog_List).concat(giveUp_List);
		Post("./php/LuckyTime.php",{
			Command:"SetInfo",
			LuckyDog_Info:info
		},function(res){
			if(res.status===200){
				var obj = res.responseJSON;
				if(obj.Type==="SetOK"){
					console.log("数据更新成功了！");
				}
			}
		});
	};
	//重置信息
	var ResetInfo=function(){
		if(timerHwnd){
			clearTimeout(timerHwnd);
		}
		lucky_idx = -1;//当前随机数
		current_prize=0;//当前抽的奖
		timerHwnd = null;//定时器句柄
		luckyDraw_List=[];//待抽奖
		luckyDog_List=[];//已中奖
		giveUp_List=[];//放弃的
		that.isStart=false;
		$("#start-stop").html("开始抽奖");
		if(!$("#lucky-dog").hasClass("hide")){$("#lucky-dog").addClass("hide");}
		if(!$("#ticker-tape").hasClass("hide")){$("#ticker-tape").addClass("hide");}
		if($("#cover").hasClass("cover_active")){$("#cover").removeClass("cover_active");}
		Post("./php/LuckyTime.php",{
			Command:"Reset"
		},function(res){
			if(res.status===200){
				var obj = res.responseJSON;
				if(obj.Type==="ResetOK"){
					LoadInfo(obj);
					layer.msg("数据恢复了！",{
						offset: "rt"
					});
				}
			}
		});
	};
	var LoadInfo=function(obj){
		$('#lucky-list').children().remove();
		luckyDraw_List=[];
		luckyDog_List=[];
		giveUp_List=[];
		$('.picture_icon').remove();
		for(var i=0;i<obj.LuckyDog_Info.length;i++){
			switch(obj.LuckyDog_Info[i].Prize){
				case 0:{//未抽奖
					luckyDraw_List.push(obj.LuckyDog_Info[i]);
					$('body').append('<div class="picture_icon" id="picture_icon_'+obj.LuckyDog_Info[i].ID+'" style="background-image:url(./img/photo/'+obj.LuckyDog_Info[i].Name+'.jpg)"><div class="cover"></div></div>');
				}break;
				case -1:{//放弃
					giveUp_List.push(obj.LuckyDog_Info[i]);
					$('#lucky-list').append(
						'<div class="lucky-dog-list bounceIn animated">'+
							'<div class="lucky-dog-icon" style="background-image:url(./img/photo/'+obj.LuckyDog_Info[i].Name+'.jpg)"></div>'+
							'<div class="lucky-dog-list-name">'+obj.LuckyDog_Info[i].Name+'</div>'+
							'<div class="prize prize_'+obj.LuckyDog_Info[i].Prize+'"><span class="layui-badge layui-bg-gray">已放弃</span></div>'+
						'</div>'
					);
				}break;
				default:{//获奖的
					luckyDog_List.push(obj.LuckyDog_Info[i]);
					$('#lucky-list').prepend(
						'<div class="lucky-dog-list bounceIn animated">'+
							'<div class="lucky-dog-icon" style="background-image:url(./img/photo/'+obj.LuckyDog_Info[i].Name+'.jpg)"></div>'+
							'<div class="lucky-dog-list-name">'+obj.LuckyDog_Info[i].Name+'</div>'+
							'<div class="prize prize_'+obj.LuckyDog_Info[i].Prize+'"><span class="layui-badge layui-bg-'+color[obj.LuckyDog_Info[i].Prize+1]+'">'+num_Name[obj.LuckyDog_Info[i].Prize-1].n+'</span></div>'+
							'<div class="lucky-dog-giveUp layui-btn layui-btn-danger layui-btn-xs" id="giveup-'+obj.LuckyDog_Info[i].ID+'" value="'+obj.LuckyDog_Info[i].ID+'" n="'+obj.LuckyDog_Info[i].Name+'">放弃</div>'+
						'</div>'
					);
					$('#giveup-'+obj.LuckyDog_Info[i].ID).click(function(){
						var the = $(this);
						layer.confirm(the.attr('n')+'，确定放弃奖品吗？',{
							title:'提示',
							icon:3
						}, function(index){
							that.GiveUp(parseInt(the.attr('value')));
							layer.close(index);
						});
					});
				}break;
			}
		}
		currentStatus="pause";
		RefreshCurrentPrize();
		layer.close(loading_index);
	};
	var LuckyDialog=function(){
		layer.open({
			type: 1,
			title: '获奖名单',
			shade: 0.5,
			id: 'lucky-form', //设定一个id，防止重复弹出
			moveType: 0, //拖拽模式，0或者1
			area: ['810px', '480px'],
			content:
			'<div class="layui-tab">'+
				'<ul class="layui-tab-title">'+
					'<li class="layui-this">一等奖</li>'+
					'<li>二等奖</li>'+
					'<li>三等奖</li>'+
					'<li>幸运奖</li>'+
				'</ul>'+
				'<div class="layui-tab-content">'+
					'<div class="layui-tab-item layui-show" id="lucky1"></div>'+
					'<div class="layui-tab-item" id="lucky2"></div>'+
					'<div class="layui-tab-item" id="lucky3"></div>'+
					'<div class="layui-tab-item" id="lucky4"></div>'+
				'</div>'+
			'</div>',
			success: function(layero){
				for(var i=0; i<luckyDog_List.length;i++){
					var luckyer = luckyDog_List[i];
					$('#lucky'+luckyer.Prize).append('<div class="luckyer_icon" style="background-image:url(./img/photo/'+luckyer.Name+'.jpg);"><div class="lucker_icon_name">'+luckyer.Name+'</div></div>');
				}
			}
		});
	};
	Init();
}