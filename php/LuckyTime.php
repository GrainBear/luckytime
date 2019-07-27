<?php
/**
 * Name:幸运时光服务端  LuckyTime.php
 * Time:2019.01.06
 * Author:GrainBear  Lucky!Lucky!Lucky!
**/
	header("Content-Type:text/html;charset=utf-8");
	header("Access-Control-Allow-Origin:*");
	header('Access-Control-Allow-Headers:x-requested-with,content-type');
	error_reporting(E_ALL || ~E_NOTICE);
	if(isset($GLOBALS)){
		$jsonData = json_decode($GLOBALS['HTTP_RAW_POST_DATA']);//获取到PostJson信息
		$cmd = $jsonData->Command;//种类
		switch($cmd){
			case "GetInfo":{//请求获取json
				$file = file_get_contents(iconv("utf-8", "gbk//IGNORE","./LuckyInfo.json"));
				if($file==''){
					$file = ResetLucky();
				}
				echo '{"Type":"LuckyInfo","LuckyDog_Info":'.$file.'}';//返回服务端存储的json
			}break;
			case "SetInfo":{//幸运者
					$value=json_encode($jsonData->LuckyDog_Info,JSON_UNESCAPED_UNICODE);//json数据
					//写入文件
					$fp = fopen(iconv("utf-8", "gbk//IGNORE","./LuckyInfo.json"),"w");
					flock($fp,LOCK_EX); //flock() 不能在NFS以及其他的一些网络文件系统中正常工作
					fputs($fp,$value); 
					flock($fp,LOCK_UN); 
					fclose($fp);
					echo '{"Type":"SetOK","LuckyDog_Info":'.$value.'}';
			}break;
			case "Reset":{
				$file = ResetLucky();
				echo '{"Type":"ResetOK","LuckyDog_Info":'.$file.'}';//返回服务端存储的json
			}break;
			default:break;
		}
	}
	//重置
	function ResetLucky(){
		$luckyPicdir = opendir('../img/photo/');
		$allLucky='';
		$cnt = 0;
		while($dirhandle=readdir($luckyPicdir)){
			$fileutf8 = iconv("gbk", "utf-8//IGNORE", $dirhandle);
			if(is_dir('../img/photo/'.$dirhandle)){}//文件夹跳过
			else{
				$cnt++;
				$allLucky.='{"ID":'.$cnt.',"Name":"'.explode('.',$fileutf8)[0].'","Prize":0},';
			}
		}
		$allLucky = substr($allLucky,0,strlen($allLucky)-1);
		closedir($luckyPicdir);
		clearstatcache();
		$value = '['.$allLucky.']';
		$fp = fopen(iconv("utf-8", "gbk//IGNORE","./LuckyInfo.json"),"w");
		flock($fp,LOCK_EX); //flock() 不能在NFS以及其他的一些网络文件系统中正常工作
		fputs($fp,$value); 
		flock($fp,LOCK_UN); 
		fclose($fp);
		return $value;
	}
?>