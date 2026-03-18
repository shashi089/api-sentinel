import { test, expect } from "api-sentinel"

test("GET /users/{id}", async ({ request }) => {
  const response = await request.get("/users/{id}")
  expect(response.status).toBe(200)
})
