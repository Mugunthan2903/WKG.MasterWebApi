import React from 'react'
import * as cntrl from '../../../wkl-components'
import AuthenticationVM from './AuthenticationVM';

const colStyle = { width: '200px' };

export default class Authentication extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new AuthenticationVM(props));
        this.inputRefs = {};
    }
    onChange = (e) => {
        if (this.VM) {
            const model = this.VM.Data.Input;
            let name = '';
            if (e.name) {
                model[e.name] = e.value;
                name = e.name;
            }
            else if (e.target && e.target.name) {
                name = e.target.name;
                model[e.target.name] = e.target.value;
            }
            this.updateUI();
        }
    };
    onClosing = () => {
        this.clickAction({ id: 'btn_close' });
        return false;
    };
    clickAction = (e) => {
        if (this.VM) {
            console.log('clickAction');
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

                if (action === "btn_login") {
                    this.VM.doSave(e);
                }
                else if (action == "btn_close") {
                    this.VM.doClose(e);
                }
            }
        }
    }
    onRefChange(el, name) {
        this.inputRefs[name] = el;
    }
    setFocus = (name) => {
        try {
            if (this.inputRefs[name] && this.inputRefs[name].focus) {
                try {
                    this.inputRefs[name].focus(true);
                }
                catch {
                    this.inputRefs[name].focus();
                }
            }
        } catch { }
    }

    render() {
        let model = this.VM.Data;
        let dataModel = model.Input;
        const owner = this;
        return (<cntrl.WKLControl loading={model.ShowLoading} title="Authenticate" onClose={this.onClosing} context={this.props.context}>
            <div className="window-content-area p-3" >
                <div className="row">
                    <div className="col-auto">
                        <div className="mb-2 " style={colStyle}>
                            <label className="form-label" >Login ID<span className="text-danger text-mandatory">*</span></label>
                            <cntrl.WKLTextbox ref={(el) => this.onRefChange(el, 'LoginID')} name="LoginID" value={dataModel.LoginID} id="LoginID" maxLength={100} placeholder="Enter your login id" onChange={this.onChange} />
                        </div>
                        <div className="mb-2 " style={colStyle}>
                            <label className="form-label" >Password <span className="text-danger text-mandatory">*</span></label>
                            <cntrl.WKLTextbox className="w-100" inputType="password" ref={(el) => this.onRefChange(el, 'Password')} name="Password" value={dataModel.Password} id="Password" maxLength={100} placeholder="Enter your password" onChange={this.onChange} />
                        </div>
                    </div >
                </div >
            </div>
            <div className="window-button-area">
                <div className="row" >
                    <div className="col-md-12">
                        <div className="float-end me-1">
                            <button type="button" hot-key="A" className="btn btn-sm btn-save1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_login' })}><i className="fas fa-lock-open me-1"></i>Authorize</button>
                            <button type="button" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_close' })}><i className="fa fa-close me-1"></i>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </cntrl.WKLControl>
        );
    }
}