import * as cntrl from '../../../wkl-components';

export default class MainVM extends cntrl.VMBase {
    constructor(props) {
        super(props);
        this.init();

    }
    init() {
        const model = this.Data;
        if (Object.keys(model).length !== 0)
            return;

        model.Menus = [];
        model.ApplicationName = '';
        model.VersionNo = '';
        model.ShowLoading = false;

        //model.Menus.push({ ID: 'SMPL001', Text: 'Sample', Icon: 'grading', Url: 'Sample/SMPL001' });
        //model.Menus.push({ ID: 'SMPL005', Text: 'Sample', Icon: 'grading', Url: 'Sample/SMPL005' });


        //model.Menus.push({ ID: 'SMST001', Text: 'SMST001', Icon: 'grading', Url: 'SSMMaster/SMST001' });
        //model.Menus.push({ ID: 'SMST002', Text: 'SMST002', Icon: 'grading', Url: 'SSMMaster/SMST002' });
        //model.Menus.push({ ID: 'SMST003', Text: 'SMST003', Icon: 'grading', Url: 'SSMMaster/SMST003' });
        //model.Menus.push({ ID: 'MSTR', Text: 'Masters', Icon: 'settings', Url: 'Common/MenuContainer' });
        //model.Menus.push({ ID: 'SSM', Text: 'SSM Masters', Icon: 'settings', Url: 'Common/MenuContainer' });
        //model.Menus.push({ ID: 'SMPL004', Text: 'Sample4', Icon: 'grading', Url: 'Sample/SMPL004' });


        //model.Menus.push({ ID: 'SMPL005', Text: 'Sample5', Icon: 'grading', Url: 'Sample/SMPL005' });


        //model.Menus.push({ ID: 'HOME001', Text: 'SSM Group', Icon: 'grading', Url: 'Sample/HOME001' });
        //model.Menus.push({ ID: 'HOME002', Text: 'Home SSM', Icon: 'grading', Url: 'Sample/HOME002' });

        model.Menus.push({ ID: 'SSM', Text: 'SSM Masters', Icon: 'settings', Url: 'Common/MenuContainer' });
    }
    loadDefault() {

    }
}