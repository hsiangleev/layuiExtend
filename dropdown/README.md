## 下拉菜单

#### **html元素**
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
    </ul>
</div>
```

#### **说明**
> + 默认左对齐，给 .urp-dropdown添加 .urp-dropdown-right类右对齐
> + 默认为关闭状态，给 .urp-dropdown添加 .open类则初始打开


## table中使用
#### **html模板**
```javascript
/*表格toolbar模板*/
<script type="text/html" id="barDemo">
    <div class="urp-dropdown urp-dropdown-table">
        <button class="layui-btn layui-btn-primary layui-btn-xs urp-dropdown-btn" lay-event="dropdown">
            操作<i class="layui-icon layui-icon-down"></i>
        </button>
    </div>
</script>
```
#### **js触发事件**
```javascript
table.on('tool(test)', function (obj) {
    var data = obj.data;
    if (obj.event === 'dropdown') {
        var options = [
            {
                title: "百度", // 按钮显示内容
                icon: "layui-icon-release", // 图标样式
                url: "http://baidu.com" // 按钮跳转地址（与event二选一）
            },
            {
                title: "事件",
                icon: "layui-icon-release",
                event: function() {
                    // 按钮触发事件
                    layer.alert("触发了事件",{icon: 1});
                }
            }
        ];
        dropdown(options);
    }
})
```
#### **说明**
> + 引入dropdown模块和css文件
> + 以 urp- 开头的class为必需的
> + dropdown(options)：options参数为数组，数组中的每个对象代表一个按钮

```javascript
// options参数
{
    title: "查看", // 按钮显示内容
    icon: "layui-icon-form", // 图标样式
    url: "http://baidu.com", // 按钮跳转地址（与event二选一）
    event: function () {
        // 按钮触发事件
    }
}
```

