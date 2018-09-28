## 基于layui的tree重写

#### **html元素**
-----------------
```javascript
<div class="eleTree ele1" lay-filter="data1"></div>
<div class="eleTree ele2" lay-filter="data2"></div>
<button class="layui-btn">获取选中数据</button>
```

#### **js引用**
-----------------
```javascript
layui.use(['jquery','eleTree'], function(){
    var $ = layui.jquery;
    var eleTree = layui.eleTree;

    eleTree.render({
        elem: '.ele1',
        // url: "/tree",
        // type: "post",
        data: data,
        showCheckbox: true,
        contextmenuList: ["copy","add","edit","remove"],
        drag: true,
        accordion: true
    });
    
    eleTree.render({
        elem: '.ele2',
        // url: "../../data/home/tree.json",
        // type: "post",
        data: data2,
        showCheckbox: true,
        contextmenuList: ["add","remove"],
        drag: true,
        accordion: true
    });

    eleTree.on("add(data1)",function(data) {
        console.log(data);
        // 若后台修改，则重新获取后台数据，然后重载
        // eleTree.reload(".ele1", {where: {data: JSON.stringify(data.data)}})
    })
    eleTree.on("edit(data1)",function(data) {
        console.log(data);
    })
    eleTree.on("remove(data1)",function(data) {
        console.log(data);
    })
    eleTree.on("toggleSlide(data1)",function(data) {
        console.log(data);
    })
    eleTree.on("checkbox(data1)",function(data) {
        console.log(data);
    })
    eleTree.on("drag(data2)",function(data) {
        console.log(data);
    })

    $(".layui-btn").on("click",function() {
        console.log(eleTree.checkedData(".ele2"));
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
> + drag：是否启用拖拽功能，可选参数，默认关闭
> + accordion：是否启用手风琴功能，可选参数，默认关闭
    

#### **外部可使用的函数说明**
> + checkedData(elem)：获取当前的选择器elem选中的数据


#### **外部可使用的事件说明**
> + add(filter)：右键添加触发事件
> + edit(filter)：右键编辑触发事件
> + remove(filter)：右键删除触发事件
> + toggleSlide(filter)：展开与合并触发事件
> + checkbox(filter)：checkbox被选中触发事件
> + drag(filter)：拖拽触发事件


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
> + 所有修改功能只是在前台完成，若要实现后台数据更改，则使用新数据去修改后台重新reload，即 eleTree.reload(".ele1", {where: {data: data.data}})

