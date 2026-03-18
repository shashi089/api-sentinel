import { test, expect } from "reqprobe"

test("GET /users/{id}", async ({ request }) => {
  const response = await request.get("/users/{id}")
  expect(response.status).toBe(200)
})
