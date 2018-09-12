/**
 * 基于layui的无限级联选择器
 * 使用：
 * 
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
        this.contextmenuList=[];
        this.node="";
        this.checkedData=[];
        this.prevClickEle;       // 记录上次点击的dom
        this.treeMenu="";

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
            this.node=[];
            $(this.elem).empty();
            $(this.elem).off();
            this.nodeInit(this.data,0,false);

            console.log(this.data);

            $(this.elem).html(this.node);
            this.checkboxEvent();

            this.eleTreeEvent();
            if(this.contextmenuList.length && this.contextmenuList.length>0){
                this.rightClickMenu();
            }
            this.checkInit(this.data,0);
            this.disabledInit(this.data,0);
            
        },
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
                                if(val.children && val.children.length>0){
                                    var s='<i class="layui-icon layui-icon-triangle-r ';
                                    if(val.spread){
                                        s+='icon-rotate';
                                    }
                                    s+=' "></i>'
                                    return s;
                                }else{
                                    return '<i class="layui-icon layui-icon-triangle-r" style="color: transparent;"></i>'
                                }
                            })()
                        ,'</span>'
                        // 判断是否启用checkbox
                        ,this.showCheckbox?'<input type="checkbox" name="eleTree-node" eleTree-status="0" class="eleTree-hideen" >':""

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
        eleTreeEvent: function() {
            // 展开合并动画
            var self=this;
            $(this.elem).on("click",".eleTree-node-content",function(e) {
                e.stopPropagation();
                // 添加active背景
                if(self.prevClickEle) self.prevClickEle.removeClass("eleTree-node-content-active");
                $(this).addClass("eleTree-node-content-active");
                // 获取点击所在数据
                var node=$(this).parent(".eleTree-node ");
                var d=self.reInitData(node);
                // 切换下拉
                var el=$(this).find(".layui-icon-triangle-r");
                if(el.hasClass("icon-rotate")){
                    $(this).siblings(".eleTree-node-group").children().slideUp("fast");
                    el.removeClass("icon-rotate");
                    // 数据修改
                    delete d.spread;
                }else{
                    $(this).siblings(".eleTree-node-group").children().slideDown("fast");
                    el.addClass("icon-rotate");
                    // 数据修改
                    d.spread=true;
                }
                self.prevClickEle=$(this);

                // 数据返回
                layui.event.call(self, "eleTree", 'toggleSlide(treeMenu)', {
                    elem: this
                    ,data: self.data
                });

                $("#tree-menu").hide().remove();
            })
            $(document).on("click",function() {
                $("#tree-menu").hide().remove();
            });
        },
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
                $(self.elem).after(self.treeMenu);
                $("#tree-menu").css({
                    left: event.pageX,
                    top: event.pageY,
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
                        var d=self.reInitData(node);
                        d.children?"":d.children=[];
                        var obj={
                            label: value,
                            spread: true,
                        }
                        isChecked?obj.checked=true:"";
                        d.children.push(obj)
                        // 数据返回
                        var p=layui.event.call(self, "eleTree", 'add(treeMenu)', {
                            elem: _self
                            ,value: value
                            ,data: self.data
                        });
                        // 若果return false，则数据还原
                        // if(p===false){
                        //     layer.close(index);
                        //     return;
                        // }
                        // dom修改
                        // self.render();
                        // return;
                        // var floor=Number($(_self).parent(".eleTree-node").attr("eletree-floor"))+1;
                        // var isLeaf=$(_self).siblings(".eleTree-node-group").children(".eleTree-node").length===0;
                        // isLeaf && $(_self).children(".eleTree-node-content-icon").children("i").css("color","#c0c4cc").addClass("icon-rotate");
                        // var s=['<div class="eleTree-node" eleTree-floor="'+floor+'">'
                        //     ,'<div class="eleTree-node-content" style="padding-left: '+18*floor+'px;">'
                        //         ,'<span class="eleTree-node-content-icon">'
                        //             ,'<i class="layui-icon layui-icon-triangle-r" style="color: transparent;"></i>'
                        //         ,'</span>'
                        //         // 判断是否启用checkbox
                        //         ,(function() {
                        //             var s="";
                        //             if(self.showCheckbox){
                        //                 s+='<input type="checkbox" name="eleTree-node" class="eleTree-hideen"';
                        //                 s+=isChecked?' eleTree-status="1"':' eleTree-status="0"'
                        //                 s+='>'
                        //             }
                        //             return s;
                        //         })()
        
                        //         ,'<span class="eleTree-node-content-label">'+value+'</span>'
                        //     ,'</div>'
                        //     ,'<div class="eleTree-node-group">'
                                
                        //     ,'</div>'
                        // ,'</div>'].join("");
                        // $(_self).siblings(".eleTree-node-group").append(s);
                        // // checkbox解析
                        // var inp=$(_self).siblings(".eleTree-node-group").children(".eleTree-node:last").children(".eleTree-node-content").children("input.eleTree-hideen[type=checkbox]");
                        // var checkStr=['<div class="eleTree-checkbox '
                        // ,isChecked?'eleTree-checkbox-checked':''
                        // ,'"><i class="layui-icon '
                        // ,isChecked?'layui-icon-ok':''
                        // ,'"></i></div>'].join("");

                        // inp.after(checkStr);
                        
                        layer.close(index);
                    });
                });
                // 编辑
                $("#tree-menu li.edit").off().on("click",function() {
                    layer.prompt({
                        value: $(_self).children(".eleTree-node-content-label").text(),
                        title: '请输入修改的label值',
                    },function(value, index, elem){
                        // 数据修改
                        var node=$(_self).parent(".eleTree-node ");
                        var d=self.reInitData(node);
                        d.label=value;
                        // 数据返回
                        layui.event.call(self, "eleTree", 'edit(treeMenu)', {
                            elem: _self
                            ,value: value
                            ,data: self.data
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
                    var i=node.index();
                    var floor=Number(node.attr("eletree-floor"));
                    var arr=[];
                    while (floor>=0) {
                        arr.push(i);
                        floor=floor-1;
                        node=node.parents("[eletree-floor='"+floor+"']");
                        i=node.index();
                    }
                    arr=arr.reverse();
                    var oData=self.data;
                    var d = oData[arr[0]];
                    for(var i = 1; i<arr.length-1; i++){
                        d = d["children"][arr[i]];
                    }
                    d["children"].splice(arr[arr.length-1],1);
                    d["children"].length===0 && delete d["children"];
                    // 数据返回
                    layui.event.call(self, "eleTree", 'remove(treeMenu)', {
                        elem: _self
                        ,data: self.data
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
        checkboxRender: function() {
            // 自定义checkbox解析
            $(".eleTree-checkbox").remove();
            var str='<div class="eleTree-checkbox"><i class="layui-icon"></i></div>';
            $("input.eleTree-hideen[type=checkbox]").each(function(index,val){
                $(val).after(str);
            })
        },
        checkboxEvent: function() {
            var self=this;
            this.checkboxRender();
            // input添加属性eleTree-status：即input的三种状态，"0":未选中，"1":选中，"2":子孙部分选中
            $(this.elem).on("click",".eleTree-checkbox",function(e) {
                e.stopPropagation();
                // 获取点击所在数据
                var node=$(this).parent(".eleTree-node-content").parent(".eleTree-node ");
                var d=self.reInitData(node);
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
                // 更新选中的数据
                self.getCheckedData();

                // 数据返回
                layui.event.call(self, "eleTree", 'checkbox(treeMenu)', {
                    elem: inp
                    ,data: self.data
                    ,checkedData: self.checkedData
                });
            })
        },
        // 初始化checkbox选中状态
        checkInit: function(arr,floor) {
            arr.forEach(function(val,index) {
                if(val.checked){
                    $(".eleTree-node[eletree-floor='"+floor+"']").eq(index)
                        .children(".eleTree-node-content").children(".eleTree-checkbox").trigger("click");
                }else{
                    if(val.children && val.children.length>0){
                        this.checkInit(val.children,floor+1);
                    }
                }
            },this)
        },
        // 初始化禁用状态
        disabledInit: function(arr,floor) {
            arr.forEach(function(val,index) {
                if(val.disabled){
                    $(".eleTree-node[eletree-floor='"+floor+"']").eq(index)
                        .children(".eleTree-node-content").children(".eleTree-checkbox")
                        .addClass("eleTree-checkbox-disabled")
                        .off().on("click",function(e) {
                            e.stopPropagation();
                        });
                }else{
                    if(val.children && val.children.length>0){
                        this.disabledInit(val.children,floor+1);
                    }
                }
            },this)
        },
        // 获取选中的数据
        getCheckedData: function() {
            this.checkedData=[];
            var self=this;
            $("input[eletree-status='1']").each(function(index,item) {
                var node=$(item).parent(".eleTree-node-content").parent(".eleTree-node ");
                var d=self.reInitData(node);
                self.checkedData.push(d);
            })
        },
        reInitData: function(node) {
            var i=node.index();
            var floor=Number(node.attr("eletree-floor"));
            var arr=[];
            while (floor>=0) {
                arr.push(i);
                floor=floor-1;
                node=node.parents("[eletree-floor='"+floor+"']");
                i=node.index();
            }
            arr=arr.reverse();
            var oData=this.data;
            var d = oData[arr[0]];
            for(var i = 1; i<arr.length; i++){
                d = d["children"][arr[i]];
            }
            return d;
        },
    }

    var eleTree={
        obj: "",
        get checkedData (){
            return this.obj.checkedData;
        },
        render: function(option) {
            this.obj=new Class(option);
        },
        on: function(events, callback) {
            return layui.onevent.call(this.obj, "eleTree", events+"(treeMenu)", callback);
        },
        reload: function(option) {
            this.obj.option = $.extend({}, this.obj.option, option);
            this.obj.render();
        }
    }
    
    exports('eleTree',eleTree);
})