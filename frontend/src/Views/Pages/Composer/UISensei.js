import React, { Component } from 'react';
import Analytics from '../../Modules/App/Analytics/Analytics.js';
import BasicInfo from '../../Modules/App/UserInfo/BasicInfo.js';
import PayAndPlanSelect from '../../Modules/App/UserInfo/PayAndPlanSelect.js';
import DeleteAccount from '../../Modules/App/UserInfo/DeleteAccount.js';
import Vote from '../../Modules/App/Vote/Vote.js';
import Composer from './Composer.js';
import {
  voted, changedInfo, newPaymentInfoSubmitted, newPlanSubmitted,
  deleteUserAccount, getVoteJSON, getChartData, getUserData,
  getPrevEventData, getTotalDonated, getCurrentDonation, userBasicInfo
} from '../../../Helper-Files/Temp-DB-Utils.js';

export default class UISensei extends Component {
  constructor(props) {
    super(props);
    this.state = { sensei: null };
  }

  componentDidMount() {
    this.getSensei();
  }

  handle_changed_info = (name, email) => {
    changedInfo(name, email)
      .then((ok) => alert(ok))
      .catch((err) => alert(err));
  }

  handle_payinfo_update = (paymentToken) => {
    newPaymentInfoSubmitted(paymentToken)
      .then(() => alert('Successfully updated payment info.'))
      .catch((err) => alert(err));
  }

  handle_plan_update = (plan) => {
    newPlanSubmitted(plan)
      .then(() => alert('Successfully updated plan.'))
      .catch((err) => alert(err?.response?.data || 'Could not complete operation.'));
  }

  handle_ensure_acct_delete = async () => {
    if (window.confirm('Are you sure you would like to delete your account? This action cannot be undone.')) {
      alert('Sorry to see you go! Your account has been deleted.');
      await deleteUserAccount();
    }
  }

  getSensei = async () => {
    try {
      /* Voting element */
      const vote_json = await getVoteJSON();
      const vote = Vote(
        vote_json.title,
        vote_json.queried_result.section_title,
        vote_json.queried_result.section_summary,
        vote_json.queried_result.section_events_info,
        vote_json.queried_result.voted_callback
      );

      /* Analytics element */
      const analytics_data = {
        chart: await getChartData(),
        user: await getUserData(),
        prevEvent: await getPrevEventData(),
        total_donated: await getTotalDonated(),
        current_donation: await getCurrentDonation()
      };
      const analytics = Analytics(
        analytics_data.chart, analytics_data.user, analytics_data.prevEvent,
        analytics_data.total_donated, analytics_data.current_donation
      );

      /* Basic Info element */
      const info = await userBasicInfo();
      const basicInfo = BasicInfo(info?.name, info?.email, this.handle_changed_info);

      /* Pay/Plan Select element */
      const select = (
        <PayAndPlanSelect
          onSubmitPlan={this.handle_plan_update}
          onSubmitPayment={this.handle_payinfo_update}
        />
      );

      /* Delete Account element */
      const deleteAcct = DeleteAccount(this.handle_ensure_acct_delete);

      this.setState({
        sensei: { tabbed: vote, analytics, basicInfo, deleteAcct, select }
      });
    } catch (e) {
      console.error('Error loading dashboard:', e);
    }
  }

  render() {
    const { sensei } = this.state;
    if (sensei) {
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
    }
    return <div style={{ height: '1000px' }}></div>;
  }
}
