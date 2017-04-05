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
import moment from 'moment';

type Props = {
  creationDate: string,
  onClick: () => void
};

export default class IssueChangelog extends React.PureComponent {
  props: Props;

  onClick = (evt: SyntheticInputEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
    this.props.onClick();
  };

  render() {
    const { creationDate } = this.props;
    const formatedCreationDate = moment(creationDate).format('LLL');
    return (
      <button
        className="button-link issue-action issue-action-with-options js-issue-show-changelog"
        title={formatedCreationDate}
        onClick={this.onClick}>
        <span className="issue-meta-label">{moment(creationDate).fromNow()}</span>
        {' '}
        <i className="icon-dropdown" />
      </button>
    );
  }
}
