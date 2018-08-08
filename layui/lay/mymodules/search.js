 /**
 
 @Name : layui.search
 @Author：hsianglee
 @License：MIT
 
 */

layui.define(["jquery","layer"], function (exports) {
    var $ = layui.jquery;
    var layer = layui.layer;
    
    function Search(option) {
        this.option=option;     // 获取传入的数据
        this.data=$.extend([],this.option.data);
        this.searchId=this.option.searchId;
        this.callback=this.option.done;
        this.value=$(".urp-search input").val();
        this.newArr=[];

        this.init();
    }

    Search.prototype={
        constructor: Search,
        // 初始化参数数据
        init: function() {
            var self=this;
            $(".urp-search button").off().on("click",function() {
                self.search();
            })
        },
        search: function() {
            this.newArr=[];
            this.value=$(".urp-search input").val();
            if(this.data.length===0){
                layer.alert("data参数错误",{icon: 2});
                return;
            }
            if(this.value===""){
                this.callback?this.callback(this.data):"";
                return;
            }
            
            this.data.forEach(function(val,index) {
                if(typeof this.searchId==='string'){
                    if(val[this.searchId].indexOf(this.value)!==-1){
                        this.newArr.push(val)
                    }
                }else if(typeof this.searchId==='object' && this.searchId.length>=1){
                    this.searchId.forEach(function(v,i) {
                        if(val[v].indexOf(this.value)!==-1){
                            this.newArr.push(val)
                        }
                    },this)
                }else{
                    layer.alert("searchId参数错误",{icon: 2});
                    return;
                }
                $(".urp-search input").val("");
            },this);
            this.callback?this.callback(this.newArr):"";
        }
    }

    exports('search', function(option) {
        new Search(option);
    });
})