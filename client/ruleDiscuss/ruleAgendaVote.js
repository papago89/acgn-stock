'use strict';
import { $ } from 'meteor/jquery';
import { Meteor } from 'meteor/meteor';
import { DocHead } from 'meteor/kadira:dochead';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { dbRound } from '/db/dbRound';
import { dbRuleAgendas } from '/db/dbRuleAgendas';
import { dbRuleIssues } from '/db/dbRuleIssues';
import { dbRuleIssueOptions } from '/db/dbRuleIssueOptions';
import { inheritedShowLoadingOnSubscribing } from '../layout/loading';
import { alertDialog } from '../layout/alertDialog';
import { shouldStopSubscribe } from '../utils/idle';

inheritedShowLoadingOnSubscribing(Template.ruleAgendaVote);
Template.ruleAgendaVote.onCreated(function() {
  const agendaId = FlowRouter.getParam('agendaId');
  if (agendaId) {
    this.subscribe('ruleAgendaDetail', agendaId);
  }
  this.autorun(() => {
    if (agendaId) {
      const agendaData = dbRuleAgendas.findOne(agendaId);
      if (agendaData) {
        DocHead.setTitle(Meteor.settings.public.websiteName + ' - 「' + agendaData.title + '」議程資訊');
      }
    }
  });
  this.autorun(() => {
    if (shouldStopSubscribe()) {
      return false;
    }
    this.subscribe('currentRound');
    if (Meteor.user()) {
      this.subscribe('userCreatedAt');
    }
  });
});
Template.ruleAgendaVote.helpers({
  agendaData() {
    const agendaId = FlowRouter.getParam('agendaId');

    return dbRuleAgendas.findOne(agendaId);
  },
  canVote(agendaData) {
    const expireDate = new Date(agendaData.createdAt.getTime() + agendaData.duration * 60 * 60 * 1000);
    if (expireDate < Date.now()) {
      return false;
    }
    const user = Meteor.user();
    if (user.profile.ban.length > 0) {
      return false;
    }
    const now = Date.now();
    const voteUserNeedCreatedIn = Meteor.settings.public.voteUserNeedCreatedIn;
    const currentRound = dbRound.findOne({}, {
      sort: {
        beginDate: -1
      }
    });
    if ((now - currentRound.beginDate.getTime()) > (voteUserNeedCreatedIn * 2)) {
      const userCreatedAt = user.createdAt;
      if (! userCreatedAt || ((now - userCreatedAt.getTime()) < voteUserNeedCreatedIn)) {
        return false;
      }
    }
    const userId = user._id;
    if (agendaData.votes.indexOf(userId) >= 0) {
      return false;
    }

    return true;
  }
});
Template.ruleAgendaVote.events({
  'submit .form-vote'(event) {
    event.preventDefault();
    function submitVote(model) {
      Meteor.customCall('voteAgenda', model, function(error) {
        if (! error) {
          const path = FlowRouter.path('ruleAgendaDetail', { agendaId });
          FlowRouter.go(path);
        }
      });
    }
    const agendaId = FlowRouter.getParam('agendaId');
    const voteOptions = [];
    $('input:checked').each(function() {
      const optionId = $(this).val();
      voteOptions.push(optionId);
    });

    const issueNames = dbRuleAgendas.findOne(agendaId).issues;
    const issueVotedOptions = issueNames.map((issueName) => {
      return $(`input[name="${issueName}"]:checked`).length;
    });
    const isMissingIssue = issueVotedOptions.some(function(length) {
      return length === 0;
    });
    const model = {
      agendaId: agendaId,
      options: voteOptions
    };

    alertDialog.confirm({
      message: '投票送出後不可再修改與重新投票，確認是否送出？',
      callback: (result) => {
        if (! result) {
          return;
        }
        if (isMissingIssue) {
          alertDialog.confirm({
            message: '發現仍有未選擇的議題，確認放棄該題之投票權？',
            callback: (result) => {
              if (! result) {
                return;
              }
              submitVote(model);
            }
          });
        }
        else {
          submitVote(model);
        }
      }
    });
  }
});

Template.ruleAgendaVoteForm.helpers({
  getIssueList(issueIds) {
    return dbRuleIssues.find({
      _id: {
        $in: issueIds
      }
    }, {
      sort: {
        order: 1
      }
    });
  },
  getBackHref() {
    const agendaId = FlowRouter.getParam('agendaId');

    return FlowRouter.path('ruleAgendaDetail', { agendaId });
  }
});

Template.ruleIssueVoteList.helpers({
  getOptionText(optionId) {
    const option = dbRuleIssueOptions.findOne(optionId);

    return option ? option.title : '';
  }
});