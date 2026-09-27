import app from "./src/app.ts";
import { connectDatabase } from "./src/config/database.ts";

const email = "authsmoke_" + Date.now() + "@example.com";
await connectDatabase();
const server = app.listen(4001, "127.0.0.1", () => console.log("LISTENING"));

setTimeout(async () => {
  try {
    const base = "http://127.0.0.1:4001";

    const registerResponse = await fetch(base + "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Auth Smoke", email, password: "secret123" }),
    });
    const registerJson = await registerResponse.json();
    console.log("REGISTER_STATUS", registerResponse.status);
    console.log(JSON.stringify(registerJson));

    const loginResponse = await fetch(base + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "secret123" }),
    });
    const loginJson = await loginResponse.json();
    console.log("LOGIN_STATUS", loginResponse.status);
    console.log(JSON.stringify(loginJson));

    const token = loginJson.data?.token;
    const meResponse = await fetch(base + "/api/auth/me", {
      headers: { Authorization: "Bearer " + token },
    });
    const meJson = await meResponse.json();
    console.log("ME_STATUS", meResponse.status);
    console.log(JSON.stringify(meJson));
  } finally {
    server.close();
  }
}, 200);
