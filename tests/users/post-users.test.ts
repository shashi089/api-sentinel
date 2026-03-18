import { test, expect } from "api-sentinel"

test("POST /users", async ({ request }) => {
  const response = await request.post("/users")
  expect(response.status).toBe(200)
})
