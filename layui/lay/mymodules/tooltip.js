/**
 * 基于layui的无限级联选择器
 * 使用：
 * 
 */

layui.define(["jquery","layer"], function (exports) {
    var $ = layui.jquery;
    var layer = layui.layer;
    
    function Tooltip(option) {
        this.option=option;     // 获取传入的数据
        this.elem=$("[data-toggle='tooltip']");

        this.xAxis="";
        this.yAxis="";
        this.domWidth="";
        this.domHeight="";
        this.toolWidth="";
        this.toolHeight="";

        this.init();
    }

    Tooltip.prototype={
        constructor: Tooltip,
        // 初始化参数数据
        init: function () {
            var self=this;
            var str="";
            this.elem.each(function(index,val) {
                $(val).on("mouseenter",function() {
                    placement=$(this).data("placement")?$(this).data("placement"):"top";
                    title=$(this).data("title")?$(this).data("title"):"这是一个标题";
                    str+='<div class="urp-tooltip '+placement+'">'+
                            '<div class="urp-tooltip-arrow"></div>'+
                            '<div class="urp-tooltip-inner">'+title+'</div>'+
                        '</div>';
                    $(document.body).append(str);
    
                    self.xAxis = $(this).offset().left;  
                    self.yAxis = $(this).offset().top-$(document).scrollTop();  
                    self.domWidth = $(this).width();  
                    self.domHeight = $(this).height();  
                    self.toolWidth = $(".urp-tooltip").width();  
                    self.toolHeight = $(".urp-tooltip").height();  
                    
                    self["set"+placement]();
                }).on("mouseleave",function() {
                    $(".urp-tooltip").remove();
                    str="";
                })
            })
        },
        settop: function() {
            $(".urp-tooltip").css({
                top: this.yAxis-this.domHeight+"px",
                left: this.xAxis-(this.toolWidth-this.domWidth-40)/2+"px",
            })
        },
        setbottom: function() {
            $(".urp-tooltip").css({
                top: this.yAxis+this.domHeight+5+"px",
                left: this.xAxis-(this.toolWidth-this.domWidth-40)/2+"px",
            })
        },
        setleft: function() {
            $(".urp-tooltip").css({
                top: this.yAxis-this.toolHeight/2+this.domHeight/2+"px",
                left: this.xAxis-this.toolWidth-15+"px",
            })
        },
        setright: function() {
            $(".urp-tooltip").css({
                top: this.yAxis-this.toolHeight/2+this.domHeight/2+"px",
                left: this.xAxis+this.domWidth+40+"px",
            })
        }
    }
    
    exports('tooltip', function(option) {
        new Tooltip(option);
    });
})