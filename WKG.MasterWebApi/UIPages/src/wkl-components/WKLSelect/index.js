import PropTypes from 'prop-types';
import React from 'react';
import { findDOMNode } from 'react-dom';
import ReactDOM from 'react-dom';
import { Utils } from '../Utils';
import * as wklEnum from '../WKLEnums';
import $ from 'jquery';
import './index.css';

class WKLSelect extends React.Component {
    constructor(props) {
        super(props);
        this._id = Utils.getUniqueID();
        this.asyncTextSearchHandler = null;
        this.state = {
            isMenuOpen: false,
            dataSource: this.cloneSource(this.props.dataSource),
            selectedItem: this.props.selectedItem,
            keyTimeOut: this.props.delay || 250,
            minChar: this.props.minChar || 0,
            autoInputFocus: true,
            location: { left: '0px', top: '0px' },
            open: wklEnum.PopupLocations.bottom,
            disabled: this.props.disabled,
            allowClear: this.props.allowClear,
            focusedIndex: -1
        };

        if (props.multiSelect === true && props.selectedItem) {
            // for (const itm of props.selectedItem) {
            //     itm.isSelected = true;
            // }
            this.updateSelectedItemSource();
        }
    }
    static propTypes = {
        name: PropTypes.string,
        multiSelect: PropTypes.bool,
        placeholder: PropTypes.string,
        selectedItem: PropTypes.any,
        displayField: PropTypes.string,
        asyncSearch: PropTypes.func,
        dataSource: PropTypes.array,
        isMultiCol: PropTypes.bool,
        onChange: PropTypes.func,
        colDef: PropTypes.array,
        listWidth: PropTypes.string,
        tabIndex: PropTypes.number,
        compareKey: PropTypes.string,
        delay: PropTypes.number,
        minChar: PropTypes.number,
        cellStyles: PropTypes.array,
        rowStyles: PropTypes.array,
        disabled: PropTypes.bool,
        open: PropTypes.string,
        hideSearch: PropTypes.bool,
        onRender: PropTypes.func,
        allowClear: PropTypes.bool,
        mandatory: PropTypes.bool,
        dropDownClass: PropTypes.string
    }
    static defaultProps = {
        name: '',
        multiSelect: false,
        placeholder: 'Select..',
        isMultiCol: false,
        colDef: [],
        listWidth: undefined,
        tabIndex: 0,
        compareKey: 'id',
        delay: 250,
        minChar: 0,
        rowStyles: [],
        cellStyles: [],
        disabled: false,
        open: wklEnum.PopupLocations.bottom,
        onRender: undefined,
        hideSearch: false,
        allowClear: true,
        mandatory: false,
        dropDownClass: null
    }
    cloneSource = (s) => {
        let source = s || [];
        let response = [];
        try {
            response = JSON.parse(JSON.stringify(source));
        }
        catch (ex) {
        }
        return response;
    }

