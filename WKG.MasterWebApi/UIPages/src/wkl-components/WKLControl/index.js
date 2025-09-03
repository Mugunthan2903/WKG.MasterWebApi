import { WKLContext } from '../WKLComponent';
import PropTypes from 'prop-types';
import { WKLComponent } from "../WKLComponent";
import { WKLOverlay } from '../WKLOverlay';
import { WKLWindowStyles } from '../WKLEnums';
import { WKLToaster } from '../WKLToaster';
import { Utils } from '../Utils';
import './index.css';


//const focusables = 'a[href], button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])';

const getHokeyElements = (element = document, all = false) => {
    if (all === true)
        return [...element.querySelectorAll('[hot-key]')];
    else
        return [...element.querySelectorAll('[hot-key]')].filter(el => !el.hasAttribute('disabled') && !el.getAttribute("aria-hidden"));
};

class WKLControl extends WKLComponent {
    constructor(props) {
        super(props);
        this.________eventState = null;
        this.________registed = false;
        this.inputRefs = null;
        this._____data.isLoaded = this._____data.isLoaded || false;
        this._____data.lastFocusedIndex = this._____data.lastFocusedIndex || -1;

        this.focus = this.focus.bind(this);
        this.___onInactive = this.___onInactive.bind(this);
        this.______hotkeys = [];
    }
    static propTypes = {
        hideTitleBar: PropTypes.bool,
        loading: PropTypes.bool,
        loadingText: PropTypes.string,
        className: PropTypes.string,
        containerClassName: PropTypes.string,
        showToaster: PropTypes.bool,
        toasterConfig: PropTypes.object,
        wrapperClass: PropTypes.string,
        panelButtons: PropTypes.array,//{ text: 'Session', type: 'btn-search', hotKey: 'A', id: "btn_session" }
        panelButtonHandler: PropTypes.func,
        panelButtonWidth: PropTypes.number,//{ text: 'Session', type: 'btn-search', hotKey: 'A', id: "btn_session" }
        fullHeight: PropTypes.bool,
        showBorder: PropTypes.bool
    };
    static defaultProps = {
        hideTitleBar: false,
        loading: false,
        loadingText: undefined,
        className: undefined,
        containerClassName: undefined,
        showToaster: false,
        toasterConfig: undefined,
        wrapperClass: undefined,
        panelButtons: undefined,//{ text: 'Session', type: 'btn-search', hotKey: 'A', id: "btn_session" }
        panelButtonHandler: undefined,
        panelButtonWidth: 120,
        fullHeight: false,
        showBorder: true
    };
    registerEvent() {
        // if (this.________registed === false && this.inputRefs) {
        //     this.________registed = true;
        //     const elmnt = $(this.inputRefs);
        //     elmnt.on('focusin.hoscontrol', 'a[href], button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])', (e) => {
        //         const elmnts = Utils.getKeyboardFocusableElements(e.target);
        //         if (Array.isArray(elmnts))
        //             this._____data.lastFocusedIndex = elmnts.indexOf(e.target);
        //         else
        //             this._____data.lastFocusedIndex = 0;
        //     });

        // }
    }
    unregisterEvent() {
        // if (this.inputRefs) {
        //     const elmnt = $(this.inputRefs);
        //     elmnt.off('focusin.hoscontrol', focusables, (e) => { });

        // }
    }
    ___onInactive() {
        if (this.inputRefs) {
            if (this.______activeElements.length > 0)
                return;
            const children = Utils.getKeyboardFocusableElements(this.inputRefs);
            this.______activeElements = children;
            if (children.length > 0) {
                for (const child of children) {
                    child.disabled = true;
                }
            }
        }
    }
    __tryFocus(elmnt, isSlider = false) {
        try {
            console.log('focus');
            if (isSlider === true)
                window.setTimeout(() => { elmnt.focus(); }, 100);
            else
                elmnt.focus();
        }
        catch (ex) {
        }
    }
    focus(isSlider = false, skipLastFocus = true) {
        if (this.inputRefs) {
            if (this.______activeElements) {
                const children = this.______activeElements;
                if (children.length > 0) {
                    for (const child of children) {
                        child.disabled = false;
                    }
                }
            }
            this.______activeElements = [];

            if (skipLastFocus === true) {
                const children = Utils.getKeyboardFocusableElements(this.inputRefs);
                if (children.length > 0) {
                    let child = null;
                    if (this._____data.lastFocusedIndex > -1)
                        child = children[this._____data.lastFocusedIndex];
                    else {
                        child = children[0];
                    }
                    this.__tryFocus(child, isSlider);
                    this.registerEvent();
                }
            }

        }
        else
            this.________eventState = 'ACTIVE';
    }
    registerHotKeys() {
        const elemnts = getHokeyElements(this.inputRefs, true);
        for (let elemnt of elemnts) {
            var key = elemnt.getAttribute('hot-key');
            if (key) {
                this.______hotkeys.push(key.toLowerCase());
            }
        }
    }

