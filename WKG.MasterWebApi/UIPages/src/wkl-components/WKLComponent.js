import { Component, createContext } from 'react';
import { WKLStateManager } from './WKLStateManager';
import { Utils } from './Utils';
import { WKLMessageboxTypes } from './WKLEnums';

const WKLContext = createContext({});
const WKLTabContext = createContext({});

class WKLComponent extends Component {
    constructor(props, vm) {
        super(props);
        this.VM = vm || null;
        if (this.VM) {
            this.Data = this.VM.Data;
            this._____data = this.VM._____data;
            this.VM.register(this);
        }
        else {
            if (props && props.context !== undefined) {
                const hosstate = WKLStateManager.getStateByID(props.context.parentID, props.context.id);
                this.Data = hosstate.state;
                this._____data = hosstate.internalState;
            }
        }

        this._isUnmounted = false;
        this.onLoad = this.onLoad.bind(this);
        this.onClosing = this.onClosing.bind(this);
        this.___onActive = this.___onActive.bind(this);
        this.___onInactive = this.___onInactive.bind(this);

        this.onActive = this.onActive.bind(this);
        this.onInactive = this.onInactive.bind(this);

        this.showWindow = this.showWindow.bind(this);
        this.addTab = this.addTab.bind(this);
        this.showMessageBox = this.showMessageBox.bind(this);
        this.close = this.close.bind(this);
        this.closeTab = this.closeTab.bind(this);
        this.updateTabInfo = this.updateTabInfo.bind(this);

        this.updateUI = this.updateUI.bind(this);
        this.destroy = this.destroy.bind(this);

        this.______activeElements = [];
    }
    //options 
    // {
    //     url: 'Cashier/CSHT001',
    //     data: { ID: 'CASHIER_ID' },
    //     windowStyle: WKLWindowStyles,
    //     onClose: (r) => {
    //         console.log(JSON.stringify(r) || 'No closed data result');
    //         console.log('showCashier-closed');
    //     }
    // }
    showWindow(options) {
        if (this.context && this.context.addWindow) {
            this.context.addWindow(options);
        }
    }
    //options 
    // {
    //     title: item.Text,
    //     text: item.Text,
    //     key: item.FunctionID,
    //     url: `General/HPOSM001`,
    //     destroyOnHide: true,
    //     isClosable: true,
    //     closeAndOpen: true,
    //     onClose: (e) => {}
    // }
    addTab(options, addToMainTab = false) {
        if (this.context && this.context.addTab) {
            this.context.addTab(options, addToMainTab);
        }
    }
    showMessageBox(options) {
        options.messageboxType = options.messageboxType || WKLMessageboxTypes.error;
        options.text = options.text || '';
        options.onClose = options.onClose || null;
        options.buttons = options.buttons || [{ text: "Ok" }];
        if (this.context && this.context.showMessageBox) {
            this.context.showMessageBox(options);
        }
    }
    close(result) {
        if (this.context && this.context.close) {
            this.context.close({ id: this.props.context.id, data: result });
        }
    }
    closeTab(result) {
        if (this.context && this.context.closeTab) {
            this.context.closeTab({ data: result });
        }
    }
    updateTabInfo(result) {
        if (this.context && this.context.updateTabInfo) {
            this.context.updateTabInfo({ data: result });
        }
    }
    onLoad(e) {
        if (this.props)
            console.log(`----WKLComponent onLoad-- ${this.props.context.id}`);
        else
            console.log(`----WKLComponent onLoad--`);
    };

    onClosing() {
        console.log('----WKLComponent onClosing--');
    }
    ___onActive(e) {
        if (this._reactInternals) {
            if (this._reactInternals.child) {
                if (this._reactInternals.child.stateNode) {
                    if (this._reactInternals.child.stateNode.focus) {
                        let skipLastFocus = true;
                        if (e && e.type === 'msg-box')
                            skipLastFocus = false;
                        this._reactInternals.child.stateNode.focus(false, skipLastFocus);
                    }
                }
            }
        }
        if (e && e.type !== 'msg-box')
            this.onActive();
    }
    ___onInactive(e) {
        console.log('----WKLComponent ___onInactive--');
        if (this._reactInternals) {
            if (this._reactInternals.child) {
                if (this._reactInternals.child.stateNode) {
                    if (this._reactInternals.child.stateNode.___onInactive)
                        this._reactInternals.child.stateNode.___onInactive();
                }
            }
        }
        this.onInactive();
    }
    onActive(e) {

    }
    onInactive(e) {
    }
    updateUI() {
        if (this._isUnmounted === false)
            this.setState({});
    }

    componentWillUnmount() {

        this._isUnmounted = true;


    }

    // destroy = () => {
    //     Utils.cleanObject(this.Data);
    //     this.Data = null;
    // }
    destroy() {
         debugger;
        console.log(`Destroy id - ${this.props.context.id}`);
        if (this.VM)
            this.VM.destroy();
        Utils.cleanObject(this.VM);
        this.VM = null;
        Utils.cleanObject(this.Data);
        this.Data = null;
        this._____data = null;
        const me = this;
        let timeoutID = null;
        timeoutID = window.setTimeout(() => {
            Utils.cleanObject(me, false);
            clearTimeout(this.timeoutID);
        }, 50);
    }
}
WKLComponent.contextType = WKLContext;

export { WKLContext, WKLComponent, WKLTabContext };