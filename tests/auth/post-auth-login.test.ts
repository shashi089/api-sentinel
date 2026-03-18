import { test, expect } from "api-sentinel"

test("POST /auth/login", async ({ request }) => {
  const response = await request.post("/auth/login")
  expect(response.status).toBe(200)
})
