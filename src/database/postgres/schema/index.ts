import { relations } from "drizzle-orm";

import { colleges } from "./colleges.ts";
import {
  users,
  emailOtps,
  studentProfiles,
  pastWorks,
  skills,
  userSkills,
} from "./users.ts";
import {
  startups,
  startupMembers,
  startupOpenRoles,
  startupMilestones,
} from "./startups.ts";
import { projects, projectMembers } from "./projects.ts";
import {
  invitations,
  collaborationRequests,
  follows,
  shortlists,
} from "./teams.ts";
import { posts, comments, reactions, mediaAssets } from "./posts.ts";
import { communities, communityMembers, notifications } from "./communities.ts";

export * from "./colleges.ts";
export * from "./users.ts";
export * from "./startups.ts";
export * from "./projects.ts";
export * from "./teams.ts";
export * from "./posts.ts";
export * from "./communities.ts";

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(studentProfiles, {
    fields: [users.id],
    references: [studentProfiles.userId],
  }),
  ownedStartups: many(startups),
  startupMemberships: many(startupMembers),
  userSkills: many(userSkills),
  ownedProjects: many(projects),
  projectMemberships: many(projectMembers),
  posts: many(posts),
  follows: many(follows),
  shortlists: many(shortlists),
  notifications: many(notifications),
}));

export const studentProfilesRelations = relations(studentProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [studentProfiles.userId],
    references: [users.id],
  }),
  college: one(colleges, {
    fields: [studentProfiles.collegeId],
    references: [colleges.id],
  }),
  pastWorks: many(pastWorks),
}));

export const pastWorksRelations = relations(pastWorks, ({ one }) => ({
  profile: one(studentProfiles, {
    fields: [pastWorks.profileId],
    references: [studentProfiles.id],
  }),
}));

export const userSkillsRelations = relations(userSkills, ({ one }) => ({
  user: one(users, {
    fields: [userSkills.userId],
    references: [users.id],
  }),
  skill: one(skills, {
    fields: [userSkills.skillId],
    references: [skills.id],
  }),
}));

export const startupsRelations = relations(startups, ({ one, many }) => ({
  owner: one(users, {
    fields: [startups.ownerId],
    references: [users.id],
  }),
  college: one(colleges, {
    fields: [startups.collegeId],
    references: [colleges.id],
  }),
  members: many(startupMembers),
  openRoles: many(startupOpenRoles),
  milestones: many(startupMilestones),
  invitations: many(invitations),
  projects: many(projects),
  posts: many(posts),
}));

export const startupMembersRelations = relations(startupMembers, ({ one }) => ({
  startup: one(startups, {
    fields: [startupMembers.startupId],
    references: [startups.id],
  }),
  user: one(users, {
    fields: [startupMembers.userId],
    references: [users.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  startup: one(startups, {
    fields: [projects.startupId],
    references: [startups.id],
  }),
  members: many(projectMembers),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectMembers.userId],
    references: [users.id],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  startup: one(startups, {
    fields: [posts.startupId],
    references: [startups.id],
  }),
  comments: many(comments),
  reactions: many(reactions),
}));

export const communitiesRelations = relations(communities, ({ one, many }) => ({
  college: one(colleges, {
    fields: [communities.collegeId],
    references: [colleges.id],
  }),
  creator: one(users, {
    fields: [communities.creatorId],
    references: [users.id],
  }),
  members: many(communityMembers),
}));

export const schema = {
  colleges,
  users,
  emailOtps,
  studentProfiles,
  pastWorks,
  skills,
  userSkills,
  startups,
  startupMembers,
  startupOpenRoles,
  startupMilestones,
  projects,
  projectMembers,
  invitations,
  collaborationRequests,
  follows,
  shortlists,
  posts,
  comments,
  reactions,
  mediaAssets,
  communities,
  communityMembers,
  notifications,
};

export type Schema = typeof schema;
