import { Utils } from '../Utils';
import { AsyncLoader } from '../AsyncLoader';
import { WKLTabContext } from '../WKLTab';
import { WKLComponent, WKLContext } from "../WKLComponent";
import { WKLStateManager } from '../WKLStateManager';
import { WKLAlert } from '../WKLAlert';
import './index.css';

class WKLContainer extends WKLComponent {
    constructor(props) {
        super(props);
        const witState = this.Data;
        if (Object.keys(witState).length === 0) {
            witState.windows = [];
            witState.isLoaded = false;
            witState.context = { parentID: props.context.id, id: Utils.getUniqueID() };
        }
        this._bodyRef = null;
        this._eventState = null;
        this._windowRefs = {};
        this.destroy = this.destroy.bind(this);
        console.log(`WKLContainer ------------ ${props.context.id}`);
    }
    componentWillUnmount() {
        super.componentWillUnmount();
        if (this.props && this.props.context) {
            if (this.props.disposeOnUnmount === undefined || this.props.disposeOnUnmount === true) {
                WKLStateManager.removeStateByID(this.props.context.id);
            }
        }
    }
    onLoad = () => {
    }

    onClosing = () => {
        if (this.Data) {
            const { windows } = this.Data;
            let window = null;
            for (let i = (windows.length - 1); i >= 0; i--) {
                window = windows[i];
                const child = this._windowRefs[window.context.id];
                if (window.type === 'msg-box') {
                    return false;
                }
                else {
                    if (child) {
                        const result = Utils.invoke(child.onClosing, null);
                        if (result === false) {
                            return false;
                        }

                        Utils.invoke(child.destroy);
                    }

                }
            }
        }
        if (this._bodyRef) {
            return Utils.invoke(this._bodyRef.onClosing, null);
        }
    }
    ___onActive = (arg) => {
        if (this.Data) {
            const { windows } = this.Data;
            if (windows.length > 0) {
                const window = windows[windows.length - 1];
                const child = this._windowRefs[window.context.id];
                if (child)
                    Utils.invoke(child.___onActive, arg);
                else {
                    this._eventState = `INIT-ACTIVE-${window.context.id}`;
                }
            }
            else {
                if (this._bodyRef)
                    Utils.invoke(this._bodyRef.___onActive, arg);
                else
                    this._eventState = `INIT-ACTIVE-${this.Data.context.id}`;
            }
        }
    }
    ___onInactive = (arg) => {
        if (this.Data) {
            const { windows } = this.Data;
            if (windows.length > 0) {
                const window = windows[windows.length - 1];
                const child = this._windowRefs[window.context.id];
                if (child)
                    Utils.invoke(child.___onInactive, arg);
            }
            else {
                if (this._bodyRef)
                    Utils.invoke(this._bodyRef.___onInactive, arg);
            }
        }
    }
    destroy = () => {
        if (this.Data) {
            const { windows } = this.Data;
            for (const wndw of windows) {
                const child = this._windowRefs[wndw.context.id];
                if (child)
                    Utils.invoke(child.destroy, null);
                console.log(`window id - ${wndw.context.id}`);
            }
        }
        if (this._bodyRef) {
            return Utils.invoke(this._bodyRef.destroy, null);
        }
        super.destroy();
    }

