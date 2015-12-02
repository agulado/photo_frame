var photo_arr = new Array();        //全局变量，存放图片路径
var photo_n = 0;            //正显示图片的序号（array中的序号）
var li_n = 1;               //正显示li的序号
var photo_devising = false;      //标记正在进行旋转后的补齐及二次修正

$(function () {
    init();
    $(window).resize(function () {
        init();
    });
});

function init() {
    var h_window = $(window).height();      //窗口高度
    var w_window = $(window).width();       //窗口宽度

    var obj = ".photo_frame ul li";
    $(".photo_frame").css("height", h_window);      //场景层铺满屏幕
    $(".loading").css("height", h_window);
    $(obj).css("height", h_window * .8 + "px").css("top", h_window * .1 + "px");    //图片高度为屏幕高度的80%，并垂直居中
    for (i = 0; i < $(obj).length; i++) {
        $($(obj)[i]).css("-webkit-transform", "rotateY(" + (i - 1) * 90 + "deg) translateZ(50vw)");     //让4个图片显示层分居立方体的垂直4面
        $($(obj)[i]).css("-moz-transform", $($(obj)[i]).css("-webkit-transform"));
        
        if (i == 0)
            $($(obj)[i]).css("background", "url(" + photo_arr[photo_arr.length - 1] + ") no-repeat center center")
            .css("background-size", "cover");     //设置左面的背景图为最后一张
        else if (i <= 2)
            $($(obj)[i]).css("background", "url(" + photo_arr[i - 1] + ") no-repeat center center")
            .css("background-size", "cover");      //设置正面的背景图是第一张，右面的是第二张
        
    }

    //预加载图片
    var photo_loading_count = 0;
    for (i = 0; i < photo_arr.length; i++) {
        imgLoad(photo_arr[i], "#null", function () {
            if (++photo_loading_count == photo_arr.length) {     //如全部加载，则显示图片盒。
                $(".loading").fadeOut(500);
                $(".photo_frame").fadeIn(500);
            }
        });
    }

    //点击则左旋90度，第一版测试使用。
    $(obj).on("click", function () {
        return;
        $(obj).parents("ul").transit({ rotateY: "-=90deg" }, 1000, "ease-in-out", function () { });
    });

    var deg_old;        //原始deg
    var d;              //移动距离（带正负）
    var deg;            //移动角度（带正负）
    $(".photo_frame").swipe({
        swipeStatus: function (event, phase, direction, distance, duration, fingerCount) {
            if (photo_devising)
                return;

            if (direction == "left")
                d = -distance;
            else if (direction == "right")
                d = distance;
            //$("p").html(phase);


            //拖动开始，记录原始deg
            if (phase == "start") {
                deg_old = $(".photo_frame ul").css("rotateY").toString().replace("deg", "");
            }

            //拖动中
            if (phase == "move") {
                deg = d / w_window * 90;
                $(".photo_frame ul").css("rotateY", parseInt(parseFloat(deg_old) + deg) + "deg");
            }

            //取消拖动
            if (phase == "cancel") { 
                $(".photo_frame ul").transit({ rotateY: deg_old + "deg" }, 50, function () {
                    photo_turning = false;
                });
            }

            //拖动结束
            if (phase == "end") {
                deg = parseInt(deg);        //给移动角度求整
                if (deg < 0)
                    deg = -deg;
                if (deg == 90)
                    return;
                else {  //移动场景到平整
                    var direction_plus;

                    photo_devising = true;

                    if (direction == "left")
                        direction_plus="-=";
                    else
                        direction_plus="+=";

                    $(".photo_frame ul").transit({ rotateY: direction_plus + (90 - deg) + "deg" }, 500, "ease-out", function () {
                        revise_deg();               //二次修正
                        change_photo("left");       //换图并改变_turning值为false
                    });
                }
            }
        }
    });
}

//移动后二次修正
function revise_deg() {
    var obj=".photo_frame ul";
    var deg = parseInt($(obj).css("rotateY").replace("deg", ""));
    $(obj).css({ rotateY: deg + "deg" });
    var mod = deg % 90;
    if (mod == 0)
        return;
    var deg_abs = deg;
    if (deg < 0)
        deg_abs = -deg;
    var mod_abs=mod;
    if (mod < 0)
        mod_abs = -mod;

    var deg_diff;
    if (mod_abs < 45)
        deg_diff = mod;
    else {
        deg_diff = 90 - mod_abs;
        if (mod > 0)
            deg_diff = -deg_diff;
    }

    $(obj).css({ rotateY: "-=" + deg_diff + "deg" });
}

//更换图片
function change_photo(direction) {
    var photo_pre;          //要显示的图片的序号
    var li_pre;             //要装载新图片的li的序号
    if (direction == "left") {          //如果是往左移动，则更换移动后的右侧盒的背景图
        photo_n++;
        li_n++;
        if (photo_n >= photo_arr.length)
            photo_n = 0;
        if (li_n >= $(".photo_frame ul li").length)
            li_n = 0;
        photo_pre = photo_n + 1;
        li_pre = li_n + 1;
        if (photo_pre >= photo_arr.length)
            photo_pre = 0;
        if (li_pre >= $(".photo_frame ul li").length)
            li_pre = 0;
    }
    else if (direction == "right") {         //如果是往右移动，则更换移动后的左侧盒的背景图
        photo_n--;
        li_n--;
        if (photo_n < 0)
            photo_n = photo_arr.length - 1;
        if (li_n < 0)
            li_n = $(".photo_frame ul li").length - 1;
        photo_pre = photo_n - 1;
        li_pre = li_n - 1;
        if (photo_pre < 0)
            photo_pre = photo_arr.length - 1;
        if (li_pre < 0)
            li_pre = $(".photo_frame ul li").length - 1;
    }
    $(".photo_frame ul li:eq(" + li_pre + ")").css("background", "url(" + photo_arr[photo_pre] + ") no-repeat center center")
            .css("background-size", "cover");

    photo_devising = false;
}