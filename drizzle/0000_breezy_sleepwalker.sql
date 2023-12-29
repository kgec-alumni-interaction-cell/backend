CREATE TABLE IF NOT EXISTS "Users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(80),
	"email" varchar(80),
	"image" varchar,
	"alumni" boolean,
	"gradYr" numeric,
	"proofOfGrad" varchar,
	"verified" boolean DEFAULT false,
	"currWorkplace" varchar,
	"password" varchar,
	CONSTRAINT "Users_email_unique" UNIQUE("email")
);
