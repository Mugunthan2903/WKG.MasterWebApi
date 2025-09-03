import React from 'react';
import * as cntrl from './wkl-components';
import './App.css';
import * as bs from 'bootstrap';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.isReload = false;
    this.state = {
      ready: false,
      authenticated: false
    };
    cntrl.Utils.AppInfo = cntrl.Utils.AppInfo || {};
    cntrl.Utils.setUserAccessUrl('Common/Authentication');
    cntrl.Utils.setReportControlUrl('Common/ReportViewer');
  }
  componentDidMount() {
    cntrl.Utils.adjustUIBasedOnResolution();
    this._subscription = cntrl.ApiManager.subscribe((e) => this.events(e));
    if (cntrl.ApiManager.isAuthenticated()) {
      this.isReload = true;
    }
  }
  componentWillUnmount() {
    cntrl.ApiManager.unsubscribe(this._subscription);
  }
  populateAuthenticationState() {
    const authenticated = cntrl.ApiManager.isAuthenticated();
    if (authenticated === true) {
      this.setState({ ready: false, authenticated });
      this.setAppInfo();
    }
    else
      this.setState({ ready: false, authenticated });
  }
  setAppInfo() {

    cntrl.Utils.ajax({ url: 'General/GetAppInfoAsync', data: null }, (r) => {
      try {
        r = r || {};
        const extraInfo = r.ExtraInfo || {};
        extraInfo.Masters = extraInfo.Masters || [];
        extraInfo.AccessibleForms = extraInfo.AccessibleForms || [];
        cntrl.Utils.setUserAccess(extraInfo);
      }
      catch { }
      finally {
        this.setState({ ...this.state, ready: true });
      }
    });

  }
  async events(e) {
    if (e.action === cntrl.Msgs.Signin) {
      this.populateAuthenticationState();
    }
    else if (e.action === cntrl.Msgs.ApiUrlLoaded) {
      cntrl.Utils.ConfigInfo = cntrl.ApiManager.getApiConfig();
      cntrl.Utils.AppInfo = cntrl.Utils.AppInfo || {};
      this.loadErrorMsgs();
      if (this.isReload === true) {
        let result = await cntrl.ApiManager.resignIn();
        if (result === true) {
          const authenticated = cntrl.ApiManager.isAuthenticated();
          if (authenticated === true) {
            this.setState({ ready: false, authenticated });
            this.setAppInfo();
          }
          else
            this.setState({ ready: false, authenticated });
        }
        else {
          cntrl.ApiManager._updateState(undefined);
          this.setState({ ready: true });
        }
      }
      else {
        this.checkSessionInfo();
      }
    }
  }
  checkSessionInfo() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('t');
    if (cntrl.Utils.isNullOrEmpty(token)) {
      this.setState({ ready: true });
      this.forceUpdate();
      return;
    }
    let loginInfo = {};
    loginInfo.Token = token;
    cntrl.Utils.loginAjax(loginInfo, (r) => {
      try {
        r = r || null;
        if (r?.UserValid === true) {
          let newUrl = window.location.href.replace(window.location.search, "");
          window.history.pushState({}, null, newUrl);
        }
        else {
          this.isReload = true;
          this.setState({ ready: true });
        }
      }
      catch { }
      finally {
      }
    });
  }
  loadErrorMsgs() {
    cntrl.Utils.ajax({ url: 'General/GetErrorMessagesAsync', data: null }, (r) => {
      cntrl.Utils.setMessages(r || []);
    });
  };
  render() {
    let attr = { context: { parentID: 'HPOS' } };
    if (this.state.ready === false) {
      attr.context.id = 'SPLASH_ID';
      attr.id = "SPLASH_ID";
      attr.key = "SPLASH_ID";
      attr.url = "Common/SplashScreen";
      return (<div className='col'>
        <cntrl.WKLContainer className=" container-fluid  h-100 m-0 p-0" {...attr}></cntrl.WKLContainer>
      </div>);
    }
    else {
      if (this.state.authenticated === true) {

        attr.context.id = 'MAIN_APP';
        attr.key = "MAIN_APP";
        attr.id = "MAIN_APP";
        attr.url = "Common/Main";
        attr.data = null
        return (<cntrl.WKLTooltip className="col">
          <cntrl.WKLContainer className="container-fluid  h-100 m-0 p-0" {...attr}>
          </cntrl.WKLContainer>
        </cntrl.WKLTooltip>);
      }
      else {
        const userInfo = cntrl.ApiManager.getUser();
        attr.context.id = 'LOGIN_ID';
        attr.id = "LOGIN_ID";
        attr.key = "LOGIN_ID";
        attr.url = "Common/Login";
        attr.data = { User: userInfo };
        return (<cntrl.WKLContainer className="col container-fluid  h-100 m-0 p-0" {...attr}>
        </cntrl.WKLContainer>);
      }
    }
  }
}