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
import ListItem from './ListItem';

type Props = {
  issues: Array<Object>,
  onIssueClick: (string) => void,
  selected: ?string
};

export default class IssuesList extends React.PureComponent {
  props: Props;

  render() {
    const { issues } = this.props;

    return (
      <div className="search-navigator-workspace-list">
        {issues.map((issue, index) => (
          <ListItem
            key={issue.key}
            issue={issue}
            onClick={this.props.onIssueClick}
            previousIssue={index > 0 ? issues[index - 1] : null}
            selected={issue.key === this.props.selected}
          />
        ))}
      </div>
    );
  }
}
