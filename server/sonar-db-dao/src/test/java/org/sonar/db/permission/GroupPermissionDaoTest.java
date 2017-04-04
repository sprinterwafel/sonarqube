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
package org.sonar.db.permission;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.IntStream;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.sonar.api.utils.System2;
import org.sonar.api.web.UserRole;
import org.sonar.db.DbSession;
import org.sonar.db.DbTester;
import org.sonar.db.component.ComponentDto;
import org.sonar.db.organization.OrganizationDto;
import org.sonar.db.user.GroupDto;

import static java.util.Arrays.asList;
import static java.util.Collections.singletonList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;
import static org.sonar.api.security.DefaultGroups.ANYONE;
import static org.sonar.api.web.UserRole.ADMIN;
import static org.sonar.api.web.UserRole.ISSUE_ADMIN;
import static org.sonar.api.web.UserRole.USER;
import static org.sonar.core.permission.GlobalPermissions.PROVISIONING;
import static org.sonar.core.permission.GlobalPermissions.SCAN_EXECUTION;
import static org.sonar.core.permission.GlobalPermissions.SYSTEM_ADMIN;
import static org.sonar.db.component.ComponentTesting.newProjectDto;
import static org.sonar.db.permission.OrganizationPermission.ADMINISTER;
import static org.sonar.db.permission.OrganizationPermission.PROVISION_PROJECTS;
import static org.sonar.db.permission.OrganizationPermission.SCAN;

public class GroupPermissionDaoTest {

  private static final int ANYONE_ID = 0;
  private static final int MISSING_ID = -1;

  @Rule
  public DbTester db = DbTester.create(System2.INSTANCE);

  private DbSession dbSession = db.getSession();
  private GroupPermissionDao underTest = new GroupPermissionDao();
  private String defaultOrganizationUuid;

  @Before
  public void setUp() throws Exception {
    defaultOrganizationUuid = db.getDefaultOrganization().getUuid();
  }

  @Test
  public void group_count_by_permission_and_component_id() {
    GroupDto group1 = db.users().insertGroup();
    GroupDto group2 = db.users().insertGroup();
    GroupDto group3 = db.users().insertGroup();
    ComponentDto project1 = db.components().insertProject();
    ComponentDto project2 = db.components().insertProject();
    ComponentDto project3 = db.components().insertProject();

    db.users().insertProjectPermissionOnGroup(group1, ISSUE_ADMIN, project1);
    db.users().insertProjectPermissionOnGroup(group1, ADMIN, project2);
    db.users().insertProjectPermissionOnGroup(group2, ADMIN, project2);
    db.users().insertProjectPermissionOnGroup(group3, ADMIN, project2);
    // anyone group
    db.users().insertProjectPermissionOnAnyone(ADMIN, project2);
    db.users().insertProjectPermissionOnGroup(group1, USER, project2);
    db.users().insertProjectPermissionOnGroup(group1, USER, project3);

    final List<CountPerProjectPermission> result = new ArrayList<>();
    underTest.groupsCountByComponentIdAndPermission(dbSession, asList(project2.getId(), project3.getId(), 789L),
      context -> result.add((CountPerProjectPermission) context.getResultObject()));

    assertThat(result).hasSize(3);
    assertThat(result).extracting("permission").containsOnly(ADMIN, USER);
    assertThat(result).extracting("componentId").containsOnly(project2.getId(), project3.getId());
    assertThat(result).extracting("count").containsOnly(4, 1);
  }

  @Test
  public void selectGroupNamesByQuery_is_ordered_by_group_names() {
    OrganizationDto organizationDto = db.organizations().insert();
    GroupDto group2 = db.users().insertGroup(organizationDto, "Group-2");
    GroupDto group3 = db.users().insertGroup(organizationDto, "Group-3");
    GroupDto group1 = db.users().insertGroup(organizationDto, "Group-1");
    db.users().insertPermissionOnAnyone(organizationDto, SCAN);

    assertThat(underTest.selectGroupNamesByQuery(dbSession, newQuery().setOrganizationUuid(organizationDto.getUuid()).build()))
      .containsExactly(ANYONE, group1.getName(), group2.getName(), group3.getName());
  }

