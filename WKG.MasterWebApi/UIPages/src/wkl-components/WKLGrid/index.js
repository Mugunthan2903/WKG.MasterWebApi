import React from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import ReactDOM from 'react-dom';
import { Utils } from '../Utils';
import * as hosEnum from '../WKLEnums';
import * as WITSort from 'fast-sort';
import moment from 'moment';
import $ from 'jquery';
import './index.css';

import { WKLSelect } from '../WKLSelect';
import { WKLDatepicker } from '../WKLDatepicker';
import { WKLTextboxWrapper } from '../WKLTextbox';
import { WKLHorizontalScroller } from '../WKLHorizontalScroller';

const debounce = (func, delay) => {
    let debounceTimer = null;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    }
};

Object.defineProperty(Object.prototype, "getByObjectIndex", {
    value: function (index) {
        return this[Object.keys(this)[index]];
    },
    enumerable: false
});
class WKLGrid extends React.Component {

    constructor(props) {
        super(props);
        let rowHeight = props.rowHeight || 27;

        this.state = {
            columnTemplate: '',
            scrollTop: 0,
            scrollHeight: '0%',
            contentHeight: 'auto',
            loading: false,
            rowHeight: rowHeight,
            headerHeight: this.props.showFilter ? (50 * 2) : rowHeight,//50
            columns: this.props.columns || [],
            dataSource: this.props.dataSource || [],
            pageInfo: this.props.pageInfo || {},
            asyncPrevPage: 0,
            selectedItems: this.props.selectedItems || [],
            scrollerAdjust: 2,
            isFilterStarted: false,
            showFooter: this.props.showFooter || false
        }
        this.GridEnums = {
            ENABLE_SCROLL: 1,
            DISABLE_SCROLL: 0,
            PAGER: {
                NEXT: 'N',
                PREV: 'P',
                FIRST: 'F',
                LAST: 'L'
            }
        };
        this.filterTypes = [
            { dataTypes: ['string'], text: 'Contains', default: true, id: '~' },
            { dataTypes: ['string', 'numeric', 'date'], text: 'Equals', id: '=', default: true },
            { dataTypes: ['string'], text: 'Start With', id: '' },
            { dataTypes: ['string'], text: 'Ends With', id: ':' },
            { dataTypes: ['numeric', 'date'], text: 'Less Than', id: '<' },
            { dataTypes: ['numeric', 'date'], text: 'Greater Than', id: '>' },
            { dataTypes: ['numeric', 'date'], text: 'Between', id: '&' },
        ];

        this._debounce = debounce((columns, onFilterChange) => {
            let filterOptions = this.getExternalFilterSortOptions(columns);
            onFilterChange({ type: 'FILTER-CHANGE', columnOptions: filterOptions });
        }, 300);
    }
    static UID() {
        let keyIndex = `${Math.random() * (9999999 - 1) + 1}`;
        keyIndex = keyIndex.replace('.', '-');
        let uidFactor = moment(new Date()).format('x');
        return `component_${uidFactor}${keyIndex}`;
    }

    static propTypes = {
        name: PropTypes.string,
        columns: PropTypes.array,
        dataSource: PropTypes.array,
        totalRows: PropTypes.number,
        pageInfo: PropTypes.object,
        asyncPaging: PropTypes.bool,
        footerControls: PropTypes.any,
        enableContextMenu: PropTypes.bool,
        contextMenu: PropTypes.object,
        onGridCellDoubleClick: PropTypes.func,
        onGridCellClick: PropTypes.func,
        multiSelect: PropTypes.bool,
        showFilter: PropTypes.bool,
        externalSort: PropTypes.bool,
        onSortChange: PropTypes.func,
        onFilterChange: PropTypes.func,
        rowStyle: PropTypes.array,
        cellStyle: PropTypes.array,
        footerText: PropTypes.any,
        showFooter: PropTypes.bool,
        selectedItems: PropTypes.array,
        rowGroup: PropTypes.bool,
        rowGroupDisplayField: PropTypes.string,
        rowGroupKeyField: PropTypes.string,
        autoHeight: PropTypes.bool,
        showExport: PropTypes.bool,
        onExportClick: PropTypes.func,
        exportOptions: PropTypes.array,
        autoMeasure: PropTypes.bool,
        rowMenus: PropTypes.object,
        dragConfig: PropTypes.object

    }
    static defaultProps = {
        name: '',
        dataSource: [],
        asyncPaging: false,
        totalRows: 15,
        pageInfo: undefined,
        enableContextMenu: false,
        contextMenu: undefined,
        onGridCellDoubleClick: undefined,
        onGridCellClick: undefined,
        multiSelect: false,
        showFilter: false,
        externalSort: false,
        externalFilter: false,
        onSortChange: undefined,
        onFilterChange: undefined,
        rowStyle: undefined,
        cellStyle: undefined,
        footerText: null,
        showFooter: true,
        selectedItems: [],
        rowGroup: false,
        rowGroupDisplayField: '',
        rowGroupKeyField: '',
        autoHeight: false,
        onExportClick: undefined,
        showExport: false,
        autoMeasure: true,
        exportOptions: [{ text: 'Excel', icon: 'fa fa-file-excel-o text-success', type: 'EXCEL' }, { text: 'Pdf', icon: 'fa fa-file-pdf-o text-danger', type: 'PDF' }],
        rowMenus: { onClick: (e) => { console.error("Not Implimented!") }, items: [] },
        dragConfig: { draggable: false }
    }

    /*COMPONENT LIFECYCLE EVENTS AREA*/