    componentDidMount() {
        this.registerEvent();
        let isSlider = false;
        if (this.props.context && this.props.context.type === 'window') {
            const windowStyle = this.props.context.windowStyle || '';
            if (windowStyle === WKLWindowStyles.slideLeft || windowStyle === WKLWindowStyles.slideRight
                || windowStyle === WKLWindowStyles.slideTop || windowStyle === WKLWindowStyles.slideBottom) {
                if (this._____data.isLoaded === false) {
                    this._____data.isLoaded = true;
                    isSlider = true;
                    window.setTimeout(() => { this.setState({}); }, 100);
                }
            }
        }
        if (this.context && this.context.isTopmost && this.props.context) {
            const result = this.context.isTopmost({ id: this.props.context.id });
            if (result === true) {
                if (this.inputRefs) {
                    this.registerHotKeys();
                    this.focus(isSlider);
                }
                else
                    this.________eventState = 'ACTIVE';
            }
        }
    }
    getSnapshotBeforeUpdate(prevProps) {
        return { notifyRequired: (prevProps.loading !== this.props.loading || prevProps.loadingText !== this.props.loadingText) };
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (snapshot.notifyRequired)// Check if it's a new user, you can also use some unique property, like the ID  (this.props.user.id !== prevProps.user.id)
        {
            this.updateUI();
        }
    }
    componentWillUnmount() {
        this.unregisterEvent();
    }
    onKeyDown = (evt) => {
        if ((evt.key === 'Tab' || evt.key === 'Enter') && this.inputRefs) {
            const result = this.context.isTopmost({ id: this.props.context.id });
            if (result === true) {
                const children = Utils.getKeyboardFocusableElements(this.inputRefs);
                if (children.length > 0) {
                    if (evt.key === 'Tab') {
                        if (evt.shiftKey) {
                            if (children[0] === evt.target) {
                                evt.preventDefault();
                                evt.stopPropagation();
                                children[children.length - 1].focus();
                            }
                        }
                        else {
                            if (children[children.length - 1] === evt.target) {
                                evt.preventDefault();
                                evt.stopPropagation();
                                children[0].focus();
                            }
                        }
                    }
                    else {

                        if (evt.target.type === 'textarea') {
                            return;
                        }
                        evt.preventDefault();
                        evt.stopPropagation();
                        Utils.focusNext(evt.target);
                    }
                }
            }
        }
        else {
            //ctrlKey
            if (evt.altKey && this.______hotkeys.length > 0 && this.inputRefs) {
                let key = evt.key.toLowerCase();
                if (this.______hotkeys.first(k => k === key)) {
                    const elemnts = getHokeyElements(this.inputRefs);
                    for (let elemnt of elemnts) {
                        var hotKey = elemnt.getAttribute('hot-key')?.toLowerCase();
                        console.log(`key : ${key}, hotKey: ${hotKey}`);
                        if (key === hotKey) {
                            evt.preventDefault();
                            evt.stopPropagation();
                            if (elemnt.click)
                                elemnt.click();
                            break;
                        }
                    }
                }
            }
        }
    }

    _setRef = (el) => {
        this.inputRefs = el;
        if (this.inputRefs) {
            if (this.________eventState === 'ACTIVE') {
                this.________eventState = null;
                this.focus();
            }
        }
    }
    panelButtonHandler = (e, item) => {
        e.item = item;
        Utils.invoke(this.props.panelButtonHandler, e);
    }

    renderPanelButtons(panelButtons) {
        if (panelButtons.length <= 0)
            return;

        let style = {};
        if (this.props.panelButtonWidth > 0) {
            style.minWidth = `${this.props.panelButtonWidth}px`;
        }

        return (<div className="border rounded-end shadow-sm ms-3">
            <div className="d-flex flex-column justify-content-start mx-3 mb-3 mt-2">
                {
                    panelButtons.map((item, index) => {
                        const attr = {};
                        if (item.disabled === true)
                            attr.disabled = true;
                        return <button
                            {...attr}
                            key={`wp_btn_${index}`}
                            id={`wp_btn_${index}`}
                            hot-key={item.hotKey}
                            style={style}
                            onClick={e => this.panelButtonHandler(e, item)}
                            className={`btn btn-sm ${item.type || 'btn-info'} mt-2`} >
                            {item.icon && <i className={`fa fa-${item.icon}`}></i>} {item.text}
                        </button>
                    })
                }
            </div>
        </div>);
    }
    renderToaster() {
        return (<>
            <WKLToaster {...this.props.toasterConfig} ></WKLToaster>
            <WKLOverlay loading={false} />
        </>);
    }

