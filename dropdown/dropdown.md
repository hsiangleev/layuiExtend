## 下拉菜单

#### **html元素**
-----------------
```javascript
<div class="urp-dropdown">
    <button class="layui-btn urp-dropdown-btn">
        Action
        <i class="layui-icon layui-icon-down"></i>
    </button>
    <ul class="urp-dropdown-menu">
        <li>
            <a href="javascript:;">
                <i class="layui-icon layui-icon-senior"></i>
                action
            </a>
        </li>
        <li>
            <a href="javascript:;">
                <i class="layui-icon layui-icon-auz"></i>
                Another action action action
            </a>
        </li>
        <li>
            <a href="javascript:;">
                <i class="layui-icon layui-icon-website"></i>
                Another action
            </a>
        </li>
    </ul>
</div>
```

#### **说明**
> + 默认左对齐，给 .urp-dropdown添加 .urp-dropdown-right类右对齐
> + 默认为关闭状态，给 .urp-dropdown添加 .open类则初始打开


## table中使用
#### **html模板**
```javascript
<div class="urp-dropdown urp-dropdown-table">
    <button class="layui-btn urp-dropdown-btn" lay-event="dropdown">
        操作<i class="layui-icon layui-icon-down"></i>
    </button>
</div>
```
#### **js触发事件**
```javascript
table.on('tool(table)', function (obj) {
    var data = obj.data;
    if (obj.event === 'dropdown') {
        // 拼接数组(几个数组代表几个按钮)
        var options = [
            {
                title: "查看", // 按钮显示内容
                icon: "layui-icon-form", // 图标样式
                url: "http://baidu.com", // 按钮跳转地址（与event二选一）
                event: function () {
                    // 按钮触发事件
                }
            }
        ];
        urp.dropdown(options);
    }
})
```