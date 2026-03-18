import { test, expect } from "api-sentinel"

test("GET /users", async ({ request }) => {
  const response = await request.get("/users")
  expect(response.status).toBe(200)
})