    renderBody() {

        const hideTitleBar = (this.props.hideTitleBar === true);
        let border = '';
        if (this.props.showBorder === true)
            border = ' border shadow-sm';
        let mainSectionClass = '';
        if (this.props.context && this.props.context.type === 'window') {
            mainSectionClass = 'wkl-window-body-container ';
            if (hideTitleBar === true) {
                mainSectionClass += ' h-100';
            }
            // else
            //     mainSectionClass += ' border shadow-sm';
        }
        else {
            mainSectionClass = 'wkl-window-body-container ';
            if (hideTitleBar === true) {
                mainSectionClass += ' h-100';
            }
            // else
            //     mainSectionClass += '  shadow-sm';
        }

        if (!Utils.isNullOrEmpty(this.props.wrapperClass)) {
            mainSectionClass += ' ' + (this.props.wrapperClass || '');
        }

        mainSectionClass += (' ' + border);

        // if (this.props.fullHeight === true) {
        //     mainSectionClass = mainSectionClass + ' wkl-content-scroll-y';
        // }
        return (<div className={mainSectionClass} ref={el => this._setRef(el)} onKeyDown={this.onKeyDown} style={{ maxHeight: '100%' }}>
            {hideTitleBar === false && (<div className="wkl-window-header">
                <h5 className="wkl-header-title text-truncate">{this.props.title}</h5>
                <span className="wkl-window-close" title="Close" onClick={(e) => Utils.invoke(this.props.onClose, e)}>
                    <i className=" fa fa-times"></i>
                </span>
            </div>)}
            {this.props.children}
            {this.props.showToaster && this.renderToaster()}
        </div>);
    }
    renderModalWindow() {
        let cls = 'wkl-dialog shadow-sm';
        let mainSectionClass = 'h-100  ';



        if (this.props.context && this.props.context.type === 'window') {
            if (this._____data.isLoaded === true) {
                if (this.props.context.windowStyle === WKLWindowStyles.maximize) {
                    cls += ' maximize';
                }
                else if (this.props.context.windowStyle === WKLWindowStyles.slideLeft) {
                    cls += ' slide-left show';
                }
                else if (this.props.context.windowStyle === WKLWindowStyles.slideRight)
                    cls += ' slide-right show';
                else if (this.props.context.windowStyle === WKLWindowStyles.slideTop)
                    cls += ' slide-top show';
                else if (this.props.context.windowStyle === WKLWindowStyles.slideBottom)
                    cls += ' slide-bottom show';
            }
            else {
                if (this.props.context.windowStyle === WKLWindowStyles.maximize) {
                    cls += ' maximize';
                }
                else if (this.props.context.windowStyle === WKLWindowStyles.slideLeft) {
                    cls += ' slide-left';
                }
                else if (this.props.context.windowStyle === WKLWindowStyles.slideRight)
                    cls += ' slide-right';
                else if (this.props.context.windowStyle === WKLWindowStyles.slideTop)
                    cls += ' slide-top';
                else if (this.props.context.windowStyle === WKLWindowStyles.slideBottom)
                    cls += ' slide-bottom';
            }

            if (!Utils.isNullOrEmpty(this.props.className))
                cls = `${this.props.className} ${cls}`;
            // if (this.props.fullHeight === true)
            //     mainSectionClass = 'h-100 ';
        }
        else {
            cls = `wkl-dialog maximize`;
            mainSectionClass += (this.props.className || '');
        }
        const panelButtons = this.props.panelButtons || [];
        return (<div className={cls} >
            <div className={mainSectionClass + ' d-flex flex-row overflow-hidden'}>
                <div className='col' >
                    {this.renderBody()}
                </div>
                {this.renderPanelButtons(panelButtons)}
            </div>
            {this.props.loading === true && (<WKLOverlay loading={true} loadingText={this.props.loadingText} />)}
        </div >);
    }
    render() {
        let cls = 'top';
        let windowStyle = 'top';
        if (this.props.context)
            windowStyle = this.props.context.windowStyle || 'top';

        if (!Utils.isNullOrEmpty(this.props.containerClassName))
            cls = `${this.props.containerClassName} ${cls}`;
        if (windowStyle === WKLWindowStyles.left)
            cls = 'left';
        else if (windowStyle === WKLWindowStyles.center)
            cls = 'center';

        if (this.props.context && this.props.context.type === 'window') {
            if (windowStyle === WKLWindowStyles.slideLeft)
                cls = 'slide-left';
            else if (windowStyle === WKLWindowStyles.slideRight)
                cls = 'slide-right';
            else if (windowStyle === WKLWindowStyles.slideTop)
                cls = 'slide-top';
            else if (windowStyle === WKLWindowStyles.slideBottom)
                cls = 'slide-bottom';

            cls = `wkl-control wkl-window ${cls}`;
            return (<div className={cls} tabIndex={-1}>
                {this.renderModalWindow()}
            </div>);
        }
        else {
            cls = `wkl-control h-100 ${cls}`;
        }



        return (<div className={cls} tabIndex={-1}>
            {this.renderModalWindow()}
        </div>);
    }
}
WKLControl.contextType = WKLContext;
export { WKLControl };