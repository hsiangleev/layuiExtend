 /**
 * @Name: layui.dropdown 基于layui的下拉菜单
 * @Author: 李祥
 * @License：MIT
 * 最近修改时间: 2018/11/16
 */

layui.define(["jquery"], function (exports) {
    var $ = layui.jquery;
    // 记录dropdown的上一次点击的按钮dom
    var dropdownTarget = "";
    var dropdown = function (elem, data, callback) {
        var $elem=null;
        if(typeof elem ==="string"){
            $elem=$(elem).next(".layui-border-box").find(".urp-dropdown-table .urp-dropdown-btn");
        }else{
            callback=data;
            data=elem;
            $elem=$(".urp-dropdown-table .urp-dropdown-btn");
        }

        $elem.off("click").on("click", function (event) {
            var index = $(this).parents("tr").attr("data-index");
            var d = data[index];
            var event = event || window.event;

            var options = callback(d);
            if (Object.prototype.toString.call(options) !== "[object Array]") {
                layui.hint().error('dropdown回调参数错误(格式应为数组)');
                return;
            }
            layui.stope(event);
            // 点击的按钮dom
            var target = event.target || event.srcElement;
            target = $(target).parents(".urp-dropdown-table").children(".urp-dropdown-btn").get(0);
            if ($(".urp-dropdown-menu-table").length > 0) {
                $(".urp-dropdown-menu-table").remove();
                // 判断两次点击的是否是同一个按钮
                if ((dropdownTarget.get(0)).isEqualNode($(target).parents("tr").get(0))) {
                    return;
                }
            }
            // 下拉菜单拼接
            var str = '<ul class="urp-dropdown-menu-table ">';
            options.forEach(function (val, index) {
                var icon = val.icon || "";
                if (icon.indexOf("fa-") > -1) {
                    icon = icon.indexOf("fa ") === -1 ? ("fa " + icon) : icon;
                } else {
                    icon = icon.indexOf("layui-icon ") === -1 ? ("layui-icon " + icon) : icon;
                }
                var title = val.title || "按钮" + (index + 1);
                var url = val.url || "javascript:;";
                str += '<li><a href="' + url + '"><i class="' + icon + '"></i> ' + title + '</a></li>'
            })
            str += '</ul>';
            $(document.body).append(str);
            // 位置与事件绑定
            $(".urp-dropdown-menu-table").css({
                right: $(document.body).width() - $(target).offset().left - $(target).width() - 11,
                top: $(target).offset().top + $(target).height() + 10 - $(document).scrollTop()
            }).find("li").each(function (index, item) {
                options[index]["event"] && $(item).off().on("click", options[index]["event"])
            })
            // 判断是否需要朝上
            if ($(document.body).height() < $(target).offset().top + 50 + $(".urp-dropdown-menu-table").height()) {
                $(".urp-dropdown-menu-table").addClass("urp-dropdown-menu-table-top").css({
                    top: $(target).offset().top - $(".urp-dropdown-menu-table").height() - 10 - $(document).scrollTop()
                })
            }
            // 更新上一次按钮dom
            dropdownTarget = $(target).parents("tr");

        })
    }
    var documentEvent=function() {
        $(document.body).on("click", '.urp-dropdown:not(.urp-dropdown-table)', function (event) {
            event.stopPropagation();
            var onOff = true;
            // 判断当前是否打开，是的话，直接关闭，否则先关闭所有的，再打开当前的
            if ($(this).hasClass("open")) {
                onOff = false;
            }
            $(".urp-dropdown").removeClass("open");
            if (onOff) {
                $(this).addClass("open");
            }
        })
        $(document.body).on("click", function () {
            $(".urp-dropdown").removeClass("open");
            $(".urp-dropdown-menu-table").remove();
        });
        // 滚动移除
        window.addEventListener("scroll",function() {
            $(".urp-dropdown-menu-table").remove();
        },true);
    }
    documentEvent();

    
    exports('dropdown', dropdown);
})