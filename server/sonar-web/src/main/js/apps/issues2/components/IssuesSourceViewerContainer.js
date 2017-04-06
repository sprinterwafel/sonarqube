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
import { connect } from 'react-redux';
import SourceViewer from '../../../components/SourceViewer/SourceViewer';
import { getIssueByKey } from '../../../store/rootReducer';

// TODO loading of issues
// TODO scroll to the selected issue
// TODO move between issues

const mapStateToProps = (state, ownProps) => {
  const issue = getIssueByKey(state, ownProps.issue);
  return {
    aroundLine: issue.line,
    component: issue.component,
    selectedIssue: issue.key
  };
};

export default connect(mapStateToProps)(SourceViewer);
