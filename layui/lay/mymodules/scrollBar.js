/**
* @Name: 滚动条
* @Author: 李祥
* @License：MIT
* 最近修改时间: 2019/06/17
*/

/**
* 使用：
    var s=scrollBar({
        el: ".scroll",
        color: "#888",
        width: "7px"
    })
    s.resetHeight();    // 重新计算滚动条高度
* 
*/

layui.define(["jquery"], function (exports) {
    var $ = layui.jquery;

    function ScrollBar(options) {
        this.options = options;     // 获取传入的数据
        this.contentEL = $(options.el);
        this.wrapEl = "";
        this.rate = 0;
        this.scrollBarBodyHeight = 0;
        this.maxCurrent = 0;
        this.y = 0;
        this.pageY = 0;
        this.current = 0;

        this.scrollBarEL = "";
        this.scrollBarBodyEL = "";

        this.color = this.options.color || "#aaa";
        this.width = this.options.width || "6px";

        this.init();
    }

    ScrollBar.prototype = {
        constructor: ScrollBar,
        init: function () {
            this.wrapEl = this.contentEL.parent().addClass("urp-scroll").append(
                '<div class="urp-scrollBar" style="width: ' + this.width + '">' +
                    '<div class="urp-scrollBar-body" style="background-color: ' + this.color + ';"></div>' +
                '</div>'
            );

            var res = new RegExp(/[A-Za-z]+$/);
            var pRight = this.width;
            if (res.exec(this.width)[0] === "px") {
                pRight = parseFloat(this.width) + 10 + "px"
            }
            this.contentEL.css("padding-right", pRight);
            this.scrollBarEL = this.wrapEl.children(".urp-scrollBar");
            this.scrollBarBodyEL = this.scrollBarEL.children(".urp-scrollBar-body");
            this.countHeight();
            this.event();
        },
        countHeight: function () {
            this.rate = this.wrapEl.height() / this.contentEL.height();
            if (this.rate > 1) {
                this.rate = 1;
                this.scrollBarEL.css("opacity", 0);
            } else {
                this.scrollBarEL.css("opacity", 1);
            }
            this.scrollBarBodyHeight = this.scrollBarEL.height() * this.rate;
            this.scrollBarBodyEL.css("height", this.scrollBarBodyHeight);
            // 重新计算最大位置
            this.maxCurrent = this.scrollBarEL.height() - this.scrollBarBodyHeight;
            // 如果当前的位置超出最大位置，则重置当前位置为最大位置
            this.current = this.current > this.maxCurrent ? this.maxCurrent : this.current;
            this.scrollFn();
        },
        scrollFn: function () {
            if (this.current < 0) {
                this.current = 0;
            }
            if (this.current > this.maxCurrent) {
                this.current = this.maxCurrent;
            }
            this.scrollBarBodyEL.css("top", this.current + "px");
            this.wrapEl.scrollTop(this.current / this.rate);
            this.scrollBarEL.css("top", this.current / this.rate + "px");
        },
        down: function (type, e) {
            var clientY = 0, moveType, endType;
            if (type === "mouse") {
                // 滚动条拖拽滚动
                this.y = e.clientY - this.wrapEl.offset().top - this.scrollBarBodyEL.position().top + $(document).scrollTop();
                moveType = "mousemove";
                endType = "mouseup";
            } else if (type === "touch") {
                // 滚动条手势滚动
                this.y = e.originalEvent.touches[0].clientY - this.wrapEl.offset().top - this.scrollBarBodyEL.position().top + $(document).scrollTop();
                moveType = "touchmove";
                endType = "touchend";
            } else {
                // 页面手势滚动
                this.pageY = e.originalEvent.touches[0].pageY;
                moveType = "touchmove";
                endType = "touchend";
            }
            var scrollFn = this.throttle(this.move.bind(this, type));
            $(document).on(moveType + ".move", scrollFn);
            $(document).on(endType + ".up", function () {
                $(document).off(".move").off(".up");
            })
        },
        move: function (type, e) {
            var clientY = 0;
            e.preventDefault();
            if (type === "mouse") {
                this.current = e.clientY - this.y - this.wrapEl.offset().top + $(document).scrollTop();
            } else if (type === "touch") {
                this.current = e.originalEvent.touches[0].clientY - this.y - this.wrapEl.offset().top + $(document).scrollTop();
            } else {
                this.current = this.current - (e.originalEvent.touches[0].pageY - this.pageY) / 10;
            }
            this.scrollFn();
            window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
        },
        event: function () {
            var that = this;
            this.scrollBarBodyEL.on("mousedown", this.down.bind(this, "mouse"));
            this.scrollBarBodyEL.on("touchstart", this.down.bind(this, "touch"));
            this.contentEL.on("touchstart", this.down.bind(this, "contentTouch"));
            this.scrollBarBodyEL.on("click", function (e) {
                e.stopPropagation();
            });
            this.scrollBarEL.on("click", function (e) {
                var y = e.clientY - that.wrapEl.offset().top + $(document).scrollTop();
                // 判断点击的是上面还是下面
                if (y > that.current) {
                    that.current += that.scrollBarBodyHeight;
                } else {
                    that.current -= that.scrollBarBodyHeight;
                }
                that.scrollFn();
            })

            var f = function (e) {
                var value = e.originalEvent.wheelDelta || -e.originalEvent.detail;
                that.current = value > 0 ? that.current - 15 : that.current + 15;
                that.scrollFn();

                if (that.current >= that.maxCurrent || that.current <= 0) {
                    // 滚动到最大最小时，重新绑定事件，相当于移除preventDefault
                    that.wrapEl.off("mousewheel DOMMouseScroll", f).on("mousewheel DOMMouseScroll", f);
                } else {
                    e.preventDefault();
                }
            }
            this.wrapEl.on("mousewheel DOMMouseScroll", f);

            var scrollFn = this.throttle(function () {
                that.countHeight();
            });
            $(window).on("resize", scrollFn);
        },
        // 节流函数
        throttle: function (callback, time) {
            var timer = null;
            var firstTime = true;
            return function () {
                var args = arguments;
                var _self = this;
                if (firstTime) {
                    callback.apply(_self, args);
                    return firstTime = false;
                }
                if (timer) {
                    return false;
                }
                timer = setTimeout(function () {
                    clearTimeout(timer);
                    timer = null;
                    callback.apply(_self, args);
                }, time || 50)

            }
        }
    }


    exports('scrollBar', function (options) {
        var inst = new ScrollBar(options);
        var obj = {
            resetHeight: inst.countHeight.bind(inst)
        }
        return obj;
    });
})