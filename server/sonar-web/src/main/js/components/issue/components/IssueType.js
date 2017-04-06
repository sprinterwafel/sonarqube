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
import IssueTypeIcon from '../../../components/ui/IssueTypeIcon';
import { translate } from '../../../helpers/l10n';
import type { Issue } from '../types';

type Props = {
  canSetType: boolean,
  issue: Issue,
  onClick: () => void
};

export default class IssueType extends React.PureComponent {
  props: Props;

  render() {
    const { issue } = this.props;

    if (this.props.canSetType) {
      return (
        <button
          className="button-link issue-action issue-action-with-options js-issue-set-type"
          onClick={this.props.onClick}>
          <IssueTypeIcon className="little-spacer-right" query={issue.type} />
          {translate('issue.type', issue.type)}
          <i className="little-spacer-left icon-dropdown" />
        </button>
      );
    } else {
      return (
        <span>
          <IssueTypeIcon className="little-spacer-right" query={issue.type} />
          {translate('issue.type', issue.type)}
        </span>
      );
    }
  }
}
