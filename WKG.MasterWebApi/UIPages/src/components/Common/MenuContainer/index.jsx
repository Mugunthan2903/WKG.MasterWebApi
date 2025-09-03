import * as cntrl from '../../../wkl-components';
import { MenuContainerVM } from './MenuContainerVM';
import './index.css';

export default class MenuContainer extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new MenuContainerVM(props));
        this.inputRef = {};
        this._containerHeight = -1;
    }
    onLoad = (e) => {
        this.VM?.loadMenus();
    }
    onClosing = () => {
        return true;
    }
    addItemOnTab(e) {

        const item = e.item;
        const parent = e.parent;

        item.IsActive = true;
        item.IsOpen = true;
        this.VM.setActive(item);

        //alert('Not Implemented!');
        if (this.inputRef.Tab && this.inputRef.Tab.addTab) {

            const data = {
                Title: item.Text
            };
            const tabs = [];
            const tab = {
                parentItem: item,
                title: item.Text,
                text: item.Text,
                key: item.ID,
                url: `${parent.ID}/${item.ID}`,
                data: data,
                destroyOnHide: true,
                isClosable: true,
                closeAndOpen: false,
                onClose: (e) => {
                    try {
                        item.IsActive = false;
                        item.IsOpen = false;
                        tab.parentItem = undefined;
                    }
                    catch (ex) {
                    }
                    finally {
                        this.updateUI();
                    }
                }
            };
            tabs.push(tab);
            this.inputRef.Tab.addTab(tabs);
        }
        this.updateUI();
    }
    onItemClick = (e) => {
        if (e.event && e.event.preventDefault) {
            e.event.preventDefault();
            e.event.stopPropagation();
        }
        this.addItemOnTab(e);
    }
    onTabChanged = (e) => {
        if (this.VM) {
            e.item.parentItem.IsActive = true;
            if (e.oldItem)
                e.oldItem.parentItem.IsActive = false;
            this.updateUI();
        }
    };
    onChange = (e) => {
        if (this.VM) {
            this.VM.Data[e.name] = e.value;
            this.VM.filterItems();
            this.updateUI();
        }
    };
    setRef = (el, name) => {
        this.inputRef[name] = el;
        if (name === 'TabContainer' && el) {
            if (this._containerHeight < 0) {
                const dom = el.getBoundingClientRect();
                this._containerHeight = dom.height;
            }
        }
    }

    renderLeft() {
        const model = this.VM.Data;

        return (<ul className="list-unstyled mb-0 py-3 pt-1 ">
            {model.Menus.map(mn => {
                if (mn.Visible === false)
                    return null;

                let id = `${model.UniqueID}_mnu_${mn.ID}`;
                return (<li key={id} className="mb-1 position-relative">
                    <span className="btn d-inline-flex align-items-center w-100 text-uppercase" data-bs-toggle="collapse" data-bs-target={"#" + id} aria-expanded="true">
                        {mn.Text}
                    </span>
                    <div className="collapse show" id={id}>
                        <ul className="list-unstyled fw-normal pb-1 ">
                            {mn.Items.map(mni => {
                                if (mni.Visible === false)
                                    return null;

                                let cls = '';
                                if (mni.IsOpen === true)
                                    cls += ' mnu-selected';
                                if (mni.IsActive === true)
                                    cls += ' mnu-active';

                                return (<li key={`${id}_${mni.ID}`} className={cls}>
                                    <a href="#" className="d-inline-flex align-items-center" onClick={e => this.addItemOnTab({ event: e, item: mni, parent: mn })}>{mni.Text}</a>
                                </li>);
                            })}
                        </ul>
                    </div>
                </li>);
            })}
        </ul>);
    }
    renderRight() {
        const attr = { type: 'tab', id: 'MASTER-TAB', parentID: this.props.context.id };
        return (<cntrl.WKLTab scrollableY={true} orientation={cntrl.WKLTabOrientations.bottom} className="col h-100" onSelectionChanged={this.onTabChanged} containerClass="ps-2" context={attr} ref={(el) => this.setRef(el, 'Tab')}>
            <div className='w-100 h-100 border border-start-0 wkl-emtpy-container'></div>
        </cntrl.WKLTab>);
    }

    render() {
        let model = { Search: '' };
        if (this.VM) {
            model = this.VM.Data;
        }

        const style = {};


        return (<cntrl.WKLControl showBorder={false} className="h-100" hideTitleBar={true} title="Masters" loading={model.Loading} onClose={this.onClosing} context={this.props.context}>
            <div className="container-fluid h-100 gx-0">
                <div className="row h-100">
                    <div className="col-auto  pe-0 mnu-cntnr-leftside">
                        <div className="card h-100 shadow-sm">
                            <div className="card-body position-relative ">
                                <div className="scrollable-container w-100" >
                                    <div className="scrollable-section">
                                        <div className="scrollable-content bd-links p-3">
                                            {this.renderLeft()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-header border-top bg-white p-1">
                                <cntrl.WKLTextbox className="shadow-sm" iconClass="fas fa-search search-icon" name="Search" value={model.Search} onChange={this.onChange} maxLength={200} placeholder="Search" />
                            </div>
                        </div>
                    </div>
                    <div className="col h-100 position-relative ps-0" style={style} ref={(el) => this.setRef(el, 'TabContainer')}>
                        <div className="scrollable-container h-100  w-100" >
                            <div className="col scrollable-section">
                                <div className="scrollable-content pe-3">
                                    {this.renderRight()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </cntrl.WKLControl>);
    }
}