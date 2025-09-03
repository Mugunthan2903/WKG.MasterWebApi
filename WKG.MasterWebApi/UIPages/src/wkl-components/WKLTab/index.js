import PropTypes from 'prop-types';
import { WKLComponent, WKLTabContext } from "../WKLComponent";
import { WKLContainer } from '../WKLContainer';
import { WKLTabHeaderPanel } from './WKLTabHeaderPanel';
import { Utils } from '../Utils';
import { WKLTabOrientations } from '../WKLEnums';
import './index.css';

/*
    Tab Item Properties
    -------------------
    title: item.Text,
    text: item.Text,
    key: item.ID,
    url: `Cashier/${item.ID}`,
    destroyOnHide: true,
    isClosable: true,
    closeAndOpen: false
*/

class WKLTab extends WKLComponent {
    constructor(props) {
        super(props);
        const witState = this.Data;
        if (Object.keys(witState).length === 0) {
            witState.tabItems = [];
            witState.selectedID = null;
            witState.context = { parentID: props.context.id, id: Utils.getUniqueID() };
        }
        this._tabRefs = {};
        this._tabHeaderRef = null;

    }
    static propTypes = {
        scrollableX: PropTypes.bool,
        scrollableY: PropTypes.bool,
        menuWidth: PropTypes.number,
        dropDownWidth: PropTypes.number,
        dropDownHeight: PropTypes.number,
        orientation: PropTypes.oneOf(Object.keys(WKLTabOrientations)),
        onSelectionChanged: PropTypes.func,
        containerClass: PropTypes.string
    };
    static defaultProps = {
        scrollableX: false,
        scrollableY: false,
        menuWidth: undefined,
        dropDownWidth: undefined,
        dropDownHeight: undefined,
        orientation: WKLTabOrientations.top,
        onSelectionChanged: undefined,
        containerClass: undefined
    };
    getTabs() {
        const tabs = [];
        for (const tab of this.Data.tabItems) {
            tabs.push(tab.option);
        }
        return tabs;
    }
    removeTabs(e) {
        let itms = [];
        if (Array.isArray(e))
            itms = e;
        else
            itms.push(e);


        let selectedID = this.Data.selectedID;
        for (const itm of itms) {
            this.Data.tabItems.remove((t) => t.option.key === itm.key);
        }

        let selectedTab = null;
        if (!Utils.isNullOrEmpty(selectedID)) {
            selectedTab = this.Data.tabItems.first((t) => t.id === selectedID);
        }
        if (selectedTab === null) {
            selectedTab = this.Data.tabItems.first();
            if (selectedTab)
                this._onSelectionClick({ tab: selectedTab });
        }
    }
    addTab(e) {
        if (e) {
            let itms = [];
            if (Array.isArray(e))
                itms = e;
            else
                itms.push(e);
            for (const itm of itms) {
                if (itm && itm.url) {
                    if (itm.key) {
                        let closeAndOpen = itm.closeAndOpen || false;
                        const tab = this.Data.tabItems.first((t) => t.option.key === itm.key);
                        if (tab != null) {
                            if (closeAndOpen === true) {
                                let index = this.Data.tabItems.findIndex(tb => tb.id === tab.id);
                                this._addItem(itm, index);
                                continue;
                            }
                            else {
                                this._onSelectionChange(tab.id);
                                continue;
                            }
                        }
                    }
                    else
                        itm.key = itm.url;
                    this._addItem(itm, -1);
                }
            }
            this.updateUI();
        }
    };
    _addItem(itm, index = -1) {
        const tb = {};
        tb.id = Utils.getUniqueID();
        tb.loaded = false;
        tb.eventState = '';
        tb.option = itm;
        tb.context = Object.freeze({ type: 'tab-container', parentID: this.props.context.id, id: tb.id });
        if (index > -1) {
            this.Data.tabItems[index] = tb;
            this._onSelectionChange(tb.id);
        }
        else {
            this.Data.tabItems.push(tb);
            this._onSelectionChange(tb.id);
        }
    }
    closeTab(e) {
    };

