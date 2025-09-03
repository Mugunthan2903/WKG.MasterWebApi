import * as cntrl from './../../../wkl-components';

export default class GNM002VM extends cntrl.VMBase {
    constructor(props) {
        super(props);

        if (Object.keys(this.Data).length > 0)
            return;

        this.Data.IsLoading = true;

        this.Data.Genders = [{ ID: 'M', Text: 'Male' }, { ID: 'F', Text: 'Female' }];
        this.Data.StatusList = [{ ID: 'A', Text: 'Active' }, { ID: 'I', Text: 'Inactive' }];
        this.Data.Search = {
            Name: '',
            Gender: null
        };

        this.Data.ID = null;
        if (this.props.data) {
            this.Data.ID = this.props.data.ID;
        }
    }

    initDataLoad() {

        this.Data.IsLoading = true;
        this.updateUI();
        const dataInfo = { Text: '' };
        cntrl.Utils.ajax({ url: 'Sample\GetPageDataAsync', data: dataInfo }, r => {
            try {
                this.Data.IsLoading = false;
                this.Data.StatusList = r || [];
            }
            catch (ex) { }
            finally {
                this.updateUI();
            }
        });
    }
}