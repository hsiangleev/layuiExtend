 /**
 * @Name: step 基于layui的步骤条面板
 * @Author: 李祥
 * @License：MIT
 * 最近修改时间: 2018/11/16
 */

layui.define(["jquery"], function (exports) {
    var $ = layui.jquery;
    
    function Step(option) {
        this.option=option;     // 获取传入的数据
        this.elem=option.elem;
        // this.methods=option.methods?option.methods:"";
        this.title=option.title?option.title:[];
        this.description=option.description?option.description:[];
        this.canIconClick=option.canIconClick?option.canIconClick:false;
        this.isOpenStepLevel=option.isOpenStepLevel?option.isOpenStepLevel:false;
        this.len=0;   // 页面个数
        this.currentStep=(option.currentStep && option.currentStep>=1)?option.currentStep:1;    // 当前走到第几步

        this.disabledStep=Object.prototype.toString.call(option.disabledStep)==="[object Array]"?option.disabledStep:[];

        this.styleLine=$(option.elem).hasClass("layui-step-line");

        this.finalStep=1;       // 当前走到最远的步骤

        this.parameterInit();
        this.domRender();
        this.init();
        this.openStepLevel();
        this.changeStep();
    }

    Step.prototype={
        constructor: Step,
        // 初始化参数数据
        parameterInit: function() {
            var self=this;
            this.len=$(this.elem).find(".layui-step-content-item").length;   // 页面个数
            // 不传title参数
            if(this.title.length<=0){
                $(this.elem).find(".layui-step-content-item").each(function(index,val) {
                    self.title.push("第"+(index+1)+"步");
                })
            }
            if(this.len!==this.title.length){
                throw "title参数长度与页面长度不匹配";
            }
            // 不传description参数
            if(this.description.length<=0){
                $(this.elem).find(".layui-step-content-item").each(function(index,val) {
                    self.description.push("");
                })
            }
            if(this.len!==this.description.length){
                throw "description参数长度与页面长度不匹配";
            }
            // 若当前步超过最大步，则默认为最后一步
            this.currentStep=this.currentStep>=this.len?this.len:this.currentStep;
        },
        domRender: function() {
            var self=this;
            var titleStr='<div class="layui-step-title layui-clear">'+
            '<div class="layui-step-title-item step-first"'
            if(this.styleLine){
                titleStr+=' style="width: calc('+(100/this.len)+'% - 50px);margin-right: 50px;">'
            }else{
                titleStr+=' style="width: '+(100/this.len)+'%;">'
            }
            
            titleStr+='<div class="step-icon">'+
                    '<i>1</i>'+
                '</div>'+
                '<div class="step-text">'+
                    this.title[0]+
                '</div>'+
                '<div class="step-description">'+
                    this.description[0]+
                '</div>'+
            '</div>';
            for(var i=1;i<this.title.length-1;i++){
                titleStr+='<div class="layui-step-title-item"';
                if(this.styleLine){
                    titleStr+=' style="width: calc('+(100/this.len)+'% - 50px);margin-right: 50px;">'
                }else{
                    titleStr+=' style="width: '+(100/this.len)+'%;">'
                }

                titleStr+='<div class="step-icon">'+
                        '<i>'+(i+1)+'</i>'+
                    '</div>'+
                    '<div class="step-text">'+
                        this.title[i]+
                    '</div>'+
                    '<div class="step-description">'+
                        this.description[i]+
                    '</div>'+
                '</div>';
            };
            titleStr+='<div class="layui-step-title-item step-last" style="width: '+(100/this.len)+'%;">'+
                    '<div class="step-icon">'+
                        '<i>'+this.len+'</i>'+
                    '</div>'+
                    '<div class="step-text">'+
                        this.title[this.title.length-1]+
                    '</div>'+
                    '<div class="step-description">'+
                        this.description[this.title.length-1]+
                    '</div>'+
                '</div>'+
            '</div>'
            $(this.elem).prepend(titleStr);

            // 生成三角
            var self=this;
            $(this.elem).find(".layui-step-content-item").each(function(index,val) {
                if(self.styleLine){
                    var l=index===0 ? 15 : 5;
                    $(this).append("<span class='content-item-before' style='left: calc("+((100*index)/self.len)+"% + "+l+"px);'></span>");
                }else{
                    $(this).append("<span class='content-item-before' style='left: calc("+((100/(self.len*2))+((100*index)/self.len))+"% - 10px);'></span>");
                }
            })
        },
        // 添加样式
        init: function() {
            var self=this;
            this.disabledStep.forEach(function(val){
                $(self.elem).find(".layui-step-title-item").eq(val-1).addClass("step-disabled");
            })
            
            $(this.elem).find(".layui-step-title-item").eq(this.currentStep-1).addClass("step-current");
            $(this.elem).find(".layui-step-content-item").eq(this.currentStep-1).show();
            if(this.currentStep<2) return;
            for(var i=this.currentStep-2;i>=0;i--){
                $(this.elem).find(".layui-step-title-item").eq(i).addClass("step-finish");
            }
        },
        // 恢复默认样式
        reInit: function() {
            $(this.elem).find(".layui-step-title-item").each(function(index,val) {
                $(val).removeClass("step-disabled");
            })
            
            $(this.elem).find(".layui-step-title-item").eq(this.currentStep-1).removeClass("step-current");
            $(this.elem).find(".layui-step-content-item").eq(this.currentStep-1).hide();
            if(this.currentStep<2) return;
            for(var i=this.currentStep-2;i>=0;i--){
                $(this.elem).find(".layui-step-title-item").eq(i).removeClass("step-finish");
            }
        },
        // 给上面的icon添加事件
        changeStep: function() {
            var self=this;
            this.canIconClick?(function() {
                $(self.elem).on("click",".layui-step-title-item .step-icon",function() {
                    var index=$(this).parent(".layui-step-title-item").index()+1;
                    // 判断点击的是否为disabled
                    if($.inArray(index, self.disabledStep) === -1){
                        self.goStep(index);
                    }
                })
            })():"";
        },
        // 是否严格按照步骤条顺序执行步骤
        openStepLevel: function() {
            var self=this;
            this.isOpenStepLevel?(function() {
                // 如果开启这一项，则默认关闭icon点击事件
                self.canIconClick=false;
                $(self.elem).off().on("click",".layui-step-title-item .step-icon",function() {
                    var index=$(this).parent(".layui-step-title-item").index()+1;
                    // 判断如果当前点击的步骤超过已走过的最大步，则不跳转
                    if(index>self.finalStep){
                        return;
                    }
                    // 判断点击的是否为disabled
                    if($.inArray(index, self.disabledStep) === -1){
                        self.goStep(index);
                    }
                })
            })():"";
        },
        // 跳转第几步
        goStep: function(i) {
            if((i<1 || i>this.len)){
                throw "goStep函数参数不在范围内";
            }
            // 判断当前页是否禁用，即i是否在数组中
            if($.inArray(i, this.disabledStep) === -1){
                this.reInit();
                this.currentStep=i;
                this.init();
            }else{
                throw "该页已禁用";
            }
        },
        // 跳到第一步
        goFirst: function() {
            this.goStep(1);
        },
        // 跳到最后一步
        goLast: function() {
            this.goStep(this.len);
            this.finalStep=this.len;
            this.openStepLevel();
        },
        // 跳到上一步
        prev: function () {
            if(this.currentStep<=1){
                return;
            }
            this.reInit();
            // 先保存当前位置，若前面的全都已经禁用，则可以回到当前位置
            var origin=this.currentStep;
            this.PrevGo(origin);
        },
        PrevGo: function(origin) {
            this.currentStep--;
            // 判断前面的是否全都已经禁用
            if(this.currentStep<1){
                this.currentStep=origin;
                this.init();
                return;
            }
            // 判断当前页是否禁用
            if($.inArray(this.currentStep, this.disabledStep) === -1){
                this.init();
            }else{
                this.PrevGo(origin);
            }
        },
        // 跳到下一部
        next: function () {
            if(this.currentStep>=this.len){
                return;
            }
            this.reInit();
            // 先保存当前位置，若后面的全都已经禁用，则可以回到当前位置
            var origin=this.currentStep;
            this.nextGo(origin);
        },
        nextGo: function(origin) {
            if(this.currentStep===this.finalStep){
                // 更新最远步
                this.finalStep++;
                this.openStepLevel();
            }

            this.currentStep++;
            // 判断后面的是否全都已经禁用
            if(this.currentStep>this.len){
                this.currentStep=origin;
                this.init();
                return;
            }
            // 判断当前步是否禁用
            if($.inArray(this.currentStep, this.disabledStep) === -1){
                this.init();
            }else{
                this.nextGo(origin);
            }
        },
        // 禁用某一步
        disabled: function (j) {
            if(j<=this.currentStep){
                throw "已经走过的步骤不能禁用";
            }
            // 当前步不存在则加入数组，否存重复添加
            if($.inArray(j,this.disabledStep)===-1){
                this.disabledStep.push(j);
            }
            //默认为起始从第一步开始，若第一步为disabled，则从前往后找到第一个不是disabled的作为第一步
            for(var i=this.currentStep;i<this.len;i++){
                if($.inArray(i, this.disabledStep) === -1){
                    this.reInit();
                    this.currentStep=i;
                    this.init();
                    i=this.len+1;
                }
            }
            
        },
        // 解除禁用
        abled: function (j) {
            if(j<=this.currentStep){
                throw "已经走过的步骤不能解除禁用";
            }
            // 删除数组数据
            var tem=this.disabledStep.concat();
            if($.inArray(j, tem) !== -1){
                this.disabledStep.splice($.inArray(j, tem),1);
            }
            this.reInit();
            this.init();
        }
    }

    var stepObj;    // new的对象，作为内部变量
    var step={
        option: "",
        currentStep: 1,
        render: function(option) {
            var self=this;
            this.option=option || {};

            this.option.elem?"":(function() {
                throw '缺少参数，需要传入elem元素';
            })();

            !$(this.option.elem)[0]?(function() {
                throw '没有找到'+ self.option.elem +'元素';
            })():"";

            stepObj=new Step(this.option);
            this.currentStep=stepObj.currentStep;
        },
        goStep: function(i) {
            if(typeof i !== "number"){
                throw 'goStep参数不合法';
            }
            stepObj.goStep(i);
            this.currentStep=stepObj.currentStep;
        },
        goFirst: function() {
            stepObj.goFirst();
            this.currentStep=stepObj.currentStep;
        },
        goLast: function() {
            stepObj.goLast();
            this.currentStep=stepObj.currentStep;
        },
        prev: function() {
            stepObj.prev();
            this.currentStep=stepObj.currentStep;
        },
        next: function() {
            stepObj.next();
            this.currentStep=stepObj.currentStep;
        },
        disabled: function(i) {
            stepObj.disabled(i);
        },
        abled: function(i) {
            stepObj.abled(i);
        }
    }
    
    exports('step', step);
})