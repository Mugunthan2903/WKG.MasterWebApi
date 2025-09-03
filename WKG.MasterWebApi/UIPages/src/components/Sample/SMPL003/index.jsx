import React from 'react';
import SMPL003VM from './SMPL003VM';
import * as cntrl from '../../../wkl-components';

export default class SMPL003 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SMPL003VM(props));
        this.inputRefs = {};
    }
    // called on load
    onLoad = () => {
        window.setTimeout(function () {
            if (this.VM)
                this.VM.loadInitData();
        }.bind(this), 100)
    }
    // called on closing
    onClosing = () => {
        return false;
    };
    clickAction = (e) => {
        if (this.VM) {
            if (e) {
                let action = e.id;
                if (action === undefined && e.target) {
                    action = e.target.name || e.target.id || '';
                    e = undefined;
                }
                if (!action) {
                    return;
                }
                try {
                    if (e && e.stopPropagation) {
                        e.stopPropagation();
                        e.preventDefault();
                        e.nativeEvent.stopImmediatePropagation();
                    }
                } catch (ex) { }
                if (action == "btn_close") {
                    this.VM.doClose(e);
                }
            }
        }
    }
    handleTabClick = (tabId) => {
        const model = this.VM.Data;
        model.TabId = tabId;
    };
    render() {
        const model = this.VM.Data;
        let title = '';
        let showloading = false;
        if (this.VM && this.VM.Data) {
            showloading = model.Loading;
            title = model.Title;

        }
        return (
            <cntrl.WKLControl wrapperClass="modal-xl-12" loading={showloading} title={title}
                showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
                <div className="container mt-5" style={{ width: "30rem" }}>
                    <ul className="nav nav-tabs" id="myTab" role="tablist">
                        {model.Tabs && model.Tabs.map(tab => (
                            <li className="nav-item" role="presentation" key={tab.id}>
                                <button
                                    className={`nav-link ${model.TabId === tab.id ? 'active' : ''}`}
                                    onClick={() => this.handleTabClick(tab.id)}
                                    id={`${tab.id}-tab`}
                                    data-bs-toggle="tab"
                                    data-bs-target={`#${tab.id}`}
                                    type="button"
                                    role="tab"
                                    aria-controls={tab.id}
                                    aria-selected={model.TabId === tab.id}
                                >
                                    {tab.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className="tab-content" id="myTabContent">
                        {model.Tabs && model.Tabs.map(tab => (
                            <div
                                className={`tab-pane fade ${model.TabId === tab.id ? 'show active' : ''}`}
                                id={tab.id}
                                role="tabpanel"
                                aria-labelledby={`${tab.id}-tab`}
                                key={tab.id}
                            >
                                <h3>{tab.label}</h3>
                                {/* <p>{tab.content}</p> */}
                                {tab.id === "home" && < p > {tab.id}</p>}
                                {tab.id === "profile" && < p > {tab.id}</p>}
                                {tab.id === "contact" && < p > {tab.id}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </cntrl.WKLControl >
        )
    }
}