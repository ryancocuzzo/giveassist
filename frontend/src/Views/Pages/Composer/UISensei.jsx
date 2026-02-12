import React, { Component } from 'react';
import Analytics from '../../Modules/App/Analytics/Analytics.jsx';
import BasicInfo from '../../Modules/App/UserInfo/BasicInfo.jsx';
import PayAndPlanSelect from '../../Modules/App/UserInfo/PayAndPlanSelect.jsx';
import DeleteAccount from '../../Modules/App/UserInfo/DeleteAccount.jsx';
import Vote from '../../Modules/App/Vote/Vote.jsx';
import Composer from './Composer.jsx';
import vars from '../../../Helper-Files/variables.js';
import {
  voted, changedInfo, newPaymentInfoSubmitted, newPlanSubmitted,
  deleteUserAccount, getVoteJSON, getChartData, getUserData,
  getPrevEventData, getTotalDonated, getCurrentDonation, userBasicInfo,
  loadSenseiDataForDemo
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
      let vote_json, analytics_data, info;

      if (vars.DEMO_MODE) {
        const demoData = await loadSenseiDataForDemo();
        vote_json = demoData.voteJson;
        analytics_data = demoData.analyticsData;
        info = demoData.basicInfo;
      } else {
        vote_json = await getVoteJSON();
        analytics_data = {
          chart: await getChartData(),
          user: await getUserData(),
          prevEvent: await getPrevEventData(),
          total_donated: await getTotalDonated(),
          current_donation: await getCurrentDonation()
        };
        info = await userBasicInfo();
      }

      const vote = Vote(
        vote_json.title,
        vote_json.queried_result.section_title,
        vote_json.queried_result.section_summary,
        vote_json.queried_result.section_events_info,
        vote_json.queried_result.voted_callback
      );

      const analytics = Analytics(
        analytics_data.chart, analytics_data.user, analytics_data.prevEvent,
        analytics_data.total_donated, analytics_data.current_donation
      );

      const basicInfo = BasicInfo(info?.name, info?.email, this.handle_changed_info);

      const select = (
        <PayAndPlanSelect
          onSubmitPlan={this.handle_plan_update}
          onSubmitPayment={this.handle_payinfo_update}
        />
      );

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
    return <div style={{ minHeight: '60vh' }} aria-label="Loading dashboard"></div>;
  }
}
