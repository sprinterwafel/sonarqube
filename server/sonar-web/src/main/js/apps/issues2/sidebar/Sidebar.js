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
import AssigneeFacet from './AssigneeFacet';
import AuthorFacet from './AuthorFacet';
import DirectoryFacet from './DirectoryFacet';
import FileFacet from './FileFacet';
import LanguageFacet from './LanguageFacet';
import ModuleFacet from './ModuleFacet';
import ProjectFacet from './ProjectFacet';
import ResolutionFacet from './ResolutionFacet';
import RuleFacet from './RuleFacet';
import SeverityFacet from './SeverityFacet';
import StatusFacet from './StatusFacet';
import TagFacet from './TagFacet';
import TypeFacet from './TypeFacet';
import type {
  Query,
  Facet,
  ReferencedComponent,
  ReferencedUser,
  ReferencedLanguage
} from '../utils';

type Props = {|
  facets: { [string]: Facet },
  onFacetToggle: (property: string) => void,
  onFilterChange: (changes: { [string]: Array<string> }) => void,
  openFacets: { [string]: boolean },
  query: Query,
  referencedComponents: { [string]: ReferencedComponent },
  referencedLanguages: { [string]: ReferencedLanguage },
  referencedRules: { [string]: { name: string } },
  referencedUsers: { [string]: ReferencedUser }
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
            <TagFacet
              onChange={this.props.onFilterChange}
              onToggle={this.props.onFacetToggle}
              open={!!openFacets.tags}
              stats={facets.tags}
              tags={query.tags}
            />
            <ProjectFacet
              onChange={this.props.onFilterChange}
              onToggle={this.props.onFacetToggle}
              open={!!openFacets.projects}
              projects={query.projects}
              referencedComponents={this.props.referencedComponents}
              stats={facets.projects}
            />
            <ModuleFacet
              onChange={this.props.onFilterChange}
              onToggle={this.props.onFacetToggle}
              open={!!openFacets.modules}
              modules={query.modules}
              referencedComponents={this.props.referencedComponents}
              stats={facets.modules}
            />
            <DirectoryFacet
              onChange={this.props.onFilterChange}
              onToggle={this.props.onFacetToggle}
              open={!!openFacets.directories}
              directories={query.directories}
              referencedComponents={this.props.referencedComponents}
              stats={facets.directories}
            />
            <FileFacet
              onChange={this.props.onFilterChange}
              onToggle={this.props.onFacetToggle}
              open={!!openFacets.files}
              files={query.files}
              referencedComponents={this.props.referencedComponents}
              stats={facets.files}
            />
            <AssigneeFacet
              onChange={this.props.onFilterChange}
              onToggle={this.props.onFacetToggle}
              open={!!openFacets.assignees}
              assigned={query.assigned}
              assignees={query.assignees}
              referencedUsers={this.props.referencedUsers}
              stats={facets.assignees}
            />
            <AuthorFacet
              onChange={this.props.onFilterChange}
              onToggle={this.props.onFacetToggle}
              open={!!openFacets.authors}
              authors={query.authors}
              stats={facets.authors}
            />
            <LanguageFacet
              onChange={this.props.onFilterChange}
              onToggle={this.props.onFacetToggle}
              open={!!openFacets.languages}
              languages={query.languages}
              referencedLanguages={this.props.referencedLanguages}
              stats={facets.languages}
            />
          </div>
        </div>
      </aside>
    );
  }
}
