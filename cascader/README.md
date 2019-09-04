## 基于layui的无限级联选择器

#### **html元素**
-----------------
```javascript
<div class="layui-form-item">
    <label class="layui-form-label">选择框</label>
    <div class="layui-input-block">
        <input type="text" id="a" class="layui-input" readonly="readonly">
    </div>
</div>
```

#### **js引用**
-----------------
```javascript
layui.use(['form',"jquery","cascader"], function(){
    var $ = layui.jquery;
    var cascader = layui.cascader;
    
    var data = [
        {
            value: 'A',
            label: 'a',
            children: [
                {
                    value: 'AA1',
                    label: 'aa1',
                },
                {
                    value: 'BB1',
                    label: 'bb1'
                }
            ]
        },
        {
            value: 'B',
            label: 'b',
        }
    ]
    var cas=cascader({
        elem: "#a",
        data: data,
        // url: "/aa",
        // type: "post",
        // triggerType: "change",
        // showLastLevels: true,
        // where: {
        //     a: "aaa"
        // },
        value: ["A", "AA1"],
        success: function (valData,labelData) {
            console.log(valData);
            console.log(labelData);
        }
    });

    cas.reload({})  // 重载
});
```

#### **cascader参数说明**
> + elem：input容器
> + data：需要的静态数据，类型为数组，
> + url：异步获取的数据，类型为数组，（data与url两个参数二选一）
> + type：异步获取的方式，默认get，可省略
> + where：异步传入的参数，可省略
> + triggerType：触发方式，不填或其他都为click，可选参数"change"，即鼠标移入触发
> + showLastLevels：输入框是否只显示最后一级,默认false，即全显示
> + value：传入的初始值，类型为数组，值为data的value值
> + changeOnSelect：是否选中即改变，默认false（可以选择非叶子节点）
> + success：回调函数，选择完成之后的回调函数，返回值第一个参数为value数组，第二个参数为label数组
> + lazy：是否开启懒加载功能
> + lazyLoad：懒加载回调函数，仅在lazy为true时有效，有两个参数node和callback函数，node为当前点击的节点数据，callback函数需要把新数据和node节点同时传递回去，即callback(newArray,node);

#### **cascader函数说明**
> + cas.reload(): 可重新渲染数据，或赋初值