   /* UNSAFE_componentWillReceiveProps({ dataSource, selectedItem, disabled, open, hideSearch, allowClear, delay }) {
        if (this.state.dataSource !== dataSource) {
            let source = this.cloneSource(dataSource);
            this.setState({ dataSource: source });
        }
        if (this.state.selectedItem !== selectedItem) {
            if (this.props.multiSelect === true && selectedItem) {
                // for (const itm of selectedItem) {
                //     itm.isSelected = true;
                // }
            }
            this.updateSelectedItemSource();
            this.setState({ selectedItem });
        }
        if (this.state.disabled != disabled) {
            this.setState({ disabled });
        }
        if (this.state.open != open) {
            this.setState({ open });
        }
        if (this.props.hideSearch != hideSearch) {
            this.setState({});
        }
        if (this.props.allowClear != allowClear) {
            this.setState({ allowClear });
        }
        if (this.props.delay != delay) {
            this.setState({ keyTimeOut: delay });
        }


    }*/
   
UNSAFE_componentWillReceiveProps({ dataSource, selectedItem, disabled, open, hideSearch, allowClear, delay }) {
        let newState = {};
        if(!(this.props.asyncSearch)){
            dataSource = dataSource || [];
            let newDS = JSON.stringify(dataSource);
            let oldDS = JSON.stringify(this.state.dataSource || []);
            if (newDS !== oldDS) {
                newState.dataSource = this.cloneSource(dataSource);
            }
        }
        if (this.state.selectedItem !== selectedItem) {

            if (this.props.multiSelect === true && selectedItem) {
                this.updateSelectedItemSource();
            }
            newState.selectedItem = selectedItem;
        }
        if (this.state.disabled !== disabled) {
           // this.setState({ disabled });
            newState.disabled = disabled;
        }
        if (this.state.open !== open) {
            newState.open = open;
        }
        if (this.props.hideSearch !== hideSearch) {
            this.setState({});
        }
        if (this.props.allowClear !== allowClear) {
            newState.open = open;
        }
        if (this.props.delay !== delay) {
            newState.keyTimeOut = delay;
        }
        if (Object.keys(newState).length !== 0)
            this.setState(newState);
    }
    componentDidMount() {
        this.renderLocation(true);

    }
    renderLocation = (stateChange) => {
        let bounds = this.dropDDMenu.getBoundingClientRect();
        let innerWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        let innerHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
        let width = this.props.listWidth;
        let { location, open } = this.state;

        location.left = `${bounds.left}px`;
        location.top = `${bounds.bottom}px`;
        location.width = `${bounds.width}px`;
        let bodyHeight = document.body.clientHeight;

        delete location.bottom;
        switch (open) {
            case wklEnum.PopupLocations.bottom:
                location.top = `${bounds.bottom + window.scrollY}px`; break;
            case wklEnum.PopupLocations.top:
                location.top = 'unset';
                location.bottom = `${bodyHeight - bounds.top}px`; break;
            case wklEnum.PopupLocations.left:
                location.left = `${Math.abs(bounds.left - bounds.width)}px`;
                location.top = `${bounds.bottom - bounds.height}px`;
                break
            case wklEnum.PopupLocations.leftTop:
                location.left = `${Math.abs(bounds.left - bounds.width)}px`;
                location.top = 'unset';
                location.bottom = `${bodyHeight - bounds.bottom}px`;
                break;;
            case wklEnum.PopupLocations.right:
                location.left = `${Math.abs(bounds.left + bounds.width)}px`;
                location.top = `${bounds.bottom - bounds.height}px`;
                break
            case wklEnum.PopupLocations.rightTop:
                location.left = `${Math.abs(bounds.left + bounds.width)}px`;
                location.top = 'unset';
                location.bottom = `${bodyHeight - bounds.bottom}px`;
                break;
            default:
                break;
        }

        if (width && bounds.left + parseFloat((width.replace("px", "")).replace("%", "")) > innerWidth) {
            delete location.left;
            location.left = (bounds.left - parseFloat((width.replace("px", "")).replace("%", ""))) + bounds.width;
        }
        if (stateChange) {
            this.setState({ location });
        }
        $(document).on('witselect.click', (event) => {
            this.onSelectBlur(event);
        });
    }
    componentWillUnmount() {
        $(document).off('witselect.click');
    }
    focus = (showMenu) => {
        const me = this;
        if (showMenu) {
            me.updateMenuState(true);
        }
        else
            me.dropDDMenu.focus();

    }
    onSelectBlur(event) {
        try {

            if (event.relatedTarget/* && !event.relatedTarget.matches('.wddsm')*/) {
                // event.stopPropagation();
                // event.preventDefault(); 
                this.setState({ isMenuOpen: false });
                this.localStoreageManage({ id: this._id, isOpen: false }, false);
            }
        }
        catch (ex) {

        }
    }
    localStoreageManage = (data, isProceed) => {

        let prevCtrl = localStorage.getItem('wit-dd-state-cache');
        localStorage.setItem('wit-dd-state-cache', JSON.stringify(data));
        if (!this.isNullOrUndefined(prevCtrl) && isProceed) {
            let ctrlInfo = JSON.parse(prevCtrl);
            if (ctrlInfo.id && ctrlInfo.isOpen) {
                //$('#'+ctrlInfo.id).find('.wit-dd-list-wrapper').removeClass('show');
                let selector = `.wit-dd-list-wrapper[parent-tag="${ctrlInfo.id}"]`;
                $(selector).removeClass('show');
            }
        }
    }
    updateMenuState(menuStatus) {
        this.setState({ isMenuOpen: menuStatus });
        this.localStoreageManage({ id: this._id, isOpen: menuStatus }, true);
        this.updateDataSource();
    }
    showDropMenu = () => {
        let isMenuOpen = !this.state.isMenuOpen;
        if (this.dropDDMenuList && !this.dropDDMenuList.classList.contains('show')) {

            this.dropDDMenuList.classList.add('show');
            this.setState({ isMenuOpen: false });
            window.setTimeout(() => {
                this.updateMenuState(true);
            }, 100);

        }
        else {
            this.updateMenuState(isMenuOpen);
        }
    }
    onSelectDropClick(event) {
        if (this.props.disabled) {
            return false;
        }
        if (event.button !== 0) {
            return;
        }
        let tgt = event.target;
        //console.log(tgt);
        /* if (tgt.matches('.wit-dd-selected-item') || tgt.matches('.wit-dd-caret-down')) {
             event.stopPropagation();
             event.preventDefault();
             this.showDropMenu();
 
         }*/

        if (tgt.matches('.wit-dd-item-wrapper') || tgt.matches('.wit-dd-selected-item') || tgt.matches('.wit-dd-caret-down')) {
            event.stopPropagation();
            event.preventDefault();
            this.showDropMenu();

        }
    }
    isNullOrUndefined(o) {
        return o == null || o == undefined;
    }
    isObjectType(d) {
        let T = Object.prototype.toString.call(d);
        let isObject = false;
        switch (T) {
            case '[object String]':
                isObject = false;
                break;
            case '[object Object]':
                isObject = true;
                break;
        }
        return isObject;
    }
    updateDataSource(source) {
        source = source || null;
        if (source) {
            source = this.updateRuntimeSource(source);
            this.setState({ dataSource: source, focusedIndex: -1 });
        } else {
            this.setState({ dataSource: this.cloneSource(this.props.dataSource), focusedIndex: -1 });
        }
    }
    focusMenulistItem() {

        let textElm = findDOMNode(this.searchInput)
        if (!this.props.isMultiCol) {
            let liElm = $(textElm).closest('.wit-dd-list-wrapper').find('ul > li:first');
            if (liElm.length > 0) {
                liElm.focus()
            }
            else {
                this.handleEmptyFocus();
            }

        }
        else {
            let liElm = $(textElm).closest('.wit-dd-list-wrapper').find('div.wddlm-row:first');
            if (liElm.length > 0) {
                liElm.focus()
            }
            else {
                this.handleEmptyFocus();
            }
        }
    }
    handleEmptyFocus = () => {
        this.handleSearchKeyDown(new KeyboardEvent('keypress', { 'keyCode': 27, 'key': 'Esc' }));
        this.dropDDMenu.focus();
    }
    handleEscape = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.updateMenuState(false);
        window.setTimeout(() => {
            this.dropDDMenu.focus();
        }, 100);
    }
    handleSearchKeyDown(e) {
        console.log(e.keyCode);
        switch (e.keyCode) {
            case 9:
                break;
            case 13:
                this.selectFocusedItem(e);
                break;
            case 38:
                //$(e.target).prev().focus();
                this.setFocusedItem(-1);
                e.preventDefault()
                e.stopPropagation()
                break
            case 40:
                //$(e.target).next().focus();
                this.setFocusedItem(1);
                e.preventDefault()
                e.stopPropagation()
                break
            // case 40:
            //     this.focusMenulistItem();
            //     e.preventDefault();
            //     e.stopPropagation();
            //     break;
            case 27:
                this.handleEscape(e);
                break;
            default:
                break
        }
    }
    selectFocusedItem(e) {
        try {
            if (this.state.focusedIndex >= 0) {
                let source = this.state.dataSource || [];
                if (source.length > 0) {
                    this.onSelectItem(e, source[this.state.focusedIndex]);
                }
            }
        }
        catch (ex) {
            console.error(ex);
        }
    }
    scrollIntoView(index) {
        let textElm = findDOMNode(this.searchInput)
        if (!this.props.isMultiCol) {
            let liElm = $(textElm).closest('.wit-dd-list-wrapper').find(`ul > li:nth-child(${index})`);
            if (liElm.length > 0 && liElm[0].scrollIntoView) {
                liElm[0].scrollIntoView()
            }
        }
        else {
            let liElm = $(textElm).closest('.wit-dd-list-wrapper').find(`div.wddlm-row:nth-child(${index})`);
            if (liElm.length > 0 && liElm[0].scrollIntoView) {
                liElm[0].scrollIntoView()
            }
        }
    }
    setFocusedItem(idx) {
        let focusedIndex = this.state.focusedIndex;
        let source = this.state.dataSource || [];
        if (source.length > 0) {
            if (idx < 0) {
                focusedIndex -= 1;
                if (focusedIndex < 0) {
                    focusedIndex = source.length - 1;
                }
            }
            else {
                focusedIndex += 1;
                if (focusedIndex >= source.length) {
                    focusedIndex = 0;
                }
            }
        }
        else {
            focusedIndex = -1;
        }

        if (focusedIndex !== this.state.focusedIndex) {

            this.setState({ ...this.state, focusedIndex: focusedIndex });
        }
        this.scrollIntoView(focusedIndex);
    }
    handleMenuKeyDown(e, item) {

        switch (e.keyCode) {

            case 13:
                this.onSelectItem(e, item);
            case 38:
                //$(e.target).prev().focus();
                this.setFocusedItem(-1);
                e.preventDefault()
                e.stopPropagation()
                break
            case 40:
                //$(e.target).next().focus();
                this.setFocusedItem(1);
                e.preventDefault()
                e.stopPropagation()
                break
            case 27:
                this.handleEscape(e);
                break;
            case 9:
                if (!$(e.target).next() || $(e.target).next().length <= 0) {
                    this.handleEmptyFocus();
                }
                break;
        }
    }
    handleTextChange(term) {

        term = term || '';
        if (this.state.minChar > term.length)
            return;

        if (this.props.asyncSearch) {
            this.props.asyncSearch(term).then(data => {
                this.updateDataSource(data);
            })
            return;
        }

        if ($.trim(term) != '') {
            term = term.toString().toLowerCase();
            let filterResult = [];
            let ds = this.cloneSource(this.props.dataSource);
            if (this.isObjectType(ds[0])) {
                filterResult = ds.filter(p =>
                    p[this.props.displayField].toLowerCase().includes(term)
                );
            } else {
                filterResult = ds.filter(p =>
                    p.toLowerCase().includes(term)
                );
            }
            this.updateDataSource(filterResult);

        } else {
            this.updateDataSource();
        }
    }
    doUpdateSelectedItem() {
        let source = this.state.dataSource || [];
        let selectedItem = null;
        if (!this.props.multiSelect) {
            selectedItem = source.first(p => p.isSelected);
            if (!this.isNullOrUndefined(selectedItem)) {
                this.setState({ selectedItem });
            }
        }
        else {
            let selectedItem = source.where(p => p.isSelected)
            if (!this.isNullOrUndefined(selectedItem) && selectedItem.length > 0) {
                this.setState({ selectedItem: selectedItem });
            }
        }
    }
    onRemoveSelectedItem(event, item) {
        if (event.button && event.button !== 0) {
            return;
        }
        let { compareKey } = this.props;
        let { selectedItem, dataSource } = this.state;

        if (this.isNullOrUndefined(selectedItem) || this.isNullOrUndefined(item)) {
            return;
        }
        let selectedItemPicked = null;
        let keyVal = null;
        if (!this.props.multiSelect) {
            selectedItemPicked = selectedItem;
            keyVal = selectedItemPicked[compareKey];
            selectedItem = null;
        }
        else {
            let selectedItemPicked = selectedItem.first(k => k[compareKey] === item[compareKey]);
            keyVal = selectedItemPicked[compareKey];
            selectedItem.remove(selectedItemPicked);
        }
        if (keyVal) {
            let indexedData = dataSource.first(d => d[compareKey] === keyVal);
            if (indexedData)
                indexedData.isSelected = false;
        }
        this.setState({ selectedItem, dataSource }, () => {
            this.triggerControlEvent(event);
        });
        //this.triggerControlEvent(event);
    }
    onSelectItem(event, item) {
        if ((event.button && event.button !== 0) || (event.keyCode && event.keyCode !== 13)) {
            return;
        }
        try {
            if (event && event.stopPropagation) {
                event.stopPropagation();
                event.preventDefault();
                event.nativeEvent.stopImmediatePropagation();
            }
        }
        catch { }
        let source = this.state.dataSource || [];
        if (!this.props.multiSelect) {
            source.map((o, i) => {
                o.isSelected = false;
            });
            item.isSelected = true;
            this.setState({ selectedItem: item, isMenuOpen: false, dataSource: source }, () => {
                this.triggerControlEvent(event);
                this.dropDDMenu.focus();
            });
        }
        else {
            item.isSelected = !item.isSelected;
            let selectedItems = source.where(p => p.isSelected);
            let { selectedItem } = this.state;
            let { compareKey } = this.props;
            if (!this.isNullOrUndefined(selectedItem)) {
                let existingItem = selectedItem.first(k => k[compareKey] === item[compareKey]);
                if (existingItem) {
                    if (!item.isSelected) {
                        existingItem.isSelected = item.isSelected;
                        selectedItem.remove(existingItem);
                    }
                }
                else if (item.isSelected) {
                    selectedItem.push(item);
                }
            }
            else {
                selectedItem = selectedItems;
            }
            this.setState({ selectedItem, dataSource: source }, () => {
                this.triggerControlEvent(event);
            });
        }
        //this.triggerControlEvent(event);
        this.searchInput.focus();
    }

    getSelectedItems = () => {
        return this.state.selectedItem;
    }
    /*triggerControlEvent(event) {
        window.setTimeout(() => {
            if (this.props.onChange != undefined && this.props.onChange != null) {
                event = event || {};
                event.cntrlID = this._id || '';
                //this.props.onChange(event, this.state.selectedItem, this.state.dataSource);
                this.props.onChange({ name: this.props.name, value: this.state.selectedItem, event: event });
            }
        }, 100);
    }*/
        triggerControlEvent(event) {
            /*let selectedItem = this.state.selectedItem;
            let dataSource = this.state.dataSource;
            window.setTimeout(() => {
                if (this.props.onChange != undefined && this.props.onChange != null) {
                    event = event || {};
                    event.cntrlID = this.props.id || '';
                    this.props.onChange(event, selectedItem, dataSource);
                }
            }, 100);*/
            let selectedItem = this.state.selectedItem;
            let dataSource = this.state.dataSource;
            if (this.props.onChange != undefined && this.props.onChange != null) {
                event = event || {};
                event.cntrlID = this.props.id || '';
                this.props.onChange({ name: this.props.name, value: this.state.selectedItem, event: event });
            }
        }
    onClearInputFilter(event) {

        if (event.button !== 0) {
            return;
        }
        this.searchInput.value = "";
        this.updateDataSource();
    }
    onClearMainSelect(event) {
        if (event.button !== 0) {
            return;
        }
        event.stopPropagation();
        event.preventDefault();
        let source = this.state.dataSource || [];
        source.map((o, i) => { o.isSelected = false; });
        this.setState({ selectedItem: null, dataSource: source }, () => {
            this.triggerControlEvent(event);
        });
        //this.triggerControlEvent(event);
    }
    updateRuntimeSource = (dataSource) => {

        let { compareKey } = this.props;
        let { selectedItem } = this.state;
        if (this.isNullOrUndefined(selectedItem)) {
            return dataSource;
        }
        if (!this.props.multiSelect) {
            let indexedData = dataSource.first(d => d[compareKey] === selectedItem[compareKey]);
            if (indexedData)
                indexedData.isSelected = true;
        }
        else {
            for (const [index, s] of selectedItem.entries()) {
                let indexedData = dataSource.first(d => d[compareKey] === s[compareKey]);
                if (indexedData)
                    indexedData.isSelected = true;
            }
        }
        return dataSource;
    }
    updateSelectedItemSource = () => {

        let { compareKey } = this.props;
        let { selectedItem, dataSource } = this.state;
        dataSource = dataSource || [];
        if (this.isNullOrUndefined(selectedItem)) {
            return;
        }
        if (!this.props.multiSelect) {
            let indexedData = dataSource.first(d => d[compareKey] === selectedItem[compareKey]);
            if (indexedData)
                indexedData.isSelected = true;
        }
        else {
            for (const [index, s] of selectedItem.entries()) {
                let indexedData = dataSource.first(d => d[compareKey] === s[compareKey]);
                if (indexedData)
                    indexedData.isSelected = true;
            }
        }
    }
    renderSelectItemArea() {

        let toolTip= '';
        let selectedItemText = this.props.placeholder;
        let { selectedItem } = this.state;
        if (!this.props.multiSelect) {
            if (!this.isNullOrUndefined(selectedItem)) {
                selectedItemText = selectedItem[this.props.displayField];
                toolTip = selectedItemText;
            }
        }
        else {
            if (selectedItem && selectedItem.length > 0) {
                let nameSource = selectedItem.map((o, i) => { return o[this.props.displayField]; });
                if (nameSource.length > 0) {
                    selectedItemText = nameSource.join(',');
                    toolTip = selectedItemText;
                }
            }
        }
        this.updateSelectedItemSource();
        let { disabled } = this.state;
        let classNames = `wit-dd-selected-item wddsm ${disabled ? 'text-muted' : ''}`;
        if (selectedItemText == this.props.placeholder) {
            classNames += ' placeholder-ddl';
        }
        return <span className={classNames} wkl-tool-tip={toolTip}>{selectedItemText}</span>;
    }
    renderIconArea() {
        let { allowClear, disabled, selectedItem } = this.state;
        let showClear = allowClear;
        if (disabled || !selectedItem) { showClear = false; }

        return <span className="wit-dd-icon-area wddsm" style={{ backgroundColor: 'transparent' }}>
            {/* {showClear ? <i className="select-clear" onMouseDown={(e) => this.onClearMainSelect(e)}></i> : <i />} */}
            {showClear ? <i className="fa fa-times wddsm select-clear text-danger" onMouseDown={(e) => this.onClearMainSelect(e)}></i> : <i />}
            <i className="fa fa-caret-down wit-dd-caret-down wddsm"></i>
        </span>;

    }
    renderSearchArea() {
        const { ...inputProps } = {

            onChange: e => {
                let textValue = e.target.value
                if (this.props.asyncSearch) {
                    window.clearTimeout(this.asyncTextSearchHandler)
                    this.asyncTextSearchHandler = window.setTimeout(() => {
                        this.handleTextChange(textValue)
                    }, this.state.keyTimeOut)
                } else {
                    this.handleTextChange(textValue)
                }
            }
        }
        let { hideSearch } = this.props;
        let classNames = ['wit-dd-list-search wddsm'];
        if (hideSearch)
            classNames.push('d-none')
        return <div className={classNames.join(' ')}>
            <i className="fa fa-search left-ico wddsm"></i>
            <input type="text" {...inputProps} autoComplete={0} autofill="off" ref={ref => this.searchInput = ref} onKeyDown={(e) => this.handleSearchKeyDown(e)} autoFocus={this.state.autoInputFocus} onBlur={(e) => this.onSelectBlur(e)} className="wddsm" tabIndex="1" />
            {/* <i className="fa fa-close right-ico wddsm" onMouseDown={(e) => this.onClearInputFilter(e)}></i>     */}
            <i className="select-clear right-ico wddsm" onMouseDown={(e) => this.onClearInputFilter(e)}></i>
        </div>;
    }
    rendersubItem() {
        let source = this.state.dataSource || [];
        let hasCustomRender = !Utils.isNullOrEmpty(this.props.onRender) && Utils.isFunction(this.props.onRender);
        if (!this.props.isMultiCol) {
            return source.map((item, i) => {
                let classNames = ["wddsm"];

                if (this.state.focusedIndex === i)
                    classNames.push("focused");

                if (item.isSelected) {
                    classNames.push("selected");
                }
                let { ...mprop } = {
                    tabIndex: i + 1,
                    key: i,
                    className: classNames.join(' ')
                };
                return <li {...mprop} onKeyDown={(e) => this.handleMenuKeyDown(e, item)} onMouseDown={(e) => this.onSelectItem(e, item)}>
                    {hasCustomRender && this.props.onRender(item)}
                    {!hasCustomRender && item[this.props.displayField]}
                </li>;
            });
        }

    }
    renderMultiColSubItem() {
        let headers = [];
        var cols = new Array();
        let source = this.state.dataSource || [];
        let colDefProp = this.props.colDef || [];

        let cellStyles = this.props.cellStyles || [];
        let rowStyles = this.props.rowStyles || [];

        let totCols = 0;

        colDefProp.forEach(function (o) {
            totCols++;
            let coldef = { id: o.col, text: o.caption, width: o.width || 'auto' };
            cols.push(coldef);
        });

        let autoWidth = (100.00 / parseFloat(totCols));
        let gridWidth = cols.map((o, i) => {
            if (o.width == 'auto')
                return autoWidth + "%";
            else
                return o.width
        }
        );
        //console.log(gridWidth);
        return <div className="wit-dd-list-multi-col wddsm ">
            <div className="wddlm-hdr wddsm" style={{ gridTemplateColumns: gridWidth.join(' ') }}>
                {
                    cols.map((item, index) => {
                        return <span key={index} className="text-truncate">{item.text}</span>
                    })
                }
            </div>
            <div className="wddlm-rows wddsm">
                {
                    source.map((item, index) => {
                        let classNames = ["wddlm-row wddsm"];
                        if (item.isSelected) {
                            classNames.push("selected");
                        }
                        let customClasses = this.getRowCssClassInfo(item, rowStyles);
                        classNames.push(customClasses);
                        return <div className={classNames.join(' ')} key={index} style={{ gridTemplateColumns: gridWidth.join(' ') }} tabIndex={index + 1} onMouseDown={(e) => this.onSelectItem(e, item)} onKeyDown={(e) => this.handleMenuKeyDown(e, item)}>
                            {
                                cols.map((o, i) => {
                                    let cellClassNames = this.getcellCssClassInfo(o, item, cellStyles) || [''];
                                    return <span className={cellClassNames.join(' ')} key={i}>{item[o.id]}</span>
                                })
                            }
                        </div>

                    })
                }
            </div>
        </div>
    }
    getRowCssClassInfo(item, rowStyles) {
        let classNames = [''];
        let isThere = rowStyles || undefined;
        if (isThere) {
            for (const [index, styleInfo] of isThere.entries()) {
                if ($.isFunction(styleInfo.tie)) {
                    let isTie = styleInfo.tie(item);
                    if (isTie) {
                        classNames.push(styleInfo.cssClass || '');
                    }
                }
                else {
                    classNames.push(styleInfo.cssClass || '');
                }
            }
        }
        return classNames.join(' ');
    }
    getcellCssClassInfo(o, item, cellStyles) {

        let classNames = [''];
        let isThere = cellStyles.where(p => p.col == o.id) || undefined;
        if (isThere) {
            for (const [index, styleInfo] of isThere.entries()) {

                if ($.isFunction(styleInfo.tie)) {
                    let isTie = styleInfo.tie(item);
                    if (isTie) {
                        classNames.push(styleInfo.cssClass || '');
                    }
                }
                else {
                    classNames.push(styleInfo.cssClass || '');
                }
            }
        }

        return classNames;
    }
    renderListArea() {
        return <div className="wit-dd-list-items br-t bw2 wddsm">
            <ul className="wddsm">
                {!this.props.isMultiCol && this.rendersubItem()}
            </ul>
            {this.props.isMultiCol && this.renderMultiColSubItem()}

        </div>
    }
    componentDidUpdate() {
        window.setTimeout(() => {
            $(findDOMNode(this.dropDDMenuList)).find('input').focus();
        }, 100);
    }
    renderMenuArea() {

        this.renderLocation();
        let width = this.props.listWidth;
        let domRenderElement = document.getElementById('root');
        let { location, open } = this.state;
        if (!this.isNullOrUndefined(width)) {
            location.width = width;
        }
        else {
            if (this.dropDDMenuWrapper && this.dropDDMenuWrapper.getBoundingClientRect) {
                const dom = this.dropDDMenuWrapper.getBoundingClientRect();
                location.width = `${dom.width}px`;
            }
        }
        let style = Object.assign({}, location);

        let cls = 'wit-dd-list-wrapper shadow-5 show wddsm ';
        if (this.props.dropDownClass)
            cls += ' ' + (this.props.dropDownClass || '');

        let child = <div style={style} parent-tag={this._id} className={cls} ref={ref => this.dropDDMenuList = ref} >

            {!open.includes('top') && this.renderSearchArea()}
            {!open.includes('top') && this.renderListArea()}
            {this.props.multiSelect && !this.isNullOrUndefined(this.state.selectedItem) && <div className="wit-dd-list-selected-items wddsm col-md-12">
                {
                    this.state.selectedItem.map((d, index) => {
                        /*if (d.isSelected)*/ {
                            return <span key={index} onMouseDown={(e) => {
                                this.onRemoveSelectedItem(e, d);
                            }
                            } className="badge badge-wit m5 pointer wddsm left">x {d[this.props.displayField]}</span>
                        }
                    })
                }
            </div>
            }
            {open.includes('top') && this.renderListArea()}
            {open.includes('top') && this.renderSearchArea()}

        </div>;
        return ReactDOM.createPortal(child, domRenderElement);
    }
    render() {
        const width = this.props.listWidth;
        const { mandatory } = this.props
        let { selectedItem } = this.state;
        let mandatoryClass = '';
        if (mandatory) {
            mandatoryClass = selectedItem ? '' : 'mandatory';
        }

        let cls = 'wit-dd-wraper wddsm';
        if (this.state.isMenuOpen)
            cls += ' menu-open';
        let cls1 = `wit-dd-item-wrapper wddsm ${mandatoryClass}`;

        if (this.props.disabled) {
            cls += ' wit-dd-wraper-disabled';
            cls1 += ' disabled';
        }

        return (
            <div className={cls}
                id={this._id}
                ref={ref => this.dropDDMenu = ref}
                tabIndex={this.props.tabIndex || 0}
                onMouseDown={(e) => this.onSelectDropClick(e)}
                onKeyPress={(e) => {
                    var code = e.keyCode || e.which;
                    if (code === 13) {
                        this.showDropMenu();
                    }
                }}
                onBlur={(e) => this.onSelectBlur(e)}>
                <div className={cls1} ref={ref => this.dropDDMenuWrapper = ref}    >
                    {this.renderSelectItemArea()}
                    {this.renderIconArea()}
                </div>
                {

                    this.state.isMenuOpen && this.renderMenuArea()
                }
            </div>
        );
    }
}

export { WKLSelect }

