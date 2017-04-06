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
import Helmet from 'react-helmet';
import { keyBy } from 'lodash';
import Sidebar from '../sidebar/Sidebar';
import IssuesListContainer from './IssuesListContainer';
import { parseQuery, areQueriesEqual, getOpen, serializeQuery, parseFacets } from '../utils';
import type {
  Query,
  Facet,
  ReferencedComponent,
  ReferencedUser,
  ReferencedLanguage
} from '../utils';
import IssuesSourceViewerContainer from './IssuesSourceViewerContainer';
import ListFooter from '../../../components/controls/ListFooter';
import Page from '../../../components/layout/Page';
import PageMain from '../../../components/layout/PageMain';
import PageSide from '../../../components/layout/PageSide';
import PageFilters from '../../../components/layout/PageFilters';
import { translate } from '../../../helpers/l10n';
import { formatMeasure } from '../../../helpers/measures';

type Props = {
  fetchIssues: () => Promise<*>,
  location: { pathname: string, query: { [string]: string } },
  router: { push: () => void }
};

type State = {
  facets: { [string]: Facet },
  issues?: Array<string>,
  loading: boolean,
  openFacets: { [string]: boolean },
  paging?: {
    pageIndex: number,
    pageSize: number,
    total: number
  },
  query?: Query,
  referencedComponents: { [string]: ReferencedComponent },
  referencedLanguages: { [string]: ReferencedLanguage },
  referencedRules: { [string]: { name: string } },
  referencedUsers: { [string]: ReferencedUser },
  selected?: string
};

export default class App extends React.PureComponent {
  mounted: boolean;
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      facets: {},
      loading: true,
      openFacets: { resolutions: true, types: true },
      query: parseQuery(props.location.query),
      referencedComponents: {},
      referencedLanguages: {},
      referencedRules: {},
      referencedUsers: {},
      selected: getOpen(props.location.query)
    };
  }

  componentDidMount() {
    this.mounted = true;

    const footer = document.getElementById('footer');
    if (footer) {
      footer.classList.add('search-navigator-footer');
    }

    this.fetchFirstIssues();
  }

  componentWillReceiveProps(nextProps: Props) {
    const open = getOpen(nextProps.location.query);
    if (open != null && open !== this.state.selected) {
      this.setState({ selected: open });
    }
    this.setState({ query: parseQuery(nextProps.location.query) });
  }

  componentDidUpdate(prevProps: Props) {
    if (!areQueriesEqual(prevProps.location.query, this.props.location.query)) {
      this.fetchFirstIssues();
    }
  }

  componentWillUnmount() {
    const footer = document.getElementById('footer');
    if (footer) {
      footer.classList.remove('search-navigator-footer');
    }

    this.mounted = false;
  }

  fetchIssues(additional?: {}): Promise<*> {
    const { query } = this.state;

    if (!query) {
      return Promise.reject();
    }

    const parameters = {
      ...serializeQuery(query),
      ps: 25,
      facets: [
        'assignees',
        'authors',
        'createdAt',
        'directories',
        'fileUuids',
        'languages',
        'moduleUuids',
        'projectUuids',
        'resolutions',
        'rules',
        'severities',
        'statuses',
        'tags',
        'types'
      ].join(),
      ...additional
    };

    this.setState({ loading: true });

    return this.props.fetchIssues(parameters);
  }

  fetchFirstIssues() {
    this.fetchIssues().then(response => {
      if (this.mounted) {
        const issues = response.issues.map(issue => issue.key);
        this.setState({
          facets: parseFacets(response.facets),
          loading: false,
          issues,
          paging: response.paging,
          referencedComponents: keyBy(response.components, 'uuid'),
          referencedLanguages: keyBy(response.languages, 'key'),
          referencedRules: keyBy(response.rules, 'key'),
          referencedUsers: keyBy(response.users, 'login'),
          selected: issues.length > 0 ? issues[0] : undefined
        });
      }
    });
  }

  fetchMoreIssues = () => {
    const { paging } = this.state;

    if (!paging) {
      return;
    }

    const p = paging.pageIndex + 1;

    this.fetchIssues({ p }).then(response => {
      if (this.mounted) {
        const issues = response.issues.map(issue => issue.key);
        this.setState(state => ({
          loading: false,
          issues: [...state.issues, ...issues],
          paging: response.paging
        }));
      }
    });
  };

  handleIssueClick = (issue: string) => {
    if (this.state.query) {
      this.props.router.push({
        pathname: this.props.location.pathname,
        query: { ...serializeQuery(this.state.query), open: issue }
      });
    }
  };

  handleFilterChange = (changes: {}) => {
    if (this.state.query) {
      this.props.router.push({
        pathname: this.props.location.pathname,
        query: serializeQuery({ ...this.state.query, ...changes })
      });
    }
  };

  handleFacetToggle = (property: string) => {
    this.setState(state => ({
      openFacets: { ...state.openFacets, [property]: !state.openFacets[property] }
    }));
  };

  render() {
    const { issues, paging, query, selected } = this.state;

    const open = getOpen(this.props.location.query);
    const openIssue = issues != null && issues.includes(open) ? open : null;

    return (
      <Page className="issues" id="issues-page">
        <Helmet title={translate('issues.page')} titleTemplate="%s - SonarQube" />

        <PageSide>
          <PageFilters>
            <Sidebar
              facets={this.state.facets}
              onFacetToggle={this.handleFacetToggle}
              onFilterChange={this.handleFilterChange}
              openFacets={this.state.openFacets}
              query={query}
              referencedComponents={this.state.referencedComponents}
              referencedLanguages={this.state.referencedLanguages}
              referencedRules={this.state.referencedRules}
              referencedUsers={this.state.referencedUsers}
            />
          </PageFilters>
        </PageSide>

        <PageMain>
          <header className="page-header">
            {JSON.stringify(query)}

            <div className="page-actions">
              {this.state.loading && <i className="spinner spacer-right" />}
              {paging != null &&
                <span>
                  <strong>{formatMeasure(paging.total, 'INT')}</strong> issues
                </span>}
            </div>
          </header>

          {issues != null &&
            <div>
              {openIssue != null &&
                <IssuesSourceViewerContainer
                  issue={openIssue}
                  displayAllIssues={true}
                  onIssueSelect={this.handleIssueClick}
                />}

              <div className={openIssue != null ? 'hidden' : undefined}>
                <IssuesListContainer
                  issues={issues}
                  onIssueClick={this.handleIssueClick}
                  selected={selected}
                />

                {paging != null &&
                  <ListFooter
                    total={paging.total}
                    count={issues.length}
                    loadMore={this.fetchMoreIssues}
                  />}
              </div>
            </div>}
        </PageMain>
      </Page>
    );
  }
}
