/**

 @Name：layui.tree 树组件
 @Author：贤心
 @License：MIT
    
 */
 
 
layui.define('jquery', function(exports){
    "use strict";
    
    var $ = layui.$
    ,hint = layui.hint();
    
    var enterSkin = 'layui-tree-enter', Tree = function(options){
        this.options = options;
    };
    
    //图标
    var icon = {
        arrow: ['&#xe623;', '&#xe625;'] //箭头
      ,checkbox: ['&#xe626;', '&#xe627;'] //复选框
      ,radio: ['&#xe62b;', '&#xe62a;'] //单选框
      ,branch: ['&#xe622;', '&#xe624;'] //父节点
      ,leaf: '&#xe621;' //叶节点
    };
    
    //初始化
    Tree.prototype.init = function(elem){
        var that = this;
        elem.addClass('layui-box layui-tree'); //添加tree样式
        if(that.options.skin){
            elem.addClass('layui-tree-skin-'+ that.options.skin);
        }
        that.tree(elem);
        that.on(elem);

        elem.after('<ul id="tree-menu">'+
              '<li><a href="javascript:;">复制</a></li>'+
              '<li><a href="javascript:;">新增</a></li>'+
              '<li><a href="javascript:;">修改</a></li>'+
              '<li><a href="javascript:;">删除</a></li>'+
          '</ul>'
      )
      $(document).on("click",function() {
          $("#tree-menu").hide();
      })
    };
    
    //树节点解析
    Tree.prototype.tree = function(elem, children){
        var that = this, options = that.options
        var nodes = children || options.nodes;
      
        layui.each(nodes, function(index, item){
            var hasChild = item.children && item.children.length > 0;
            var ul = $('<ul class="'+ (item.spread ? "layui-show" : "") +'"></ul>');
            var li = $(['<li '+ (item.spread ? 'data-spread="'+ item.spread +'"' : '') +'>'
              //展开箭头
              ,function(){
                  return hasChild ? '<i class="layui-icon layui-tree-spread">'+ (
                    item.spread ? icon.arrow[1] : icon.arrow[0]
                  ) +'</i>' : '';
              }()
          
              //复选框/单选框
              ,function(){
                  return options.check ? (
                    '<i class="layui-icon layui-tree-check">'+ (
                      options.check === 'checkbox' ? icon.checkbox[0] : (
                        options.check === 'radio' ? icon.radio[0] : ''
                      )
                    ) +'</i>'
                  ) : '';
              }()
          
              //节点
              ,function(){
                  return '<a href="'+ (item.href || 'javascript:;') +'" '+ (
                    options.target && item.href ? 'target=\"'+ options.target +'\"' : ''
                  ) +'>'
                  + ('<i class="layui-icon layui-tree-'+ (hasChild ? "branch" : "leaf") +'">'+ (
                    hasChild ? (
                      item.spread ? icon.branch[1] : icon.branch[0]
                    ) : icon.leaf
                  ) +'</i>') //节点图标
                  + ('<cite>'+ (item.name||'未命名') +'</cite></a>');
              }()
        
            ,'</li>'].join(''));
        
            //如果有子节点，则递归继续生成树
            if(hasChild){
                li.append(ul);
                that.tree(ul, item.children);
            }
        
            elem.append(li);
        
            //触发点击节点回调
            typeof options.click === 'function' && that.click(li, item); 
            options.contextmenu && typeof options.contextmenu === 'function'?that.contextmenu(li, item):"";
        
            //伸展节点
            that.spread(li, item);
        
            //拖拽节点
            options.drag && that.drag(li, item); 
        });
    };
    
    var oldDom;
    //点击节点回调
    Tree.prototype.click = function(elem, item){
        var that = this, options = that.options;
        elem.children('a').on('click', function(e){
            layui.stope(e);
            $("#tree-menu").hide();
            // 点击添加背景色
            if(oldDom) oldDom.removeClass("tree-menu-bg");
            $(elem[0]).children("a").addClass("tree-menu-bg");
            oldDom=$(elem[0]).children("a");

            options.click(item)
        });
    };
    // 右键菜单
    Tree.prototype.contextmenu = function(elem, item){
        var that = this, options = that.options;
        elem.children('a').on('contextmenu', function(e){
            e.preventDefault();
            layui.stope(e);
            // options.contextmenu(elem,item)
            // 菜单位置
            $("#tree-menu").css({
                left: event.pageX,
                top: event.pageY+13,
            }).show();
            // 点击右键添加背景色
            if(oldDom) oldDom.removeClass("tree-menu-bg");
            $(elem[0]).children("a").addClass("tree-menu-bg");
            oldDom=$(elem[0]).children("a");
            // 计算点击的当前菜单在数组中的位置存入数组
            var arr=[];
            var d=$(elem[0]);
            arr.push(d.index());
            while(d.parent("ul")[0]!==$("#demo")[0]){
                d=d.parent("ul").parent("li");
                arr.push(d.index());
            }
            arr=arr.reverse();

            // 复制功能
            $("#tree-menu li").eq(0).off().on("click",function() {
                var el = $(elem[0]).children("a").children("cite").get(0);
                var selection = window.getSelection();
                var range = document.createRange();
                range.selectNodeContents(el);
                selection.removeAllRanges();
                selection.addRange(range);
                document.execCommand('Copy', 'false', null);
                selection.removeAllRanges();
            });


            item.IsCanAdd?(function(){
                $("#tree-menu li").eq(1).find("a").removeClass("layui-disabled");
                $("#tree-menu li").eq(1).off().on("click",function() {
                    layer.prompt(function(value, index, elem){
                        var obj={
                            name: value,
                            IsCanAdd: true,
                            IsCanEdit: true,
                            IsCanDelete: true
                        };
                        item.spread=true;
                        item.children?(
                            item.children.push(obj)
                        ):(
                            item.children=[obj]
                        );
                        $("#tree-menu").hide();
                        options.contextmenu("add",item,function() {
                            that.reload();
                        });
                        layer.close(index);
                    });
                })
            })():(
              $("#tree-menu li").eq(1).off().find("a").addClass("layui-disabled")
            );

            item.IsCanEdit?(function(){
                $("#tree-menu li").eq(2).find("a").removeClass("layui-disabled");
                $("#tree-menu li").eq(2).off().on("click",function() {
                    layer.prompt(function(value, index, elem){
                        item.name=value;
                        $("#tree-menu").hide();
                        options.contextmenu("change",item,function() {
                            that.reload();
                        });
                        layer.close(index);
                    });
                })
            })():(
              $("#tree-menu li").eq(2).off().find("a").addClass("layui-disabled")
            );

            item.IsCanDelete?(function(){
                $("#tree-menu li").eq(3).find("a").removeClass("layui-disabled");
                $("#tree-menu li").eq(3).off().on("click",function() {
                    layer.confirm('确定删除?', {icon: 3, title:'提示'}, function(index){
                        // 若数组长度是1则点击的是顶层
                        (arr.length===1)?(
                            options.nodes.splice(arr[0],1)
                        ):(function(){
                            var tem=options.nodes[arr[0]];
                            for(var k=1;k<arr.length-1;k++){
                                tem=tem["children"][arr[k]];
                            }
                            if("children" in tem){
                                var t=tem["children"];
                                t.splice(arr[arr.length-1],1);
                            }
                            // if(t.length===0){
                            //     delete tem["children"]
                            // }
                        })();
                        $("#tree-menu").hide();
                        options.contextmenu("remove",item,function() {
                            that.reload();
                        })
                        layer.close(index);
                    });
                })
            })():(
              $("#tree-menu li").eq(3).off().find("a").addClass("layui-disabled")
            );
        });
        
    };
    
    //伸展节点
    Tree.prototype.spread = function(elem, item){
        var that = this, options = that.options;
        var arrow = elem.children('.layui-tree-spread')
        var ul = elem.children('ul'), a = elem.children('a');
      
        //执行伸展
        var open = function(){
            if(elem.data('spread')){
                // 合并
                delete item.spread;
                elem.data('spread', null)
                ul.removeClass('layui-show');
                arrow.html(icon.arrow[0]);
                a.find('.layui-icon').html(icon.branch[0]);
            } else {
                // 展开
                item.spread=true;
                elem.data('spread', true);
                ul.addClass('layui-show');
                arrow.html(icon.arrow[1]);
                a.find('.layui-icon').html(icon.branch[1]);
            }
        };
      
        //如果没有子节点，则不执行
        if(!ul[0]) return;
      
        arrow.on('click', open);
        a.on('dblclick', open);
    }
    
    //通用事件
    Tree.prototype.on = function(elem){
        var that = this, options = that.options;
        var dragStr = 'layui-tree-drag';
      
        //屏蔽选中文字
        elem.find('i').on('selectstart', function(e){
            return false
        });
      
        //拖拽
        if(options.drag){
            $(document).on('mousemove', function(e){
                var move = that.move;
                if(move.from){
                    var to = move.to, treeMove = $('<div class="layui-box '+ dragStr +'"></div>');
                    e.preventDefault();
                    $('.' + dragStr)[0] || $('body').append(treeMove);
                    var dragElem = $('.' + dragStr)[0] ? $('.' + dragStr) : treeMove;
                    (dragElem).addClass('layui-show').html(move.from.elem.children('a').html());
                    dragElem.css({
                        left: e.pageX + 10
                      ,top: e.pageY + 10
                    })
                }
            }).on('mouseup', function(){
                var move = that.move;
                if(move.from){
                    move.from.elem.children('a').removeClass(enterSkin);
                    move.to && move.to.elem.children('a').removeClass(enterSkin);
                    that.move = {};
                    $('.' + dragStr).remove();
                }
            });
        }
    };
      
    //拖拽节点
    Tree.prototype.move = {};
    Tree.prototype.drag = function(elem, item){
        var that = this, options = that.options;
        var a = elem.children('a'), mouseenter = function(){
            var othis = $(this), move = that.move;
            if(move.from){
                move.to = {
                    item: item
                  ,elem: elem
                };
                othis.addClass(enterSkin);
            }
        };
        a.on('mousedown', function(){
            var move = that.move
            move.from = {
                item: item
              ,elem: elem
            };
        });
        a.on('mouseenter', mouseenter).on('mousemove', mouseenter)
        .on('mouseleave', function(){
            var othis = $(this), move = that.move;
            if(move.from){
                delete move.to;
                othis.removeClass(enterSkin);
            }
        });
    };

    Tree.prototype.reload = function() {
        var tree = new Tree(this.options = this.options || {});
        var elem = $(this.options.elem);
        if(!elem[0]){
            return hint.error('layui.tree 没有找到'+ this.options.elem +'元素');
        }
        elem.empty();
        tree.init(elem);
    }
    
    //暴露接口
    exports('mytree', function(options) {
        var tree = new Tree(options = options || {});
        var elem = $(options.elem);
        if(!elem[0]){
            return hint.error('layui.tree 没有找到'+ options.elem +'元素');
        }
        tree.init(elem);
    });
});
  