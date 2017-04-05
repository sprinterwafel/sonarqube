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
import { orderBy, without } from 'lodash';
import FacetBox from './components/FacetBox';
import FacetHeader from './components/FacetHeader';
import FacetItem from './components/FacetItem';
import FacetItemsList from './components/FacetItemsList';
import { translate } from '../../../helpers/l10n';

type Props = {|
  onChange: (changes: { [string]: Array<string> }) => void,
  onToggle: (property: string) => void,
  open: boolean,
  stats?: { [string]: number },
  statuses: Array<string>
|};

export default class StatusFacet extends React.PureComponent {
  props: Props;

  static defaultProps = {
    open: true
  };

  property = 'statuses';

  handleItemClick = (itemValue: string) => {
    const { statuses } = this.props;
    const newValue = orderBy(
      statuses.includes(itemValue) ? without(statuses, itemValue) : [...statuses, itemValue]
    );
    this.props.onChange({ [this.property]: newValue });
  };

  handleHeaderClick = () => {
    this.props.onToggle(this.property);
  };

  getStat(status: string): ?number {
    const { stats } = this.props;
    return stats ? stats[status] : null;
  }

  renderStatus(status: string) {
    return (
      <span>
        <i className={`icon-status-${status.toLowerCase()}`} />
        {' '}
        {translate('issue.status', status)}
      </span>
    );
  }

  render() {
    const statuses = ['OPEN', 'RESOLVED', 'REOPENED', 'CLOSED', 'CONFIRMED'];

    return (
      <FacetBox property={this.property}>
        <FacetHeader
          hasValue={this.props.statuses.length > 0}
          name={translate('issues.facet', this.property)}
          onClick={this.handleHeaderClick}
          open={this.props.open}
        />

        <FacetItemsList open={this.props.open}>
          {statuses.map(status => (
            <FacetItem
              active={this.props.statuses.includes(status)}
              halfWidth={true}
              key={status}
              name={this.renderStatus(status)}
              onClick={this.handleItemClick}
              stat={this.getStat(status)}
              value={status}
            />
          ))}
        </FacetItemsList>
      </FacetBox>
    );
  }
}
