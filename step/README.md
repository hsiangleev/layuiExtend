## 基于layui的步骤条面板

#### **html元素**
-----------------
```javascript
<div class="layui-step">
    <div class="layui-step-content layui-clear">
        <div class="layui-step-content-item">条目1</div>
        <div class="layui-step-content-item">条目2</div>
        <div class="layui-step-content-item">条目3</div>
        <div class="layui-step-content-item">条目4</div>
    </div>
    <div class="layui-step-btn">
        <div class="layui-btn-group">
            <button class="layui-btn goFirst">第一步</button>
            <button class="layui-btn prev">上一步</button>
            <button class="layui-btn next">下一步</button>
            <button class="layui-btn goLast">最后一步</button>
            <button class="layui-btn goStep">走到第二步</button>
            <button class="layui-btn disabled">禁用第三步</button>
            <button class="layui-btn abled">解禁第三步</button>
        </div>
    </div>
</div>
```

#### **js引用**
-----------------
```javascript
layui.use(['jquery','step'], function(){
    var $ = layui.jquery;
    var step = layui.step;
    step.render({
        elem: '.layui-step',
        // title: ["第一步","第二步","第三步","第四步"],
        description: ["aaa","bbb","ccc","ddd"],
        // currentStep: 2,
        // disabledStep: [1,3],
        // canIconClick: true,
        // isOpenStepLevel: true,
    });
    $(".goFirst").on("click",function() {
        step.goFirst();
    })
    $(".prev").on("click",function() {
        step.prev();
    })
    $(".next").on("click",function() {
        step.next();
    })
    $(".goLast").on("click",function() {
        step.goLast();
    })
    $(".goStep").on("click",function() {
        step.goStep(2);
    })
    $(".disabled").on("click",function() {
        step.disabled(3);
    })
    $(".abled").on("click",function() {
        step.abled(3);
    })
});
```

#### **说明**
> + 每一个 .layui-step-content-item代表一个tab页面，高度默认最小值为满屏
> + 按扭区默认悬浮固定在右下角，可自行设置，内部的按钮个数可以自定义
> + 按钮禁用与解禁的位置（i）必须在当前步数之后，即禁用时，该位置应尚未走到

#### **更换风格样式**
> + 给最外层容器添加class样式 layui-step-line

#### **step.render()参数说明**
> + elem：外层容器
> + title：步骤条下方文字说明，类型为数组，可省略，默认["第一步","第二步","第三步","。。。"]
> + currentStep：初始时是第几步，可省略，默认第一步
> + canIconClick：上方步骤条是否可以点击，可省略，默认false
> + description：步骤条下方描述性文字，类型为数组，可省略
> + isOpenStepLevel：是否严格按照步骤条顺序执行，即未走过的步骤不可点，走过的可点，可省略，若开启则默认canIconClick字段关闭
> + disabledStep：初始禁用的步骤，类型为数组，可省略
    

#### **外部可以使用的函数说明**
> + render()：初始渲染界面
> + goStep(i)：跳到第几步
> + goFirst()：跳到第1步
> + goLast()：跳到最后1步
> + prev()：跳到上一步
> + next()：跳到下一步
> + disabled(i)：禁用某一步
> + abled(i)：解除某一步的禁用


#### **外部可使用的变量说明**
> + currentStep：获取当前是第几步
