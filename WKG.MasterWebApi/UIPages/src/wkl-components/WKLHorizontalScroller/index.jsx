import React, { useEffect } from "react";
import { useState } from "react";
import './index.css';
import { Utils } from "../Utils";
import $ from 'jquery';

function horizontalScrollHandler(slider, slider1) {
    let isDown = false;
    let startX;
    let scrollLeft;

    const onMousedown = (e) => {
        isDown = true;
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    };
    const onMouseleave = (e) => {
        isDown = false;
    };
    const onMouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 3; //scroll-fast
        slider.scrollLeft = scrollLeft - walk;
        if (slider1) {
            slider1.scrollLeft = slider.scrollLeft;
        }
        console.log(slider.scrollLeft);
    };

    slider.addEventListener('mousedown', onMousedown);
    slider.addEventListener('mouseleave', onMouseleave);
    slider.addEventListener('mouseup', onMouseleave);
    slider.addEventListener('mousemove', onMouseMove);

    return {
        releaseEvents: () => {
            slider.removeEventListener('mousedown', onMousedown);
            slider.removeEventListener('mouseleave', onMouseleave);
            slider.removeEventListener('mouseup', onMouseleave);
            slider.removeEventListener('mousemove', onMouseMove);

        }
    };
}

const WKLHorizontalScroller = (props) => {
    const [state, setState] = useState({ id: Utils.getUniqueID() });
    useEffect(() => {
        let selector = `[data-h-scroll="${state.id}"]`;
        let selectorGroup = `[data-h-scroll-group="${props.group}"]`;

        let eventHandler = null;
        console.log('Query Selector' + selector);
        let slider = document.querySelector(selector);
        let slider1 = document.querySelector(selectorGroup);
        if (slider) {
            let overflow = false;
            if (slider) {
                overflow = slider.offsetWidth !== parseInt($(slider).innerWidth());
                console.log(`Ist - ${slider.offsetWidth} - ${parseInt($(slider).innerWidth())}`);
            }

            if (slider1 && overflow === false) {
                overflow = parseInt($(slider1).innerWidth()) > slider.offsetWidth;
                console.log(`2nd - ${slider.offsetWidth} - ${parseInt($(slider1).innerWidth())}`);
            }

            if (overflow === true) {
                slider.setAttribute("data-h-scroll-active", "");
                eventHandler = new horizontalScrollHandler(slider, slider1);
                return;
            }
            else
                slider.removeAttribute("data-h-scroll-active");
        }
        return () => {
            if (eventHandler)
                eventHandler.releaseEvents();
        };
    });

    return React.cloneElement(props.children, { "data-h-scroll": state.id });
};

export { WKLHorizontalScroller };