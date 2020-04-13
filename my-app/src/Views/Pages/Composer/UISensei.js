import React, {Component} from 'react';
import Popup from 'react-popup';
import Analytics from '../../Modules/App/Analytics/Analytics.js';
import Navbar from '../../Modules/App/Nav/Navbar.js';
import BasicInfo from '../../Modules/App/UserInfo/BasicInfo.js';
import PayAndPlanSelect from '../../Modules/App/UserInfo/PayAndPlanSelect.js';
import DeleteAccount from '../../Modules/App/UserInfo/DeleteAccount.js';
import Vote from '../../Modules/App/Vote/Vote.js';
import {TabbedSummary, TabbedContent} from '../../Modules/General/Tabbed/Tabbed.js';
import Composer from './Composer.js'; /* tabbed, analytics, basicInfo, deleteAcct, select */
import { voted, changedInfo, newPaymentInfoSubmitted, newPlanSubmitted, deleteUserAccount, getVoteJSON, getChartData,
    getUserData, getPrevEventData, getTotalDonated, getCurrentDonation, getUserInfo } from '../../../Helper-Files/Temp-DB-Utils.js';
import {packaged} from '../../../Helper-Files/Error.js';

let sensei;  // composer json

packaged(async () => {
    /* Navbar element */
    const navbar = Navbar("give","assist",'login', '/', '/login');

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
    const basicInfo = BasicInfo(info.name, info.email, changedInfo);
    console.log(newPlanSubmitted == null)
    console.log(newPaymentInfoSubmitted == null)
    /* Pay/Plan Select element */
    const select = <PayAndPlanSelect onSubmitPlan={newPlanSubmitted} onSubmitPayment={newPaymentInfoSubmitted}/>;

    /* Modules - Standard */
    const deleteAcct = <DeleteAccount onDeleteAccount={deleteUserAccount}/>;

    /* navbar, tabbed, analytics, basicInfo, deleteAcct, select */
    sensei = {
        navbar: navbar,
        tabbed: vote,
        analytics: analytics,
        basicInfo: basicInfo,
        deleteAcct: deleteAcct,
        select: select
    };

});
export default class UISensei extends Component {
    render() {
        return (
            <div>
                return <Composer
                            navbar={sensei.navbar}
                            tabbed={sensei.tabbed}
                            analytics={sensei.analytics}
                            basicInfo={sensei.basicInfo}
                            deleteAcct={sensei.deleteAcct}
                            select={sensei.select}
                        />
            </div>
        );
    }
}
