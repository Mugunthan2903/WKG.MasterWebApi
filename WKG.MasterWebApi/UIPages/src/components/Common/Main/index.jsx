import React from 'react';
import * as cntrl from '../../../wkl-components';
import { Header } from '../Header';
import { SideBars } from '../SideBars';
import Footer from './Footer';
import MainVM from './MainVM';
import './index.css';

export default class Main extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new MainVM(props));
        this.inputRef = { Tab: null };
        this.attr = { type: 'tab', id: cntrl.Utils.getUniqueID(), parentID: this.props.context.id };
    }

    onLoad = (e) => {
        this.VM?.loadDefault();
    };
    onClosing = (e) => {
        return true;
    };
    setRef = (el, name) => {
        this.inputRef[name] = el;
    }
    handleMenuClick = (menu) => {
        if (this.inputRef.Tab && this.inputRef.Tab.addTab) {
            const tabs = [];
            const tabInfo = {
                title: menu.Text,
                text: menu.Text,
                key: menu.ID,
                url: menu.Url,
                destroyOnHide: true,
                isClosable: true,
                //data: { PropertyID: model.Property.ID, ClientID: Utils.AppInfo.ClientID }
            };
            tabs.push(tabInfo);
            this.inputRef.Tab.addTab(tabs);
        }
    }

    render() {
        const model = this.VM.Data;

        return (<cntrl.WKLControl hideTitleBar={true} className="h-100 w-100 " loading={model.ShowLoading} context={this.props.context}>
            <SideBars menus={model.Menus} onClick={this.handleMenuClick} />
            <div className="content-page">
                <div className="content">
                    <cntrl.WKLTab containerClass="p-2" className="col h-100 ps-0 pt-1" orientation="top" context={this.attr} ref={(el) => this.setRef(el, 'Tab')}></cntrl.WKLTab>
                    <Header />
                    <Footer />
                </div>
            </div>
        </cntrl.WKLControl>);
    }
}