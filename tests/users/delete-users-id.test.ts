import { test, expect } from "reqprobe"

test("DELETE /users/{id}", async ({ request }) => {
  const response = await request.delete("/users/{id}")
  expect(response.status).toBe(200)
})
