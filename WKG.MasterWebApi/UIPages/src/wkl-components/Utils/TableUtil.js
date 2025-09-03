import $ from "jquery";

function stickyScroll(e){

    if($(e.target).hasClass("sticky-table-container")){            
        if(e.target.scrollTop>0&& !$( e.target).find('.sticky-header').hasClass("sticky-border")){
            $( e.target).find('.sticky-header').addClass("sticky-border")
        }
        if(e.target.scrollTop<=0){
            $( e.target).find('.sticky-header').removeClass("sticky-border")
        }
    }
}
export {stickyScroll};