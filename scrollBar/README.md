## 滚动条

#### **html元素**
-----------------
```javascript
<div>
    <div class="scroll">
        
    </div>
</div>
```

#### **js引用**
-----------------
```javascript
layui.use(['jquery','scrollBar'], function(){
    var $ = layui.jquery;
    var scrollBar = layui.scrollBar;
    var s=scrollBar({
        el: ".scroll",
        color: "#888",
        width: "7px"
    })
    s.resetHeight();    // 重新计算滚动条高度
});
```

#### **step.render()参数说明**
> + el：外层容器
> + color：颜色，默认#aaa
> + width：滚动条宽度，默认6px
    
#### **外部可以使用的函数说明**
> + resetHeight()：重新计算滚动条高度