  @Test
  public void countGroupsByQuery() {
    OrganizationDto organizationDto = db.getDefaultOrganization();
    GroupDto group1 = db.users().insertGroup(organizationDto, "Group-1");
    db.users().insertGroup(organizationDto, "Group-2");
    db.users().insertGroup(organizationDto, "Group-3");
    db.users().insertPermissionOnAnyone(organizationDto, SCAN);
    db.users().insertPermissionOnGroup(group1, PROVISION_PROJECTS);

    assertThat(underTest.countGroupsByQuery(dbSession,
      newQuery().build())).isEqualTo(4);
    assertThat(underTest.countGroupsByQuery(dbSession,
      newQuery().setPermission(PROVISION_PROJECTS.getKey()).build())).isEqualTo(1);
    assertThat(underTest.countGroupsByQuery(dbSession,
      newQuery().withAtLeastOnePermission().build())).isEqualTo(2);
    assertThat(underTest.countGroupsByQuery(dbSession,
      newQuery().setSearchQuery("Group-").build())).isEqualTo(3);
    assertThat(underTest.countGroupsByQuery(dbSession,
      newQuery().setSearchQuery("Any").build())).isEqualTo(1);
  }

  @Test
  public void selectGroupNamesByQuery_with_global_permission() {
    OrganizationDto organizationDto = db.organizations().insert();
    GroupDto group1 = db.users().insertGroup(organizationDto, "Group-1");
    GroupDto group2 = db.users().insertGroup(organizationDto, "Group-2");
    GroupDto group3 = db.users().insertGroup(organizationDto, "Group-3");

    ComponentDto project = db.components().insertComponent(newProjectDto(organizationDto));

    db.users().insertPermissionOnAnyone(organizationDto, SCAN);
    db.users().insertPermissionOnAnyone(organizationDto, PROVISION_PROJECTS);
    db.users().insertPermissionOnGroup(group1, SCAN);
    db.users().insertPermissionOnGroup(group3, ADMINISTER);
    db.users().insertProjectPermissionOnGroup(group2, UserRole.ADMIN, project);

    assertThat(underTest.selectGroupNamesByQuery(dbSession,
      newQuery().setOrganizationUuid(organizationDto.getUuid()).setPermission(SCAN.getKey()).build())).containsExactly(ANYONE, group1.getName());

    assertThat(underTest.selectGroupNamesByQuery(dbSession,
      newQuery().setOrganizationUuid(organizationDto.getUuid()).setPermission(ADMINISTER.getKey()).build())).containsExactly(group3.getName());

    assertThat(underTest.selectGroupNamesByQuery(dbSession,
      newQuery().setOrganizationUuid(organizationDto.getUuid()).setPermission(PROVISION_PROJECTS.getKey()).build())).containsExactly(ANYONE);
  }

  @Test
  public void select_groups_by_query_with_project_permissions() {
    GroupDto group1 = db.users().insertGroup();
    GroupDto group2 = db.users().insertGroup();
    GroupDto group3 = db.users().insertGroup();

    ComponentDto project = db.components().insertProject();
    ComponentDto anotherProject = db.components().insertProject();

    db.users().insertProjectPermissionOnGroup(group1, SCAN_EXECUTION, project);
    db.users().insertProjectPermissionOnGroup(group1, PROVISIONING, project);
    db.users().insertProjectPermissionOnAnyone(USER, project);

    db.users().insertProjectPermissionOnGroup(group1, SYSTEM_ADMIN, anotherProject);
    db.users().insertProjectPermissionOnAnyone(SYSTEM_ADMIN, anotherProject);
    db.users().insertProjectPermissionOnGroup(group3, SCAN_EXECUTION, anotherProject);
    db.users().insertPermissionOnGroup(group2, SCAN);

    PermissionQuery.Builder builderOnComponent = newQuery().setComponentUuid(project.uuid());
    assertThat(underTest.selectGroupNamesByQuery(dbSession,
      builderOnComponent.withAtLeastOnePermission().build())).containsOnlyOnce(group1.getName());
    assertThat(underTest.selectGroupNamesByQuery(dbSession,
      builderOnComponent.setPermission(SCAN_EXECUTION).build())).containsOnlyOnce(group1.getName());
    assertThat(underTest.selectGroupNamesByQuery(dbSession,
      builderOnComponent.setPermission(USER).build())).containsOnlyOnce(ANYONE);
  }

