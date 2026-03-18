import { test, expect } from "reqprobe"

test("POST /auth/login", async ({ request }) => {
  const response = await request.post("/auth/login")
  expect(response.status).toBe(200)
})
