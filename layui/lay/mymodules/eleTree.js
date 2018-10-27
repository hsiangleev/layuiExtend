/**
 * 基于layui的tree重写
 * author: hsianglee
 * 最近修改时间: 2018/10/27
 * 说明：因isEqualNode，ie8不支持拖拽功能
 */

layui.define(["jquery","laytpl","layer","form"], function (exports) {
    var $ = layui.jquery;
    var laytpl = layui.laytpl;
    var layer = layui.layer;
    var form = layui.form;
    
    function Class(option) {
        this.option=option;     // 获取传入的数据
        this.elem="";
        this.data=[];
        this.showCheckbox=this.option.showCheckbox;
        this.drag=this.option.drag;
        this.accordion=this.option.accordion;
        this.lazy=this.option.lazy;
        this.loadData=this.option.loadData;
        this.contextmenuList=[];    
        this.node="";               // 生成树的dom字符串
        this.checkedData=[];        // 被选中的数据
        this.prevClickEle;          // 记录上次点击的dom
        this.treeMenu="";           // 右键菜单字符串
        this.filter="";
        this.isIE8=navigator.appName=="Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g,"")=="MSIE8.0";

        this.render();
    }

    Class.prototype={
        constructor: Class,
        // 初始化参数数据
        render: function () {
            var self=this;
            self.option.elem?(function(){
                self.elem=self.option.elem;
            })():(function() {
                throw "缺少elem节点选择器";
            })();
            self.contextmenuList=self.option.contextmenuList?self.option.contextmenuList:[];
            self.lazy && !self.loadData && (function() {
                throw "缺少懒加载回调函数";
            })()
            
            self.filter=$(self.elem).attr("lay-filter");
            // 判断data参数
            if(self.option.data){
                self.data=self.option.data;
                self.init();
                return;
            }
            // 判断url参数
            if(self.option.url){
                $.ajax({
                    url: self.option.url,
                    type: self.option.type?self.option.type:"get",
                    data: self.option.where?self.option.where:{},
                    success: function(data){
                        if(data.Code===0){
                            self.data=data.Data;
                            self.init();
                            return;
                        }
                        layer.alert(data.Msg, { title: "选择器"+self.elem+"获取数据失败", icon: 2 });
                    }
                });
                return;
            }
            throw "选择器"+self.elem+"缺少data或url参数";
        },
        // 初始化容器和标签
        init: function () {
            var self=this;
            this.node="";
            this.es5ArrMethods();
            $(this.elem).empty();
            $(this.elem).off();
            this.nodeInit(this.data,0,false);

            $(this.elem).html(this.node);
            this.checkboxEvent();
            // 更新选中的数据
            this.getCheckedData();

            this.drag && this.nodeDrag();

            this.eleTreeEvent();

            this.contextmenuList.length && this.contextmenuList.length>0 && this.rightClickMenu();
            this.checkInit();
            
        },
        // 增加foreach,some,every方法支持ie8
        es5ArrMethods: function() {
            if (!Array.prototype.every) {
                Array.prototype.every = function (every_fun, thisArg) {
                    var _this = null,
                        iKey = 0,
                        len = this.length; //无符号右移
                    if (typeof every_fun !== "function") {
                        throw new TypeError("every_fun is not a function");
                    }
                    if (thisArg) {
                        _this = thisArg;
                    }//绑定执行环境
                    for (; iKey < len; iKey++) {
                        var  key_Value = this[iKey];
                        if(!every_fun.call(_this, key_Value, iKey, this)){
                            return false;
                        };
                    }
                    return true;
                }
            }
            if (!Array.prototype.some) {
                Array.prototype.some = function (some_fun, thisArg) {
                    var _this = null,
                        iKey = 0,
                        arr_len = this.length;
                    if (typeof some_fun != 'function') {
                        throw new typeError('some_fun is not a function')
                    }
                    if (thisArg) {
                        _this = thisArg;
                    }
                    for (; iKey < arr_len; iKey++) {
                        var key_value = this[iKey];
                        if (some_fun.call(_this, key_value, iKey, this)) {
                            return true;
                        }
                    }
                    return false;
                }
            }
            if (!Array.prototype.forEach) {
                Array.prototype.forEach = function(callback/*, thisArg*/) {
                    var T, k;
                    if (this == null) {
                        throw new TypeError('this is null or not defined');
                    }
                    var O = Object(this);
                    var len = O.length >>> 0;   // 所有非数值转换成0,所有大于等于 0 等数取整数部分
                    if (typeof callback !== 'function') {
                        throw new TypeError(callback + ' is not a function');
                    }
                    if (arguments.length > 1) {
                        T = arguments[1];
                    }
                    k = 0;
                    while (k < len) {
                        var kValue;
                        if (k in O) {
                            kValue = O[k];
                            callback.call(T, kValue, k, O);
                        }
                        k++;
                    }
                };
            }
        },
        // dom生成
        nodeInit: function(arr,count,spread) {
            // count: 第几层
            // spread: 是否不展开
            var self=this;
            var a=[];
            arr.forEach(function(val,index) {
                var b=['<div class="eleTree-node ',spread?'eleTree-hide':"",'" eleTree-floor="'+count+'">'
                    ,'<div class="eleTree-node-content" style="padding-left: '+18*count+'px;">'
                        ,'<span class="eleTree-node-content-icon">'
                            // 判断叶子节点
                            ,(function() {
                                var fn=function(lazyClassStr) {
                                    if(self.isIE8){
                                        var s='<i class="layui-icon '+lazyClassStr;
                                        if(val.spread){
                                            s+='layui-icon-triangle-d ';
                                        }else{
                                            s+='layui-icon-triangle-r ';
                                        }
                                        s+=' "></i>'
                                    }else{
                                        var s='<i class="layui-icon layui-icon-triangle-r '+lazyClassStr;
                                        if(val.spread){
                                            s+='icon-rotate';
                                        }
                                        s+=' "></i>'
                                    }
                                    return s;
                                }
                                if(val.children && val.children.length>0){
                                    return fn("");
                                }else if(self.lazy && !val.children && !val.isLeaf){
                                    // 懒加载
                                    return fn("lazy-icon ")
                                }else{
                                    return '<i class="layui-icon layui-icon-triangle-r" style="color: transparent;"></i>'
                                }
                            })()
                        ,'</span>'
                        // 判断是否启用checkbox
                        ,(function() {
                            var s='';
                            if(self.showCheckbox){
                                s+='<input type="checkbox" name="eleTree-node"';
                                if(val.checked){
                                    s+=' eleTree-status="1" checked '
                                }else{
                                    s+=' eleTree-status="0"'
                                }
                                s+='class="eleTree-hideen '
                                if(val.disabled){
                                    s+='eleTree-disabled'
                                }
                                s+='" >';
                            }

                            return s;
                        })()

                        ,'<span class="eleTree-node-content-label">'+val.label+'</span>'
                    ,'</div>'
                    ,'<div class="eleTree-node-group">'
                        ,(function() {
                            if(val.children && val.children.length>0){
                                return self.nodeInit(val.children,count+1,!val.spread);     // 获取已经遍历完的子节点
                            }
                        })()
                    ,'</div>'
                ,'</div>'];
                a=a.concat(b);
            },this);
            this.node=a.join("");
            return this.node;   // 返回已经遍历完的子节点
        },
        // 手风琴效果
        accordionFn: function(ele,d) {
            if(!this.accordion) return;
            // 手风琴
            var parentSibling=ele.parent(".eleTree-node").siblings(".eleTree-node");
            parentSibling.children(".eleTree-node-group").children().hide("fast");
            
            if(this.isIE8){
                parentSibling.children(".eleTree-node-content").children(".eleTree-node-content-icon").children(".layui-icon").removeClass("layui-icon-triangle-d").addClass("layui-icon-triangle-r");
            }else{
                parentSibling.children(".eleTree-node-content").find(".layui-icon-triangle-r").removeClass("icon-rotate");

            }

            var parentData=d.parentData;
            // 最外层判断
            if(d.index.length===1){
                this.data.forEach(function(val,index) {
                    if(index!==parentData.childIndex){
                        delete val.spread;
                    }
                })
            }else{
                parentData.data.children.forEach(function(val,index) {
                    if(index!==parentData.childIndex){
                        delete val.spread;
                    }
                })
            }
        },
        // 展开合并动画
        eleTreeEvent: function() {
            var self=this;
            $(this.elem).on("click",".eleTree-node-content",function(e) {
                e.stopPropagation();
                // 添加active背景
                if(self.prevClickEle) self.prevClickEle.removeClass("eleTree-node-content-active");
                $(this).addClass("eleTree-node-content-active");
                // 获取点击所在数据
                var node=$(this).parent(".eleTree-node ");
                var data=self.reInitData(node);
                var d=data.currentData;
                // 切换下拉
                var el=$(this).children(".eleTree-node-content-icon").children(".layui-icon");
                if(self.isIE8) {
                    // ie8
                    if(el.hasClass("layui-icon-triangle-d")){
                        // 合并
                        $(this).siblings(".eleTree-node-group").children().hide("fast");
                        el.removeClass("layui-icon-triangle-d").addClass("layui-icon-triangle-r");
                        // 数据修改
                        delete d.spread;
                    }else{
                        // 展开
                        // 懒加载数据
                        if(self.lazy && el.hasClass("lazy-icon")){
                            el.removeClass("layui-icon-triangle-r").addClass("layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop");
                            self.loadData(d,function(childrenData) {
                                d.children=childrenData;
                                self.render();
                            })
                        }

                        $(this).siblings(".eleTree-node-group").children().show("fast");
                        el.addClass("layui-icon-triangle-d").removeClass("layui-icon-triangle-r");
                        // 数据修改
                        d.spread=true;
                        self.accordionFn($(this),data);
                    }
                }else{
                    if(el.hasClass("icon-rotate")){
                        // 合并
                        $(this).siblings(".eleTree-node-group").children().hide("fast");
                        el.removeClass("icon-rotate");
                        // 数据修改
                        delete d.spread;
                    }else{
                        // 展开
                        // 懒加载数据
                        if(self.lazy && el.hasClass("lazy-icon")){
                            el.removeClass("layui-icon-triangle-r icon-rotate").addClass("layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop");
                            self.loadData(d,function(childrenData) {
                                d.children=childrenData;
                                self.render();
                            })
                        }

                        $(this).siblings(".eleTree-node-group").children().show("fast");
                        el.addClass("icon-rotate");
                        // 数据修改
                        d.spread=true;
                        self.accordionFn($(this),data);
                    }
                }
                
                self.prevClickEle=$(this);

                // 数据返回
                layui.event.call(this, "eleTree", 'toggleSlide('+ self.filter +')', {
                    data: self.data
                    ,currentData: d
                });

                $("#tree-menu").hide().remove();
            })
            $(document).on("click",function() {
                $("#tree-menu").hide().remove();
            });
        },
        // 右键菜单
        rightClickMenu: function() {
            var self=this;
            var menuStr=['<ul id="tree-menu" lay-filter="treeMenu">'
                ,$.inArray("copy",this.contextmenuList)!==-1?'<li class="copy"><a href="javascript:;">复制</a></li>':''
                ,$.inArray("add",this.contextmenuList)!==-1?'<li class="add"><a href="javascript:;">新增</a></li>':''
                ,$.inArray("edit",this.contextmenuList)!==-1?'<li class="edit"><a href="javascript:;">修改</a></li>':''
                ,$.inArray("remove",this.contextmenuList)!==-1?'<li class="remove"><a href="javascript:;">删除</a></li>':''
            ,'</ul>'].join("");
            this.treeMenu=$(menuStr);
            $(this.elem).on("contextmenu",".eleTree-node-content",function(e) {
                var _self=this;
                e.stopPropagation();
                e.preventDefault();
                // 添加active背景
                if(self.prevClickEle) self.prevClickEle.removeClass("eleTree-node-content-active");
                $(this).addClass("eleTree-node-content-active");
                
                // 菜单位置
                $(document.body).after(self.treeMenu);
                $("#tree-menu").css({
                    left: e.pageX,
                    top: e.pageY
                }).show();
                // 复制
                $("#tree-menu li.copy").off().on("click",function() {
                    var el = $(_self).children(".eleTree-node-content-label").get(0);
                    var selection = window.getSelection();
                    var range = document.createRange();
                    range.selectNodeContents(el);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    document.execCommand('Copy', 'false', null);
                    selection.removeAllRanges();
                });
                // 新增
                $("#tree-menu li.add").off().on("click",function() {
                    layer.prompt({title: "请输入label值"},function(value, index, elem){
                        // 判断当前是否选中，若选中，则新增的子元素也应该选中
                        var isChecked=$(_self).children(".eleTree-hideen").attr("eletree-status")==="1";
                        // 数据修改
                        var node=$(_self).parent(".eleTree-node ");
                        var data=self.reInitData(node);
                        var d=data.currentData;
                        d.children?"":d.children=[];
                        var obj={
                            label: value
                        }
                        isChecked?obj.checked=true:"";
                        d.children.push(obj);
                        d.spread=true;

                        self.accordionFn($(_self),data);

                        // 数据返回
                        layui.event.call(_self, "eleTree", 'add('+ self.filter +')', {
                            value: value
                            ,data: self.data
                            ,currentData: d
                        });
                        
                        // dom修改
                        var floor=Number($(_self).parent(".eleTree-node").attr("eletree-floor"))+1;
                        var isLeaf=$(_self).siblings(".eleTree-node-group").children(".eleTree-node").length===0;
                        isLeaf && $(_self).children(".eleTree-node-content-icon").children("i").css("color","#c0c4cc").addClass("icon-rotate");
                        var s=['<div class="eleTree-node" eleTree-floor="'+floor+'">'
                            ,'<div class="eleTree-node-content" style="padding-left: '+18*floor+'px;">'
                                ,'<span class="eleTree-node-content-icon">'
                                    ,'<i class="layui-icon layui-icon-triangle-r" style="color: transparent;"></i>'
                                ,'</span>'
                                // 判断是否启用checkbox
                                ,(function() {
                                    var s="";
                                    if(self.showCheckbox){
                                        s+='<input type="checkbox" name="eleTree-node" class="eleTree-hideen"';
                                        s+=isChecked?' eleTree-status="1"':' eleTree-status="0"'
                                        s+='>'
                                    }
                                    return s;
                                })()
        
                                ,'<span class="eleTree-node-content-label">'+value+'</span>'
                            ,'</div>'
                            ,'<div class="eleTree-node-group">'
                                
                            ,'</div>'
                        ,'</div>'].join("");
                        $(_self).siblings(".eleTree-node-group").append(s);
                        // checkbox解析
                        var inp=$(_self).siblings(".eleTree-node-group").children(".eleTree-node:last").children(".eleTree-node-content").children("input.eleTree-hideen[type=checkbox]");
                        var checkStr=['<div class="eleTree-checkbox '
                        ,isChecked?'eleTree-checkbox-checked':''
                        ,'"><i class="layui-icon '
                        ,isChecked?'layui-icon-ok':''
                        ,'"></i></div>'].join("");

                        inp.after(checkStr);
                        
                        layer.close(index);
                    });
                });
                // 编辑
                $("#tree-menu li.edit").off().on("click",function() {
                    layer.prompt({
                        value: $(_self).children(".eleTree-node-content-label").text(),
                        title: '请输入修改的label值'
                    },function(value, index, elem){
                        // 数据修改
                        var node=$(_self).parent(".eleTree-node ");
                        var d=self.reInitData(node).currentData;
                        d.label=value;
                        // 数据返回
                        layui.event.call(_self, "eleTree", 'edit('+ self.filter +')', {
                            value: value
                            ,data: self.data
                            ,currentData: d
                        });
                        // dom修改
                        $(_self).children(".eleTree-node-content-label").text(value);
                        layer.close(index);
                    });
                });
                // 删除
                $("#tree-menu li.remove").off().on("click",function() {
                    // 数据删除
                    var node=$(_self).parent(".eleTree-node ");

                    var data=self.reInitData(node);
                    var d=data.parentData.data;
                    var arr=data.index;

                    // 最外层判断
                    if(arr.length===1){
                        self.data.splice(arr[arr.length-1],1);
                    }else{
                        if(d["children"]){
                            d["children"].splice(arr[arr.length-1],1);
                            d["children"].length===0 && delete d["children"];
                        }
                    }

                    // 数据返回
                    layui.event.call(_self, "eleTree", 'remove('+ self.filter +')', {
                        data: self.data
                        ,parentData: d
                    });
                    // dom删除
                    var tem=$(_self).parent(".eleTree-node").parent(".eleTree-node-group");
                    $(_self).parent(".eleTree-node").remove();
                    var isLeaf=tem.children(".eleTree-node").length===0;
                    isLeaf && tem.siblings(".eleTree-node-content").children(".eleTree-node-content-icon").children("i").css("color","transparent").removeClass("icon-rotate");
                });
                
                self.prevClickEle=$(this);
            })
        },
        // 自定义checkbox解析
        checkboxRender: function() {
            $(this.elem).find(this.elem+" .eleTree-checkbox").remove();
            $(this.elem+" input.eleTree-hideen[type=checkbox]").each(function(index,item){
                if($(item).hasClass("eleTree-disabled")){
                    $(item).after('<div class="eleTree-checkbox eleTree-checkbox-disabled"><i class="layui-icon"></i></div>');
                }else{
                    $(item).after('<div class="eleTree-checkbox"><i class="layui-icon"></i></div>');
                }
                
            })
        },
        // 通过子孙选中祖父（递归）
        selectParents: function(inp,eleNode,siblingNode) {
            // inp: 实际input(dom元素)
            // eleNode: input父层类（.eleTree-node）
            // siblingNode: 父层同级兄弟
            while (Number(eleNode.attr("eletree-floor"))!==0) {
                // 同级input状态存入数组
                var arr=[];
                arr.push($(inp).attr("eleTree-status"));
                siblingNode.each(function(index,item) {
                    var siblingIsChecked=$(item).children(".eleTree-node-content").children("input[name='eleTree-node']").attr("eleTree-status");
                    arr.push(siblingIsChecked);
                })
                // 父元素的实际input
                var parentInput=eleNode.parent(".eleTree-node-group").siblings(".eleTree-node-content").children("input[name='eleTree-node']");
                // 父元素的checkbox替代
                var parentCheckbox=parentInput.siblings(".eleTree-checkbox");
                // 父元素的icon
                var parentIcon=parentCheckbox.children("i");
                if(arr.every(function(val) {
                    return val==="1";
                })){
                    // 子都选中则选中父
                    parentInput.prop("checked","checked").attr("eleTree-status","1");
                    parentCheckbox.addClass("eleTree-checkbox-checked");
                    parentIcon.addClass("layui-icon-ok").removeClass("eleTree-checkbox-line");
                }
                if(arr.some(function(val) {
                    return val==="0" || val==="2";
                })){
                    // 子有一个未选中则checkbox第三种状态
                    // parentInput.prop("checked","checked");
                    parentInput.attr("eleTree-status","2");
                    parentCheckbox.addClass("eleTree-checkbox-checked");
                    parentIcon.removeClass("layui-icon-ok").addClass("eleTree-checkbox-line");
                }
                if(arr.every(function(val) {
                    return val==="0";
                })){
                    // 子全部未选中则取消父选中(并且取消第三种状态)
                    parentInput.removeAttr("checked");
                    parentInput.attr("eleTree-status","0");
                    parentCheckbox.removeClass("eleTree-checkbox-checked");
                    parentIcon.removeClass("layui-icon-ok eleTree-checkbox-line");
                }

                var parentNode=eleNode.parents("[eletree-floor='"+(Number(eleNode.attr("eletree-floor"))-1)+"']");
                var parentCheckbox=parentNode.children(".eleTree-node-content").children("input[name='eleTree-node']").get(0);
                var parentSiblingNode=parentNode.siblings(".eleTree-node");
                eleNode=parentNode;
                inp=parentCheckbox;
                siblingNode=parentSiblingNode;
            }
        },
        // checkbox添加选中事件
        checkboxEvent: function() {
            var self=this;
            this.checkboxRender();
            // input添加属性eleTree-status：即input的三种状态，"0":未选中，"1":选中，"2":子孙部分选中
            $(this.elem).on("click",".eleTree-checkbox",function(e) {
                e.stopPropagation();
                if($(this).hasClass("eleTree-checkbox-disabled")) return;
                // 获取点击所在数据
                var node=$(this).parent(".eleTree-node-content").parent(".eleTree-node ");
                var d=self.reInitData(node).currentData;
                // 实际的input
                var inp=$(this).siblings(".eleTree-hideen").get(0);
                if(inp.checked){
                    $(inp).removeAttr("checked").attr("eleTree-status","0");
                    $(this).removeClass("eleTree-checkbox-checked");
                    $(this).children("i").removeClass("layui-icon-ok eleTree-checkbox-line");
                    // 数据更新
                    delete d.checked;
                }else{
                    $(inp).prop("checked","checked").attr("eleTree-status","1");
                    $(this).addClass("eleTree-checkbox-checked");
                    $(this).children("i").addClass("layui-icon-ok").removeClass("eleTree-checkbox-line");
                    d.checked=true;
                }

                var childNode=$(inp).parent(".eleTree-node-content").siblings(".eleTree-node-group").find("input[name='eleTree-node']");
                // 点击祖父层选中子孙层
                inp.checked?(function() {
                    childNode.prop("checked","checked").attr("eleTree-status","1");
                    childNode.siblings(".eleTree-checkbox").addClass("eleTree-checkbox-checked");
                    childNode.siblings(".eleTree-checkbox").children("i").addClass("layui-icon-ok").removeClass("eleTree-checkbox-line");
                })():(function() {
                    childNode.removeAttr("checked");
                    childNode.attr("eleTree-status","0");
                    childNode.siblings(".eleTree-checkbox").removeClass("eleTree-checkbox-checked");
                    childNode.siblings(".eleTree-checkbox").children("i").removeClass("layui-icon-ok eleTree-checkbox-line");
                })();   
                
                
                var eleNode=$(inp).parent(".eleTree-node-content").parent(".eleTree-node");
                var siblingNode=eleNode.siblings(".eleTree-node");
                // 点击子孙层选中祖父层(递归)
                self.selectParents(inp,eleNode,siblingNode);
                // 更新选中的数据
                self.getCheckedData();

                // 数据返回
                layui.event.call(inp, "eleTree", 'checkbox('+ self.filter +')', {
                    data: self.data
                    ,checkedData: self.checkedData
                    ,currentData: d
                });
            })
        },
        // 拖拽
        nodeDrag: function() {
            var self=this;
            $(this.elem).on("mousedown",".eleTree-node-content",function(e) {
                var _self=this;
                var time=0;
                e.stopPropagation();
                $(self.elem).css("user-select","none");
                var node=$(this).parent(".eleTree-node ");
                var cloneNode=node.clone(true);
                var temNode=node.clone(true);

                var x=e.clientX-$(self.elem).offset().left;
                var y=e.clientY-$(self.elem).offset().top;
                $(self.elem).append(cloneNode);
                cloneNode.css({
                    display: "none",
                    position: "absolute",
                    "background-color": "#f5f5f5",
                    width: "100%"
                })
                $("#tree-menu").hide().remove();

                $(document.body).on("mousemove",function(e) {
                    // t为了区别click事件
                    time++;
                    if(time>2){
                        var xx=e.clientX-$(self.elem).offset().left+10;
                        var yy=e.clientY-$(self.elem).offset().top-5;

                        cloneNode.css({
                            display: "block",
                            left: xx+"px",
                            top: yy+"px"
                        })
                    }
                }).on("mouseup",function(e) {
                    // dom更改
                    var groupNode=node.parent(".eleTree-node-group");
                    cloneNode.remove();
                    $(self.elem).css("user-select","auto");
                    $(document.body).off("mousemove").off("mouseup");
                    var target=$(e.target);
                    // 数据更改
                    var dataReset=function(len,childIndex,t) {
                        // 删除数据
                        var d=self.reInitData(node);
                        var parentData=d.parentData.data;
                        var temData=d.currentData;
                        var i=d.parentData.childIndex;

                        if(len===0){
                            // 判断目标是否超出范围
                            return false;
                        }
                        // 判断当前是否是最外层
                        if(d.index.length===1){
                            self.data.splice(d.index[0],1);
                        }else{
                            parentData.children.splice(i,1);
                            parentData.children.length===0 && delete parentData.children;
                        }
                        // 如果是同级的，并且从上面的移动到下面，则index减一
                        var f1=Number(node.attr("eletree-floor"))-1;
                        var f2=Number(node.attr("eletree-floor"))-1;
                        if(i<childIndex && node.parents(".eleTree-node[eletree-floor='"+f1+"']").get(0).isEqualNode(t.parents(".eleTree-node[eletree-floor='"+f2+"']").get(0))){
                            childIndex=childIndex-1;
                        }

                        return {
                            temData: temData,
                            childIndex: childIndex
                        };
                    }

                    // 判断是否是同一个dom树
                    var isOwnTarget=target.parents(".eleTree").length===0?target.get(0):target.parents(".eleTree").get(0);
                    if(!(isOwnTarget.isEqualNode($(self.elem+".eleTree").get(0)))){
                        return;
                    }

                    // 判断目标是否是最外层
                    if(target.get(0).isEqualNode($(self.elem+".eleTree").get(0))){
                        var dataRe=dataReset();
                        var d=dataRe.temData;
                        self.data.push(d);
                        node.remove();
                        // 添加节点
                        $(self.elem+".eleTree").append(temNode);
                        // 改floor
                        temNode.attr("eletree-floor","0");
                        // 加padding
                        temNode.children(".eleTree-node-content").css("padding-left","0px");
                        // 原dom去三角
                        var leaf=groupNode.children(".eleTree-node").length===0;
                        leaf && groupNode.siblings(".eleTree-node-content")
                            .children(".eleTree-node-content-icon").children(".layui-icon-triangle-r")
                            .removeClass("icon-rotate").css("color","transparent");

                        // 数据返回
                        if(time>2){
                            layui.event.call(_self, "eleTree", 'drag('+ self.filter +')', {
                                data: self.data
                                ,currentData: d
                            });
                            eleTree.reload(self.elem, {data: self.data});
                        }
                        return;
                    }
                    // 判断是否不是同一个dom节点或者是其子节点（父节点不能放到子节点）
                    var t=target;
                    if(!target.hasClass("eleTree-node-content")){
                        t=target.parents(".eleTree-node-content");
                    }
                    var f=Number(node.attr("eletree-floor"));
                    var isNotParentsNode=node.get(0).isEqualNode(t.parents("[eletree-floor='"+f+"']").get(0));

                    if(!isNotParentsNode){
                        var d=self.reInitData(t.parent(".eleTree-node"));
                        var i=d.parentData.childIndex;
                        var dataRe=dataReset(d.index.length,i,t);
                        var temData=dataRe.temData;
                        i=dataRe.childIndex;

                        // 判断目标是否超出范围
                        if(temData){
                            node.remove();
                            // 添加之前先删dom
                            var parentData=d.parentData.data;
                            if(d.index.length===1){
                                parentData.children?parentData.children.push(temData):parentData.children=[temData];
                            }else{
                                parentData.children[i].children?parentData.children[i].children.push(temData):parentData.children[i].children=[temData];
                            }

                            // 添加节点
                            target.siblings(".eleTree-node-group").append(temNode);
                            // 改floor
                            var floor=Number(target.parent(".eleTree-node").attr("eletree-floor"))+1;
                            temNode.attr("eletree-floor",String(floor));
                            // 加padding
                            temNode.children(".eleTree-node-content").css("padding-left",floor*18+"px");
                            // 加三角
                            target.children(".eleTree-node-content-icon").children(".layui-icon-triangle-r")
                                .addClass("icon-rotate").css("color","#c0c4cc");
                            // 原dom去三角
                            var leaf=groupNode.children(".eleTree-node").length===0;
                            leaf && groupNode.siblings(".eleTree-node-content")
                                .children(".eleTree-node-content-icon").children(".layui-icon-triangle-r")
                                .removeClass("icon-rotate").css("color","transparent");

                            // 数据返回
                            if(time>2){
                                layui.event.call(_self, "eleTree", 'drag('+ self.filter +')', {
                                    data: self.data
                                    ,currentData: temData
                                    ,targetData: d.currentData
                                });
                                eleTree.reload(self.elem, {data: self.data});
                            }
                        }
                    }
                    
                })

                
            })
        },
        // 初始化checkbox选中状态
        checkInit: function(arr,floor) {
            var self=this;
            $(self.elem+" input[eleTree-status='1']").each(function(index,item) {
                var checkboxEl=$(item).siblings(".eleTree-checkbox");
                var childNode=checkboxEl.parent(".eleTree-node-content").siblings(".eleTree-node-group").find("input[name='eleTree-node']");
                // 选择当前
                checkboxEl.addClass("eleTree-checkbox-checked");
                checkboxEl.children("i").addClass("layui-icon-ok").removeClass("eleTree-checkbox-line");
                // 选择子孙
                childNode.prop("checked","checked").attr("eleTree-status","1");
                childNode.siblings(".eleTree-checkbox").addClass("eleTree-checkbox-checked");
                childNode.siblings(".eleTree-checkbox").children("i").addClass("layui-icon-ok").removeClass("eleTree-checkbox-line");
                
                // 选择祖父
                var eleNode=checkboxEl.parent(".eleTree-node-content").parent(".eleTree-node");
                var siblingNode=eleNode.siblings(".eleTree-node");
                self.selectParents(item,eleNode,siblingNode);
            })
        },
        // 获取选中的数据
        getCheckedData: function() {
            this.checkedData=[];
            var self=this;
            $(this.elem+" input[eletree-status='1']").each(function(index,item) {
                var node=$(item).parent(".eleTree-node-content").parent(".eleTree-node ");
                var d=self.reInitData(node).currentData;
                self.checkedData.push(d);
            })
            return this.checkedData
        },
        // 通过dom节点找对应数据
        reInitData: function(node) {
            var i=node.index();
            var floor=Number(node.attr("eletree-floor"));
            var arr=[];     // 节点对应的index
            while (floor>=0) {
                arr.push(i);
                floor=floor-1;
                node=node.parents("[eletree-floor='"+floor+"']");
                i=node.index();
            }
            arr=arr.reverse();
            var oData=this.data;
            // 当前节点的父节点数据
            var parentData=oData[arr[0]];
            // 当前节点的data数据
            var d = oData[arr[0]];
            for(var i = 1; i<arr.length; i++){
                d = d["children"]?d["children"][arr[i]]:d;
            }
            for(var i = 1; i<arr.length-1; i++){
                parentData = parentData["children"]?parentData["children"][arr[i]]:parentData;
            }

            return {
                currentData: d,
                parentData: {
                    data: parentData,
                    childIndex: arr[arr.length-1]
                },
                index: arr
            }
        }
    }
    
    var thisEleTree=function() {
        thisEleTree.o[this.elem] = this;
        thisEleTree.config[this.elem] = this.option;
        thisEleTree.getCheckedData[this.elem] = this.getCheckedData;
    }
    // 保存当前对象(为了获取选中元素时改变this指向)
    thisEleTree.o = {};
    // 保存对象的option
    thisEleTree.config = {};
    // 获取选中的元素
    thisEleTree.getCheckedData = {};

    var eleTree={
        checkedData: function(elem){
            return thisEleTree.getCheckedData[elem].call(thisEleTree.o[elem]);
        },
        render: function(option) {
            var inst=new Class(option);
            thisEleTree.call(inst);
        },
        on: function(events, callback) {
            return layui.onevent.call(this, "eleTree", events, callback);
        },
        reload: function(elem, option) {
            var config = thisEleTree.config[elem];
            this.render($.extend({}, config, option));
        }
    }
    
    exports('eleTree',eleTree);
})