CREATE TYPE "public"."availability_status" AS ENUM('Open to join', 'Looking for co-founder', 'Just exploring');--> statement-breakpoint
CREATE TYPE "public"."otp_purpose" AS ENUM('SIGNUP', 'LOGIN');--> statement-breakpoint
CREATE TYPE "public"."past_work_link_type" AS ENUM('GitHub', 'Behance', 'Portfolio', 'Figma', 'Live Demo', 'Other');--> statement-breakpoint
CREATE TYPE "public"."profile_role" AS ENUM('FOUNDER', 'JOINER', 'BOTH');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."milestone_type" AS ENUM('Idea validated', 'Prototype ready', 'First users', 'Launched', 'Won event', 'Custom update');--> statement-breakpoint
CREATE TYPE "public"."open_role_status" AS ENUM('OPEN', 'FILLED', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."open_role_type" AS ENUM('co-founder', 'teammate', 'short-term collaboration');--> statement-breakpoint
CREATE TYPE "public"."startup_stage" AS ENUM('Idea', 'Building MVP', 'Launched', 'Has users');--> statement-breakpoint
CREATE TYPE "public"."startup_visibility" AS ENUM('PUBLIC', 'STEALTH');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('IDEA', 'IN_PROGRESS', 'LAUNCHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."project_visibility" AS ENUM('PUBLIC', 'PRIVATE');--> statement-breakpoint
CREATE TYPE "public"."collaboration_status" AS ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'WITHDRAWN');--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('PENDING', 'ACCEPTED', 'DECLINED');--> statement-breakpoint
CREATE TYPE "public"."target_entity_type" AS ENUM('USER', 'STARTUP');--> statement-breakpoint
CREATE TYPE "public"."post_type" AS ENUM('Update', 'Milestone', 'Looking For');--> statement-breakpoint
CREATE TYPE "public"."reaction_type" AS ENUM('LIKE', 'CELEBRATE', 'SUPPORT', 'INSIGHTFUL');--> statement-breakpoint
CREATE TYPE "public"."community_member_role" AS ENUM('ADMIN', 'MODERATOR', 'MEMBER');--> statement-breakpoint
CREATE TABLE "colleges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"short_name" varchar(64),
	"domain" varchar(255),
	"city" varchar(120),
	"state" varchar(120),
	"country" varchar(120) DEFAULT 'India' NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_otps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"otp_hash" varchar(255) NOT NULL,
	"purpose" "otp_purpose" NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "past_works" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"link_type" "past_work_link_type" DEFAULT 'Portfolio' NOT NULL,
	"description" varchar(280) DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"category" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"college_id" uuid,
	"full_name" varchar(255) DEFAULT '' NOT NULL,
	"college_name" varchar(255) DEFAULT '' NOT NULL,
	"year" varchar(64) DEFAULT '' NOT NULL,
	"branch" varchar(255) DEFAULT '' NOT NULL,
	"bio" varchar(280) DEFAULT '' NOT NULL,
	"avatar_url" text DEFAULT '/images/default.svg' NOT NULL,
	"role" "profile_role",
	"interests" text[] DEFAULT '{}' NOT NULL,
	"looking_for" text[] DEFAULT '{}' NOT NULL,
	"availability_status" "availability_status" DEFAULT 'Just exploring' NOT NULL,
	"weekly_hours_available" integer DEFAULT 0 NOT NULL,
	"is_builder" boolean DEFAULT false NOT NULL,
	"builder_badge_awarded_at" timestamp with time zone,
	"profile_completion_percentage" integer DEFAULT 0 NOT NULL,
	"social_links" jsonb DEFAULT '{"linkedin":"","github":"","twitter":"","portfolio":""}'::jsonb NOT NULL,
	"privacy" jsonb DEFAULT '{"hideYear":false,"hideBranch":false,"allowIntroRequests":true}'::jsonb NOT NULL,
	"reputation_count" integer DEFAULT 0 NOT NULL,
	"weekly_streak" integer DEFAULT 0 NOT NULL,
	"founder_details" jsonb DEFAULT '{"startupName":"","stage":""}'::jsonb NOT NULL,
	"joiner_details" jsonb DEFAULT '{"skills":[],"graduationYear":null}'::jsonb NOT NULL,
	"is_onboarded" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"proficiency" varchar(50) DEFAULT 'Intermediate',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"google_id" varchar(255),
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"email_verified_at" timestamp with time zone,
	"profile_image_url" text DEFAULT '/images/default.svg' NOT NULL,
	"role" "user_role" DEFAULT 'USER' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "startup_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"startup_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(100) DEFAULT 'Team Member' NOT NULL,
	"joined_date" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "startup_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"startup_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"milestone_type" "milestone_type" DEFAULT 'Custom update' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"completed_date" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "startup_open_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"startup_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"skills_needed" text[] DEFAULT '{}' NOT NULL,
	"commitment_hours" integer DEFAULT 0 NOT NULL,
	"role_type" "open_role_type" DEFAULT 'teammate' NOT NULL,
	"equity_or_credit_note" text DEFAULT '' NOT NULL,
	"status" "open_role_status" DEFAULT 'OPEN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "startups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"college_id" uuid,
	"name" varchar(255) NOT NULL,
	"pitch" varchar(200) NOT NULL,
	"problem" text DEFAULT '' NOT NULL,
	"solution" text DEFAULT '' NOT NULL,
	"industry_tags" text[] DEFAULT '{}' NOT NULL,
	"stage" "startup_stage" DEFAULT 'Idea' NOT NULL,
	"visibility" "startup_visibility" DEFAULT 'PUBLIC' NOT NULL,
	"links" jsonb DEFAULT '{"website":"","demo":"","github":"","pitchDeck":""}'::jsonb NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(100) DEFAULT 'Contributor' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"startup_id" uuid,
	"title" varchar(255) NOT NULL,
	"summary" varchar(280) DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"repo_url" text,
	"demo_url" text,
	"status" "project_status" DEFAULT 'IN_PROGRESS' NOT NULL,
	"visibility" "project_visibility" DEFAULT 'PUBLIC' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collaboration_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sender_id" uuid NOT NULL,
	"recipient_id" uuid NOT NULL,
	"startup_id" uuid,
	"project_id" uuid,
	"message" text DEFAULT '' NOT NULL,
	"status" "collaboration_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"follower_id" uuid NOT NULL,
	"target_type" "target_entity_type" NOT NULL,
	"target_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"startup_id" uuid,
	"project_id" uuid,
	"inviter_id" uuid,
	"invitee_email" varchar(255) NOT NULL,
	"invitee_user_id" uuid,
	"role" varchar(100) DEFAULT 'Team Member' NOT NULL,
	"status" "invitation_status" DEFAULT 'PENDING' NOT NULL,
	"invited_at" timestamp with time zone DEFAULT now() NOT NULL,
	"responded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shortlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"item_type" "target_entity_type" NOT NULL,
	"item_id" uuid NOT NULL,
	"note" varchar(300) DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"parent_id" uuid,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"uploader_id" uuid,
	"entity_type" varchar(64) NOT NULL,
	"entity_id" uuid,
	"storage_key" text NOT NULL,
	"url" text NOT NULL,
	"mime_type" varchar(120) NOT NULL,
	"size_bytes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid,
	"startup_id" uuid,
	"title" varchar(255) NOT NULL,
	"post_type" "post_type" DEFAULT 'Update' NOT NULL,
	"body" text NOT NULL,
	"cover_image_url" text,
	"profile_image_url" text NOT NULL,
	"startup_name" varchar(255) NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"likes_count" integer DEFAULT 0 NOT NULL,
	"comments_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "reaction_type" DEFAULT 'LIKE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"college_id" uuid,
	"creator_id" uuid NOT NULL,
	"name" varchar(150) NOT NULL,
	"slug" varchar(180) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"is_private" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "community_member_role" DEFAULT 'MEMBER' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"actor_id" uuid,
	"type" varchar(80) NOT NULL,
	"title" varchar(200) NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"entity_type" varchar(64),
	"entity_id" uuid,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "past_works" ADD CONSTRAINT "past_works_profile_id_student_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."student_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_college_id_colleges_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "startup_members" ADD CONSTRAINT "startup_members_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "startup_members" ADD CONSTRAINT "startup_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "startup_milestones" ADD CONSTRAINT "startup_milestones_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "startup_open_roles" ADD CONSTRAINT "startup_open_roles_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "startups" ADD CONSTRAINT "startups_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "startups" ADD CONSTRAINT "startups_college_id_colleges_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_requests" ADD CONSTRAINT "collaboration_requests_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_requests" ADD CONSTRAINT "collaboration_requests_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_requests" ADD CONSTRAINT "collaboration_requests_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_requests" ADD CONSTRAINT "collaboration_requests_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invitee_user_id_users_id_fk" FOREIGN KEY ("invitee_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shortlists" ADD CONSTRAINT "shortlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploader_id_users_id_fk" FOREIGN KEY ("uploader_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communities" ADD CONSTRAINT "communities_college_id_colleges_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communities" ADD CONSTRAINT "communities_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_members" ADD CONSTRAINT "community_members_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_members" ADD CONSTRAINT "community_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_colleges_name" ON "colleges" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_colleges_domain" ON "colleges" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "idx_colleges_city" ON "colleges" USING btree ("city");--> statement-breakpoint
CREATE INDEX "idx_email_otps_email_purpose" ON "email_otps" USING btree ("email","purpose");--> statement-breakpoint
CREATE INDEX "idx_email_otps_expires_at" ON "email_otps" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_past_works_profile_id" ON "past_works" USING btree ("profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_skills_name" ON "skills" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_skills_slug" ON "skills" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_student_profiles_user_id" ON "student_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_student_profiles_college_id" ON "student_profiles" USING btree ("college_id");--> statement-breakpoint
CREATE INDEX "idx_student_profiles_role" ON "student_profiles" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_student_profiles_availability" ON "student_profiles" USING btree ("availability_status");--> statement-breakpoint
CREATE INDEX "idx_student_profiles_is_builder" ON "student_profiles" USING btree ("is_builder");--> statement-breakpoint
CREATE INDEX "idx_student_profiles_is_onboarded" ON "student_profiles" USING btree ("is_onboarded");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_user_skills_user_skill" ON "user_skills" USING btree ("user_id","skill_id");--> statement-breakpoint
CREATE INDEX "idx_user_skills_skill_id" ON "user_skills" USING btree ("skill_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_users_google_id" ON "users" USING btree ("google_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_startup_members_startup_user" ON "startup_members" USING btree ("startup_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_startup_members_user_id" ON "startup_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_startup_milestones_startup_id" ON "startup_milestones" USING btree ("startup_id");--> statement-breakpoint
CREATE INDEX "idx_startup_open_roles_startup_id" ON "startup_open_roles" USING btree ("startup_id");--> statement-breakpoint
CREATE INDEX "idx_startup_open_roles_status" ON "startup_open_roles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_startups_owner_id" ON "startups" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_startups_college_id" ON "startups" USING btree ("college_id");--> statement-breakpoint
CREATE INDEX "idx_startups_stage" ON "startups" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "idx_startups_visibility" ON "startups" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "idx_startups_is_archived" ON "startups" USING btree ("is_archived");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_project_members_project_user" ON "project_members" USING btree ("project_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_project_members_user_id" ON "project_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_projects_owner_id" ON "projects" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_projects_startup_id" ON "projects" USING btree ("startup_id");--> statement-breakpoint
CREATE INDEX "idx_projects_status" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_collab_requests_sender_id" ON "collaboration_requests" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "idx_collab_requests_recipient_id" ON "collaboration_requests" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "idx_collab_requests_status" ON "collaboration_requests" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_follows_follower_target" ON "follows" USING btree ("follower_id","target_type","target_id");--> statement-breakpoint
CREATE INDEX "idx_follows_target" ON "follows" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "idx_invitations_startup_id" ON "invitations" USING btree ("startup_id");--> statement-breakpoint
CREATE INDEX "idx_invitations_project_id" ON "invitations" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_invitations_email" ON "invitations" USING btree ("invitee_email");--> statement-breakpoint
CREATE INDEX "idx_invitations_status" ON "invitations" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_shortlists_user_item" ON "shortlists" USING btree ("user_id","item_type","item_id");--> statement-breakpoint
CREATE INDEX "idx_shortlists_item" ON "shortlists" USING btree ("item_type","item_id");--> statement-breakpoint
CREATE INDEX "idx_comments_post_id" ON "comments" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "idx_comments_author_id" ON "comments" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_media_assets_uploader_id" ON "media_assets" USING btree ("uploader_id");--> statement-breakpoint
CREATE INDEX "idx_media_assets_entity" ON "media_assets" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_posts_author_id" ON "posts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_posts_startup_id" ON "posts" USING btree ("startup_id");--> statement-breakpoint
CREATE INDEX "idx_posts_post_type" ON "posts" USING btree ("post_type");--> statement-breakpoint
CREATE INDEX "idx_posts_published_at" ON "posts" USING btree ("published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_reactions_post_user_type" ON "reactions" USING btree ("post_id","user_id","type");--> statement-breakpoint
CREATE INDEX "idx_reactions_user_id" ON "reactions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_communities_slug" ON "communities" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_communities_college_id" ON "communities" USING btree ("college_id");--> statement-breakpoint
CREATE INDEX "idx_communities_creator_id" ON "communities" USING btree ("creator_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_community_members_community_user" ON "community_members" USING btree ("community_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_community_members_user_id" ON "community_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_id_read" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "idx_notifications_created_at" ON "notifications" USING btree ("created_at");