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
import StatusHelper from '../../../components/shared/StatusHelper';
import type { Issue } from '../types';

type Props = {
  hasTransitions: boolean,
  issue: Issue,
  onClick: () => void
};

export default class IssueTransition extends React.PureComponent {
  props: Props;

  render() {
    const { issue } = this.props;

    if (this.props.hasTransitions) {
      return (
        <button
          className="button-link issue-action issue-action-with-options js-issue-transition"
          onClick={this.props.onClick}>
          <StatusHelper
            className="issue-meta-label little-spacer-right"
            status={issue.status}
            resolution={issue.resolution}
          />
          <i className="little-spacer-left icon-dropdown" />
        </button>
      );
    } else {
      return (
        <StatusHelper
          className="issue-meta-label"
          status={issue.status}
          resolution={issue.resolution}
        />
      );
    }
  }
}
