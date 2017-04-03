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
package org.sonar.process;

import java.io.IOException;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.util.HashSet;
import java.util.Set;

public final class NetworkUtils {

  private static final Set<Integer> ALREADY_ALLOCATED = new HashSet<>();
  private static final int MAX_TRIES = 50;

  private NetworkUtils() {
    // prevent instantiation
  }

  public static int getNextAvailablePort(InetAddress address) {
    return getNextAvailablePort(address, PortAllocator.INSTANCE);
  }

  static int getNextAvailablePort(InetAddress address, PortAllocator portAllocator) {
    for (int i = 0; i < MAX_TRIES; i++) {
      int port = portAllocator.getAvailable(address);
      if (isValidPort(port)) {
        ALREADY_ALLOCATED.add(port);
        return port;
      }
    }
    throw new IllegalStateException("Fail to find an available port on " + address);
  }

  private static boolean isValidPort(int port) {
    return port > 1023 && !ALREADY_ALLOCATED.contains(port);
  }

  static class PortAllocator {
    private static final PortAllocator INSTANCE = new PortAllocator();

    int getAvailable(InetAddress address) {
      try (ServerSocket socket = new ServerSocket(0, 50, address)) {
        return socket.getLocalPort();
      } catch (IOException e) {
        throw new IllegalStateException("Fail to find an available port on " + address, e);
      }
    }
  }
}
