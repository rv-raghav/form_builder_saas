CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	CONSTRAINT "roles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" varchar(120) NOT NULL,
	"path" varchar(255),
	"category" varchar(80) DEFAULT 'main' NOT NULL,
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "components" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text,
	"page_id" integer NOT NULL,
	"category" varchar(80) DEFAULT 'general' NOT NULL,
	CONSTRAINT "components_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TYPE "public"."permission_override_type" AS ENUM('page', 'component');--> statement-breakpoint
CREATE TYPE "public"."permission_override_action" AS ENUM('grant', 'revoke');--> statement-breakpoint
CREATE TABLE "role_page_permissions" (
	"role_id" integer NOT NULL,
	"page_id" integer NOT NULL,
	"has_access" boolean DEFAULT false NOT NULL,
	CONSTRAINT "role_page_permissions_role_id_page_id_unique" UNIQUE("role_id","page_id")
);
--> statement-breakpoint
CREATE TABLE "role_component_permissions" (
	"role_id" integer NOT NULL,
	"component_id" integer NOT NULL,
	"has_access" boolean DEFAULT false NOT NULL,
	CONSTRAINT "role_component_permissions_role_id_component_id_unique" UNIQUE("role_id","component_id")
);
--> statement-breakpoint
CREATE TABLE "user_permission_overrides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"override_type" "permission_override_type" NOT NULL,
	"slug" varchar(80) NOT NULL,
	"action" "permission_override_action" NOT NULL,
	CONSTRAINT "user_permission_overrides_user_id_override_type_slug_unique" UNIQUE("user_id","override_type","slug")
);
--> statement-breakpoint
ALTER TABLE "components" ADD CONSTRAINT "components_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_page_permissions" ADD CONSTRAINT "role_page_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_page_permissions" ADD CONSTRAINT "role_page_permissions_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_component_permissions" ADD CONSTRAINT "role_component_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_component_permissions" ADD CONSTRAINT "role_component_permissions_component_id_components_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_permission_overrides" ADD CONSTRAINT "user_permission_overrides_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
