## 基于layui的tree重写

#### **html元素**
-----------------
```javascript
<div class="eleTree"></div>
<button id="add">add</button>
```

#### **js引用**
-----------------
```javascript
layui.use(['jquery','eleTree'], function(){
    var $ = layui.jquery;
    var eleTree = layui.eleTree;
    eleTree.render({
        elem: '.eleTree',
        url: "/tree",
        type: "post",
        where: {a: "aaa"},
        // data: data,
        showCheckbox: true
    });

    $("#add").on("click",function() {
        console.log(eleTree.checkedData);
    })
});
```

#### **step.render()参数说明**
> + elem：外层容器
> + data：data或url参数二选一，data优先 (静态数据)，必选参数
> + url：data或url参数二选一，data优先 (获取数据地址)，必选参数
> + type：获取后台数据类型(默认get)，可选参数
> + where：ajax附带的额外参数，可选参数
> + showCheckbox：是否启用checkbox，类型为数组，可选参数
    

#### **外部可使用的变量说明**
> + checkedData：获取当前选中的数据


#### **data数据格式**
```javascript
// label: 节点名称
// spread: 是否展开子项
// children: 子元素数组
// disabled: 是否禁用
// checked: 是否选中
[
    {
        label: 'a',
        spread: true,
        children: [
            {
                label: 'aa1',
                disabled: true,
                checked: true,
            },
            {
                label: 'bb1',
            }
        ]
    },
    {
        label: 'c',
        children: [
            {
                label: 'aa1',
            },
            {
                label: 'bb1'
            }
        ]
    }
]

```

