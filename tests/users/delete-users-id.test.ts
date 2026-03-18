import { test, expect } from "api-sentinel"

test("DELETE /users/{id}", async ({ request }) => {
  const response = await request.delete("/users/{id}")
  expect(response.status).toBe(200)
})
