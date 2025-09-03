import './index.css';
import * as cntrl from '../../../wkl-components';
import { HeaderVM } from './HeaderVM';
import { useCallback, useEffect, useRef, useState } from 'react';

export class Header extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new HeaderVM(props));
        this._subscription = null;
        this.clickAction = this.clickAction.bind(this);
    }
    componentDidMount() {
        this._subscription = cntrl.ApiManager.subscribe((e) => this.onEvents(e));
        cntrl.ApiManager.startSessionTimeout();
    }
    componentWillUnmount() {
        cntrl.ApiManager.unsubscribe(this._subscription);
    }
    onEvents(e) {
        if (this.VM) {
            if (e.action === cntrl.Msgs.SessionTimeout) {
                this.VM.lockAppln({}, false);
            }
        }
    }
    clickAction(e) {
        if (e.name === 'btn_lock') {
            this.VM.lockAppln(e, true);
        }
        else if (e.name === 'btn_logout') {
            this.VM.signOutAppln(e, true);
        }
        else if (e.name === 'btn_change_password') {
            this.VM.changeAccPassword(e, true);
        }
        else if (e.name === 'btn_my_account') {
            this.VM.updateProfile(e, true);
        }
    }

    render() {
        const model = this.VM.Data;

        var user = cntrl.Utils.getUserInfo();
        let name = '';
        let siteName = '';
        if (user) {
            name = user.Name;
        }
        let isMale = true;
        let userIcon = 'assets/images/users/user-female.jfif';
        if (isMale === true)
            userIcon = 'assets/images/users/user-male.jfif';

        let dropdownMenuButton2 = `${model.UniqueID}_dropdownMenu2`;

        return (<div className="navbar-custom d-flex flex-row flex-nowrap wkl-navbar-top bg-primary">
            <div className="col-auto d-inline-flex align-items-center">
                <span className='fw-bold fs-3 text-white'>{siteName}</span>
            </div>
            <div className="col">
            </div>
            <FontSizeUI />
            <FullScreen />
            <ul className="col-auto d-inline-flex jsutify-content-center align-items-center list-unstyled topbar-menu float-end mb-0 bg-primary text-white">
                <li className="dropdown notification-list bg-primary text-white">
                    <a
                        className="nav-link dropdown-toggle nav-user arrow-none me-0 bg-primary text-white border-0"
                        data-bs-toggle="dropdown"
                        id={dropdownMenuButton2}
                        href="#"
                        role="button"
                        aria-haspopup="false"
                        aria-expanded="false"
                    >
                        <span className="account-user-avatar">
                            <img
                                src={userIcon}
                                alt="user-image"
                                width="30"
                                className="rounded-circle"
                            />
                        </span>
                        <span>
                            <span className="account-user-name text-white pt-2">{name}</span>
                        </span>
                    </a>
                    <div aria-labelledby={dropdownMenuButton2} className="dropdown-menu dropdown-menu-end dropdown-menu-animated topbar-dropdown-menu profile-dropdown">
                        <div className=" dropdown-header noti-title">
                            <h6 className="text-overflow m-0">Welcome !</h6>
                        </div>
                        {/* <a href="#" className="dropdown-item notify-item dd-items" name="btn_my_account" onClick={() => this.clickAction({ name: 'btn_my_account' })}>
                            <span className="material-icons">
                                account_circle
                            </span>
                            <span>Profile</span>
                        </a> */}
                        <a href="#" className="dropdown-item notify-item dd-items" name="btn_change_password" onClick={() => this.clickAction({ name: 'btn_change_password' })}>
                            <span className="material-icons">
                                password
                            </span>
                            <span>Change Password</span>
                        </a>
                        <a href="#" className="dropdown-item notify-item dd-items" name="btn_lock" onClick={() => this.clickAction({ name: 'btn_lock' })}>
                            <span className="material-icons">
                                lock
                            </span>
                            <span>Lock Screen</span>
                        </a>
                        <a href="#" className="dropdown-item notify-item dd-items" name="btn_logout" onClick={() => this.clickAction({ name: 'btn_logout' })}>
                            <span className="material-icons">
                                logout
                            </span>
                            <span>Logout</span>
                        </a>
                    </div>
                </li>
            </ul>
        </div>);
    }
}

const FullScreen = () => {
    const [state, setState] = useState({ ui: false });
    let cmpnt = null;

    function onResize(evt) {
        setState({ ui: !state.ui });
    }

    useEffect(() => {
        document.addEventListener("fullscreenchange", onResize);
        return () => {
            document.removeEventListener("fullscreenchange", onResize);
        };
    });

    if (cntrl.Utils.canOpenFullScreen()) {
        if (cntrl.Utils.isFullScreen()) {
            cmpnt = (<div className='col-auto d-inline-flex align-items-center text-white cursor-pointer' title='Exit full screen' onClick={() => { cntrl.Utils.fullScreenUI(); }}>
                <i className="material-icons" >close_fullscreen</i>
            </div>);
        }
        else {
            cmpnt = (<div className='col-auto d-inline-flex align-items-center  text-white cursor-pointer' title='Full screen' onClick={() => { cntrl.Utils.fullScreenUI(); }}>
                <i className="material-icons" >fullscreen</i>
            </div>);
        }
    }
    return cmpnt;
};

const FontSizeUI = () => {
    const cntrl = useRef();
    useEffect(() => {
        cntrl.current = { defaultValue: 13.6, value: 13.6, change: 1 };
        const fs = getComputedStyle(document.querySelector('html')).fontSize;
        let value = parseFloat(fs);
        cntrl.current.defaultValue = value;
        cntrl.current.value = value;
    }, []);

    function onIncrease(evt) {
        cntrl.current.value = cntrl.current.value + cntrl.current.change;
        document.querySelector('html').style.fontSize = `${cntrl.current.value}px`;
    }
    function onReset(evt) {
        document.querySelector('html').style.fontSize = `${cntrl.current.defaultValue}px`;
    }
    function onDecrease(evt) {
        cntrl.current.value = cntrl.current.value - cntrl.current.change;
        document.querySelector('html').style.fontSize = `${cntrl.current.value}px`;
    }

    return (<div className='col-auto d-inline-flex flex-row align-items-center justify-content-center wkl-fs-container me-2'>
        <span title='Increase text size' onClick={onIncrease}>A+</span>
        <span title='Reset text size' onClick={onReset}>A</span>
        <span title='Decrease text size' onClick={onDecrease}>A-</span>
    </div>);
};