    componentDidMount() {
        this.calculateMeasurements();
        this.manageGridScroll(this.GridEnums.ENABLE_SCROLL);
        this.setPagerInput();
        window.addEventListener("resize", this.updateDimensions);
        document.oncontextmenu = function (e) {
            e.preventDefault();
        };

    }
    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions);
    }
    componentDidCatch() {

    }
    componentDidUpdate() {
        window.setTimeout(() => { this.state.loading = false; }, 0);
        $(window).trigger("resize");
    }
    updatePageInfo = (pageInfo, dataSource) => {
        if (Utils.isNullOrEmpty(pageInfo)) {
            pageInfo = {
                currentPage: 1,
                totalPages: 1,
                totalCount: (dataSource || []).length,
                onPageChange: undefined
            };
        }
        return pageInfo;
    }
    updateDimensions = () => {
        window.setTimeout(() => { this.calculateMeasurements(); }, 5);
    }

    UNSAFE_componentWillReceiveProps({ dataSource, pageInfo, columns, showFilter, showFooter, selectedItems, autoHeight }) {
        let { asyncPaging, totalRows, autoMeasure } = this.props;
        let { asyncLoading, headerHeight, scrollerAdjust, isFilterStarted } = this.state
        let contentHeight = this.getContentHeight(dataSource, pageInfo).contentHeight;
        scrollerAdjust = 2;
        if (totalRows < dataSource.length)
            scrollerAdjust = 5;

        pageInfo = this.updatePageInfo(pageInfo, dataSource);

        if (this.props.dataSource != dataSource) {
            if (asyncPaging && asyncLoading && !isFilterStarted) {
                dataSource = this.state.dataSource.concat(dataSource);
            }

            let columnTemplate = this.getTemplateColumns(columns, scrollerAdjust);
            this.setState({ dataSource, contentHeight, isFilterStarted: false, asyncLoading: false, showLoader: false, scrollerAdjust, columnTemplate });

        }
        if (this.props.pageInfo != pageInfo) {

            this.setState({ pageInfo, contentHeight });
            this.setPagerInput(pageInfo);
        }
        if (columns != this.state.columns) {
            this.state.columns = Object.assign([], columns, this.state.columns);
            this.updateColParams(columns);
            let columnTemplate = this.getTemplateColumns(columns, scrollerAdjust);
            this.setState({ columns: columns, columnTemplate });
        }
        if (showFilter !== this.state.showFilter) {
            let rowHeight = (this.props.rowHeight || 27);
            headerHeight = this.props.showFilter ? rowHeight * 2 : rowHeight;
            this.setState({ headerHeight });
        }
        if (showFooter !== this.state.showFooter) {
            this.setState({ showFooter, pageInfo });
            if (pageInfo && showFooter)
                this.setPagerInput(pageInfo);
        }
        if (selectedItems !== this.state.selectedItems) {
            this.setState({ selectedItems });
        }

        if (autoHeight || autoMeasure) {
            window.setTimeout(() => { this.calculateMeasurements(); }, 5);
        }
    }

    /*MISC FUNCTIONS*/
    calculateMeasurements() {
        let { columns, dataSource, pageInfo } = this.props;
        columns = this.updateColParams(columns);
        let columnTemplate = this.getTemplateColumns(columns);
        let measures = this.getContentHeight(dataSource, pageInfo);
        this.setState({ columnTemplate, ...measures });
    }
    getContentHeight(source, pageInfo) {

        source = source || [];
        let { rowHeight } = this.state;
        let { totalRows, asyncPaging, autoHeight, showFooter } = this.props;
        let contentHeight = `${rowHeight * source.length}px`;

        if (asyncPaging && pageInfo) {
            let totalRecords = pageInfo.totalCount || totalRows;
            contentHeight = `${rowHeight * totalRecords}px`;
        }

        let scrollHeight = `${(rowHeight * totalRows) + 4}px`;
        if (autoHeight && !asyncPaging) {

            let factor = showFooter ? 60 : 35;
            if (this.GridWrapper && this.GridWrapper.parentElement) {
                scrollHeight = `${this.GridWrapper.parentElement.clientHeight - factor}px`;
                contentHeight = `${this.GridWrapper.parentElement.clientHeight - factor}px`
            }

        }
        return { contentHeight, scrollHeight };
    }
    updateColParams = (cols) => {

        let prefixVal = 100.00 / parseFloat(cols.length);
        cols.map((item, index) => {
            if (item.width === undefined || item.width == null || item.width === '') {
                item.width = prefixVal + '%';
            }
        });
        cols.map((item, index) => {
            if (item.width !== undefined && item.width != null && item.width !== '' && Utils.isNumber(item.width)) {
                item.width = item.width + '%';
            }
        })
        return cols;
    }
    getTemplateColumns(columns, scrollerAdjust) {

        if (this.GridWrapper === undefined || this.GridWrapper === null) {
            return [];
        }

        scrollerAdjust = scrollerAdjust || this.state.scrollerAdjust;
        let parentWidth = this.GridWrapper.parentElement.clientWidth;
        let padLeft = $(this.GridWrapper.parentElement).css('padding-left');
        let padRight = $(this.GridWrapper.parentElement).css('padding-right');
        let adujust = { left: 0, right: 0 };
        padLeft = padLeft.replace("px");
        padRight = padRight.replace("px");
        if (padLeft.includes('%')) {
            adujust.left = document.body.clientWidth * (parseInt(padLeft.replace('%')) / 100)
        }
        else {
            adujust.left = parseInt(padLeft);
        }
        if (padRight.includes('%')) {
            adujust.right = document.body.clientWidth * (parseInt(padRight.replace('%')) / 100)
        }
        else {
            adujust.right = parseInt(padRight);
        }


        parentWidth = parentWidth - (Math.abs(adujust.right + adujust.left) + scrollerAdjust);

        let templateArray = columns.map((item, index) => {
            if (item.width && item.width.includes('%')) {
                return `${parentWidth * (parseFloat(item.width.replace('%', '')) / 100)}px`;
            }
            return `${item.width || '0px'}`
        });
        // console.warn(`${this.GridWrapper.parentElement.clientWidth},${document.body.clientWidth},${adujust.left},${adujust.right},${JSON.stringify(columns)}`);    
        return templateArray.join(' ');

    }

    /*GRID SCROLL MANAGER*/
    manageGridScroll = (type) => {
        let scroller = findDOMNode(this.GridScroller);
        if (scroller) {
            switch (type) {
                case this.GridEnums.ENABLE_SCROLL:
                    scroller.addEventListener('scroll', this.onGridScroll);
                    break;
                case this.GridEnums.DISABLE_SCROLL:
                    scroller.removeEventListener('scroll', this.onGridScroll);
                    break;
                default:
                    break;
            }
        }

    }
    onGridScroll = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.scrollGridHeader();
    }
    scrollGridScroller = (e) => {
        var leftPos = this.GridColWrapper.scrollLeft;
        this.GridScroller.scrollLeft = leftPos;
        //$(this.GridScroller).animate({ scrollLeft: leftPos }, 0);
    }
    scrollGridHeader = () => {
        //console.log( this.GridScroller.scrollTop);
        // if (!loading) {
        var leftPos = this.GridScroller.scrollLeft;
        this.GridColWrapper.scrollLeft = leftPos;

        //$(this.GridColWrapper).animate({ scrollLeft: leftPos }, 0);
        if (this.state.scrollTop != this.GridScroller.scrollTop)
            this.setState({ scrollTop: this.GridScroller.scrollTop });
        //  }
    }
    verticalScrollPresent = () => {
        return (this.GridScroller.scrollHeight !== this.GridScroller.clientHeight);
    }

    /*ROWS / CELLS Render AREA*/
    renderSelectCell = (source, col, index) => {
        if (!source) return null;
        let { rowHeight } = this.state;
        let { field, controlProps } = col;

        let controlPropsEx = JSON.parse(JSON.stringify(controlProps));
        controlPropsEx.asyncSearch = controlProps.asyncSearch;
        let cellValue = eval(`source.${field || ''}`);
        if (cellValue)
            cellValue.isSelected = true;
        let align = this.getColTextAlignment(col);
        let classNames = `grid-ui-cell ${align}`;
        controlPropsEx.selectedItem = cellValue;
        controlPropsEx.onChange = (e) => {
            let sourceObj = source;
            if (col.field && col.field.length > 0)
                eval(`sourceObj.${col.field}=${JSON.stringify(e.value)}`);
            else
                eval(`sourceObj.${Object.keys(sourceObj)[index]}=${JSON.stringify(e.value)}`);
            this.updateState({ isCellValueUpdated: true });
            if (controlProps.onChange)
                controlProps.onChange(e);
        };
        let cellAttribs = {
            className: classNames,
            onClick: (e) => this.cellClick(e, source, col),
            onDoubleClick: (e) => this.cellDblClick(e, source, col),
            onMouseDown: (e) => this.cellMouseDown(e, source, col),
            key: index,
            style: { height: `${rowHeight}px` }
        };

        return <div {...cellAttribs}><WKLSelect id={`grid_wit_sel_${index}`} {...controlPropsEx} /></div>
    }
    getRegExp = (controlProps) => {
        let testers = [];
        if (controlProps.inputType === hosEnum.WKLTextboxTypes.numeric) {
            var prefix = controlProps.prefix;
            var suffix = controlProps.suffix;
            var neg = "";
            if (controlProps.numericType == 'both')
                neg = '(-)?';
            else if (controlProps.numericType == 'negative')
                neg = '-';
            if (prefix !== 0 || suffix !== 0) {
                if (suffix <= 0) {
                    testers.push(new RegExp('^' + neg + '[0-9]{0,' + prefix + '}$'));
                }
                else {
                    testers.push(new RegExp('^' + neg + '[0-9]{0,' + prefix + '}\\.[0-9]{0,' + suffix + '}$|^' + neg + '[0-9]{0,' + prefix + '}\\.$|^' + neg + '[0-9]{0,' + prefix + '}$'));
                }
            }
        }
        else if (controlProps.inputType === hosEnum.WKLTextboxTypes.alphaNumeric) {
            testers.push(new RegExp('^[0-9a-zA-Z]+$'));
        }
        else if (controlProps.inputType === hosEnum.WKLTextboxTypes.time) {
            testers.push(new RegExp('^([0-9]|[0-1][0-2])(:([0-5]|[0-5][0-9])?)?$'));
            testers.push(new RegExp('^([0-9]|[0-1][0-2])(.([0-5]|[0-5][0-9])?)?$'));
        }
        else if (controlProps.inputType === hosEnum.WKLTextboxTypes.time24hr) {
            testers.push(new RegExp('^([0-9]|[0-1][0-9]|[2][0-3])(:([0-5]|[0-5][0-9])?)?$'));
            testers.push(new RegExp('^([0-9]|[0-1][0-9]|[2][0-3])(.([0-5]|[0-5][0-9])?)?$'));
        }
        return testers;
    };
    renderEditCell = (source, col, index) => {
        if (!source) return null;
        let { rowHeight } = this.state;
        let { field, controlProps } = col;
        let locProps = {};
        if (controlProps) {
            if (controlProps.maxLength)
                locProps.maxLength = controlProps.maxLength;
        }
        let cellValue = field && field.length > 0 ? eval(`source.${field || ''}`) : eval(`source.getByObjectIndex(${index})`);
        let align = this.getColTextAlignment(col);
        let classNames = `grid-ui-cell ${align}`;
        let cellAttribs = {
            className: classNames,
            onClick: (e) => this.cellClick(e, source, col),
            onDoubleClick: (e) => this.cellDblClick(e, source, col),
            onMouseDown: (e) => this.cellMouseDown(e, source, col),
            key: index,
            style: { height: `${rowHeight}px` }
        };

        return <div {...cellAttribs}><input type="text"
            {...locProps}
            onInput={evt => {
                let value = evt.target.value;
                if (value.length == 0)
                    return;

                let testers = this.getRegExp(controlProps);
                if (testers.length > 0) {
                    var failedResults = testers.filter(i => !i.test(value));
                    if (failedResults.length > 0) {
                        evt.target.value = cellValue;
                    }
                }
            }}
            onChange={(e) => {
                let sourceObj = source;
                if (col.field && col.field.length > 0)
                    eval(`sourceObj.${col.field}='${e.target.value}'`);
                else
                    eval(`sourceObj.${Object.keys(sourceObj)[index]}='${e.target.value}'`);
                this.updateState({ isCellValueUpdated: true });
            }} className="input-sm form-control" value={cellValue} /></div>
    }
    getCellStyle = (row, col, cell) => {
        let { cellStyle } = this.props;
        let cu = Utils;
        let classNames = [''];
        if (cu.isNullOrEmpty(cellStyle) || cu.isNullOrEmpty(col) || cu.isNullOrEmpty(row))
            return '';
        let isThere = cellStyle.where(p => p.column === col.field) || undefined;

        if (isThere) {
            for (const [index, styleInfo] of isThere.entries()) {

                if (cu.isFunction(styleInfo.condition)) {
                    let isTie = styleInfo.condition(row);
                    if (isTie) {
                        classNames.push(styleInfo.className || '');
                    }
                }
                else {
                    classNames.push(styleInfo.className || '');
                }
            }
        }

        return classNames.join(' ');
    }

    renderCell = (source, col, index) => {

        let { rowHeight } = this.state;
        if (!source) return null;

        let cellValue = col.field && col.field.length > 0 ? eval(`source.${col.field || ''}`) : eval(`source.getByObjectIndex(${index})`);
        if (Utils.isNullOrEmpty(cellValue)) {
            cellValue = '';
        }
        else if (Utils.isObject(cellValue)) {
            cellValue = JSON.stringify(cellValue);
        }

        let align = this.getColTextAlignment(col);
        let classNames = `grid-ui-cell ${align}`;
        let cellTemplate = col.onRender || null;
        if (cellTemplate) {
            cellValue = cellTemplate({ row: source, column: col, dataSource: this.state.dataSource });
        }

        let externalStyle = this.getCellStyle(source, col, cellValue);
        let internalStyle = classNames;
        let combinedStyle = `${externalStyle} ${internalStyle}`;
        return <div className={combinedStyle} onClick={(e) => this.cellClick(e, source, col)} onDoubleClick={(e) => this.cellDblClick(e, source, col)} onMouseDown={(e) => this.cellMouseDown(e, source, col)} key={'cell_' + index} style={{ height: `${rowHeight}px` }}><span>{cellValue}</span></div>
    }
    cellClick = (event, source, col) => {
        if (this.props.onGridCellClick) {
            this.props.onGridCellClick({ event: event, type: 'click', row: source, column: col, dataSource: this.state.dataSource });
        }
    }
    jsonEqual(a, b) {
        return JSON.stringify(a) === JSON.stringify(b);
    }
    setSelectedItems = (source) => {

        let { selectedItems } = this.state;
        let { multiSelect, multiSelectKey } = this.props;
        if (!multiSelect) {
            selectedItems = [];
            selectedItems.push(source);
        }
        else if (multiSelect) {
            let existingItem = null;
            if (selectedItems && selectedItems.length > 0) {
                existingItem = selectedItems.first(p => p[multiSelectKey] == source[multiSelectKey]);
            }
            if (existingItem) {
                selectedItems.remove(existingItem);
            }
            else {
                selectedItems.push(source);
            }
        }
        this.updateState({ selectedItems });

        return selectedItems;
    }
    updateState = (o) => {
        window.setTimeout(() => {
            this.setState(o)
        }, 1);

    }
    cellDblClick = (event, source, col) => {
        this.setSelectedItems(source);
        if (this.props.onGridCellDoubleClick) {
            this.props.onGridCellDoubleClick({ event: event, type: 'dblclick', row: source, column: col, dataSource: this.state.dataSource });
        }

    }
    cellMouseDown = (event, source, col) => {
        if (event.button != 2) {
            this.setState({ showContextMenu: false, cellContext: undefined });
            return;
        }
        let { clientX, clientY } = event;
        this.setState({ showContextMenu: true, cellContext: { source, col }, contextLocation: { x: clientX, y: clientY } });
    }
    setCurrentSelection = (row) => {
        this.setSelectedItems(row);
    }
    getRowStyle = (row) => {
        let { rowStyle } = this.props;
        let cu = Utils;
        let classNames = [''];
        if (cu.isNullOrEmpty(rowStyle) || cu.isNullOrEmpty(row))
            return '';

        rowStyle.forEach(styleObj => {
            if (cu.isFunction(styleObj.condition)) {
                let isTie = styleObj.condition(row);
                if (isTie) {
                    classNames.push(styleObj.className || '');
                }
            }
            else {
                classNames.push(styleObj.className || '');
            }

        });
        return classNames.join(' ');
    }
    renderRowGroup = () => {

        let {
            columnTemplate,
            dataSource,
            scrollTop,
            rowHeight,
            columns,
            pageInfo,
            asyncPrevPage,
            asyncLoading,
            selectedItems,
            isFilterStarted
        } = this.state;
        let { totalRows, asyncPaging, multiSelectKey, multiSelect, rowGroupDisplayField, rowGroupKeyField } = this.props;
        let rows = [];
        this.state.loading = true;
        let subSource = [];
        let startIndex = 0, endIndex = dataSource.length;

        if (dataSource.length <= 0)
            return null;
        for (var i = startIndex; i < endIndex; i++) {
            rows.push(<div key={i} className={'grid-ui-row group-row'} style={{ gridTemplateColumns: columnTemplate, height: `${rowHeight}px` }}>
                {
                    <span className="grid-ui-group-cell" style={{ width: '100%' }}>{dataSource[i][rowGroupDisplayField]}</span>
                }
            </div>);
            for (var j = 0; j < dataSource[i].items.length; j++) {

                rows.push(<div key={`${i}${j}`} className={'grid-ui-row'} style={{ gridTemplateColumns: columnTemplate, height: `${rowHeight}px` }}>
                    {
                        columns.map((colItem, colIndex) => {
                            if (colItem.edit) {
                                let controlType = colItem.controlType || 'text'
                                switch (controlType) {
                                    case 'text': return this.renderEditCell(dataSource[i].items[j], colItem, colIndex);
                                    case 'select': return this.renderSelectCell(dataSource[i].items[j], colItem, colIndex);
                                }
                            }
                            return this.renderCell(dataSource[i].items[j], colItem, colIndex);
                        })
                    }
                </div>);
            }
        }
        return rows;

    }
    getRowTemplate = () => {

    }
    draggableTie = (dragConfig, row) => {
        let cu = Utils;
        if (cu.isNullOrEmpty(dragConfig.prevent) || cu.isNullOrEmpty(dragConfig.prevent))
            return { draggable: true };

        if (cu.isFunction(dragConfig.prevent)) {
            let isTie = dragConfig.prevent(row);
            if (isTie) {
                return {};
            }
        }
        return { draggable: true };
    }
    getDraggableConfiguration = (i) => {
        let { dataSource } = this.state;
        let { dragConfig } = this.props;

        let draggableConfig = {};
        if (!dragConfig.draggable)
            return draggableConfig;
        let dragData = dataSource[i];
        if (dragConfig && dragConfig.draggable) {
            draggableConfig = this.draggableTie(dragConfig, dragData);
            draggableConfig = Object.assign({}, draggableConfig, {
                onDragStart: (ev) => {
                    ev.dataTransfer.setData("text/plain", JSON.stringify(dragData));
                    ev.dataTransfer.dropEffect = "move";
                    if (dragConfig.onDragStart) {
                        const result = dragConfig.onDragStart({ event: ev, row: dragData });
                        if (result !== undefined && result === false) {
                            ev.preventDefault();
                            ev.stopPropagation();
                            return false;
                        }
                    }
                },
                onDrop: (ev) => {
                    ev.preventDefault();
                    let dragStopData = dataSource[$(ev.currentTarget).attr("dataindex")];
                    var data = ev.dataTransfer.getData("text");
                    ev.dataTransfer.clearData();
                    let dragStartData = {};
                    try {
                        dragStartData = JSON.parse(data);
                    }
                    catch (ex) {
                        dragStartData = ex;
                    }
                    if (dragConfig.onDrop) {
                        dragConfig.onDrop({ event: ev, dragRow: dragStartData, dropRow: dragStopData });
                    }
                },

                onDragOver: (ev) => {
                    ev.preventDefault();
                    ev.dataTransfer.dropEffect = "move"
                    // let xData=dataSource[$(ev.currentTarget).attr("dataIndex")];
                    // dragConfig.onDragOver(ev,xData);
                },
            })
        }
        return draggableConfig;
    }
    renderRow = () => {

        let { columnTemplate, dataSource, scrollTop, rowHeight, columns, pageInfo, asyncPrevPage, asyncLoading, selectedItems, isFilterStarted } = this.state;
        let { totalRows, asyncPaging, multiSelectKey, multiSelect, autoHeight } = this.props;
        let startIndex = parseInt(scrollTop / rowHeight);
        let totRows = totalRows;

        if (autoHeight && !asyncPaging) {
            if (!isNaN(this.state.contentHeight.replace("px", ''))) {
                totRows = parseInt(this.state.contentHeight.replace("px", '') / 25);
                if (parseInt(this.state.contentHeight.replace("px", '') % 25) != 0) {
                    totRows += 1;
                }
                if (dataSource.length > totRows) {
                    totRows = totRows + (dataSource.length - totRows);
                }
            }
        }
        // pageInfo=this.updatePageInfo(pageInfo,dataSource);
        if (pageInfo.totalCount <= totalRows)
            totRows = pageInfo.totalCount;
        if (Utils.isNullOrEmpty(dataSource) || dataSource.length <= 0)
            return;

        let endIndex = startIndex + (totRows - 1);
        if (endIndex == dataSource.length - 2)
            endIndex = startIndex + (totRows);
        let rows = [];
        this.state.loading = true;
        if (startIndex > 0) {
            rows.push(<div key={i} className="grid-ui-row" style={{ height: `${startIndex * rowHeight}px` }}>
            </div>);
        }

        if (endIndex > dataSource.length) {
            endIndex = dataSource.length - 1;
            if (asyncPaging && !asyncLoading && !isFilterStarted) {
                if (pageInfo.currentPage < pageInfo.totalPages && asyncPrevPage != pageInfo.currentPage) {
                    this.state.asyncLoading = true;
                    asyncPrevPage = pageInfo.currentPage;
                    let value = pageInfo.currentPage + 1;
                    this.setState({ showLoader: true });

                    const columnOptions = this.getExternalFilterSortOptions(columns);

                    pageInfo.onPageChange({ event: null, type: 'N', value: value, name: this.props.name, columnOptions: columnOptions });
                    return null;
                }
            }
        }

        for (var i = startIndex; i <= endIndex; i++) {

            let isSelected = false;
            if (multiSelect) {
                isSelected = (selectedItems.count(p => p[multiSelectKey] == dataSource[i][multiSelectKey]) || 0) > 0;
            }
            else {
                let sitem = selectedItems.first();
                if (sitem) {
                    isSelected = this.jsonEqual(sitem, dataSource[i]);
                }
            }
            let classNames = ['grid-ui-row'];
            if (isSelected) {
                classNames.push('selected')
            }
            let externalStyle = this.getRowStyle(dataSource[i]);
            let internalStyle = classNames.join(' ');
            let combinedStyle = `${externalStyle} ${internalStyle}`;
            let draggableConfig = this.getDraggableConfiguration(i);

            rows.push(<div key={i}   {...draggableConfig} id={`d_row_${i}`} dataindex={`${i}`} onMouseLeave={e => { this.toggleAdvancedMenus(e, false) }} onMouseOver={this.toggleAdvancedMenus} className={combinedStyle} style={{ gridTemplateColumns: columnTemplate, height: `${rowHeight}px`, position: 'relative' }}>
                {
                    columns.map((colItem, colIndex) => {
                        if (colItem.edit) {
                            let controlType = colItem.controlType || 'text'
                            switch (controlType) {
                                case 'text': return this.renderEditCell(dataSource[i], colItem, colIndex);
                                case 'select': return this.renderSelectCell(dataSource[i], colItem, colIndex);
                            }
                        }
                        return this.renderCell(dataSource[i], colItem, colIndex);
                    })

                }
                {
                    this.state.advancedMenus && this.state.advancedMenus.dataIndex == i && this.renderAdvancedMenus()
                }
            </div>);
        }

        return rows;
    }

    /*COLS / COL HEADER Render AREA*/
    cloneObject = (s) => {
        return JSON.parse(JSON.stringify(s))
    }
    onColumnFilterInputChange = (e, col) => {
        //asyncPaging then externalFilter is must
        this.GridScroller.scrollTop = 0;
        let { columns, dataSource, isFilterStarted } = this.state;
        let { externalFilter, onFilterChange, asyncPaging } = this.props;
        col.term = e.target.value || '';
        if (externalFilter || asyncPaging) {
            if (!Utils.isNullOrEmpty(onFilterChange) && Utils.isFunction(onFilterChange)) {
                let colMinChar = 3;
                this._debounce(columns, onFilterChange);

                /*isFilterStarted = true;
                let filterOptions = this.getExternalFilterSortOptions(columns);
                onFilterChange({ type: 'FILTER-CHANGE', data: filterOptions });*/
            }
            else {
                console.clear();
                console.warn("Please Provide onFilterChange event callbak for WKLGrid");
            }
            this.updateState({ columns, isFilterStarted });
            return;
        }
        if (!this.cachedSource) {
            this.cachedSource = this.cloneObject(this.props.dataSource);
        }
        let filterdDataSource = this.cloneObject(this.cachedSource) || [];

        columns.forEach(colObj => {
            if (!Utils.isNullOrEmpty(colObj.term) && colObj.term.length > 0) {

                let filterType = '~';
                if (colObj.filterType)
                    filterType = colObj.filterType;
                switch (filterType) {
                    /*Contain*/
                    case '~':

                        switch (col.dataType || 'string') {
                            case 'string': filterdDataSource = filterdDataSource.
                                where(row => row[colObj.field]?.toString().toLowerCase().includes(colObj.term.toString().toLowerCase()));
                                break;
                            default: filterdDataSource = filterdDataSource.
                                where(row => row[colObj.field]?.toString().toLowerCase().includes(colObj.term.toString().toLowerCase())); break;
                        }
                        break;
                    /*Equal*/
                    case '=':
                        switch (col.dataType || 'string') {
                            case 'date': filterdDataSource = filterdDataSource.
                                where(row => row[colObj.field] ? moment(row[colObj.field]).isSame(moment(colObj.term || null)) : false);
                                break;
                            default: filterdDataSource = filterdDataSource.
                                where(row => row[colObj.field]?.toLowerCase() == colObj.term.toLowerCase()); break;
                        }
                        break;
                    /*Start With*/
                    case '':
                        filterdDataSource = filterdDataSource.
                            where(row => row[colObj.field]?.toLowerCase().startsWith(colObj.term.toLowerCase()));
                        break;
                    /*Ends With*/
                    case ':':
                        filterdDataSource = filterdDataSource.
                            where(row => row[colObj.field]?.toLowerCase().endsWith(colObj.term.toLowerCase()));
                        break;
                    /*Less Than*/
                    case '<':
                        switch (col.dataType || 'string') {
                            case 'numeric': filterdDataSource = filterdDataSource.
                                where(row => row[colObj.field] ? parseFloat(row[colObj.field]) < parseFloat(colObj.term || '0') : false);
                                break;
                            case 'date': filterdDataSource = filterdDataSource.
                                where(row => row[colObj.field] ? moment(row[colObj.field]).isSameOrBefore(moment(colObj.term || null)) : false);
                                break;
                        }
                        break;
                    /*Greater Than*/
                    case '>':
                        switch (col.dataType || 'string') {
                            case 'numeric': filterdDataSource = filterdDataSource.
                                where(row => row[colObj.field] ? parseFloat(row[colObj.field]) > parseFloat(colObj.term || '0') : false);
                                break;
                            case 'date': filterdDataSource = filterdDataSource.
                                where(row => row[colObj.field] ? moment(row[colObj.field]).isSameOrAfter(moment(colObj.term || null)) : false);
                                break;
                        }
                        break;
                    /*Between*/
                    case '&':
                        let splitValues = (colObj.term || '').split(',');
                        if (splitValues.length == 2) {
                            switch (col.dataType || 'string') {
                                case 'numeric': filterdDataSource = filterdDataSource.
                                    where(row => row[colObj.field] ?
                                        (parseFloat(row[colObj.field]) >= parseFloat(splitValues[0] || '0') &&
                                            parseFloat(row[colObj.field]) <= parseFloat(splitValues[1] || '0')) : false
                                    );
                                    break;
                                case 'date': filterdDataSource = filterdDataSource.
                                    where(row => row[colObj.field] ?
                                        moment(row[colObj.field]).isBetween(moment(splitValues[0] || null), moment(splitValues[1] || null), null, '[]') : false);
                                    break;
                            }
                        }

                        break;
                }
            }
        });

        this.updateState({ columns, dataSource: filterdDataSource });
    }
    onColumFilterInputKeyDown = (e, col) => {
        let { key, keyCode, which, target } = e;
        let { left, top, height, width } = target.getBoundingClientRect();
        if (width < 200)
            width = 200;
        let style = {
            left: `${left}px`,
            top: `${top + height}px`,
            width: `${width}px`,
            position: 'absolute',
            zIndex: '106'
        }
        let { columns } = this.state;
        let { filterManager } = col;
        let status = false;
        if (filterManager) {
            status = filterManager.isOpen;
        }

        switch (keyCode) {
            case 113: status = !status; break;
            case 115:
                this.clearFilterBox(col);
                e.preventDefault();
                e.stopPropagation();
                return;
                break;
            case 27:
                if (status) {
                    status = false;
                    e.preventDefault();
                    e.stopPropagation();
                }
                break;
        }

        columns.forEach(colObj => {
            if (colObj.filterManager)
                colObj.filterManager.isOpen = false;
            else
                colObj.filterManager = { isOpen: false };
        });
        if (col.filterManager) {
            col.filterManager.isOpen = status;
            col.filterManager.location = style;
        }
        else
            col.filterManager = {
                isOpen: status,
                location: style
            };
        this.updateState({ columns });
    }
    renderFilterInput = (source, index) => {
        let { filterType } = source;
        let classNames = `filterInput`;
        if (filterType) {
            switch (filterType) {
                case '~': classNames = `filterInput showType type-C`; break;
                case '=': classNames = `filterInput showType type-E`; break;
                case '': classNames = `filterInput showType type-S`; break;
                case ':': classNames = `filterInput showType type-EW`; break;
                case '<': classNames = `filterInput showType type-L`; break;
                case '>': classNames = `filterInput showType type-G`; break;
                case '&': classNames = `filterInput showType type-B`; break;
            }
        }

        return <div className={classNames}><input type='text' className=""
            onFocus={() => {
                this.scrollGridScroller();
            }}
            value={source.term || ''}
            onChange={e => this.onColumnFilterInputChange(e, source)}
            tabIndex={index}
            onKeyUp={e => this.onColumFilterInputKeyDown(e, source)}
        >
        </input></div>;
    }
    getColTextAlignment = (col) => {
        let align = col.align || 'left';
        switch (align.toLowerCase()) {
            case "left": return 'text-left';
            case "right": return 'text-right';
            case "center": return 'text-center';
        }
        return 'text-left';
    }
    getSortOptions = (columns) => {
        let sortOptions = [];
        columns.forEach(colObj => {
            if (colObj.sort) {
                let field = colObj.field;
                if (colObj.sort.field) {
                    field = colObj.sort.field;
                }

                if (colObj.sort.defSort == 'desc')
                    sortOptions.push({ desc: field });
                if (colObj.sort.defSort == 'asc')
                    sortOptions.push({ asc: field });
            }
        });
        return sortOptions;
    }
    getExternalFilterSortOptions = (columns) => {
        let filterSortOptions = [];
        columns.forEach(colObj => {
            let obj = null;
            if (colObj.sort) {
                obj = {};
                obj.field = colObj.field;
                obj.dataType = colObj.dataType || '';
                //obj.sort = colObj.sort.defSort || 'asc';
                obj.sort = colObj.sort.defSort;
            }
            if (!Utils.isNullOrEmpty(colObj.term)) {
                obj = obj || {};
                obj.field = colObj.field;
                obj.filter = {
                    type: colObj.filterType || '',
                    term: colObj.term || ''
                }
            }
            if (obj)
                filterSortOptions.push(obj)
        });
        return filterSortOptions;
    }
    onSortClick = (event, col, sortType) => {

        if (event.button != 0) {
            return;
        }
        let { sort } = col;
        let { dataSource, columns, isFilterStarted } = this.state;
        let { externalSort, onSortChange, asyncPaging } = this.props;
        let sortOptions = [];
        switch (sortType) {
            case 'asc': sort.defSort = 'desc';
                break;
            case 'desc': sort.defSort = '';
                break;
            case '': sort.defSort = 'asc';
                break;
        }
        sortOptions = this.getSortOptions(columns);
        if (externalSort || asyncPaging) {
            if (!Utils.isNullOrEmpty(onSortChange) && Utils.isFunction(onSortChange)) {
                isFilterStarted = true;
                sortOptions = this.getExternalFilterSortOptions(columns);
                onSortChange({ type: 'SORT-CHANGE', columnOptions: sortOptions })
            }
            else {
                console.clear();
                console.warn("Please provide onSortChange event callback for WITGrid");
            }
            this.updateState({ columns, isFilterStarted });
            return;
        }
        if (!this.cachedSource) {
            this.cachedSource = JSON.parse(JSON.stringify(this.props.dataSource));
        }
        let sortedDataSource = JSON.parse(JSON.stringify(this.cachedSource)) || [];

        if (sortOptions.length > 0) {
            //   sortedDataSource = WITSort(dataSource).by(sortOptions);
            sortedDataSource = WITSort.sort(dataSource).by(sortOptions);
        }
        this.updateState({ columns, dataSource: sortedDataSource });
    }
    onFilterBoxInputChange = (e, col, id) => {

        let { dataType, filterManager } = col;
        dataType = dataType || 'string';
        let { columns } = this.state;
        let activeFilters = filterManager.filters || [];
        let currentFilter = activeFilters.first(p => p.id == id) || undefined;
        filterManager.filters.forEach(filterObj => {
            if (!(filterObj.id.includes('&_') && id.includes('&_')))
                filterObj.term = null;
        });
        if (!Utils.isNullOrEmpty(currentFilter)) {
            currentFilter.term = e.value || null;
        }
        this.updateState(columns);
    }
    getControlByDataType = (col, id) => {
        let { dataType, filterManager } = col;
        dataType = dataType || 'string';
        let controlFX = null;
        if (Utils.isNullOrEmpty(filterManager.filters)) {
            filterManager.filters = [];
        }
        let currentFilter = filterManager.filters.first(p => p.id == id) || undefined;
        if (Utils.isNullOrEmpty(currentFilter)) {
            filterManager.filters.push({ id: id, term: null })
        }
        currentFilter = filterManager.filters.first(p => p.id == id);
        switch (dataType) {
            case 'date': controlFX = <WKLDatepicker selectedDate={currentFilter.term} onDateChanged={e => this.onFilterBoxInputChange(e, col, id)} placeholder="dd MMM yyyy" inputType="textbox" />; break;
            case 'numeric': controlFX = (<WKLTextboxWrapper value={currentFilter.term || ''} onChange={e => this.onFilterBoxInputChange(e, col, id)} prefix={10} inputType="numeric">
                <input type="text" placeholder="" className="form-control" id="usr"></input>
            </WKLTextboxWrapper>); break;
            default: controlFX = (
                <WKLTextboxWrapper value={currentFilter.term || ''} onChange={e => this.onFilterBoxInputChange(e, col, id)} >
                    <input type="text" className="form-control" id="usr"></input>
                </WKLTextboxWrapper>
            ); break;
        }
        return controlFX;
    }
    renderFilterBoxControl = (source, col, index) => {

        switch (source.id) {
            case '&': return (
                <div className="form-group form-group-sm" key={index}>
                    <label>
                        {source.text}
                    </label>
                    <div className="row">
                        <div className="col-md-12">
                            {
                                this.getControlByDataType(col, `${source.id}_1`)
                            }
                        </div>
                        <div className="col-md-12">
                            {
                                this.getControlByDataType(col, `${source.id}_2`)
                            }
                        </div>
                    </div>
                </div>);
            default: return (
                <div className="form-group form-group-sm" key={index}>
                    <label>
                        {source.text}
                    </label>
                    <div className="row">
                        <div className="col-md-12">
                            {
                                this.getControlByDataType(col, source.id)
                            }
                        </div>
                    </div>
                </div>);
        }
        return null;
    }
    clearFilterBox = (col) => {
        let { columns } = this.state;
        let { filterManager } = col;
        if (filterManager && filterManager.filters) {
            filterManager.filters.forEach(filterObj => {
                filterObj.term = null;
            });
        }
        switch (col.dataType || 'string') {
            case 'date':
            case 'numeric': col.filterType = '='; break;
            case 'string': col.filterType = '~'; break;
        }
        col.term = '';
        filterManager.isOpen = false;
        this.onColumnFilterInputChange({ target: {} }, col);
    }
    applyFilterBoxInputValue = (col) => {
        let { filterManager, dataType } = col;
        dataType = dataType || 'string';
        if (filterManager && filterManager.filters) {
            filterManager.filters.forEach(filterObj => {
                if (!Utils.isNullOrEmpty(filterObj.term) && !filterObj.id.includes('&')) {
                    switch (dataType) {
                        case 'date': col.term = moment(filterObj.term || null).format('DD MMM YYYY'); break;
                        default: col.term = filterObj.term; break;
                    }
                    col.filterType = filterObj.id
                    return false;
                }
                else {
                    let bw1 = filterManager.filters.first(f => f.id == '&_1') || null;
                    let bw2 = filterManager.filters.first(f => f.id == '&_2') || null;
                    if (bw1 && bw2 && !Utils.isNullOrEmpty(bw1.term) && !Utils.isNullOrEmpty(bw2.term)) {
                        switch (dataType) {
                            case 'date': col.term = `${moment(bw1.term || null).format('DD MMM YYYY')},${moment(bw2.term || null).format('DD MMM YYYY')}`; break;
                            default: col.term = `${bw1.term},${bw2.term}`; break;
                        }
                        col.filterType = '&';
                        return false;
                    }
                }
            });
        }
        filterManager.isOpen = false;
        this.onColumnFilterInputChange({ target: { value: col.term } }, col);
    }
    onFilterBoxButtonClick = (e, col) => {
        let { name } = e.target;
        switch (name) {
            case 'FILTER-CLEAR': this.clearFilterBox(col); break;
            case 'FILTER-APPLY': this.applyFilterBoxInputValue(col); break;
        }
    }
    renderFilterBox = (col) => {
        let domRenderElement = document.getElementById('root');
        let { filterManager, dataType } = col;
        dataType = dataType || 'string';

        let child = <div className="bg-white br-t p2 bw3 br-info box-shadow filter-box" style={filterManager.location} >

            {

                this.filterTypes.map((item, index) => {
                    if (item.dataTypes.includes(dataType))
                        return this.renderFilterBoxControl(item, col, index);
                })
            }
            <div className="row br-t bw2 br-dark pt5 pb5">
                <div className="col-md-6">
                    <button type="button" onClick={e => this.onFilterBoxButtonClick(e, col)} name="FILTER-CLEAR" className="btn  btn-sm btn-clear btn-gradient dark btn-block">Clear</button>
                </div>
                <div className="col-md-6">
                    <button type="button" onClick={e => this.onFilterBoxButtonClick(e, col)} name="FILTER-APPLY" className="btn  btn-sm btn-add btn-gradient dark btn-block">Apply</button>
                </div>
            </div>
        </div>
        return ReactDOM.createPortal(child, domRenderElement);
    }
    toggleAdvancedMenus = (data, isShow = true) => {
        let dataIndex = $(data.currentTarget).attr("dataindex");
        let targetElm = $(data.currentTarget).attr("id");

        if (isShow) {
            this.setState({
                advancedMenus: {
                    dataIndex,
                    targetElm
                }
            });
        }
        else {
            this.setState({
                advancedMenus: {
                    dataIndex: -1,
                    targetElm: ''
                }
            });
        }


    }

    renderAdvancedMenus = () => {

        let { dataSource, advancedMenus, rowHeight } = this.state;
        let { rowMenus } = this.props;
        let dataIndex = advancedMenus.dataIndex;
        let targetElm = advancedMenus.targetElm;
        if (targetElm && rowMenus && rowMenus.items && rowMenus.items.length > 0) {
            var wraper = findDOMNode(this.GridWrapper);
            let domRenderElement = $(wraper).find(`#${targetElm}`)[0]; //document.getElementById(targetElm);

            var scroller = $(wraper).find(`#${targetElm}`).closest('.grid-ui-scroller')[0];
            if (!scroller) return null;
            var bounds = scroller.getBoundingClientRect();
            var scrollWidth = scroller.scrollWidth;

            var right = scroller.scrollWidth - bounds.width - scroller.scrollLeft + 8;
            var temp = rowMenus;
            let moreMenus = [];
            if (temp.items.length > 4) {
                for (let index = 4; index < temp.items.length; index++) {
                    const element = temp.items[index];
                    let icon = null;
                    if (element.iconType == "svg") {
                        icon = <img key={index} src={element.icon}></img>
                    }
                    else {
                        icon = <span key={index} className={element.icon}></span>
                    }
                    icon = <span key={index} className="fa fa-circle me-1" style={{ fontSize: '0.4rem' }}></span>
                    element.disabled = element.disabled || false;
                    let classNames = 'p-1';
                    if (element.disabled) {
                        classNames = "text-gray p-1"
                    }
                    moreMenus.push(<li onClick={e => {

                        if (!element.disabled)
                            temp.onClick({ menuItem: element, row: dataSource[dataIndex] });
                    }} key={index} className={classNames}> {icon}{element.title}</li>);
                }
            }
            let icons = <div className="icon-view" style={{ gridTemplateColumns: `repeat(${temp.items.length > 4 ? 5 : temp.items.length}, 1fr)` }}>
                {
                    temp.items.map((item, index) => {
                        item.disabled = item.disabled || false;
                        let attribs = {
                            onClick: (e) => {
                                if (!item.disabled) {
                                    temp.onClick({ menuItem: item, data: dataSource[dataIndex] });
                                }
                            },
                            key: index
                        };
                        if (index < 4) {
                            if (item.iconType == "svg") {
                                return <img {...attribs} src={item.icon}></img>
                            }
                            else {
                                let classNames = item.icon;
                                if (item.disabled) {
                                    classNames = `text-gray ${item.icon}`
                                }
                                return <span {...attribs} className={classNames}></span>
                            }
                        }
                    })
                }
                {
                    temp.items.length > 4 && <span onClick={(e) => {
                        $(e.target).find('ul').toggleClass('hidden');
                        if ($(e.target).hasClass('more-ico')) {
                            var scrollerBounds = scroller.getBoundingClientRect();
                            var targetBounds = $(e.target).find('ul')[0].getBoundingClientRect();
                            if (targetBounds.bottom > scrollerBounds.bottom) {
                                $(e.target).find('ul').css({ top: -(targetBounds.height) + 'px' })
                            }
                        }

                    }} className="more-ico" > ... <ul className="shadow border p-1 mb-0 bg-white rounded hidden  more-view" >{moreMenus}</ul></span>
                }

            </div>;

            return ReactDOM.createPortal(<div className="bg-white ps-2 row-adv-menu text-danger" style={{ height: rowHeight, right: `${right}px` }}>{icons}</div>, domRenderElement);
        }

    }
    renderColCheckBox = (source, index) => {
        if (source.item.checkbox)
            return <i onClick={e => {
                source.item.checked = !source.item.checked;
                if (source.item.onChange) {
                    source.item.onChange({ field: source.item.field || '', index: index, value: source.item.checked });
                }
                this.updateState({});
            }} className={`fa fa${source.item.checked ? '-check' : ''}-square-o pointer`} style={{ marginRight: '2px' }} aria-hidden="true"></i>;
        return '';
    }
    renderColumn = (source, colIndex) => {
        let classNames = ["grid-ui-col"];
        let align = this.getColTextAlignment(source.item);
        classNames.push(align);
        let filterIcon = <span></span>;
        let { sort, showFilter } = source.item;
        if (Utils.isNullOrEmpty(showFilter))
            showFilter = true;
        let { sortState } = this.state;
        if (sort && sort.enabled) {
            let sortType = sort.defSort || '';
            let icon = `fa fa-sort`;
            if (sortType != '')
                icon = `fa fa-sort-${sortType}`;
            let style = { alignItems: 'center' }
            switch (sortType) {
                case 'desc': style = { alignItems: 'baseline' }; break;
                case 'asc': style = { alignItems: 'center' }; break;
            }
            filterIcon = <span onMouseDown={(e) => this.onSortClick(e, source.item, sortType)} className="sort-icon" style={style}><i className={icon}></i></span>;
        }
        let { filterManager } = source.item;
        return <div className={classNames.join(" ")} style={{ position: 'relative' }} key={source.index}>
            <div className="grid-ui-col-text">
                <span className="fw-bold">{this.renderColCheckBox(source, source.index)}{source.item.text}</span>
                {filterIcon}
                <span></span>
            </div>
            {this.props.showFilter && showFilter && this.renderFilterInput(source.item)}
            {filterManager && filterManager.isOpen && this.renderFilterBox(source.item)}
        </div>
    }
    renderColumns = (uid) => {
        let { columnTemplate, columns, headerHeight } = this.state;
        return <div className="grid-ui-header" data-h-scroll-group={uid} style={{ gridTemplateColumns: columnTemplate, height: `${headerHeight}px`, position: 'absolute' }}>
            {
                columns.map((item, index) => {
                    return this.renderColumn({ item, index });
                })
            }
        </div>;
    }

    /*Pager Area*/
    onPagerKeyPress(e) {
        switch (e.charCode) {
            case 13:
                this.onPageValueChange(e, '');
                e.preventDefault();
                return true;
                break;
        }
        if (!String.fromCharCode(e.charCode).match(/^([1-9]\d*|0)$/)) {
            e.preventDefault(); return true;
        }

    }
    onPagerValueChange = (e, type) => {

        if (type == "D") return false;
        let domNodeInfo = findDOMNode(this.inputCurrent);
        let { columns, pageInfo } = this.state;
        let { asyncPaging } = this.props;
        if (domNodeInfo.validity.valid) {
            let value = domNodeInfo.value;
            if (value.length <= 0 || value > pageInfo.totalPages || value < 1) {
                this.setPagerInput(pageInfo);
                return;
            }
            switch (type) {
                case 'F': value = 1; break;
                case 'L': value = pageInfo.totalPages; break;
                case 'N': if (parseInt(value) < pageInfo.totalPages) value = parseInt(value) + 1; break;
                case 'P': if (parseInt(value) > 1) value = parseInt(value) - 1; break;
            }
            if (pageInfo.currentPage != value) {
                pageInfo.currentPage = value;
                this.setPagerInput(pageInfo);
                if (pageInfo.onPageChange) {
                    if (!asyncPaging)
                        this.GridScroller.scrollTop = 0;
                    this.setState({ showLoader: true });

                    const columnOptions = this.getExternalFilterSortOptions(columns);

                    pageInfo.onPageChange({ event: e, type: type, value: value, name: this.props.name, columnOptions: columnOptions });
                }
            }

        }
    }
    setPagerInput = (pageInfo) => {
        let { asyncPaging } = this.props;
        if (pageInfo && !asyncPaging && this.inputCurrent) {
            this.inputCurrent.value = pageInfo.currentPage
        }
    }
    renderPager = () => {
        let { pageInfo } = this.state;
        let { PAGER } = this.GridEnums;

        let inputAttr = {
            onKeyPress: (e) => this.onPagerKeyPress(e),
            onBlur: (e) => this.onPagerValueChange(e, 'C'),
            ref: ref => this.inputCurrent = ref
        }

        return (
            <div className="grid-ui-footer-pager">
                <span className="grid-ui-pager-icon fa fa-angle-double-left " onClick={(ev) => this.onPagerValueChange(ev, PAGER.FIRST)}></span>
                <span className="grid-ui-pager-icon fa fa-angle-left " onClick={(ev) => this.onPagerValueChange(ev, PAGER.PREV)}></span>
                <input type="text" pattern="[0-9]*" {...inputAttr} />
                <span className="grid-ui-pager-total">/{pageInfo.totalPages || '1'}</span>
                <span className="grid-ui-pager-icon fa fa-angle-right " onClick={(ev) => this.onPagerValueChange(ev, PAGER.NEXT)}></span>
                <span className="grid-ui-pager-icon fa fa-angle-double-right " onClick={(ev) => this.onPagerValueChange(ev, PAGER.LAST)} ></span>
            </div>
        );
    }

    /*Footer Area*/
    renderFooter = () => {
        let { footerControls, asyncPaging, footerText, footerClass } = this.props;
        return <div className={`grid-ui-footer ${footerClass || ''}`}>
            <div className="grid-ui-footer-hoster">
                {
                    footerText || ''
                }
            </div>
            {
                (!asyncPaging) && this.renderPager()
            }

        </div>;
    }

    /*XHR Loader Symbol*/
    renderLoader() {
        return <div className="wit-grid-loader">
            <div style={{ width: '100px', height: '100px' }}>
                <img src="dist/css/images/XENIA.svg" alt="" ></img>
            </div>
        </div>;
    }

    /* CONTEXT MENU */
    renderContextMenuItem = (item, key) => {
        let { contextMenu } = this.props;
        let { cellContext } = this.state;

        let icon = '';
        let text = item.text || '';
        if (item.icon) {
            let classNames = ['mr5 gcm-icon'];
            classNames.push(item.icon);
            icon = <i className={classNames.join(' ')}></i>
        }
        else {
            icon = <i className="fa fa-empty gcm-icon"></i>
        }

        let mainClassNames = ['grid-ui-context-menu-item br-b pointer']
        if (item.isGroupStart)
            mainClassNames.push('divider-start');
        if (item.isGroupEnd)
            mainClassNames.push('divider-end');
        if (item.disabled)
            mainClassNames.push('item-disabled text-muted');
        if (item.onRender && Utils.isFunction(item.onRender)) {
            let response = item.onRender(item);
            icon = <span className="gcm-icon custom-content">{response.icon || ''}</span>;
            text = <span className="custom-content">{response.text || ''}</span>;
        }
        return <span key={key} onMouseDown={(event) => {
            if ((event.button && event.button !== 0) || item.disabled) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            if (item.callback) {
                item.callback(cellContext, item);
            }
            else if (contextMenu.onMenuItemClick) {
                contextMenu.onMenuItemClick(cellContext, item);
            }
            this.setState({ showContextMenu: false });

        }} className={mainClassNames.join(' ')}>{icon}<span className="gcm-content">{text}</span>
            {item.subMenus && item.subMenus.length > 0 && <i className="fa fa-caret-right gcm-arrow"></i>}
            {
                item.subMenus && item.subMenus.length > 0 && <div className="grid-ui-context-menu sub">
                    {
                        item.subMenus.map((subMenuItem, index) => {
                            return this.renderContextMenuItem(subMenuItem, index);
                        })
                    }
                </div>
            }</span>
    }

    renderContextMenu = () => {
        let domRenderElement = document.getElementById('root');
        let { contextMenu } = this.props;
        let { cellContext, contextLocation } = this.state;

        if (contextLocation && contextMenu) {
            let contextSource = contextMenu.menuItems(cellContext.source, cellContext.col) || [];
            if (contextSource.length <= 0)
                return null;
            let css = {
                left: `${contextLocation.x}px`,
                top: `${contextLocation.y}px`
            }
            let child = <div className="grid-ui-context-menu br-a br2" style={css}>
                {
                    contextSource.map((item, index) => {
                        return this.renderContextMenuItem(item, index);
                    })
                }
            </div>;
            return ReactDOM.createPortal(child, domRenderElement);
        }
        return null;
    }
    renderExportArea() {
        let exportOptions = this.props.exportOptions || [];
        return <React.Fragment>
            <div style={{ position: 'absolute' }} className="wit-grid-export-wrapper wit-no-hide" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></div>
            <div className="dropdown-menu export me-1" >
                {/* <ul > */}
                {
                    exportOptions.map((item, index) => {
                        // return <li className="dropdown-item" key={index} onMouseDown={(e)=>{
                        // if(this.props.onExportClick!=null&&this.props.onExportClick!==undefined)
                        // {
                        //     this.props.onExportClick(e,item.type);
                        // }
                        // }}><i className={item.icon}></i>&nbsp;{item.text}</li>

                        return <button className="dropdown-item ps-3" type="button" onMouseDown={(e) => {
                            if (this.props.onExportClick != null && this.props.onExportClick !== undefined) {
                                this.props.onExportClick({ event: e, item });
                            }
                        }}><i className={item.icon}></i>&nbsp;{item.text}</button>
                    })
                }
                {/* </ul> */}
            </div>
        </React.Fragment>
    }
    /* Main RENDER*/
    render() {

        var uid = WKLGrid.UID();
        this.cachedSource = this.props.cachedSource || null;
        let { showLoader, showContextMenu, showFooter, headerHeight } = this.state;
        let { rowGroup, autoHeight } = this.props;
        let footerHeight = {};
        if (!showFooter) {
            footerHeight = { height: '5px' }
        }
        let scrollerStyle = { height: `calc(${this.state.scrollHeight} - ${0}px)` };
        if (autoHeight) {
            scrollerStyle = { top: `${this.state.headerHeight}px`, bottom: `${footerHeight.height}` };
        }

        return (<div className="grid-ui-wrapper  " id={uid} ref={ref => this.GridWrapper = ref}>
            {
                showLoader && this.renderLoader()
            }
            {
                showContextMenu && this.renderContextMenu()
            }
            {this.props.showExport && this.renderExportArea()}
            <div className="grid-ui-header-wrapper" ref={ref => this.GridColWrapper = ref} style={{ height: `${headerHeight}px`, position: 'relative' }}>
                {this.renderColumns(uid)}

            </div>
            {/* style={{ height: `calc(${this.state.scrollHeight} - ${0}px)` }} */}

            <WKLHorizontalScroller group={uid}>
                <div className={`grid-ui-scroller ${autoHeight ? 'autoheight' : 'calcheight'}`} style={scrollerStyle} ref={ref => this.GridScroller = ref} >
                    <div className="grid-ui-rows-wraper" style={{ height: `${this.state.contentHeight}` }}>

                        <div className="grid-ui-rows">
                            {!rowGroup && this.renderRow()}
                            {rowGroup && this.renderRowGroup()}
                        </div>
                    </div>
                </div>
            </WKLHorizontalScroller>

            <div className={`grid-ui-footer-wrapper ${autoHeight ? 'autoheight' : ''}`} style={footerHeight}>
                {
                    showFooter && this.renderFooter()
                }
            </div>
        </div>);
    }
}
export { WKLGrid }