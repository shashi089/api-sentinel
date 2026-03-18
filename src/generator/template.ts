export function renderTestTemplate(method: string, apiPath: string): string {
    return `import { test, expect } from "api-sentinel"

test("${method} ${apiPath}", async ({ request }) => {
  const response = await request.${method.toLowerCase()}("${apiPath}")
  expect(response.status).toBe(200)
})
`;
}
