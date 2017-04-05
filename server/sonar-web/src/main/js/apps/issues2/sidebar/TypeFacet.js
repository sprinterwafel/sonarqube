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
import IssueTypeIcon from '../../../components/ui/IssueTypeIcon';
import { translate } from '../../../helpers/l10n';

type Props = {|
  onChange: (changes: { [string]: Array<string> }) => void,
  onToggle: (property: string) => void,
  open: boolean,
  stats?: { [string]: number },
  types: Array<string>
|};

export default class TypeFacet extends React.PureComponent {
  props: Props;

  static defaultProps = {
    open: true
  };

  property = 'types';

  handleItemClick = (itemValue: string) => {
    const { types } = this.props;
    const newValue = orderBy(
      types.includes(itemValue) ? without(types, itemValue) : [...types, itemValue]
    );
    this.props.onChange({ [this.property]: newValue });
  };

  handleHeaderClick = () => {
    this.props.onToggle(this.property);
  };

  getStat(type: string): ?number {
    const { stats } = this.props;
    return stats ? stats[type] : null;
  }

  render() {
    const types = ['BUG', 'VULNERABILITY', 'CODE_SMELL'];

    return (
      <FacetBox property={this.property}>
        <FacetHeader
          hasValue={this.props.types.length > 0}
          name={translate('issues.facet', this.property)}
          onClick={this.handleHeaderClick}
          open={this.props.open}
        />

        {this.props.open &&
          <FacetItemsList>
            {types.map(type => (
              <FacetItem
                active={this.props.types.includes(type)}
                key={type}
                name={<span><IssueTypeIcon query={type} /> {translate('issue.type', type)}</span>}
                onClick={this.handleItemClick}
                stat={this.getStat(type)}
                value={type}
              />
            ))}
          </FacetItemsList>}
      </FacetBox>
    );
  }
}
