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
import type { ReferencedComponent } from '../utils';
import QualifierIcon from '../../../components/shared/QualifierIcon';
import { translate } from '../../../helpers/l10n';
import { collapsePath } from '../../../helpers/path';

type Props = {|
  onChange: (changes: { [string]: Array<string> }) => void,
  onToggle: (property: string) => void,
  open: boolean,
  stats?: { [string]: number },
  referencedComponents: { [string]: ReferencedComponent },
  files: Array<string>
|};

export default class FileFacet extends React.PureComponent {
  props: Props;

  static defaultProps = {
    open: true
  };

  property = 'files';

  handleItemClick = (itemValue: string) => {
    const { files } = this.props;
    const newValue = sortBy(
      files.includes(itemValue) ? without(files, itemValue) : [...files, itemValue]
    );
    this.props.onChange({ [this.property]: newValue });
  };

  handleHeaderClick = () => {
    this.props.onToggle(this.property);
  };

  getStat(file: string): ?number {
    const { stats } = this.props;
    return stats ? stats[file] : null;
  }

  renderName(file: string): React.Element<*> | string {
    const { referencedComponents } = this.props;
    const name = referencedComponents[file]
      ? collapsePath(referencedComponents[file].path, 15)
      : file;
    return (
      <span>
        <QualifierIcon className="little-spacer-right" qualifier="FIL" />
        {name}
      </span>
    );
  }

  render() {
    const { stats } = this.props;

    if (!stats) {
      return null;
    }

    const files = sortBy(Object.keys(stats), key => -stats[key]);

    return (
      <FacetBox property={this.property}>
        <FacetHeader
          hasValue={this.props.files.length > 0}
          name={translate('issues.facet', this.property)}
          onClick={this.handleHeaderClick}
          open={this.props.open}
        />

        {this.props.open &&
          <FacetItemsList>
            {files.map(file => (
              <FacetItem
                active={this.props.files.includes(file)}
                key={file}
                name={this.renderName(file)}
                onClick={this.handleItemClick}
                stat={this.getStat(file)}
                value={file}
              />
            ))}
          </FacetItemsList>}
      </FacetBox>
    );
  }
}
