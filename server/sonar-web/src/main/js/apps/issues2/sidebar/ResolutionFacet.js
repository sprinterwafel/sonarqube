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
  onChange: (changes: {}) => void,
  onToggle: (property: string) => void,
  open: boolean,
  resolved: boolean,
  resolutions: Array<string>,
  stats?: { [string]: number }
|};

export default class ResolutionFacet extends React.PureComponent {
  props: Props;

  static defaultProps = {
    open: true
  };

  property = 'resolutions';

  handleItemClick = (itemValue: string) => {
    if (itemValue === '') {
      // unresolved
      this.props.onChange({ resolved: !this.props.resolved, resolutions: [] });
    } else {
      // defined resolution
      const { resolutions } = this.props;
      const newValue = orderBy(
        resolutions.includes(itemValue)
          ? without(resolutions, itemValue)
          : [...resolutions, itemValue]
      );
      this.props.onChange({ resolved: true, resolutions: newValue });
    }
  };

  handleHeaderClick = () => {
    this.props.onToggle(this.property);
  };

  isFacetItemActive(resolution: string) {
    return resolution === '' ? !this.props.resolved : this.props.resolutions.includes(resolution);
  }

  getFacetItemName(resolution: string) {
    return resolution === '' ? translate('unresolved') : translate('issue.resolution', resolution);
  }

  getStat(resolution: string): ?number {
    const { stats } = this.props;
    return stats ? stats[resolution] : null;
  }

  render() {
    const resolutions = ['', 'FIXED', 'FALSE-POSITIVE', 'WONTFIX', 'REMOVED'];

    return (
      <FacetBox property={this.property}>
        <FacetHeader
          hasValue={!this.props.resolved || this.props.resolutions.length > 0}
          name={translate('issues.facet', this.property)}
          onClick={this.handleHeaderClick}
          open={this.props.open}
        />

        {this.props.open &&
          <FacetItemsList>
            {resolutions.map(resolution => (
              <FacetItem
                active={this.isFacetItemActive(resolution)}
                key={resolution}
                halfWidth={true}
                name={this.getFacetItemName(resolution)}
                onClick={this.handleItemClick}
                stat={this.getStat(resolution)}
                value={resolution}
              />
            ))}
          </FacetItemsList>}
      </FacetBox>
    );
  }
}