    _onCloseTab = (args) => {
        const e = args.e;
        const tb = args.tab;
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        let selectedTab = null;
        let prevId = null;
        let prevChk = true;
        let nextId = null;
        let nextChk = false;
        for (let tbitm of this.Data.tabItems) {
            if (nextChk === true) {
                nextId = tbitm.id;
                nextChk = false;
            }

            if (tbitm.id === tb.id) {
                prevChk = false;
                nextChk = true;
                selectedTab = tbitm;
            }

            if (prevChk === true)
                prevId = tbitm.id;
        }
        let el = this._tabRefs[tb.id];
        if (e) {
            if (el) {
                const result = Utils.invoke(el.onClosing);
                if (result === false)
                    return;
            }
        }

        if (selectedTab.option && selectedTab.option.onClose) {
            try {
                Utils.invoke(selectedTab.option.onClose);
            }
            catch (ex) {
                console.error('On tab closing');
            }
        }
        this.Data.tabItems.remove(selectedTab);
        if (el)
            Utils.invoke(el.destroy);

        let selectedID = null;
        if (prevId)
            selectedID = prevId;

        if (nextId)
            selectedID = nextId;

        this._onSelectionChange(selectedID);

        let cntrl = this._tabRefs[selectedID];
        if (cntrl)
            Utils.invoke(cntrl.___onActive);

        this.updateUI();
    }