    _showMessageBox(e) {
        this.___onInactive();
        const wndw = {};
        wndw.eventState = null;
        wndw.id = Utils.getUniqueID();
        wndw.context = Object.freeze({ parentID: this.Data.context.id, id: wndw.id, type: 'msg-box', windowStyle: 'top' });
        wndw.data = e;
        wndw.onClose = e.onClose;
        this.Data.windows.push(wndw);
        this.updateUI();
    }
    _addWindow(e) {
        if (e && e.url) {
            this.___onInactive();
            const wndw = {};
            wndw.eventState = null;
            wndw.loaded = false;
            wndw.id = Utils.getUniqueID();
            wndw.context = Object.freeze({ parentID: this.Data.context.id, id: wndw.id, type: 'window', windowStyle: e.windowStyle || 'top' });
            wndw.url = e.url;
            wndw.data = e.data;
            wndw.disableEscape = e.disableEscape === true;
            wndw.onClose = e.onClose;
            this.Data.windows.push(wndw);
            this.updateUI();
        }
    }
    _closeWindow(e, args) {
        const window = this.Data.windows.first(w => w.context.id === args.id);
        let callActive = true;
        if (window) {
            if (window.context.type === 'msg-box') {
                callActive = false;
                if (args.data === undefined || args.data === null)
                    args.data = { index: -1, item: null };
            }
            else {
                if (e) {
                    callActive = true;
                    const child = this._windowRefs[window.context.id];
                    if (child && child.onClosing) {
                        const result = Utils.invoke(child.onClosing);
                        if (result === false) {
                            return;
                        }
                    }
                }
            }
            this.Data.windows.remove(window);
            this.___onActive({ type: window.context.type });
            try {
                Utils.invoke(window.onClose, args.data);
            }
            catch (ex) { console.error(ex); }
            WKLStateManager.removeStateByID(window.context.id);
            window.eventState = 'DESTROY';
            //if (callActive === true)
            //this.___onActive({ type: window.context.type });
            this.updateUI();
        }
    }
    _setBodyRef = (el) => {
        this._bodyRef = el;
        if (this._bodyRef) {
            if (this.Data.isLoaded === false) {
                this.Data.isLoaded = true;
                Utils.invoke(this._bodyRef.onLoad, { isActive: this.Data.windows.length === 0 });
            }
            else if (this._eventState === `INIT-ACTIVE-${this.Data.context.id}`) {
                this._eventState = null;
                Utils.invoke(this._bodyRef.___onActive);
            }
        }
    }
    _setRef = (el, w) => {
        let dstryWndw = null;
        if (w.eventState === 'DESTROY') {
            dstryWndw = this._windowRefs[w.id];
        }
        this._windowRefs[w.id] = el;
        if (el) {
            console.log('------Window Load-------');
            if (el && w.loaded === false) {
                w.loaded = true;
                const wndws = this.Data.windows || [];
                let isActive = false;
                if (wndws.length > 0)
                    isActive = wndws[wndws.length - 1].id === w.id;
                Utils.invoke(el.onLoad, { isActive: isActive });
            }
            else if (this._eventState === `INIT-ACTIVE-${w.context.id}`) {
                this._eventState = null;
                Utils.invoke(el.___onActive);
            }
        }

        try {
            if (dstryWndw) {
                Utils.invoke(dstryWndw.destroy);
                dstryWndw = null;
            }
        }
        catch (ex) { }
    }
    _loadWindow(w) {
        if (w.url)
            return (<AsyncLoader key={`WND_${this.props.context.id}_${w.context.id}`} url={w.url} data={w.data} context={w.context} childRef={(el) => this._setRef(el, w)} />);
        else if (w.context.type === 'msg-box') {
            const { onClose, ...attr } = w.data;
            return (<WKLAlert key={`MGS_${this.props.context.id}_${w.context.id}`} {...attr} onClose={(e) => this._closeWindow(null, { id: w.id, data: e })} />);
        }
        else
            return null;
    }
    _loadBody() {
        if (this.props.url)
            return (<AsyncLoader key={`BODY_${this.props.context.id}`} url={this.props.url} data={this.props.data} context={this.Data.context} childRef={(el) => this._setBodyRef(el)} />);
        return this.props.children;
    }
    _keyUpEventHandler = (e) => {
        if (e.key === 'Escape') {
            console.log('key up container---------------');
            if (this.Data.windows.length > 0) {
                e.preventDefault();
                e.stopPropagation();
                const wndw = this.Data.windows[this.Data.windows.length - 1];
                if (wndw.disableEscape === true) {

                }
                else
                    this._closeWindow(e, { id: wndw.id });
            }
        }
    }
    _getOptions() {
        return {
            isTopmost: (e) => {
                if (this.Data.windows.length > 0) {
                    const wndw = this.Data.windows[this.Data.windows.length - 1];
                    return wndw.id === e.id;
                }
                else {
                    return this.Data.context.id === e.id;
                }
            },
            addWindow: (e) => {
                this._addWindow(e);
            },
            addTab: (args, addToMainTab) => {
                if (this.context.addTab) {
                    return this.context.addTab(args, addToMainTab);
                }
                else
                    return false;
            },
            close: (args) => {
                if (args.id === this.Data.context.id) {
                    if (this.context.close)
                        this.context.close({ id: this.props.context.id });
                }
                else {
                    this._closeWindow(null, args);
                }
            },
            closeTab: (args) => {
                if (this.context.close)
                    this.context.close({ id: this.props.context.id });
            },
            updateTabInfo: (args) => {
                if (this.context.updateTabInfo) {
                    args.id = this.props.context.id;
                    this.context.updateTabInfo(args);
                }
            },
            showMessageBox: (e) => {
                this._showMessageBox(e);
            }
        }
    }

    render() {
        let cls = 'wkl-container';
        if (this.props.className)
            cls += ' ' + (this.props.className || '');

        return (<div className={cls} tabIndex={-1} onKeyDown={this._keyUpEventHandler}>
            <WKLContext.Provider value={this._getOptions()}>
                {this._loadBody()}
                {this.Data.windows.map(w => this._loadWindow(w))}
            </WKLContext.Provider>
        </div>);
    }
}
WKLContainer.contextType = WKLTabContext;

export { WKLContainer };