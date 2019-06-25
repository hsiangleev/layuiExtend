/**
 * @Name: 程序流程图
 * @Author: 李祥
 * @License：MIT
 * 最近修改时间: 2019/06/25
 */

layui.define(function (exports) {
    function Draw(options) {
        this.options=options;
        this.optionsReset();

        this.cvs=document.querySelector(this.options.el);
        this.ctx=this.cvs.getContext("2d");
        var fontSize=new RegExp(/\d+(px)/).exec(this.textFont)[0];
        this.lineHeight=Number(fontSize.substring(0,fontSize.length-2))*1.2;    // 计算行高
        this.eventData=null;
        this.init();
        this.addEvent();
    }
    Draw.prototype={
        constructor: Draw,
        // 参数设置
        optionsReset: function() {
            this.bdColor=this.options.bdColor || "#000";            // 默认边框颜色
            this.bgColor=this.options.bgColor || "#ccc";            // 默认背景颜色
            this.textColor=this.options.textColor || "#000";        // 默认字体颜色
            this.textFont=this.options.textFont || "14px serif";    // 默认字体
            this.nodeType=this.options.nodeType || {};              // 获取的节点类型对应的图形
            this.event=this.options.event || {};                    // 事件
            this.arrowSize={                                        // 箭头大小(x,y为相对箭头顶点坐标，x/y越大，角度越大，distance为在箭头反方向到顶点的距离)
                x: 10,
                y: 10,
                distance: 3
            };

            if(this.options.arrowSize){
                for(var k in this.options.arrowSize){
                    if(typeof this.options.arrowSize[k]==="number"){
                        this.arrowSize[k]=this.options.arrowSize[k];
                    }
                }
            }
        },
        init: function(position) {
            this.options.data.forEach(function(val) {
                for(var k in this.nodeType){
                    for(var i=0;i<this.nodeType[k].length;i++){
                        if(this.nodeType[k][i]===val.type){
                            this[k]([val],position);
                        }
                    }
                }
            },this)
        },
        // 文本
        drawText: function(text,x,y,w,h,textColor) {
            if(text==="" || text===undefined) return;
            this.ctx.font = this.textFont;
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            // 换行处理
            var width=0;    // 当前宽度
            var index=0;    // 当前行首字母索引
            var maxWidth=w/10*8;    // 最大宽度
            var totalLine=Math.ceil(this.ctx.measureText(text).width/maxWidth);    // 总行数
            var currentLine=1;  // 当前行数
            this.ctx.strokeStyle=textColor || this.textColor;
            for(var i=0;i<text.length;i++){
                width+=this.ctx.measureText(text[i]).width;
                if(width>maxWidth){
                    var s=text.substring(index,i);
                    // {-3/2, -1/2, 1/2, 3/2}*lineHeight==>-1/2*lineHeight*(totalLine-{1,3,5,7})==>-1/2*lineHeight*(totalLine-(1+(2*(currentLine-1)))
                    this.ctx.strokeText(s,x+w/2,y+h/2-1/2*this.lineHeight*(totalLine-(1+2*(currentLine-1))));
                    index=i;
                    width=0;
                    currentLine++;
                }
                if(i===text.length-1){
                    var s=text.substring(index,text.length);
                    this.ctx.strokeText(s,x+w/2,y+h/2-1/2*this.lineHeight*(totalLine-(1+2*(currentLine-1))));
                }
            }
        },
        // 矩形(x,y,width,height)
        drawRect: function(arr,position) {
            arr.forEach(function(val) {
                this.ctx.strokeStyle=val.bdColor || this.bdColor;
                this.ctx.fillStyle=val.bgColor || this.bgColor;
                this.ctx.beginPath();
                this.ctx.rect(val.x,val.y,val.width,val.height);
                this.ctx.fillRect(val.x,val.y,val.width,val.height);
                this.ctx.stroke();
                this.ctx.closePath();
                this.drawText(val.text,val.x,val.y,val.width,val.height,val.textColor);

                this.changeEventData(position, val);
            },this)
        },
        // 箭头(xStart,xEnd,yStart,yEnd)
        drawLineArrow: function (arr, position) {
            arr.forEach(function(val) {
                this.ctx.strokeStyle=val.bdColor || this.bdColor;
                this.ctx.fillStyle=val.bdColor || this.bdColor;
                this.ctx.beginPath();
                this.ctx.moveTo(val.xStart,val.yStart);
                this.ctx.lineTo(val.xEnd,val.yEnd);
                this.ctx.stroke();
                var k=(val.yEnd-val.yStart)/(val.xEnd-val.xStart);  // 斜率
                this.ctx.save();  
                // 切换原点坐标
                this.ctx.translate(val.xEnd,val.yEnd);
                // 判断如果起始点在上，斜率大于0，或者起始点在下，斜率小于0,或者为从左到右的水平线段，即箭头方向不是左侧
                if(val.yEnd>val.yStart && k>0 || val.yEnd<val.yStart && k<0 || val.xStart<val.xEnd && k===0){
                    this.ctx.rotate(Math.atan(k)-Math.PI/2); 
                }else{
                    this.ctx.rotate(Math.atan(k)+Math.PI/2); 
                }
                this.ctx.moveTo(-1*this.arrowSize.x,-1*this.arrowSize.y);
                this.ctx.lineTo(0,0);
                this.ctx.lineTo(this.arrowSize.x,-1*this.arrowSize.y);
                this.ctx.lineTo(0,-1*this.arrowSize.distance);
                this.ctx.fill();
                this.ctx.closePath();
                this.ctx.restore();  
            
                if(val.text){
                    this.ctx.font = this.textFont;
                    this.ctx.strokeStyle=val.textColor || this.textColor;
                    this.ctx.strokeText(val.text,(val.xEnd+val.xStart)/2,(val.yEnd+val.yStart)/2);
                }
                this.changeEventData(position, val);
            },this)
        },
        // 椭圆(x,y,width,height),当width===height时为圆
        drawOval: function(arr,position) {
            arr.forEach(function(val) {
                // 格式转换 原为矩形一点加长宽，修改为中心点加二分之一长宽
                var x=val.x+val.width/2;
                var y=val.y+val.height/2;
                var radiusX=val.width/2;
                var radiusY=val.height/2;
                this.ctx.save(); 
                this.ctx.beginPath(); 
                //设置填充颜色 
                this.ctx.strokeStyle=val.bdColor || this.bdColor;
                this.ctx.fillStyle=val.bgColor || this.bgColor;
                //选择a、b中的较大者作为arc方法的半径参数 
                var r = (radiusX > radiusY) ? radiusX : radiusY; 
                var ratioX = radiusX / r; //横轴缩放比率 
                var ratioY = radiusY / r; //纵轴缩放比率 
                this.ctx.scale(ratioX, ratioY); //进行缩放（均匀压缩）	
                this.ctx.arc(x/ratioX, y/ratioY, r, 0, 2 * Math.PI);	
                this.ctx.stroke(); 
                this.ctx.fill(); 
                this.ctx.closePath();
                this.ctx.restore();  
                
                this.drawText(val.text,val.x,val.y,val.width,val.height,val.textColor);
                this.changeEventData(position, val);
            },this)
        },
        // 圆角矩形(x,y,width,height,radius)
        drawRadiusRect: function(arr,position) {
            arr.forEach(function(val) {
                var radius=val.radius || 20;
                this.ctx.beginPath();
                this.ctx.strokeStyle=val.bdColor || this.bdColor;
                this.ctx.fillStyle=val.bgColor || this.bgColor;
                //左上角
                this.ctx.arc(val.x+radius,val.y+radius,radius,Math.PI,-Math.PI/2,false);
                //右上角
                this.ctx.arc(val.x+val.width-radius,val.y+radius,radius,-Math.PI/2,0,false);
                // //右下角
                this.ctx.arc(val.x+val.width-radius,val.y+val.height-radius,radius,0,Math.PI/2,false);
                // //左下角
                this.ctx.arc(val.x+radius,val.y+val.height-radius,radius,Math.PI/2,Math.PI,false);
                // 左边竖线
                this.ctx.moveTo(val.x, val.y+val.height-radius);
                this.ctx.lineTo(val.x, val.y+radius);
                this.ctx.stroke(); 
                this.ctx.fill(); 
                this.ctx.closePath();
                this.drawText(val.text,val.x,val.y,val.width,val.height,val.textColor);

                this.changeEventData(position, val);
            },this)
        },
        // 两条竖线的矩形(xStart,xEnd,yStart,yEnd,distance)
        drawLineRect: function(arr,position) {
            arr.forEach(function(val) {
                var distance=val.distance || 10;
                this.ctx.strokeStyle=val.bdColor || this.bdColor;
                this.ctx.fillStyle=val.bgColor || this.bgColor;
                this.ctx.rect(val.x,val.y,val.width,val.height);
                this.ctx.fillRect(val.x,val.y,val.width,val.height);
                this.ctx.stroke(); 

                this.changeEventData(position, val);
                this.ctx.beginPath();
                this.ctx.moveTo(val.x+distance, val.y);
                this.ctx.lineTo(val.x+distance, val.y+val.height);
                this.ctx.stroke(); 
                this.ctx.closePath();
                this.changeEventData(position, val);

                this.ctx.beginPath();
                this.ctx.moveTo(val.x+val.width-distance, val.y);
                this.ctx.lineTo(val.x+val.width-distance, val.y+val.height);
                this.ctx.stroke(); 
                this.ctx.closePath();
                this.drawText(val.text,val.x,val.y,val.width,val.height,val.textColor);

                this.changeEventData(position, val);
            },this)
        },
        // 画菱形(x,y,width,height)
        drawRiamond: function(arr,position) {
            arr.forEach(function(val) {
                this.ctx.strokeStyle=val.bdColor || this.bdColor;
                this.ctx.fillStyle=val.bgColor || this.bgColor;
                this.ctx.beginPath();
                this.ctx.moveTo(val.x+val.width/2, val.y);
                this.ctx.lineTo(val.x+val.width, val.y+val.height/2);
                this.ctx.lineTo(val.x+val.width/2, val.y+val.height);
                this.ctx.lineTo(val.x, val.y+val.height/2);
                this.ctx.closePath();
                this.ctx.stroke(); 
                this.ctx.fill(); 
                this.drawText(val.text,val.x,val.y,val.width,val.height,val.textColor);
                
                this.changeEventData(position, val);
            },this)
        },
        // 添加事件
        addEvent: function() {
            var self=this;

            var f=this.throttle(function(event) {
                var x=event.offsetX;
                var y=event.offsetY;

                // 重绘，因为isPointInPath方法只对最后一个闭合路径生效，所以每次画一个图像都进行判断点击的是否是当前绘制的图形
                self.ctx.clearRect(0, 0, self.cvs.width, self.cvs.height);
                self.eventData=null;
                self.init({x:x,y:y});
                if(!self.eventData) return;

                self.event["click"](self.eventData);
            },100)
            if(this.event["click"]){
                this.cvs.addEventListener("click", f);
            }

            // 记录上一次移入的节点
            var oldEventData=self.eventData || {};
            var f2=this.throttle(function(event) {
                var x=event.offsetX;
                var y=event.offsetY;
                oldEventData=self.eventData || {};

                // 重绘，因为isPointInPath方法只对最后一个闭合路径生效，所以每次画一个图像都进行判断点击的是否是当前绘制的图形
                self.ctx.clearRect(0, 0, self.cvs.width, self.cvs.height);
                self.eventData=null;
                self.init({x:x,y:y})
                // 鼠标移入
                if(self.eventData && self.eventData.text!==oldEventData.text) {
                    self.event["mouseenter"] && self.event["mouseenter"](self.eventData);
                }
                // 鼠标移出
                if(!self.eventData && oldEventData.text) {
                    self.event["mouseleave"] && self.event["mouseleave"](oldEventData);
                }
            },100)

            if(this.event["mouseenter"]){
                this.cvs.addEventListener("mousemove", f2);
            }

        },
        // 修改eventData数据
        changeEventData: function(position, val) {
            if(position && !this.eventData && this.ctx.isPointInPath(position.x, position.y)){
                this.eventData=val;
            }
        },
        // 节流函数
        throttle: function (callback, time) {
            var timer = null;
            var firstTime = true;
            return function () {
                var args = arguments;
                var _self = this;
                if (firstTime) {
                    callback.apply(_self, args);
                    return firstTime = false;
                }
                if (timer) {
                    return false;
                }
                timer = setTimeout(function () {
                    clearTimeout(timer);
                    timer = null;
                    callback.apply(_self, args);
                }, time || 50)

            }
        }
    }

    var obj={
        render: function(options) {
            new Draw(options);
        }
    }

    exports('eFlowChart', obj);
})