import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import { users } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_KEY);

export const config = {
  runtime: "edge"
};
const app = new Hono().basePath('/api');

app.use(
  "/*",
  cors({
    origin: "*",
  })
);
export const db = drizzle(sql);

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
  const usr = await db.select().from(users).where(eq(users.id, body.id));
  await resend.emails.send({
    from: 'onboarding@mail.alumni-kgec.in',
    to: usr[0].email || "abc@def.com",
    subject: "Congrats 🎊🎊 Your account has been verified",
    html: `<h1>Welcome to KGEC Alumni Platform</h1>
          <br><h3>The place to connect with others of the KGEC Family<h3>
          <p>Go over to <a href=alumni-kgec.in>Alumni Website</a> and meet your old batchmates once again
          <h2>Thank you very much for registering</h2>`
  })
  return c.text("Successfully verified!");
});

export default handle(app);