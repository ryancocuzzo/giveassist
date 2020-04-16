import React, {Component} from 'react';
import Popup from 'react-popup';
import Analytics from '../../Modules/App/Analytics/Analytics.js';
import BasicInfo from '../../Modules/App/UserInfo/BasicInfo.js';
import PayAndPlanSelect from '../../Modules/App/UserInfo/PayAndPlanSelect.js';
import DeleteAccount from '../../Modules/App/UserInfo/DeleteAccount.js';
import Vote from '../../Modules/App/Vote/Vote.js';
import {TabbedSummary, TabbedContent} from '../../Modules/General/Tabbed/Tabbed.js';
import Composer from './Composer.js'; /* tabbed, analytics, basicInfo, deleteAcct, select */
import { voted, changedInfo, newPaymentInfoSubmitted, newPlanSubmitted, deleteUserAccount, getVoteJSON, getChartData,
    getUserData, getPrevEventData, getTotalDonated, getCurrentDonation, getUserInfo, login, logout } from '../../../Helper-Files/Temp-DB-Utils.js';
import {packaged} from '../../../Helper-Files/Error.js';

let sensei;  // composer json

export default class UISensei extends Component {
    constructor(props) {
        super(props);
        this.state = {sensei: null};
    }
    componentDidMount() {
        this.getSensei();
    }
    getSensei = () => {

        packaged('UISensei', async () => {

            /* Voting element */
            let vote_json = await getVoteJSON();
            const vote = Vote(vote_json.title, vote_json.queried_result.section_title, vote_json.queried_result.section_summary, vote_json.queried_result.section_events_info, vote_json.queried_result.voted_callback);

            /* Analytics element */
            let analytics_data = {
                chart: await getChartData(),
                user: await getUserData(),
                prevEvent: await getPrevEventData(),
                total_donated: await getTotalDonated(),
                current_donation: await getCurrentDonation()
            };
            const analytics = Analytics(analytics_data.chart, analytics_data.user, analytics_data.prevEvent, analytics_data.total_donated, analytics_data.current_donation);

            /* Basic Info element */
            let info = await getUserInfo();
            const basicInfo = BasicInfo(info?.name, info?.email, changedInfo);
            // console.log(newPlanSubmitted == null)
            // console.log(newPaymentInfoSubmitted == null)
            var select = <PayAndPlanSelect onSubmitPlan={newPlanSubmitted} onSubmitPayment={newPaymentInfoSubmitted}/>;
            /* Pay/Plan Select element */

            /* Modules - Standard */
            const deleteAcct = <DeleteAccount onDeleteAccount={deleteUserAccount}/>;

            /* navbar, tabbed, analytics, basicInfo, deleteAcct, select */
            sensei = {
                tabbed: vote,
                analytics: analytics,
                basicInfo: basicInfo,
                deleteAcct: deleteAcct,
                select: select
            };

            this.setState({sensei: sensei});


        });
    }
    render() {
        if (this.state.sensei)
            return (
                <div>
                    <Composer
                                tabbed={sensei.tabbed}
                                analytics={sensei.analytics}
                                basicInfo={sensei.basicInfo}
                                deleteAcct={sensei.deleteAcct}
                                select={sensei.select}
                            />
                </div>
            );
        else return <div>Sensei is in hiding..</div>
    }
}
