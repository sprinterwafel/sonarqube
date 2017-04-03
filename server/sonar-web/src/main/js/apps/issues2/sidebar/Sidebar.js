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
import TypeFacet from './TypeFacet';
import ResolutionFacet from './ResolutionFacet';
import RuleFacet from './RuleFacet';
import SeverityFacet from './SeverityFacet';
import StatusFacet from './StatusFacet';
import type { Query, Facet } from '../utils';

type Props = {|
  facets: { [string]: Facet },
  onFacetToggle: (property: string) => void,
  onFilterChange: (changes: { [string]: Array<string> }) => void,
  openFacets: { [string]: boolean },
  query: Query,
  referencedRules: { [string]: { name: string } }
|};

export default class Sidebar extends React.PureComponent {
  props: Props;

  render() {
    const { facets, openFacets, query } = this.props;

    return (
      <aside className="page-sidebar-fixed page-sidebar-sticky">
        <div className="page-sidebar-sticky-inner">
          <div className="search-navigator-facets-list">
            <TypeFacet
              onChange={this.props.onFilterChange}
              onToggle={this.props.onFacetToggle}
              open={!!openFacets.types}
              stats={facets.types}
              types={query.types}
            />
            <ResolutionFacet
              onChange={this.props.onFilterChange}
              onToggle={this.props.onFacetToggle}
              open={!!openFacets.resolutions}
              resolved={query.resolved}
              resolutions={query.resolutions}
              stats={facets.resolutions}
            />
            <SeverityFacet
              onChange={this.props.onFilterChange}
              onToggle={this.props.onFacetToggle}
              open={!!openFacets.severities}
              severities={query.severities}
              stats={facets.severities}
            />
            <StatusFacet
              onChange={this.props.onFilterChange}
              onToggle={this.props.onFacetToggle}
              open={!!openFacets.statuses}
              stats={facets.statuses}
              statuses={query.statuses}
            />
            <RuleFacet
              onChange={this.props.onFilterChange}
              onToggle={this.props.onFacetToggle}
              open={!!openFacets.rules}
              stats={facets.rules}
              referencedRules={this.props.referencedRules}
              rules={query.rules}
            />
          </div>
        </div>
      </aside>
    );
  }
}
