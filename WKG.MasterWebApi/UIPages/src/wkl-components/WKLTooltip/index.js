import React, { useEffect, useRef, useState } from "react";
import "./index.css";
import { DOMUtil } from "../Utils";
import ReactDOM from 'react-dom';
import $ from "jquery";

const findReactElement = (node, prop = null) => {
    if (prop) {
        for (let key in node) {
            if (key.startsWith(prop)) {
                return node[key];
            }
        }
    }
    else {
        for (let key in node) {
            if (key.startsWith("__reactInternalInstance$")) {
                return node[key]._debugOwner.stateNode;
            }
        }
    }
    return null;
};

const appRoot = document.getElementById('root');

export const WKLTooltip = (props) => {
    let timeout;
    const [active, setActive] = useState(false);
    const container = useRef(null);
    const element = useRef(null);
    const dropDown = useRef(null);

    useEffect(() => {
        if (container.current) {
            $(container.current).on('mouseenter.tooltip', '[wkl-tool-tip]', null, showTip);
            $(container.current).on('mouseleave.tooltip', '[wkl-tool-tip]', null, hideTip);
        }

        return () => {
            if (container.current) {
                $(container.current).off('mouseenter.tooltip', showTip);
                $(container.current).off('mouseleave.tooltip', hideTip);
            }

        };
    });

    const showTip = (e) => {
        if (e.target) {
            const cmpnt = findReactElement(e.target, '__reactProps$');
            if (cmpnt) {
                let toolTip = cmpnt['wkl-tool-tip'];
                if (toolTip) {
                    element.current = {
                        parent: e.target,
                        child: null,
                        data: toolTip,
                        left: 0,
                        top: 0,
                        type: ''
                    };
                    timeout = setTimeout(() => {
                        setActive(!active);
                    }, props.delay || 400);
                }
            }
        }
    };

    const hideTip = (e) => {
        element.current = null;
        dropDown.current = null;
        clearInterval(timeout);
        setActive(!active);

    };

    function dropDownRef(el) {
        dropDown.current = el;
        if (dropDown.current) {
            const s = DOMUtil.getTooltipPosition(element.current.parent, dropDown.current);
            if (element.current.left === 0) {
                element.current.left = s.x;
                element.current.top = s.y;
                element.current.type = s.type;
                setActive(!active);
            }
        }
    }

    function renderTooltip() {
        if (element.current && element.current.parent) {
            const atr = { className: 'wkl-tooltip' };
            atr.ref = dropDownRef;
            atr.className += (' ' + element.current.type);
            atr.style = { left: element.current.left + 'px', top: element.current.top + 'px' };

            return ReactDOM.createPortal(
                (<div  {...atr}>
                    <div className="tooltip-arrow"></div>
                    <div className="tooltip-inner">
                        {element.current.data}
                    </div>
                </div>),
                appRoot);
        }
    }

    return (<div className={props.className || ''} ref={el => container.current = el}>
        {props.children}
        {renderTooltip()}
    </div>);
};
