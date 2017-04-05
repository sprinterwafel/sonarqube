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
import IssueView from './IssueView';
import type { Issue } from './types';

type Props = {
  checked?: boolean,
  issue: Issue,
  onCheck?: () => void,
  onClick: (string) => void,
  onFail: (Error) => void,
  onFilterClick?: () => void,
  onIssueChange: ({}) => void,
  selected: boolean
};

type State = {
  currentPopup: string
};

export default class BaseIssue extends React.PureComponent {
  props: Props;
  state: State;

  static defaultProps = {
    selected: false
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      currentPopup: ''
    };
  }

  componentDidMount() {
    //this.renderIssueView();
    if (this.props.selected) {
      this.bindShortcuts();
    }
  }

  componentWillUpdate(nextProps: Props) {
    if (!nextProps.selected && this.props.selected) {
      this.unbindShortcuts();
    }
    //this.destroyIssueView();
  }

  componentDidUpdate(prevProps: Props) {
    //this.renderIssueView();
    if (!prevProps.selected && this.props.selected) {
      this.bindShortcuts();
    }

    /*const { resolution } = this.props.issue;
    if (!prevProps.issue.resolution && ['FALSE-POSITIVE', 'WONTFIX'].includes(resolution)) {
      this.issueView.comment({ fromTransition: true });
    }*/
  }

  componentWillUnmount() {
    if (this.props.selected) {
      this.unbindShortcuts();
    }
    //this.destroyIssueView();
  }

  bindShortcuts() {
    document.addEventListener('keypress', this.handleKeyPress);
  }

  unbindShortcuts() {
    document.removeEventListener('keypress', this.handleKeyPress);
  }

  togglePopup = (popupName: string, open?: boolean) => {
    if (open) {
      this.setState({ currentPopup: popupName });
    } else {
      this.setState((prevState: State) => {
        if (prevState.currentPopup === popupName) {
          return { currentPopup: '' };
        } else if (open == null) {
          return { currentPopup: popupName };
        }
        return prevState;
      });
    }
  };

  handleKeyPress = (e: Object) => {
    const tagName = e.target.tagName.toUpperCase();
    const shouldHandle = tagName !== 'INPUT' && tagName !== 'TEXTAREA' && tagName !== 'BUTTON';

    if (shouldHandle) {
      switch (e.key) {
        case 'f':
          return this.togglePopup('transition');
        case 'a':
          return this.togglePopup('assign');
        /*case 'm':
          return this.doIssueAction('assign-to-me');*/
        case 'p':
          return this.togglePopup('plan');
        case 'i':
          return this.togglePopup('set-severity');
        case 'c':
          return this.togglePopup('comment');
        case 't':
          return this.togglePopup('edit-tags');
      }
    }
  };

  /*destroyIssueView() {
    this.issueView.destroy();
  }

  renderIssueView() {
    //const model = this.props.issue.toJSON ? this.props.issue : new IssueModel(this.props.issue);
    this.issueView = new IssueView({
      issue,
      checked: this.props.checked,
      onCheck: this.props.onCheck,
      onClick: this.props.onClick,
      onFilterClick: this.props.onFilterClick,
      onIssueChange: this.props.onIssueChange
    });
    this.issueView.render().$el.appendTo(this.node);
    if (this.props.selected) {
      this.issueView.select();
    }
  }*/

  render() {
    return (
      <IssueView
        issue={this.props.issue}
        checked={this.props.checked}
        onCheck={this.props.onCheck}
        onClick={this.props.onClick}
        onFail={this.props.onFail}
        onFilterClick={this.props.onFilterClick}
        onIssueChange={this.props.onIssueChange}
        togglePopup={this.togglePopup}
        currentPopup={this.state.currentPopup}
        selected={this.props.selected}
      />
    );
  }
}
