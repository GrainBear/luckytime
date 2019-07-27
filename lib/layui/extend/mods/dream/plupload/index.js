/**
 * plupload上传封装
 * 整理：ITCCP.CN 龚申展
 * Date：2018年8月13日21:28:33
 */
(function(root,factroy){
    // root = this = window
    // factroy = function(){}
    typeof root.layui === 'object' && layui.define ? layui.define(function(mods){mods('pupload',factroy(layui))}) :
        root.pupload = factroy();
}( this,function(layui){
    'use strict';
    var $ = layui.$,layer = layui.layer;
    return {
        //options 参数
        //url:上传服务器地址及上传文件路径参数，例如：/dream/file/upload?path=upload/file/
        loader:function (options,callback) {
            //引用下载js
            console.log(layui.cache.base);
            $.getScript(layui.cache.base+"dream/plupload/plupload.full.min.js",function () {
                if(!options.url){
                    layer.msg('初始化参数：上传地址不能为空.', {icon: 2});
                    return;
                }
                //alert(document.getElementById(options.browse_button))
                var upload = new plupload.Uploader({
                    runtimes: 'html5,flash,silverlight,html4',//设置运行环境，会按设置的顺序，可以选择的值有html5,gears,flash,silverlight,browserplus,html
                    flash_swf_url: layui.cache.base+'dream/plupload/Moxie.swf',
                    silverlight_xap_url: layui.cache.base+'dream/plupload/Moxie.xap',
                    url: options.url,//上传文件路径
                    max_file_size: options.max_file_size||'1tb',//100b, 10kb, 10mb, 1gb, 1tb
                    chunk_size: options.chunk_size||'1mb',//分块大小，小于这个大小的不分块
                    unique_names: options.unique_names || true,//生成唯一文件名
                    browse_button: options.browse_button||'plupload',
                    multi_selection: options.multi_selection || true,//是否可以选择多个，true为可以
                    filters: options.filters || [],
                    init: {
                        FilesAdded: function (uploader, files) {
                            //console.log(files)
                            if(typeof options.FilesAdded === 'function'){
                                options.FilesAdded(uploader,files);
                            }else{
                                uploader.start();
                            }
                            return false;
                        },
                        FileUploaded: function (uploader, file, info) {
                            //文件上传完毕触发
                            if(typeof options.FileUploaded === 'function'){
                                options.FileUploaded(uploader,file,info);
                            }
                        },
                        UploadComplete: function (uploader, files) {
                            //console.log("所有文件上传完毕");
                            if(typeof options.UploadComplete === 'function'){
                                options.UploadComplete(uploader,files);
                            }
                        },
                        UploadProgress: function (uploader, file) {
                            // console.log("上传进度为：" + file.percent + "%");
                            // console.log(file);
                            if(typeof options.UploadProgress === 'function'){
                                options.UploadProgress(uploader,file);
                            }
                        },
                        //当发生错误时触发监听函数
                        Error: function (up, err) {
                            if(typeof options.Error === 'function'){
                                options.Error(up,err);
                            }else if (err.code == -600) {
                                layer.open({
                                    title: '上传错误'
                                    ,content: '选择的文件太大了，最大不能超过'+(options.max_file_size||'1tb'),
                                    icon:2
                                });
                            }
                            else if (err.code == -601) {
                                layer.open({
                                    title: '上传错误'
                                    ,content: '选择的文件后缀不对',
                                    icon:2
                                });
                            }
                            else if (err.code == -602) {
                                layer.open({
                                    title: '上传错误'
                                    ,content: '请勿重复上传同一个文件',
                                    icon:2
                                });
                            }
                            else {
                                alert("\nError xml:" + err.response, "");
                            }
                        }
                    }
                });
                if(options.container){
                    upload.setOption("container", options.container); //按钮容器，可以为ID或者DOM(document.getElementById)
                }
                if(options.drop_element){
                    upload.setOption("drop_element", options.drop_element); //拖拽容器，可以为ID或者DOM(document.getElementById)
                }
                if(typeof callback === 'function'){
                    callback(upload)
                }else{
                    upload.init();
                }
            });
        }
    };
} ));