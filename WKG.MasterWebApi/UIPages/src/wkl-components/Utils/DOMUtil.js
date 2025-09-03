import $ from "jquery";

class domUtil {
    width(el) {
        return el.width() || 0;
    };
    height(el) {
        return el.height() || 0;
    };
    outerWidth(el) {
        el = $(el);
        if (el[0] === window) {
            return el.width() || document.body.clientWidth;
        }
        return el.outerWidth() || 0;
    };
    outerHeight(el) {
        if (el[0] === window) {
            return el.height() || document.body.clientHeight;
        }
        return el.outerHeight() || 0;
    };
    getBounds(parent) {
        parent = $(parent);
        let bounds = null;
        if (parent) {
            let areaBounds = parent.getBoundingClientRect();
            bounds = { left: areaBounds.left, top: areaBounds.top, right: areaBounds.right, bottom: areaBounds.bottom };
        }
        return bounds;
    }
    getPopupLeft(parent, popup, isRightAlign) {
        parent = $(parent);
        popup = $(popup);
        var leftPos = parent.offset().left;
        if (isRightAlign) {
            leftPos += this.outerWidth(parent) - this.outerWidth(popup);
        }
        if (leftPos + this.outerWidth(popup) > this.outerWidth($(window)) + $(document).scrollLeft()) {
            leftPos = this.outerWidth($(window)) + $(document).scrollLeft() - this.outerWidth(popup);
        }
        if (leftPos < 0) {
            leftPos = 0;
        }
        return leftPos;
    };
    getPopupTop(parent, popup, isBottomAlign) {
        parent = $(parent);
        popup = $(popup);
        var top = parent.offset().top;

        if (isBottomAlign)
            top += this.outerHeight(parent);

        //var top = parent.offset().top + this.outerHeight(parent);
        if (top + this.outerHeight(popup) > this.outerHeight($(window)) + $(document).scrollTop()) {
            top = parent.offset().top - this.outerHeight(popup);
        }
        if (top < $(document).scrollTop()) {
            top = parent.offset().top + this.outerHeight(parent);
        }
        const ht1 = $('body').height();
        const ht2 = this.outerHeight(popup);
        const newTop = (ht1 - ht2);
        if (top > newTop) {
            top = newTop;
        }
        return top;
    };


    getTooltipPosition(hoverRect, ttNode) {
        const parent = $(hoverRect);
        const child = $(ttNode);
        if (ttNode != null) {
            let x = 0, y = 0;

            const docWidth = document.documentElement.clientWidth,
                docHeight = document.documentElement.clientHeight;

            let pWidth = this.outerWidth(parent);
            let pHeight = this.outerHeight(parent);

            let cWidth = this.outerWidth(child);
            let cHeight = this.outerHeight(child);


            let rx = parent.offset().left + pWidth, // most right x
                lx = parent.offset().left, // most left x
                ty = parent.offset().top, // most top y
                by = parent.offset().top + pHeight; // most bottom y

            let bRight = (rx + cWidth) <= (window.scrollX + docWidth);
            let bLeft = (lx - cWidth) >= 0;

            let bAbove = (ty - cHeight) >= 0;
            let bBellow = (by + cHeight) <= (window.scrollY + docHeight);

            let newState = {};

            // the tooltip doesn't fit to the right
            if (bRight) {
                x = rx;

                y = ty + (pHeight - cHeight);

                if (y < 0) {
                    y = ty;
                }

                newState.type = "right";
            }
            else if (bBellow) {
                y = by;

                x = lx + (pWidth - cWidth);

                if (x < 0) {
                    x = lx;
                }

                newState.type = "bottom";
            }
            else if (bLeft) {
                x = lx - cWidth;

                y = ty + (pHeight - cHeight);

                if (y < 0) {
                    y = ty;
                }

                newState.type = "left";
            }
            else if (bAbove) {
                y = ty - cHeight;

                x = lx + (pWidth - cWidth);

                if (x < 0) {
                    x = lx;
                }

                newState.type = "top";
            }

            return { x: x, y: y, type: newState.type };
        }
    }

}

const DOMUtil = new domUtil();
export { DOMUtil };