  @Test
  public void selectGroupNamesByQuery_is_paginated() {
    IntStream.rangeClosed(0, 9).forEach(i -> db.users().insertGroup(db.getDefaultOrganization(), i + "-name"));

    List<String> groupNames = underTest.selectGroupNamesByQuery(dbSession,
      newQuery().setPageIndex(2).setPageSize(3).build());
    assertThat(groupNames).containsExactly("3-name", "4-name", "5-name");
  }

  @Test
  public void selectGroupNamesByQuery_with_search_query() {
    GroupDto group = db.users().insertGroup(db.getDefaultOrganization(), "group-anyone");
    db.users().insertGroup(db.getDefaultOrganization(), "unknown");
    db.users().insertPermissionOnGroup(group, SCAN);

    assertThat(underTest.selectGroupNamesByQuery(dbSession,
      newQuery().setSearchQuery("any").build())).containsOnlyOnce(ANYONE, group.getName());
  }

  @Test
  public void selectGroupNamesByQuery_does_not_return_anyone_when_group_roles_is_empty() {
    GroupDto group = db.users().insertGroup();

    assertThat(underTest.selectGroupNamesByQuery(dbSession,
      newQuery().build()))
        .doesNotContain(ANYONE)
        .containsExactly(group.getName());
  }

  @Test
  public void selectByGroupIds_on_global_permissions() {
    OrganizationDto organizationDto = db.organizations().insert();

    GroupDto group1 = db.users().insertGroup(organizationDto, "Group-1");
    db.users().insertPermissionOnGroup(group1, SCAN);

    GroupDto group2 = db.users().insertGroup(organizationDto, "Group-2");
    ComponentDto project = db.components().insertComponent(newProjectDto(organizationDto));
    db.users().insertProjectPermissionOnGroup(group2, UserRole.ADMIN, project);

    GroupDto group3 = db.users().insertGroup(organizationDto, "Group-3");
    db.users().insertPermissionOnGroup(group3, ADMINISTER);

    // Anyone
    db.users().insertPermissionOnAnyone(organizationDto, SCAN);
    db.users().insertPermissionOnAnyone(organizationDto, PROVISION_PROJECTS);

    assertThat(underTest.selectByGroupIds(dbSession, organizationDto.getUuid(), asList(group1.getId()), null))
      .extracting(GroupPermissionDto::getGroupId, GroupPermissionDto::getRole, GroupPermissionDto::getResourceId)
      .containsOnly(tuple(group1.getId(), SCAN_EXECUTION, null));

    assertThat(underTest.selectByGroupIds(dbSession, organizationDto.getUuid(), asList(group2.getId()), null)).isEmpty();

    assertThat(underTest.selectByGroupIds(dbSession, organizationDto.getUuid(), asList(group3.getId()), null))
      .extracting(GroupPermissionDto::getGroupId, GroupPermissionDto::getRole, GroupPermissionDto::getResourceId)
      .containsOnly(tuple(group3.getId(), SYSTEM_ADMIN, null));

    assertThat(underTest.selectByGroupIds(dbSession, organizationDto.getUuid(), asList(ANYONE_ID), null))
      .extracting(GroupPermissionDto::getGroupId, GroupPermissionDto::getRole, GroupPermissionDto::getResourceId)
      .containsOnly(
        tuple(0, SCAN_EXECUTION, null),
        tuple(0, PROVISIONING, null));

    assertThat(underTest.selectByGroupIds(dbSession, organizationDto.getUuid(), asList(group1.getId(), group2.getId(), ANYONE_ID), null)).hasSize(3);
    assertThat(underTest.selectByGroupIds(dbSession, organizationDto.getUuid(), asList(MISSING_ID), null)).isEmpty();
    assertThat(underTest.selectByGroupIds(dbSession, organizationDto.getUuid(), Collections.emptyList(), null)).isEmpty();
  }

