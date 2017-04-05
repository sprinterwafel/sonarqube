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
import { sortBy, without } from 'lodash';
import FacetBox from './components/FacetBox';
import FacetHeader from './components/FacetHeader';
import FacetItem from './components/FacetItem';
import FacetItemsList from './components/FacetItemsList';
import { translate } from '../../../helpers/l10n';

type Props = {|
  onChange: (changes: {}) => void,
  onToggle: (property: string) => void,
  open: boolean,
  stats?: { [string]: number },
  authors: Array<string>
|};

export default class AuthorFacet extends React.PureComponent {
  props: Props;

  static defaultProps = {
    open: true
  };

  property = 'authors';

  handleItemClick = (itemValue: string) => {
    const { authors } = this.props;
    const newValue = sortBy(
      authors.includes(itemValue) ? without(authors, itemValue) : [...authors, itemValue]
    );
    this.props.onChange({ [this.property]: newValue });
  };

  handleHeaderClick = () => {
    this.props.onToggle(this.property);
  };

  getStat(author: string): ?number {
    const { stats } = this.props;
    return stats ? stats[author] : null;
  }

  render() {
    const { stats } = this.props;

    if (!stats) {
      return null;
    }

    const authors = sortBy(Object.keys(stats), key => -stats[key]);

    return (
      <FacetBox property={this.property}>
        <FacetHeader
          hasValue={this.props.authors.length > 0}
          name={translate('issues.facet', this.property)}
          onClick={this.handleHeaderClick}
          open={this.props.open}
        />

        {this.props.open &&
          <FacetItemsList>
            {authors.map(author => (
              <FacetItem
                active={this.props.authors.includes(author)}
                key={author}
                name={author}
                onClick={this.handleItemClick}
                stat={this.getStat(author)}
                value={author}
              />
            ))}
          </FacetItemsList>}
      </FacetBox>
    );
  }
}
