import { Utils, VMBase } from "../../../wkl-components";

export class MenuContainerVM extends VMBase {
    constructor(props) {
        super(props);
        this.init();

    }
    init() {
        const model = this.Data;
        if (Object.keys(model).length !== 0)
            return;
        model.Search = '';
        model.Loading = false;
        model.UniqueID = Utils.getUniqueID();
        model.Caption = 'Masters';
        model.Menus = [];
        model.FormType = "M";//"R"
        if (this.props.data) {
            model.FormType = this.props.data.formType || 'M';
        }
        if (model.FormType === 'M') {
            model.Caption = 'Masters';
        }
        else
            model.Caption = 'Reports';
    }

    loadMenus() {
        const model = this.Data;

        const menus = [];
        //  let mnu = this.getMenuItem('SSMMaster', 'Masters', false);
        //  mnu.Items.push(this.getMenuItem(`SMST054`, `SMSTDTable`, true));
        // menus.push(mnu);


        // let mnu1 = this.getMenuItem('SSMMaster', 'Masters', false);
        // mnu1.Items.push(this.getMenuItem(`SMST001`, `SMST001`, true));
        // mnu1.Items.push(this.getMenuItem(`SMST002`, `SMST002`, true));
        // mnu1.Items.push(this.getMenuItem(`SMST003`, `SMST003`, true));
        // mnu1.Items.push(this.getMenuItem(`SMST004`, `SMST004`, true));
        //mnu1.Items.push(this.getMenuItem(`SMST010`, `SMST010`, true));
        // mnu1.Items.push(this.getMenuItem(`SMST015`, `SMST015`, true));
        // mnu1.Items.push(this.getMenuItem(`SMST020`, `SMST020`, true));
        // mnu1.Items.push(this.getMenuItem(`SMST030`, `SMST030`, true));
        // mnu2.Items.push(this.getMenuItem(`SSM040`, `Manage Tui`, true));


        //menus.push(mnu1);

        let mnu2 = this.getMenuItem('SSM', 'SSM', false);

        mnu2.Items.push(this.getMenuItem(`SSM010`, `Group Master`, true));
        mnu2.Items.push(this.getMenuItem(`SSM005`, `Refresh SSM`, true));
        mnu2.Items.push(this.getMenuItem(`SSM040`, `Data Master`, true));
        mnu2.Items.push(this.getMenuItem(`SSM090`, `Arena Location Details`, true));

        mnu2.Items.push(this.getMenuItem(`SSM020`, ` Manage Tui`, true));
        mnu2.Items.push(this.getMenuItem(`SSM030`, ` Manage Ltd`, true));
        //mnu2.Items.push(this.getMenuItem(`SSM050`, `Manage Big Bus`, true));
        mnu2.Items.push(this.getMenuItem(`SSM100`, `Manage Ventrata`, true));
        mnu2.Items.push(this.getMenuItem(`SSM130`, `Manage Distribusion`, true));
        mnu2.Items.push(this.getMenuItem(`SSM150`, `Manage National Express`, true));
        mnu2.Items.push(this.getMenuItem(`SSM060`, `Manage London Pass`, true));
        mnu2.Items.push(this.getMenuItem(`SSM080`, `Manage Explorer Pass`, true));
        
        mnu2.Items.push(this.getMenuItem(`SSM110`, `Manage Tour Category`, true));
        mnu2.Items.push(this.getMenuItem(`SSM120`, `Manage Product by City`, true));

        mnu2.Items.push(this.getMenuItem(`SSM070`, `Api Config`, true));
        mnu2.Items.push(this.getMenuItem(`SSM160`, `Terms & Conditions`, true));

        menus.push(mnu2);
        // for (let i = 0; i < 30; i++) {
        //     let smnu = this.getMenuItem(`MST0${i}`, `Masters - ${i}`, true);
        //     mnu.Items.push(smnu);
        // }

        // mnu = this.getMenuItem('CNBREPORT', 'CNBReports', false);
        // for (let i = 0; i < 10; i++) {
        //     let smnu = this.getMenuItem(`CRTP0${i}`, `CNB Report - ${i}`, true);
        //     mnu.Items.push(smnu);
        // }
        // menus.push(mnu);

        model.Menus = menus;

        this.updateUI();
    }
    getMenuItem(id, name, isSubitem) {
        return { ID: id, Text: name, isSubitem: isSubitem, IsActive: false, IsOpen: false, Items: [], IsExpanded: false, Visible: true };
    }
    setActive(item) {
        const model = this.Data;
        for (const mnu of model.Menus) {
            for (const itm of mnu.Items) {
                itm.IsActive = item === itm;
            }
        }
    }
    filterItems() {
        const model = this.Data;
        let filterSearch = model.Search.toLowerCase();
        if (Utils.isNullOrEmpty(model.Search)) {
            for (const mnu of model.Menus) {
                mnu.Visible = true;
                for (const itm of mnu.Items) {
                    itm.Visible = true;
                }
            }
        }
        else {
            for (const mnu of model.Menus) {
                mnu.Visible = false;
                for (const itm of mnu.Items) {
                    if (itm.Text.toLowerCase().includes(filterSearch)) {
                        itm.Visible = true;
                        mnu.Visible = true;
                    }
                    else
                        itm.Visible = false;
                }
            }
        }
    }
}