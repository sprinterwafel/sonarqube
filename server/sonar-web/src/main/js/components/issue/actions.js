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
import type { Dispatch } from 'redux';
import type { Issue } from './types';
import { onFail } from '../../store/rootActions';
import { receiveIssues } from '../../store/issues/duck';
import { parseIssueFromResponse } from '../../helpers/issues';

export const updateIssue = (oldIssue: Issue, newIssue: Issue, resultPromise: Promise<*>) =>
  (dispatch: Dispatch<*>) => {
    dispatch(receiveIssues([newIssue]));
    resultPromise.then(
      response => {
        dispatch(
          receiveIssues([
            parseIssueFromResponse(
              response.issue,
              response.components,
              response.users,
              response.rules
            )
          ])
        );
      },
      error => {
        onFail(dispatch)(error);
        dispatch(receiveIssues([oldIssue]));
      }
    );
  };