  @Test
  public void selectByGroupIds_on_projects() {
    OrganizationDto org = db.organizations().insert();
    GroupDto group1 = db.users().insertGroup(org, "Group-1");
    db.users().insertPermissionOnGroup(group1, PROVISION_PROJECTS);

    GroupDto group2 = db.users().insertGroup(org, "Group-2");
    ComponentDto project = db.components().insertComponent(newProjectDto(org));
    db.users().insertProjectPermissionOnGroup(group2, USER, project);

    GroupDto group3 = db.users().insertGroup(org, "Group-3");
    db.users().insertProjectPermissionOnGroup(group3, USER, project);

    // Anyone group
    db.users().insertPermissionOnAnyone(org, SCAN);
    db.users().insertProjectPermissionOnAnyone(PROVISIONING, project);

    assertThat(underTest.selectByGroupIds(dbSession, defaultOrganizationUuid, singletonList(group1.getId()), project.getId())).isEmpty();

    assertThat(underTest.selectByGroupIds(dbSession, org.getUuid(), singletonList(group2.getId()), project.getId()))
      .extracting(GroupPermissionDto::getGroupId, GroupPermissionDto::getRole, GroupPermissionDto::getResourceId)
      .containsOnly(tuple(group2.getId(), USER, project.getId()));

    assertThat(underTest.selectByGroupIds(dbSession, org.getUuid(), singletonList(group3.getId()), project.getId()))
      .extracting(GroupPermissionDto::getGroupId, GroupPermissionDto::getRole, GroupPermissionDto::getResourceId)
      .containsOnly(tuple(group3.getId(), USER, project.getId()));

    assertThat(underTest.selectByGroupIds(dbSession, org.getUuid(), singletonList(ANYONE_ID), project.getId()))
      .extracting(GroupPermissionDto::getGroupId, GroupPermissionDto::getRole, GroupPermissionDto::getResourceId)
      .containsOnly(tuple(0, PROVISIONING, project.getId()));

    assertThat(underTest.selectByGroupIds(dbSession, org.getUuid(), asList(group1.getId(), group2.getId(), ANYONE_ID), project.getId())).hasSize(2);
    assertThat(underTest.selectByGroupIds(dbSession, org.getUuid(), singletonList(MISSING_ID), project.getId())).isEmpty();
    assertThat(underTest.selectByGroupIds(dbSession, org.getUuid(), singletonList(group1.getId()), 123L)).isEmpty();
    assertThat(underTest.selectByGroupIds(dbSession, org.getUuid(), Collections.emptyList(), project.getId())).isEmpty();
  }

  @Test
  public void selectGlobalPermissionsOfGroup() {
    OrganizationDto org1 = db.organizations().insert();
    OrganizationDto org2 = db.organizations().insert();
    GroupDto group1 = db.users().insertGroup(org1, "group1");
    GroupDto group2 = db.users().insertGroup(org2, "group2");
    ComponentDto project = db.components().insertProject(org1);

    db.users().insertPermissionOnAnyone(org1, "perm1");
    db.users().insertPermissionOnGroup(group1, "perm2");
    db.users().insertPermissionOnGroup(group1, "perm3");
    db.users().insertPermissionOnGroup(group2, "perm4");
    db.users().insertProjectPermissionOnGroup(group1, "perm5", project);
    db.users().insertProjectPermissionOnAnyone("perm6", project);

    assertThat(underTest.selectGlobalPermissionsOfGroup(dbSession, org1.getUuid(), group1.getId())).containsOnly("perm2", "perm3");
    assertThat(underTest.selectGlobalPermissionsOfGroup(dbSession, org2.getUuid(), group2.getId())).containsOnly("perm4");
    assertThat(underTest.selectGlobalPermissionsOfGroup(dbSession, org1.getUuid(), null)).containsOnly("perm1");

    // group1 is not in org2
    assertThat(underTest.selectGlobalPermissionsOfGroup(dbSession, org2.getUuid(), group1.getId())).isEmpty();
    assertThat(underTest.selectGlobalPermissionsOfGroup(dbSession, org2.getUuid(), null)).isEmpty();
  }

