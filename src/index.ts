import { drizzle } from "drizzle-orm/postgres-js";
import { Hono } from "hono";
import { cors } from "hono/cors";
import postgres from "postgres";
import { users } from "./db/schema";
import { and, eq } from "drizzle-orm";

const app = new Hono();
app.use(
  "/*",
  cors({
    origin: "*",
  })
);
const client = postgres(process.env.POSTGRES_URL || panic());
const db = drizzle(client);

type User = {
  name: string;
  email: string;
  waNum: string;
  linkedin: string;
  degree: string;
  department: string;
  image: string;
  alumni: boolean;
  gradYr: string;
  proofOfGrad: string;
  currWorkplace: string;
  password: string;
};

app.get("/", (c) => c.text("Server Online!"));

app.get("/users", async (c) => {
  const usr = await db.select().from(users);
  return c.json(
    usr.map((x: any) => {
      delete x.password;
      return x; // remove password from response. 🤷‍♂️ 🤷‍♀️ 🤷‍♂️ 🤷‍♀"
    })
  );
});

app.get("/users/alumni", async (c) => {
  const usr = await db.select().from(users).where(eq(users.alumni, true));
  return c.json(
    usr.map((x: any) => {
      delete x.password;
      return x; // remove password from response. 🤷‍♂️ 🤷‍♀️ 🤷‍♂️ 🤷‍♀"
    })
  );
});

app.get("/users/students", async (c) => {
  const usr = await db.select().from(users).where(eq(users.alumni, false));
  return c.json(
    usr.map((x: any) => {
      delete x.password;
      return x; // remove password from response. 🤷‍♂️ 🤷‍♀️ 🤷‍♂️ 🤷‍♀"
    })
  );
});

app.post("/users/delete", async (c) => {
  const body: { id: number; token: string } = await c.req.json();
  if (body.token !== process.env.TOKEN) {
    return c.text("Invalid token", 401);
  }
  const res = await db.delete(users).where(eq(users.id, body.id));
  return c.text("Successfully deleted!");
});

app.post("/users/login", async (c) => {
  const body: { email: string; password: string } = await c.req.json();
  const usr = await db.select().from(users).where(eq(users.email, body.email));
  if (usr.length === 0) {
    c.status(401);
    return c.text("Invalid email");
  }
  if (usr[0].password !== body.password) {
    c.status(401);
    return c.text("Invalid password");
  }
  return c.json(usr[0]);
});

app.post("/users/register", async (c) => {
  const body: User = await c.req.json();
  await db.insert(users).values({
    ...body,
    verified: false,
  });
  return c.text("Successfully added!");
});

app.post("/users/update", async (c) => {
  const {id, password, user} : {id: number, password: string, user: User} = await c.req.json();
  await db.update(users).set(user).where(and(eq(users.id, id), eq(users.password, password)));
  return c.text("Successfully updated!");
})

app.post("/users/verify", async (c) => {
  const body: { id: number; token: string } = await c.req.json();
  if (body.token !== process.env.TOKEN) {
    return c.text("Invalid token", 401);
  }
  await db.update(users).set({ verified: true }).where(eq(users.id, body.id));
  return c.text("Successfully verified!");
});

export default app;

function panic() {
  console.error("POSTGRES_URL not set");
  process.exit(1);
  return ""; // unreachable code, but typescript doesn't know that. 🤷‍♂️ 🤷‍♀️ 🤷‍♂️ 🤷‍♀"
}
