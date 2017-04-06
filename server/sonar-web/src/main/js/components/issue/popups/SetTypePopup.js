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
import classNames from 'classnames';
import { translate } from '../../../helpers/l10n';
import BubblePopup from '../../../components/common/BubblePopup';
import type { Issue } from '../types';

type Props = {
  issue: Issue,
  onSelect: (string) => void,
  popupPosition?: {}
};

type State = {
  active: string
};

const TYPES = ['BUG', 'VULNERABILITY', 'CODE_SMELL'];

export default class SetTypePopup extends React.PureComponent {
  list: HTMLElement;
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      active: props.issue.type
    };
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyboard, false);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyboard);
  }

  handleKeyboard = (evt: KeyboardEvent) => {
    switch (evt.keyCode) {
      case 40: // down
        evt.preventDefault();
        this.setState(this.selectNextElement);
        break;
      case 38: // up
        evt.preventDefault();
        this.setState(this.selectPreviousElement);
        break;
      case 13: // return
        if (this.state.active !== this.props.issue.type) {
          // TODO update
        }
        break;
    }
  };

  handleSelect = (evt: MouseEvent & { target: HTMLElement }) => {
    evt.preventDefault();
    evt.stopPropagation();
    this.props.onSelect(this.state.active);
  };

  handleHover = (evt: MouseEvent & { target: HTMLElement }) => {
    this.setState({ active: evt.target.getAttribute('data-type') || '' });
  };

  selectNextElement = (state: State) => {
    const idx = TYPES.indexOf(state.active);
    if (idx < 0) {
      return { active: TYPES[0] };
    }
    return { active: TYPES[(idx + 1) % TYPES.length] };
  };

  selectPreviousElement = (state: State) => {
    const idx = TYPES.indexOf(state.active);
    if (idx <= 0) {
      return { active: TYPES[TYPES.length - 1] };
    }
    return { active: TYPES[idx - 1] };
  };

  render() {
    return (
      <BubblePopup
        position={this.props.popupPosition}
        customClass="bubble-popup-menu bubble-popup-bottom">
        <ul className="menu" ref={list => this.list = list}>
          {TYPES.map(type => (
            <li key={type}>
              <a
                href="#"
                className={classNames({ active: type === this.state.active })}
                data-type={type}
                onClick={this.handleSelect}
                onMouseOver={this.handleHover}
                onFocus={this.handleHover}>
                {translate('issue.type', type)}
              </a>
            </li>
          ))}
        </ul>
      </BubblePopup>
    );
  }
}
