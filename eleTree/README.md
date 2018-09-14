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
        // url: "../../data/home/tree.json",
        // type: "post",
        // where: {a: "aaa"},
        data: data,
        showCheckbox: true,
        contextmenuList: ["copy","add","edit","remove"],
        drag: true
    });

    eleTree.on("add",function(data) {
        console.log(data);
        // 若后台修改，则重新获取后台数据，然后重载
        // eleTree.reload({where: {data: JSON.stringify(data.data)}})
    })
    eleTree.on("edit",function(data) {
        console.log(data);
    })
    eleTree.on("remove",function(data) {
        console.log(data);
    })
    eleTree.on("toggleSlide",function(data) {
        console.log(data);
    })
    eleTree.on("checkbox",function(data) {
        console.log(data);
    })
    eleTree.on("drag",function(data) {
        console.log(data);
    })

    $("#add").on("click",function() {
        console.log(eleTree.checkedData);
    })
});
```

#### **eleTree.render()参数说明**
> + elem：外层容器
> + data：data或url参数二选一，data优先 (静态数据)，必选参数
> + url：data或url参数二选一，data优先 (获取数据地址)，必选参数
> + type：获取后台数据类型(默认get)，可选参数
> + where：ajax附带的额外参数，可选参数
> + showCheckbox：是否启用checkbox，类型为数组，可选参数
> + contextmenuList：右键操作，类型为数组，可选["copy","add","edit","remove"]，不写则不启用右键功能
> + drag：右键操作，是否启用拖拽功能，可选参数
    

#### **外部可使用的变量说明**
> + checkedData：获取当前选中的数据


#### **外部可使用的事件说明**
> + add：右键添加触发事件
> + edit：右键编辑触发事件
> + remove：右键删除触发事件
> + toggleSlide：展开与合并触发事件
> + checkbox：checkbox被选中触发事件
> + drag：拖拽触发事件


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
    }
]

```


#### **注意**
> + 所有修改功能只是在前台完成，若要实现后台数据更改，则使用新数据去修改后台重新reload，即 eleTree.reload({where: {data: data.data}})

