/*
 * SonarQube :: Server
 * Copyright (C) 2009-2016 SonarSource SA
 * mailto:contact AT sonarsource DOT com
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

package org.sonar.server.measure.ws;

import org.sonar.api.server.ws.WebService;
import org.sonarqube.ws.client.measure.MeasuresWsParameters;

public class MeasuresWs implements WebService {
  private final MeasuresWsAction[] actions;

  public MeasuresWs(MeasuresWsAction... actions) {
    this.actions = actions;
  }

  @Override
  public void define(Context context) {
    NewController controller = context.createController(MeasuresWsParameters.CONTROLLER_MEASURES)
      .setSince("5.4")
      .setDescription("Measures search");

    for (MeasuresWsAction action : actions) {
      action.define(controller);
    }

    controller.done();
  }
}