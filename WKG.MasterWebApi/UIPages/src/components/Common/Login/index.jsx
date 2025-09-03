import React from 'react';
import * as cntrl from '../../../wkl-components';
import './index.css';
import LoginVM from './LoginVM';
import Logo from './Logo'
import $ from 'jquery';


export default class Login extends cntrl.WKLComponent {
    _hasOverflow = false;
    constructor(props) {
        super(props, new LoginVM(props));
        this.inputRefs = {};
        console.log(`Login ------------ ${props.context.id}`);
    }
    componentDidMount() {
        const bdy = $('body');
        this._hasOverflow = bdy.hasClass('overflow-hidden');
        if (this._hasOverflow === false)
            $('body').addClass('overflow-hidden');

        let focusControl = 'LoginID';
        if (this.VM) {
            let model = this.VM.Data;
            if (localStorage.wkl_poschkbox && localStorage.wkl_poschkbox != '') {
                model.RememberMe = true;
                model.LoginID = localStorage.wkl_posloginid || '';
                focusControl = 'Password';
            } else {
                model.RememberMe = false;
            }
            this.updateUI();
        }
    }
    componentWillUnmount() {
        if (this._hasOverflow === false)
            $('body').removeClass('overflow-hidden');
    }
    onLoad = (e) => {
        super.onLoad(e);
        if (this.props.data && this.props.data.IsLocked === true)
            this.setFocus('Password');
        else
            this.setFocus('LoginID');
    };
    onRefChange = (e, name) => {
        this.inputRefs[name] = e;
    }
    onCheckChange = (e) => {
        if (this.VM) {
            const model = this.VM.Data;
            model[e.target.name] = e.target.checked;
            this.VM.updateUI();
        }
    }
    onChange = (e) => {
        if (this.VM) {
            if (e.name || e.target.name) {
                const model = this.VM.Data;
                if (e.name)
                    model[e.name] = e.value;
                else if (e.target.name)
                    model[e.target.name] = e.target.value;
                this.VM.updateUI();
            }
        }
    };
    clickAction = (e, dataModel) => {
        if (dataModel) {
            this.VM.Data.SelectedHotel = dataModel;
            this.VM.LoginUser(e);
        }
        else if (this.VM) {
            if (this.props.data && this.props.data.IsLocked === true) {
                if (e.target) {
                    if (e.target.name === "btn_unlock") {
                        this.VM.sessionUnlock();
                    }
                    else if (e.target.name === "btn_signin" || e.name === 'btn_signin') {
                        window.location.reload();
                        if (e && e.stopPropagation) {
                            e.stopPropagation();
                            e.preventDefault();
                            e.nativeEvent.stopImmediatePropagation();
                        }
                    }
                }
            }
            else {
                this.VM.LoginUser(e);
            }
        }
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
    renderLocked() {
        const model = this.VM.Data;
        return (<div className="card-body p-4">
            <div className="text-center w-75 m-auto">
                <img src='assets/images/logo.png' style={{ width: '200px' }}></img>
                <h4 className="text-dark-50 text-center mt-3 fw-bold">Hi ! {model.Name} </h4>
                <p className="text-muted mb-4">Enter your password to access the account.</p>
            </div>
            <form action="#">
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <cntrl.WKLTextbox className="w-100" inputType="password" ref={(el) => this.onRefChange(el, 'Password')} name="Password" value={model.Password} id="Password" maxLength={100} placeholder="Enter your password" onChange={this.onChange} />
                </div>
                <div className="mb-0 text-center">
                    <button name="btn_unlock" className="btn btn-primary" type="button" onClick={this.clickAction}>Log In</button>
                </div>
            </form>
        </div>);
    }
    renderLogin() {
        const model = this.VM.Data;
        return (<div className="row" >
            <div className="col-md-6 d-none d-md-block wkl-login-box-leftcol position-relative" >
                <img src='assets/images/logo.png' className='position-absolute' style={{ left: '30px', top: '30px', width: '200px' }}></img>
                {/* <Logo></Logo> */}
                <img src='assets/images/login-abstract.png'></img>

            </div>
            <div className="col-md-6 right-column wkl-login-box-rightcol" >
                <div className="d-flex align-items-start flex-column justify-content-center w-100 h-100 ">
                    <h3>Welcome to We Know Group<sup>&reg;</sup></h3>
                    <h4> Sign in to WKG </h4>
                    <div className="mb-3 w-100">
                        <label htmlFor="LoginID" className="form-label fw-bold">Login ID</label>
                        <cntrl.WKLTextbox ref={(el) => this.onRefChange(el, 'LoginID')} name="LoginID" value={model.LoginID} id="LoginID" maxLength={100} placeholder="Enter your login id" onChange={this.onChange} />
                    </div>
                    <div className="mb-3 w-100">
                        <label htmlFor="password" className="form-label fw-bold">Password</label>
                        <cntrl.WKLTextbox className="w-100" inputType="password" ref={(el) => this.onRefChange(el, 'Password')} name="Password" value={model.Password} id="Password" maxLength={100} placeholder="Enter your password" onChange={this.onChange} />
                    </div>
                    <div className="row w-100">
                        <div className="col-md-12 col-sm-12 col-lg-6">
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input" id="checkbox-signin" checked={model.RememberMe} name="RememberMe" onChange={this.onCheckChange} />
                                <label className="form-check-label" htmlFor="checkbox-signin" >Remember me</label>
                            </div>
                        </div>
                        <div className="col-md-12 col-sm-12 forgot-pass col-lg-6">
                            <a href="#" className="" tabIndex={-1}>Forgot Password?</a>
                        </div>
                    </div>
                    <div className="row w-100 mt-3">
                        <div className="col-md-12">
                            <button name="btn_signin" className="btn btn-primary" type="button" onClick={this.clickAction}> Log In </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>);
    }
    render() {
        const model = this.VM.Data;
        let cmpnt = null;
        let cmpnt1 = null;
        let boxWdth = 'w-100';
        if (this.props.data && this.props.data.IsLocked === true) {
            cmpnt = this.renderLocked();
            cmpnt1 = (<div className="row mt-3">
                <div className="col-12 text-center">
                    <p className="text-muted">Not you? return <a onClick={(e) => this.clickAction({ name: 'btn_signin', target: e.target })} href="#" name="btn_signin" className="text-muted ms-1 pointer"><b >Sign In</b></a></p>
                </div>
            </div>);
        }
        else
            cmpnt = this.renderLogin();

        return (<cntrl.WKLControl hideTitleBar={true} containerClassName="wkl-dialog-hoster" className="h-100 w-100 " loading={model.ShowLoading} loadingText="Authenicating...." context={this.props.context} >
            <div className="vw-100 vh-100 overflow-hidden  d-flex flex-row align-items-center justify-content-center wkl-login-container" >
                <div className={[boxWdth, "bg-white rounded-3 shadow-lg wkl-login-box", this.props.data && this.props.data.IsLocked ? "wkl-login-box-locked" : ''].join(" ")} >
                    {cmpnt}{cmpnt1 && cmpnt1}
                </div>
            </div>
        </cntrl.WKLControl>);
    }
}