    _keyUpEventHandler = (e) => {
        if (e.key === 'Escape') {
            if (this._tabHeaderRef) {
                let result = Utils.invoke(this._tabHeaderRef.closePopup);
                if (result === true) {
                    if (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }
                }
            }

            if (this.Data.tabItems.length > 0) {
                const tb = this.Data.tabItems.first(t => t.id === this.Data.selectedID);
                if (tb) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (tb.option.isClosable === true)
                        this._onCloseTab({ e, tab: { id: this.Data.selectedID } });
                }
            }
        }
    };
    _onSelectionChange(tabId) {
        let oldTabId = this.Data.selectedID;

        this.Data.selectedID = tabId || null;
        try {
            if (tabId && this.Data && this.Data.tabItems) {
                const oldTab = this.Data.tabItems.first(t => t.id === oldTabId);
                const tab = this.Data.tabItems.first(t => t.id === tabId);
                if (tab) {
                    Utils.invoke(this.props.onSelectionChanged, { item: tab.option, oldItem: oldTab?.option });
                }
            }
        }
        catch (ex) {
            console.error('Tab selection changed failed', ex);
        }
    }
    _onSelectionClick = (args) => {
        let tb = args.tab;
        if (tb.id !== this.Data.selectedID) {

            let cntrl = this._tabRefs[this.Data.selectedID];
            if (cntrl)
                Utils.invoke(cntrl.___onInactive);
            this._onSelectionChange(tb.id);
            cntrl = this._tabRefs[this.Data.selectedID];
            if (cntrl)
                Utils.invoke(cntrl.___onActive);
            else {
                const tbItem = this.Data.tabItems.first(t => t.id === tb.id);
                if (tbItem)
                    tbItem.eventState = 'INIT-ACTIVE';
            }
            this.updateUI();
        }
    }
    _setRef = (el, tb) => {
        this._tabRefs[tb.id] = el;
        if (el) {
            if (tb.loaded === false) {
                tb.loaded = true;
                Utils.invoke(el.onLoad);
            }
            else if (tb.eventState === 'INIT-ACTIVE') {
                tb.eventState = null;
                Utils.invoke(el.___onActive);
            }
        }

    }
    _setHeaderRef = (el) => {
        this._tabHeaderRef = el;
    }

    // _renderTabBody1(tb) {
    //     let cls = 'wkl-tab-content hide';
    //     if (tb.id === this.Data.selectedID)
    //         cls = 'wkl-tab-content';
    //     else {
    //         if (tb.option.destroyOnHide === true)
    //             return null;
    //     }
    //     return (<div key={`tab_${tb.id}`} className={cls}>
    //         <WKLContainer disposeOnUnmount={false} key={`tab_${tb.id}`} url={tb.option.url} data={tb.option.data} context={tb.context} ref={(el) => this._setRef(el, tb)}></WKLContainer>
    //     </div>);
    // }

    _renderTabBody(tb) {

        let cls = 'wkl-tab-content hide';
        if (tb.id === this.Data.selectedID)
            cls = 'wkl-tab-content';
        else {
            if (tb.option.destroyOnHide === true)
                return null;
        }

        cls += ' ' + this.props.orientation || 'top';

        if (this.props.scrollableY === true)
            cls += ' wkl-container-scroll-y';
        if (this.props.scrollableX === true)
            cls += ' wkl-container-scroll-x';

        cls += ' ' + (this.props.containerClass || '')
        return (<WKLContainer disposeOnUnmount={false} key={`tab_${tb.id}`} className={cls} url={tb.option.url} data={tb.option.data} context={tb.context} ref={(el) => this._setRef(el, tb)}></WKLContainer>);
    }

    _getTabContextOptions() {
        const opt = {};
        opt.addTab = (args, addToMainTab) => {
            if (addToMainTab === true && this.context.addTab) {
                let result = this.context.addTab(args);
                if (result === true)
                    return true;
            }
            this.addTab(args, addToMainTab);
            return true;
        };
        opt.close = (args) => {
            this._onCloseTab({ e: null, tab: args });
        };
        opt.updateTabInfo = (args) => {
            if (args.data) {
                const tb = this.Data.tabItems.first(t => t.id === args.id);
                if (tb) {
                    tb.option.text = args.data.text || tb.option.text;
                    tb.option.title = args.data.title || tb.option.title;
                    if (this._tabHeaderRef)
                        this._tabHeaderRef.updateUI();
                }
            }
        };
        return opt;
    }
    render() {

        console.log('--------Tab--render--------' + this.props.orientation);
        let orientation = this.props.orientation || 'top';
        let cntrl1 = null;

        //let items = [...this.Data.tabItems];
        let items = this.Data.tabItems;
        let cntrl2 = (<WKLTabHeaderPanel ref={this._setHeaderRef} orientation={orientation} dropDownHeight={this.props.dropDownHeight} menuWidth={this.props.menuWidth} dropDownWidth={this.props.dropDownWidth} tabItems={items} selectedID={this.Data.selectedID} onClose={this._onCloseTab} onSelectionChange={this._onSelectionClick} />);
        if (orientation === 'top' || orientation === 'left') {
            cntrl1 = cntrl2;
            cntrl2 = null;
        }

        let cls = 'wkl-tab';
        if (orientation === 'left' || orientation === 'right')
            cls += ' wkl-tab-veritcal';

        if (this.props.className)
            cls += ' ' + (this.props.className || '');

        const style = {};
        let ht = +this.props.height;
        if (!Utils.isNumber(ht))
            ht = 0;
        if (ht > 0) {
            style.height = `${ht}px`;
            style.minHeight = style.height;
            style.maxHeight = style.height;
        }
        let body = null;
        if (this.Data.tabItems && this.Data.tabItems.length > 0)
            body = this.Data.tabItems.map((tb, idx) => this._renderTabBody(tb, idx));
        else {
            body = (<div className="wkl-container wkl-tab-content">{this.props.children}</div>);
            cntrl1 = null;
            cntrl2 = null;
        }

        return (<div tabIndex={0} className={cls} onKeyDown={this._keyUpEventHandler} style={style}>
            <WKLTabContext.Provider value={this._getTabContextOptions()}>
                {cntrl1}
                {body}
                {cntrl2}
            </WKLTabContext.Provider>
        </div>);
    }
}
export { WKLTab, WKLTabContext };