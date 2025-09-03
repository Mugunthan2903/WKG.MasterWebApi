import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Utils } from '../Utils';
import $ from 'jquery';
import { WKLLabel } from '../WKLLabel';

function TabHeaderPanel(props, ref) {
    const [state, setState] = useState({ noOfTabs: null, isFocused: false, moreTabs: false, showPopup: false, dropDownWidth: 0, x: 0, y: 0 });
    const inputRef = useRef();

    useImperativeHandle(ref, () => ({
        closePopup: (e) => {
            if (state.showPopup === true) {
                setState({ ...state, showPopup: false });
                return true;
            }
        },
        updateUI: () => {
            setState({ ...state, refresh: !state.refresh });
        }
    }));

    const mouseupListener = (e) => {
        if (state.showPopup) {
            toggleDropdown(e);
        }
    };
    function focusSelectedItem() {
        if (inputRef.current.isFocused === false) {
            if (inputRef.current['inputRef'] && inputRef.current[props.selectedID]) {
                inputRef.current.isFocused = true;
                if (isVisible(inputRef.current[props.selectedID]) === false)
                    focusItem(inputRef.current[props.selectedID]);
            }
        }
    }
    useEffect(() => {
        if (inputRef.current)
            inputRef.current.isFocused = false;
        focusSelectedItem();
    }, [props.tabItems, props.selectedID]);

    useEffect(() => {
        $(document).on('mouseup.wittab', mouseupListener);
        return () => {
            $(document).off('mouseup.wittab', mouseupListener);
        };
    });
    function toggleDropdown(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setState({ ...state, showPopup: !state.showPopup });
    };
    function toggleDropdown1(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
    };
    function selectionChangeTab(e, tb) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (props.selectedID === tb.id)
            return;

        Utils.invoke(props.onSelectionChange, { e, tab: tb });
    }
    function focusItem(tbElmnt, tb, e) {
        if (tbElmnt && inputRef.current['inputRef'] && tbElmnt && inputRef.current['inputTabItemRef'] && inputRef.current['DropDown']) {
            const container = inputRef.current['inputRef'];

            const contRect = container.getBoundingClientRect();
            const itemRect = tbElmnt.getBoundingClientRect();
            if (props.orientation === 'top' || props.orientation === 'bottom') {
                let left = 0;
                left = (tbElmnt.offsetLeft + itemRect.width) - contRect.width;
                if (left > 0) {
                    left += 8;
                    left = left * -1;
                }
                else {
                    left = tbElmnt.offsetLeft * -1;
                }

                if (state.x !== left)
                    setState({ ...state, showPopup: false, x: left });
            }
            if (tb)
                Utils.invoke(props.onSelectionChange, { e, tab: tb });
        }
    }
    function selectTab(e, tb) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (props.selectedID === tb.id)
            return;

        if (inputRef.current && inputRef.current[tb.id]) {
            focusItem(inputRef.current[tb.id], tb, e);
        }
    }
    function setRef(el, name) {
        if (inputRef.current === undefined)
            inputRef.current = { isFocused: false };

        inputRef.current[name] = el;
        if (inputRef.current['inputRef'] && inputRef.current['inputTabItemRef']) {
            let moreTabs = (inputRef.current['inputRef'].getBoundingClientRect().width > (inputRef.current['inputTabItemRef'].getBoundingClientRect().width + 10));
            if (state.moreTabs !== moreTabs) {
                setState({ ...state, moreTabs });
            }
        }
    }

    function renderItem(tb) {
        let classList = "wkl-tab-item";
        if (props.orientation === 'top')
            classList += " wkl-tab-item-top";
        else if (props.orientation === 'bottom')
            classList += " wkl-tab-item-bottom";
        else if (props.orientation === 'left')
            classList += " wkl-tab-item-left";
        else if (props.orientation === 'right')
            classList += " wkl-tab-item-right";

        if (tb.id === props.selectedID)
            classList += " active";

        let toolTip = tb.option.title || ''

        let style = null;
        let width = (+props.menuWidth) || 0;
        if (!isNaN(width) && isFinite(width) && width > 0)
            style = { width: `${width}px` };

        let cmpnt = null;
        const title = tb.option.text || null;
        if (title) {
            if (typeof tb.option.text === 'string') {
                cmpnt = title || '';
            }
            else {
                cmpnt = (<WKLLabel id={title.id || 0} text={title.text || ''} />);
            }
        }

        return (<li title={toolTip} key={`tbitm_${tb.id}`} style={style} ref={(el) => setRef(el, tb.id)} className={classList} onClick={(e) => selectionChangeTab(e, tb)}>
            <span className="wkl-tab-item-text">{cmpnt}</span>
            {tb.option.isClosable === true && <span className="wkl-tab-item-close fa fa-times" title="Close" onClick={(e) => Utils.invoke(props.onClose, { e, tab: tb })}></span>}
        </li>);
    }
    function isVisible(itm) {
        if (itm && inputRef.current['inputRef']) {
            const domRect = inputRef.current['inputRef'].getBoundingClientRect();
            const dm = itm.getBoundingClientRect();
            let totalWidth = domRect.width;
            let totalHeight = domRect.height;
            if (props.orientation === 'top' || props.orientation === 'bottom') {
                let left = (dm.left - domRect.left);
                if (left < 0 || (left + dm.width) > totalWidth) {
                    return false;
                }
            }
            else {
                let top = (dm.top - domRect.top);
                if (top < 0 || (top + dm.height) > totalHeight) {
                    return false;
                }
            }
        }
        return true;
    }
    function renderMoreItem(tb) {
        let style = null;
        let width = (+props.dropDownWidth) || 0;
        if (!isNaN(width) && isFinite(width) && width > 0)
            style = { width: `${width}px` };

        if (isVisible(inputRef.current[tb.id]) === false) {
            let classList = "wkl-tab-item wkl-dropdown-item";
            return (<div key={`tbitm_${tb.id}`} className={classList} style={style} onClick={(e) => selectTab(e, tb)}>
                <span className="wkl-tab-item-text">{tb.option.text}</span>
                {tb.option.isClosable === true && <span className="wkl-tab-item-close " title="Close" onClick={(e) => Utils.invoke(props.onClose, { e, tab: tb })}><i className=" fa fa-times"></i></span>}
            </div>);
        }
        return null;
    }
    function renderMoreTabs() {
        let cls = 'wkl-dropdown-menu';
        let dropdownItems = null;
        if (state.showPopup) {
            if (props.orientation === 'top')
                cls += ' wkl-show-bottom';
            else if (props.orientation === 'bottom')
                cls += ' wkl-show-top';
            else if (props.orientation === 'left')
                cls += ' wkl-show-right';
            else if (props.orientation === 'right')
                cls += ' wkl-show-top';
            else
                cls += ' wkl-show';

            dropdownItems = props.tabItems.map((tb, idx) => renderMoreItem(tb));
            if (dropdownItems.length > 0) {
                if (dropdownItems[0] === null)
                    dropdownItems = null;
            }
        }
        let style = {};
        if (props.dropDownHeight) {
            let ht = +props.dropDownHeight || 0;
            if (!isNaN(ht) && isFinite(ht) && ht > 0)
                style.maxHeight = `${ht}px`;
        }

        const stye = { visibility: 'visible' }
        if (state.moreTabs)
            stye.visibility = 'visible';


        return (<div className="wkl-tab-item-more wkl-dropdown" style={stye} ref={(el) => setRef(el, 'DropDown')}>
            <span className="wkl-tab-item-more-btn" onMouseUp={toggleDropdown} >
                <i className="fa fa-ellipsis-h"></i>
            </span>
            {dropdownItems && (<ul className={cls} onMouseUp={toggleDropdown1} style={style}>
                {dropdownItems}
            </ul>)}
        </div>);
    }

    let cls1 = 'wkl-tab-header';

    let wrapperCls = 'wkl-tab-header-items-wrapper';
    let wrapperCls1 = '';

    let cls = 'wkl-tab-header-items';
    if (props.orientation === 'top') {
        cls += ' wkl-tab-header-items-top';
        wrapperCls1 += ' top';
    }
    else if (props.orientation === 'bottom') {
        cls += ' wkl-tab-header-items-bottom';
        wrapperCls1 += ' bottom';
    }
    else if (props.orientation === 'left') {
        cls += ' wkl-tab-header-items-left';
        cls1 += ' wkl-tab-header-vertical';
        wrapperCls1 += ' left';
    }
    else if (props.orientation === 'right') {
        cls += ' wkl-tab-header-items-right';
        cls1 += ' wkl-tab-header-vertical';
        wrapperCls1 += ' right';
    }

    wrapperCls += wrapperCls1;
    cls1 += wrapperCls1;

    let style = {
        willChange: "transform",
    };
    if (props.orientation === 'top' || props.orientation === 'bottom') {
        style.transform = `translateX(${state.x}px)`;
    }
    else {
        style.transform = `translateY(${state.y}px)`;
    }
    return (<div className={cls1} ref={(el) => setRef(el, 'outerRef')}>
        <div className={wrapperCls} ref={(el) => setRef(el, 'inputRef')} >
            <ul className={cls} style={style} ref={(el) => setRef(el, 'inputTabItemRef')}>
                {props.tabItems.map((tab, index) => renderItem(tab, index))}
            </ul>
        </div>
        {renderMoreTabs()}
    </div >);
}


const WKLTabHeaderPanel = forwardRef(TabHeaderPanel);

export { WKLTabHeaderPanel }