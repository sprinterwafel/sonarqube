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
import HeaderPanel from './HeaderPanel';
import PageActions from './PageActions';
import Sidebar from '../sidebar/Sidebar';
import IssuesListContainer from './IssuesListContainer';
import ComponentBreadcrumbsContainer from './ComponentBreadcrumbsContainer';
import { parseQuery, areQueriesEqual, getOpen, serializeQuery, parseFacets } from '../utils';
import type {
  Query,
  Paging,
  Facet,
  ReferencedComponent,
  ReferencedUser,
  ReferencedLanguage
} from '../utils';
import IssuesSourceViewerContainer from './IssuesSourceViewerContainer';
import ListFooter from '../../../components/controls/ListFooter';
import Page from '../../../components/layout/Page';
import PageMain from '../../../components/layout/PageMain';
import PageMainInner from '../../../components/layout/PageMainInner';
import PageSide from '../../../components/layout/PageSide';
import PageFilters from '../../../components/layout/PageFilters';
import { translate } from '../../../helpers/l10n';

// TODO project-level page
// TODO conditionaly show organization/project in breadcrumbs
// TODO my issues filter
// TODO bulk change
// TODO issue checkboxes
// TODO filter similar issues
// TODO issue permalink
// TODO request facets on demand
// TODO clear filters
// TODO reload button
// TODO redirect from old-style urls
// TODO no results
// TODO issues/debt display mode
// TODO sticky header

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
  paging?: Paging,
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

    this.attachShortcuts();
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
    this.detachShortcuts();

    const footer = document.getElementById('footer');
    if (footer) {
      footer.classList.remove('search-navigator-footer');
    }

    this.mounted = false;
  }

  attachShortcuts() {
    window.addEventListener('keydown', this.handleKeyDown, false);
  }

  detachShortcuts() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (event: KeyboardEvent) => {
    switch (event.keyCode) {
      case 38:
        // up
        event.preventDefault();
        this.selectPreviousIssue();
        break;
      case 40:
        // down
        event.preventDefault();
        this.selectNextIssue();
        break;
      case 39:
        // right
        event.preventDefault();
        this.openSelectedIssue();
        break;
      case 37:
        // left
        event.preventDefault();
        this.closeIssue();
        break;
    }
  };

  getSelectedIndex(): ?number {
    const { issues, selected } = this.state;
    return issues != null && selected != null && issues.includes(selected)
      ? issues.indexOf(selected)
      : null;
  }

  selectNextIssue = () => {
    const { issues } = this.state;
    const selectedIndex = this.getSelectedIndex();
    if (issues != null && selectedIndex != null && selectedIndex < issues.length - 1) {
      if (getOpen(this.props.location.query)) {
        this.openIssue(issues[selectedIndex + 1]);
      } else {
        this.setState({ selected: issues[selectedIndex + 1] });
      }
    }
  };

  selectPreviousIssue = () => {
    const { issues } = this.state;
    const selectedIndex = this.getSelectedIndex();
    if (issues != null && selectedIndex != null && selectedIndex > 0) {
      if (getOpen(this.props.location.query)) {
        this.openIssue(issues[selectedIndex - 1]);
      } else {
        this.setState({ selected: issues[selectedIndex - 1] });
      }
    }
  };

  openIssue = (issue: string) => {
    if (this.state.query) {
      this.props.router.push({
        pathname: this.props.location.pathname,
        query: { ...serializeQuery(this.state.query), open: issue }
      });
    }
  };

  closeIssue = () => {
    if (this.state.query) {
      this.props.router.push({
        pathname: this.props.location.pathname,
        query: { ...serializeQuery(this.state.query), open: undefined }
      });
    }
  };

  openSelectedIssue = () => {
    const { selected } = this.state;
    if (selected) {
      this.openIssue(selected);
    }
  };

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
        const open = getOpen(this.props.location.query);
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
          selected: issues.length > 0 ? issues.includes(open) ? open : issues[0] : undefined
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

    const selectedIndex = this.getSelectedIndex();

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
          <HeaderPanel border={true}>
            <PageMainInner>
              {openIssue != null &&
                <div className="pull-left">
                  <ComponentBreadcrumbsContainer issue={openIssue} />
                </div>}
              <PageActions
                loading={this.state.loading}
                openIssue={openIssue}
                paging={paging}
                selectedIndex={selectedIndex}
              />
            </PageMainInner>
          </HeaderPanel>

          <PageMainInner>
            {issues != null &&
              <div>
                {openIssue != null &&
                  <IssuesSourceViewerContainer
                    issue={openIssue}
                    displayAllIssues={true}
                    onIssueSelect={this.openIssue}
                  />}

                <div className={openIssue != null ? 'hidden' : undefined}>
                  <IssuesListContainer
                    issues={issues}
                    onIssueClick={this.openIssue}
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
          </PageMainInner>
        </PageMain>
      </Page>
    );
  }
}
