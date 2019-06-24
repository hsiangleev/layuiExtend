## 程序流程图

**[示例](https://layuiextend.hsianglee.cn/eFlowChart)**

#### 使用方式：
1. 引入eFlowChart模块
2. 使用：
```javascript
// <canvas id="cvs" width="800" height="800"></canvas>      // html
layui.eFlowChart.render({
    el: "#cvs",
    data: [
        // ...
    ],
    bdColor: "#ff4200",
    bgColor: "#ddd",
    textFont: "14px serif",
    textColor: "#666",
    arrowSize: {
        x: 15,
        y: 15,
        distance: 8
    },
    nodeType: {
        drawOval: ["StartNode","EndNode"],
        drawLineArrow: ["Line"],
        drawRect: ["ProcNode"],
        drawRiamond: ["CondNode"],
        drawLineRect: ["ChildNode"],
        drawRadiusRect: ["ConfNode"],
    },
    event: {
        click: function(d) {
            console.log(d)
        },
        mouseenter: function(d) {
            console.log(d)
        },
        mouseleave: function(d) {
            console.log(d)
        }
    }
})
```
3. render参数说明：
    * el: canvas容器
    * bdColor: 默认边框颜色（可省略）
    * bgColor: 默认背景颜色（可省略）
    * textFont: 默认字体，大小和样式（可省略）
    * textColor: 默认字体颜色（可省略）
    * arrowSize: 默认箭头大小（可省略）
    * data: 流程图数据，类型为数组
    * nodeType: 节点类型对应的图形
    * event: 节点事件
4. arrowSize数据格式说明：
    * x,y为相对箭头顶点坐标，x/y越大，角度越大
    * distance: 在箭头反方向到顶点的距离，数字越大，箭头面积越大
5. data数据格式说明：
    * 箭头的数据格式为起始节点坐标，和末尾节点坐标，示例：{xStart: 100, yStart: 530, xEnd: 100, yEnd: 590},
    * 圆，椭圆，矩形，菱形，圆角矩形和双竖线的矩形的数据格式都为矩形左上角坐标和矩形的宽高，示例：{x: 170, y: 20, width: 60, height: 60}
    * 所有节点均支持的字段：
        * text：文本
        * bdColor: 当前节点的边框颜色
        * bgColor: 当前节点的背景颜色
        * type: 当前节点类型，与nodeType字段里面的值对应
        * textColor: 当前节点的字体颜色
    * 额外参数：
        * radius: 圆角矩形的圆角半径
        * distance: 双竖线的矩形的两条竖线距离左右的宽度
6. nodeType数据格式说明（目前只支持6种）：
    * drawOval: [],         绘制圆或椭圆（数组内容为data节点的type类型）
    * drawLineArrow: [],    绘制箭头
    * drawRect: [],         绘制矩形
    * drawRiamond: [],      绘制菱形
    * drawLineRect: [],     绘制双竖线矩形
    * drawRadiusRect: [],   绘制圆角矩形
7. event参数说明：
    * click: 点击事件，返回值为点击的节点对象
    * mouseenter和mouseleave为一对，组成hover事件，即鼠标移入移出事件，返回值为点击的节点对象