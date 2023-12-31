import {
  boolean,
  numeric,
  pgTable,
  serial,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("Users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 80 }),
  email: varchar("email", { length: 80 }).unique(),
  waNum: numeric("waNum"),
  linkedin: varchar("linkedin"),
  degree: varchar("degree", { length: 3 }),
  department: varchar("department", { length: 80 }),
  image: varchar("image"),
  alumni: boolean("alumni"),
  gradYr: numeric("gradYr"),
  proofOfGrad: varchar("proofOfGrad"),
  verified: boolean("verified").default(false),
  currWorkplace: varchar("currWorkplace"),
  password: varchar("password"),
});
