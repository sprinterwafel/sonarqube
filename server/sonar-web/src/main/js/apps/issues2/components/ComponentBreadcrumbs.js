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
import { Link } from 'react-router';
import Organization from '../../../components/shared/Organization';
import { collapsePath, limitComponentName } from '../../../helpers/path';
import { getProjectUrl } from '../../../helpers/urls';

type Props = {
  issue: Object
};

export default class ComponentBreadcrumbs extends React.PureComponent {
  props: Props;

  render() {
    const { issue } = this.props;

    return (
      <div className="component-name">
        <Organization linkClassName="link-no-underline" organizationKey={issue.organization} />

        {issue.project != null &&
          <span>
            <Link to={getProjectUrl(issue.project)} className="link-no-underline">
              {limitComponentName(issue.projectName)}
            </Link>
            <span className="slash-separator" />
          </span>}

        {issue.subProject != null &&
          <span>
            <Link to={getProjectUrl(issue.subProject)} className="link-no-underline">
              {limitComponentName(issue.subProjectName)}
            </Link>
            <span className="slash-separator" />
          </span>}

        <Link to={getProjectUrl(issue.component)} className="link-no-underline">
          {collapsePath(issue.componentLongName)}
        </Link>
      </div>
    );
  }
}