  @Test
  public void selectProjectPermissionsOfGroup() {
    OrganizationDto org1 = db.organizations().insert();
    GroupDto group1 = db.users().insertGroup(org1, "group1");
    ComponentDto project1 = db.components().insertProject(org1);
    ComponentDto project2 = db.components().insertProject(org1);

    db.users().insertPermissionOnAnyone(org1, "perm1");
    db.users().insertPermissionOnGroup(group1, "perm2");
    db.users().insertProjectPermissionOnGroup(group1, "perm3", project1);
    db.users().insertProjectPermissionOnGroup(group1, "perm4", project1);
    db.users().insertProjectPermissionOnGroup(group1, "perm5", project2);
    db.users().insertProjectPermissionOnAnyone("perm6", project1);

    assertThat(underTest.selectProjectPermissionsOfGroup(dbSession, org1.getUuid(), group1.getId(), project1.getId()))
      .containsOnly("perm3", "perm4");
    assertThat(underTest.selectProjectPermissionsOfGroup(dbSession, org1.getUuid(), group1.getId(), project2.getId()))
      .containsOnly("perm5");
    assertThat(underTest.selectProjectPermissionsOfGroup(dbSession, org1.getUuid(), null, project1.getId()))
      .containsOnly("perm6");
    assertThat(underTest.selectProjectPermissionsOfGroup(dbSession, org1.getUuid(), null, project2.getId()))
      .isEmpty();
  }

  @Test
  public void selectAllPermissionsByGroupId() throws Exception {
    OrganizationDto org1 = db.organizations().insert();
    GroupDto group1 = db.users().insertGroup(org1, "group1");
    ComponentDto project1 = db.components().insertProject(org1);
    ComponentDto project2 = db.components().insertProject(org1);
    db.users().insertPermissionOnAnyone(org1, "perm1");
    db.users().insertPermissionOnGroup(group1, "perm2");
    db.users().insertProjectPermissionOnGroup(group1, "perm3", project1);
    db.users().insertProjectPermissionOnGroup(group1, "perm4", project1);
    db.users().insertProjectPermissionOnGroup(group1, "perm5", project2);
    db.users().insertProjectPermissionOnAnyone("perm6", project1);

    List<GroupPermissionDto> result = new ArrayList<>();
    underTest.selectAllPermissionsByGroupId(dbSession, org1.getUuid(), group1.getId(), context -> result.add((GroupPermissionDto) context.getResultObject()));
    assertThat(result).extracting(GroupPermissionDto::getResourceId, GroupPermissionDto::getRole).containsOnly(
      tuple(null, "perm2"),
      tuple(project1.getId(), "perm3"), tuple(project1.getId(), "perm4"), tuple(project2.getId(), "perm5"));
  }

  @Test
  public void deleteByRootComponentId() {
    OrganizationDto org = db.organizations().insert();
    GroupDto group1 = db.users().insertGroup(org);
    GroupDto group2 = db.users().insertGroup(org);
    ComponentDto project1 = db.components().insertProject(org);
    ComponentDto project2 = db.components().insertProject(org);
    db.users().insertPermissionOnGroup(group1, "perm1");
    db.users().insertProjectPermissionOnGroup(group1, "perm2", project1);
    db.users().insertProjectPermissionOnAnyone("perm3", project1);
    db.users().insertProjectPermissionOnGroup(group2, "perm4", project2);

    underTest.deleteByRootComponentId(dbSession, project1.getId());
    dbSession.commit();

    assertThat(db.countSql("select count(id) from group_roles where resource_id=" + project1.getId())).isEqualTo(0);
    assertThat(db.countRowsOfTable("group_roles")).isEqualTo(2);
  }

  @Test
  public void delete_global_permission_from_group() {
    OrganizationDto org = db.organizations().insert();
    GroupDto group1 = db.users().insertGroup(org);
    ComponentDto project1 = db.components().insertProject(org);
    db.users().insertPermissionOnAnyone(org, "perm1");
    db.users().insertPermissionOnGroup(group1, "perm2");
    db.users().insertProjectPermissionOnGroup(group1, "perm3", project1);
    db.users().insertProjectPermissionOnAnyone("perm4", project1);

    underTest.delete(dbSession, "perm2", group1.getOrganizationUuid(), group1.getId(), null);
    dbSession.commit();

    assertThatNoPermission("perm2");
    assertThat(db.countRowsOfTable("group_roles")).isEqualTo(3);
  }

  @Test
  public void delete_global_permission_from_anyone() {
    OrganizationDto org = db.organizations().insert();
    GroupDto group1 = db.users().insertGroup(org);
    ComponentDto project1 = db.components().insertProject(org);
    db.users().insertPermissionOnAnyone(org, "perm1");
    db.users().insertPermissionOnGroup(group1, "perm2");
    db.users().insertProjectPermissionOnGroup(group1, "perm3", project1);
    db.users().insertProjectPermissionOnAnyone("perm4", project1);

    underTest.delete(dbSession, "perm1", group1.getOrganizationUuid(), null, null);
    dbSession.commit();

    assertThatNoPermission("perm1");
    assertThat(db.countRowsOfTable("group_roles")).isEqualTo(3);
  }

