var $scrollBar, $scrollbarDiv, $slider;
var scrollAreaHeight = 0;
var scrollbarScrollHeight = 0;
var startPoint = 0;
var scrollRatio = 1;
var isScrolling = 0;
var scrollbarTop = 0, scrollbarBottom = 0;
var sliderTop = 0;

function topOf($element) {
    var thisTop = $element.offset().top;
    thisTop = $element.offset().top;
    return thisTop;
}

function initArrowImages(sliderImg, topArrowImg, bottomArrowImg, scrollbarDivHeight) {
    var topArrowImgHeight = 0, bottomArrowImgHeight = 0, sliderImgHeight = 0, img0 = new Image(),
        img1 = new Image(), img2 = new Image();

    img0.src = sliderImg;
    img0.onload = function () {
        sliderImgHeight = this.height;
    };

    img1.src = topArrowImg;
    img1.onload = function () {
        topArrowImgHeight = this.height;
    };

    img2.src = bottomArrowImg;
    img2.onload = function () {
        var bottomArrowImgHeight = this.height;
        scrollbarScrollHeight = scrollAreaHeight - topArrowImgHeight - bottomArrowImgHeight;
        $('#scroll_background').css({height: scrollbarScrollHeight});
        scrollbarScrollHeight -= sliderImgHeight;
        scrollRatio = scrollbarScrollHeight / (scrollbarDivHeight - scrollAreaHeight + 10);
        scrollbarTop += topArrowImgHeight;
        sliderTop = scrollbarTop;
        scrollbarBottom = scrollbarTop + scrollbarScrollHeight;
        if (scrollbarDivHeight < scrollAreaHeight) {
            $scrollBar.css({display: 'none'});
        }
    };
}

function moveToTop() {
    isScrolling = 0;
    $scrollbarDiv.animate({top: 0}, 100, 'linear', function() {});
    $slider.animate({top: 0}, 100, 'linear', function() {});
    sliderTop = scrollbarTop;
}

function moveToBottom() {
    isScrolling = 0;
    $scrollbarDiv.animate({top: (scrollAreaHeight - $scrollbarDiv.height())}, 100, 'linear', function() {});
    $slider.animate({top: scrollbarScrollHeight}, 100, 'linear', function() {});
    sliderTop = scrollbarBottom;
}

function stopScrollbarScrolling() {
    isScrolling = 0;
    $scrollbarDiv.stop(true);
    $slider.stop(true);
}

function makeSliderScroll(toMove, moveOnce) {
    if (isScrolling == 0)
        return;
    var distance = parseInt(toMove.replace("=", ""));
    if (sliderTop <= (scrollbarTop - distance) && isScrolling == -1) {
        stopScrollbarScrolling();
        moveToTop();
        return;
    }
    if (sliderTop >= (scrollbarBottom - distance) && isScrolling == 1) {
        stopScrollbarScrolling();
        moveToBottom();
        return;
    }
    $slider.animate({top: toMove}, 100, 'linear', function() {
        sliderTop += distance;
        if (!moveOnce)
            makeSliderScroll(toMove, false);
    });
}

function makeDivScroll(toMove, moveOnce) {
    if (isScrolling == 0)
        return;
    $scrollbarDiv.animate({top: toMove}, 100, 'linear', function() {
        if (!moveOnce)
            makeDivScroll(toMove, false);
    });
}

function startScrollbarScrolling(distance, moveOnce) {
    var toMoveSlider = "+="+distance;
    if (distance < 0)
        toMoveSlider = "-="+(0-distance);
    distance /= scrollRatio;
    distance *= -1;
    var toMoveDiv = "+="+distance;
    if (distance < 0)
        toMoveDiv = "-="+(0-distance);
    makeSliderScroll(toMoveSlider, moveOnce);
    makeDivScroll(toMoveDiv, moveOnce);
}

function initScrollBar(scrollBarSel, topArrowImgSel, backgroundImgSel, sliderImgSel, bottomArrowImgSel, scrollbarDivSel, 
    topArrowMouseoverImgSel, bottomArrowMouseoverImgSel, scrollAreaHeightSel) {
    $scrollBar = scrollBarSel;
    scrollbarTop = $scrollBar.offset().top; 
    $scrollbarDiv = scrollbarDivSel;
    scrollAreaHeight = scrollAreaHeightSel;
    var my_html = '<div id="scroll_arrow1"><img src="'+topArrowImgSel+'" alt="Up" border="0" id="scroll_arrow_img1" onmouseover="MM_swapImage(\'scroll_arrow_img1\',\'\',\''+topArrowMouseoverImgSel+'\',1)" onmouseout="MM_swapImgRestore()" />';            
    my_html += '</div><div id="scroll_background" style="background-image: url(\''+backgroundImgSel+'\');">';
    my_html += '<div id="slider" style="vertical-align: top;"><img style="position: relative; top: 0;" src="'+sliderImgSel+'" alt="Scroll Bar" border="0" />';
    my_html += '</div></div><div id="scroll_arrow2"><img src="'+bottomArrowImgSel+'" alt="Down" border="0" id="scroll_arrow_img2" onmouseover="MM_swapImage(\'scroll_arrow_img2\',\'\',\''+bottomArrowMouseoverImgSel+'\',1)" onmouseout="MM_swapImgRestore()" />';            
    my_html += '</div>';
    $scrollBar.html(my_html);
    initArrowImages(sliderImgSel, topArrowImgSel, bottomArrowImgSel, $scrollbarDiv.height());
    $slider = $('#slider');
    $slider.css({position: 'relative'});
    $scrollbarDiv.css({position: 'relative'});
    
    $('#slider').draggable({ 
        axis: "y",
        containment: "parent",
        drag: function() {
            var distance = topOf($(this)) - topOf($('#scroll_background'));
            distance /= scrollRatio;
            distance *= -1;
            var scrollLeft = $scrollbarDiv.offset().left; 
            var scrollTop = $scrollbarDiv.parent().offset().top + distance;
            $scrollbarDiv.offset({top: scrollTop, left: scrollLeft});
        },
        stop: function() {
            if ( topOf($slider) == scrollbarTop )
                moveToTop();
            else if ( topOf($slider) == scrollbarBottom )
                moveToBottom();
        }
    });

    $('#scroll_background').click(function(event) {
        var toMove = 0;
        if (event.pageY < $slider.offset().top) {
            toMove = 0 - $slider.height();
            isScrolling = -1;
        }
        else if (event.pageY > ($slider.offset().top + $slider.height())) {
            toMove = $slider.height();
            isScrolling = 1;
        }
        startScrollbarScrolling(toMove, true);
    });
    $('#scroll_arrow1').mousedown(function(event) {
        isScrolling = -1;
        startScrollbarScrolling(-10, false);
    });
    $('#scroll_arrow1').mouseup(function(event) {
        stopScrollbarScrolling();
    });
    $('#scroll_arrow2').mousedown(function(event) {
        isScrolling = 1;
        startScrollbarScrolling(10, false);
    });
    $('#scroll_arrow2').mouseup(function(event) {
        stopScrollbarScrolling();
    });
}
