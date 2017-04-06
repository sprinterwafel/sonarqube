/*
 * SonarQube
 * Copyright (C) 2009-2017 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
// @flow
import React from 'react';
import classNames from 'classnames';
import moment from 'moment';
import IssueModel from './models/issue';
import Avatar from '../../components/ui/Avatar';
import BubblePopupHelper from '../../components/common/BubblePopupHelper';
import Checkbox from '../../components/controls/Checkbox';
import ChangelogPopup from './popups/ChangelogPopup';
import IssueChangelog from './components/IssueChangelog';
import IssueMessage from './components/IssueMessage';
import IssueType from './components/IssueType';
import SetTypePopup from './popups/SetTypePopup';
import SeverityHelper from '../../components/shared/severity-helper';
import StatusHelper from '../../components/shared/StatusHelper';
import TagsList from '../../components/tags/TagsList';
import { setIssueType } from '../../api/issues';
import { getSingleIssueUrl } from '../../helpers/urls';
import { translate, translateWithParameters } from '../../helpers/l10n';
import type { Issue } from './types';

type Props = {
  checked?: boolean,
  currentPopup: string,
  issue: Issue,
  onCheck?: () => void,
  onClick: (string) => void,
  onFail: (Error) => void,
  onFilterClick?: () => void,
  onIssueChange: (Issue, Issue, Promise<*>) => void,
  selected: boolean,
  togglePopup: (string) => void
};

export default class IssueView extends React.PureComponent {
  props: Props;
  issueModel: IssueModel;

  componentWillUpdate(nextProps: Props) {
    this.issueModel = nextProps.issue.toJSON ? nextProps.issue : new IssueModel(nextProps.issue);
  }

  handleClick = (evt: MouseEvent) => {
    evt.preventDefault();
    if (this.props.onClick) {
      this.props.onClick(this.props.issue.key);
    }
  };

  toggleChangelog = (open?: boolean) => {
    this.props.togglePopup('changelog', open);
  };

  toggleSetType = (open?: boolean) => {
    this.props.togglePopup('set-type', open);
  };

  setType = (type: string) => {
    const { issue } = this.props;
    const newIssue = { ...issue, type };
    this.props.onIssueChange(issue, newIssue, setIssueType({ issue: issue.key, type }));
    this.toggleSetType(false);
  };

  render() {
    const { issue } = this.props;
    const canAssign = issue.actions.includes('assign');
    const canAssignToMe = issue.actions.includes('assign_to_me');
    const canComment = issue.actions.includes('comment');
    const canSetSeverity = issue.actions.includes('set_severity');
    const canSetTags = issue.actions.includes('set_tags');
    const hasCheckbox = this.props.onCheck != null;
    const hasSimilarIssuesFilter = this.props.onFilterClick != null;
    const hasTransitions = issue.transitions && issue.transitions.length > 0;

    const issueClass = classNames('issue', {
      'issue-with-checkbox': hasCheckbox,
      selected: this.props.selected
    });
    const btnClass = 'button-link issue-action issue-action-with-options';
    const commentBtnClass = 'button-link icon-half-transparent';

    return (
      <div className={issueClass} onClick={this.handleClick} tabIndex={0} role="listitem">
        <table className="issue-table">
          <tbody>
            <tr>
              <td>
                <IssueMessage
                  message={issue.message}
                  rule={issue.rule}
                  organization={issue.organization}
                />
              </td>
              <td className="issue-table-meta-cell issue-table-meta-cell-first">
                <ul className="list-inline issue-meta-list">
                  <li className="issue-meta">
                    <BubblePopupHelper
                      isOpen={this.props.currentPopup === 'changelog'}
                      position="bottomright"
                      togglePopup={this.toggleChangelog}
                      popup={<ChangelogPopup issue={issue} onFail={this.props.onFail} />}>
                      <IssueChangelog
                        creationDate={issue.creationDate}
                        onClick={this.toggleChangelog}
                      />
                    </BubblePopupHelper>
                  </li>
                  {issue.line != null &&
                    <li className="issue-meta">
                      <span className="issue-meta-label" title={translate('line_number')}>
                        L{issue.line}
                      </span>
                    </li>}
                  <li className="issue-meta">
                    <a
                      className="js-issue-permalink icon-link"
                      href={getSingleIssueUrl(issue.key)}
                      target="_blank"
                    />
                  </li>
                  {hasSimilarIssuesFilter &&
                    <li className="issue-meta">
                      <button
                        className={classNames(btnClass, 'js-issue-filter')}
                        aria-label={translate('issue.filter_similar_issues')}
                        onClick={this.props.onFilterClick}>
                        <i className="icon-filter icon-half-transparent" />{' '}
                        <i className="icon-dropdown" />
                      </button>
                    </li>}
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
        <table className="issue-table">
          <tbody>
            <tr>
              <td>
                <ul className="list-inline issue-meta-list">
                  <li className="issue-meta">
                    <BubblePopupHelper
                      isOpen={this.props.currentPopup === 'set-type' && canSetSeverity}
                      position="bottomleft"
                      togglePopup={this.toggleSetType}
                      popup={<SetTypePopup issue={issue} onSelect={this.setType} />}>
                      <IssueType
                        issue={issue}
                        canSetType={canSetSeverity}
                        onClick={this.toggleSetType}
                      />
                    </BubblePopupHelper>
                  </li>
                  <li className="issue-meta">
                    {canSetSeverity &&
                      <button className={classNames(btnClass, 'js-issue-set-severity')}>
                        <span className="issue-meta-label">
                          <SeverityHelper severity={issue.severity} />
                        </span>
                        {' '}
                        <i className="icon-dropdown" />
                      </button>}
                    {!canSetSeverity && <SeverityHelper severity={issue.severity} />}
                  </li>
                  <li className="issue-meta">
                    {hasTransitions &&
                      <button className={classNames(btnClass, 'js-issue-transition')}>
                        <span className="issue-meta-label">
                          <StatusHelper status={issue.status} resolution={issue.resolution} />
                        </span>{' '}<i className="icon-dropdown" />
                      </button>}
                    {!hasTransitions &&
                      <StatusHelper status={issue.status} resolution={issue.resolution} />}
                  </li>
                  {canAssign &&
                    <li className="issue-meta">
                      <button className={classNames(btnClass, 'js-issue-assign')}>
                        {issue.assignee &&
                          <span className="text-top">
                            <Avatar
                              className="little-spacer-right"
                              hash={issue.assigneeAvatar}
                              size={16}
                            />
                          </span>}
                        <span className="issue-meta-label">
                          {issue.assignee ? issue.assigneeName : translate('unassigned')}
                        </span>{' '}<i className="icon-dropdown" />
                      </button>
                    </li>}
                  {!canAssign &&
                    <li className="issue-meta">
                      {issue.assignee &&
                        <span className="text-top">
                          <Avatar
                            className="little-spacer-right"
                            hash={issue.assigneeAvatar}
                            size={16}
                          />
                        </span>}
                      <span className="issue-meta-label">
                        {issue.assignee ? issue.assigneeName : translate('unassigned')}
                      </span>
                    </li>}
                  {issue.effort &&
                    <li className="issue-meta">
                      <span className="issue-meta-label">
                        {translateWithParameters('issue.x_effort', issue.effort)}
                      </span>
                    </li>}
                  {canComment &&
                    <li className="issue-meta">
                      <button className="button-link issue-action js-issue-comment">
                        <span className="issue-meta-label">
                          {translate('issue.comment.formlink')}
                        </span>
                      </button>
                    </li>}
                </ul>
                {canAssignToMe && <button className="button-link hidden js-issue-assign-to-me" />}
              </td>
              <td className="issue-table-meta-cell">
                <ul className="list-inline">
                  <li className="issue-meta js-issue-tags">
                    {canSetTags &&
                      <button className={classNames(btnClass, 'js-issue-edit-tags')}>
                        <TagsList
                          tags={
                            issue.tags && issue.tags.length > 0
                              ? issue.tags
                              : [translate('issue.no_tag')]
                          }
                          allowUpdate={canSetTags}
                        />
                      </button>}
                    {!canSetTags &&
                      <TagsList
                        tags={
                          issue.tags && issue.tags.length > 0
                            ? issue.tags
                            : [translate('issue.no_tag')]
                        }
                        allowUpdate={canSetTags}
                      />}
                  </li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
        {issue.comments &&
          issue.comments.length > 0 &&
          <div className="issue-comments">
            {issue.comments.map(comment => (
              <div className="issue-comment" key={comment.key} data-comment-key={comment.key}>
                <div className="issue-comment-author" title={comment.authorName}>
                  <Avatar className="little-spacer-right" hash={comment.authorAvatar} size={16} />
                  {comment.authorName}
                </div>
                <div className="issue-comment-text markdown">{comment.htmlText}</div>
                <div className="issue-comment-age">({moment(comment.createdAt).fromNow()})</div>
                <div className="issue-comment-actions">
                  {comment.updatable &&
                    <button
                      className={classNames(commentBtnClass, 'js-issue-comment-edit icon-edit')}
                    />}
                  {comment.updatable &&
                    <button
                      className={classNames(commentBtnClass, 'js-issue-comment-delete icon-delete')}
                      data-confirm-msg={translate('issue.comment.delete_confirm_message')}
                    />}
                </div>
              </div>
            ))}
          </div>}
        <a className="issue-navigate js-issue-navigate">
          <i className="issue-navigate-to-left icon-chevron-left" />
          <i className="issue-navigate-to-right icon-chevron-right" />
        </a>
        {hasCheckbox &&
          <div className="js-toggle issue-checkbox-container">
            <Checkbox
              className="issue-checkbox"
              onCheck={this.props.onCheck}
              checked={this.props.checked}
            />
          </div>}
      </div>
    );
  }
}