  @Test
  public void delete_project_permission_from_group() {
    OrganizationDto org = db.organizations().insert();
    GroupDto group1 = db.users().insertGroup(org);
    ComponentDto project1 = db.components().insertProject(org);
    db.users().insertPermissionOnAnyone(org, "perm1");
    db.users().insertPermissionOnGroup(group1, "perm2");
    db.users().insertProjectPermissionOnGroup(group1, "perm3", project1);
    db.users().insertProjectPermissionOnAnyone("perm4", project1);

    underTest.delete(dbSession, "perm3", group1.getOrganizationUuid(), group1.getId(), project1.getId());
    dbSession.commit();

    assertThatNoPermission("perm3");
    assertThat(db.countRowsOfTable("group_roles")).isEqualTo(3);
  }

  @Test
  public void delete_project_permission_from_anybody() {
    OrganizationDto org = db.organizations().insert();
    GroupDto group1 = db.users().insertGroup(org);
    ComponentDto project1 = db.components().insertProject(org);
    db.users().insertPermissionOnAnyone(org, "perm1");
    db.users().insertPermissionOnGroup(group1, "perm2");
    db.users().insertProjectPermissionOnGroup(group1, "perm3", project1);
    db.users().insertProjectPermissionOnAnyone("perm4", project1);

    underTest.delete(dbSession, "perm4", group1.getOrganizationUuid(), null, project1.getId());
    dbSession.commit();

    assertThatNoPermission("perm4");
    assertThat(db.countRowsOfTable("group_roles")).isEqualTo(3);
  }

  @Test
  public void deleteByOrganization_does_not_fail_on_empty_db() {
    underTest.deleteByOrganization(dbSession, "some uuid");
    dbSession.commit();
  }

  @Test
  public void deleteByOrganization_does_not_fail_if_organization_has_no_group() {
    OrganizationDto organization = db.organizations().insert();

    underTest.deleteByOrganization(dbSession, organization.getUuid());
    dbSession.commit();
  }

  @Test
  public void deleteByOrganization_deletes_all_groups_of_organization() {
    OrganizationDto organization1 = db.organizations().insert();
    OrganizationDto organization2 = db.organizations().insert();
    OrganizationDto organization3 = db.organizations().insert();
    insertGroupWithPermissions(organization1);
    insertGroupWithPermissions(organization2);
    insertGroupWithPermissions(organization3);
    insertGroupWithPermissions(organization3);
    insertGroupWithPermissions(organization2);
    db.users().insertPermissionOnAnyone(organization1, "pop");
    db.users().insertPermissionOnAnyone(organization2, "pop");
    db.users().insertPermissionOnAnyone(organization3, "pop");

    underTest.deleteByOrganization(dbSession, organization2.getUuid());
    dbSession.commit();
    verifyOrganizationUuidsInTable(organization1.getUuid(), organization3.getUuid());

    underTest.deleteByOrganization(dbSession, organization1.getUuid());
    dbSession.commit();
    verifyOrganizationUuidsInTable(organization3.getUuid());

    underTest.deleteByOrganization(dbSession, organization3.getUuid());
    dbSession.commit();
    verifyOrganizationUuidsInTable();
  }

  private PermissionQuery.Builder newQuery() {
    return PermissionQuery.builder().setOrganizationUuid(db.getDefaultOrganization().getUuid());
  }

  private void verifyOrganizationUuidsInTable(String... organizationUuids) {
    assertThat(db.select("select distinct organization_uuid as \"organizationUuid\" from group_roles"))
      .extracting((row) -> (String) row.get("organizationUuid"))
      .containsOnly(organizationUuids);
  }

  private int insertGroupWithPermissions(OrganizationDto organization1) {
    GroupDto group = db.users().insertGroup(organization1);
    db.users().insertPermissionOnGroup(group, "foo");
    db.users().insertPermissionOnGroup(group, "bar");
    db.users().insertPermissionOnGroup(group, "doh");
    return group.getId();
  }

  private void assertThatNoPermission(String permission) {
    assertThat(db.countSql("select count(id) from group_roles where role='" + permission + "'")).isEqualTo(0);
  }

}
