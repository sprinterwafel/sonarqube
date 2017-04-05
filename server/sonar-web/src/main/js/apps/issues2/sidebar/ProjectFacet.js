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
import Organization from '../../../components/shared/Organization';
import { translate } from '../../../helpers/l10n';

type Props = {|
  onChange: (changes: { [string]: Array<string> }) => void,
  onToggle: (property: string) => void,
  open: boolean,
  stats?: { [string]: number },
  referencedComponents: { [string]: ReferencedComponent },
  projects: Array<string>
|};

export default class ProjectFacet extends React.PureComponent {
  props: Props;

  static defaultProps = {
    open: true
  };

  property = 'projects';

  handleItemClick = (itemValue: string) => {
    const { projects } = this.props;
    const newValue = sortBy(
      projects.includes(itemValue) ? without(projects, itemValue) : [...projects, itemValue]
    );
    this.props.onChange({ [this.property]: newValue });
  };

  handleHeaderClick = () => {
    this.props.onToggle(this.property);
  };

  getStat(project: string): ?number {
    const { stats } = this.props;
    return stats ? stats[project] : null;
  }

  renderName(project: string): React.Element<*> | string {
    const { referencedComponents } = this.props;
    return referencedComponents[project]
      ? <span>
          <Organization link={false} organizationKey={referencedComponents[project].organization} />
          {referencedComponents[project].name}
        </span>
      : project;
  }

  render() {
    const { stats } = this.props;

    if (!stats) {
      return null;
    }

    const projects = sortBy(Object.keys(stats), key => -stats[key]);

    return (
      <FacetBox property={this.property}>
        <FacetHeader
          hasValue={this.props.projects.length > 0}
          name={translate('issues.facet', this.property)}
          onClick={this.handleHeaderClick}
          open={this.props.open}
        />

        <FacetItemsList open={this.props.open}>
          {projects.map(project => (
            <FacetItem
              active={this.props.projects.includes(project)}
              key={project}
              name={this.renderName(project)}
              onClick={this.handleItemClick}
              stat={this.getStat(project)}
              value={project}
            />
          ))}
        </FacetItemsList>
      </FacetBox>
    );
  }
}
