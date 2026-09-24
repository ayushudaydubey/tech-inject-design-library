import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { app } from "../server";
import { connectDatabase, disconnectDatabase } from "../src/config/db";
import { seedDatabase } from "../src/services/seedService";
import { User } from "../src/models/User";
import { Component } from "../src/models/Component";
import { env } from "../src/config/env";

const TEST_PORT = 5099;
const BASE_URL = `http://localhost:${TEST_PORT}`;
let server: http.Server;

let adminToken = "";
let freeCustomerToken = "";
let freeCustomerId = "";
let freeCustomerRefreshToken = "";
let premiumCustomerToken = "";
let testComponentId = "";
const testComponentSlug = "test-verification-widget";

describe("Tech Inject Backend Comprehensive Test Suite", () => {
  before(async () => {
    await connectDatabase();
    await seedDatabase();

    // Start server on dedicated test port
    await new Promise<void>((resolve) => {
      server = app.listen(TEST_PORT, () => {
        resolve();
      });
    });

    // 1. Authenticate Admin
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    assert.strictEqual(adminLoginRes.status, 200);
    adminToken = adminLoginData.data.accessToken;

    // 2. Authenticate Free Customer
    const freeCustomerLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: env.FREE_CUSTOMER_EMAIL,
        password: env.FREE_CUSTOMER_PASSWORD,
      }),
    });
    const freeCustomerLoginData = await freeCustomerLoginRes.json();
    assert.strictEqual(freeCustomerLoginRes.status, 200);
    freeCustomerToken = freeCustomerLoginData.data.accessToken;
    freeCustomerRefreshToken = freeCustomerLoginData.data.refreshToken;
    freeCustomerId = freeCustomerLoginData.data.user.id;

    // 3. Authenticate Premium Customer
    const premiumCustomerLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: env.PREMIUM_CUSTOMER_EMAIL,
        password: env.PREMIUM_CUSTOMER_PASSWORD,
      }),
    });
    const premiumCustomerLoginData = await premiumCustomerLoginRes.json();
    assert.strictEqual(premiumCustomerLoginRes.status, 200);
    premiumCustomerToken = premiumCustomerLoginData.data.accessToken;
  });

  after(async () => {
    // Clean up created test component
    if (testComponentId) {
      await Component.findByIdAndDelete(testComponentId);
    }
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    await disconnectDatabase();
  });

  // 1. Unauthenticated admin request fails (401)
  test("1. unauthenticated admin request -> 401", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/components`);
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  // 2. Customer accessing admin API fails (403)
  test("2. customer accessing admin API -> 403", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/components`, {
      headers: { Authorization: `Bearer ${freeCustomerToken}` },
    });
    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.message, /Admin privileges required/);
  });

  // 3. Admin accessing admin API allowed (200)
  test("3. admin accessing admin API -> allowed (200)", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/components`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));
  });

  // 4. Draft not publicly accessible (404)
  test("4. draft is not publicly accessible -> 404", async () => {
    const res = await fetch(`${BASE_URL}/api/components/customer-activity-feed`);
    assert.strictEqual(res.status, 404);
  });

  // 5. Unpublished component sub-resources not publicly accessible (404)
  test("5. unpublished component sub-resources not publicly accessible -> 404", async () => {
    const res = await fetch(
      `${BASE_URL}/api/components/customer-activity-feed/source`
    );
    assert.strictEqual(res.status, 404);
  });

  // 6. Free component accessible without login (200)
  test("6. free component accessible without login -> 200", async () => {
    const res = await fetch(
      `${BASE_URL}/api/components/sales-metric-card/source`
    );
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.sourceFiles.length > 0);
  });

  // 7. Premium component blocked for signed-out user (401)
  test("7. premium component blocked for signed-out user -> 401", async () => {
    const res = await fetch(
      `${BASE_URL}/api/components/pipeline-kanban-board/source`
    );
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  // 8. Premium component blocked for free customer (403)
  test("8. premium component blocked for free customer -> 403", async () => {
    const res = await fetch(
      `${BASE_URL}/api/components/pipeline-kanban-board/source`,
      {
        headers: { Authorization: `Bearer ${freeCustomerToken}` },
      }
    );
    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.message, /premium membership is required/i);
  });

  // 9. Premium customer can access premium component (200)
  test("9. premium customer can access premium component -> 200", async () => {
    const res = await fetch(
      `${BASE_URL}/api/components/pipeline-kanban-board/source`,
      {
        headers: { Authorization: `Bearer ${premiumCustomerToken}` },
      }
    );
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.sourceFiles.length > 0);
  });

  // 10. Admin grants premium to free customer (200)
  test("10. admin grants premium -> 200", async () => {
    const res = await fetch(
      `${BASE_URL}/api/admin/customers/${freeCustomerId}/grant-premium`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.isPremium, true);
  });

  // 11. Customer now gains premium access using their existing token
  test("11. customer gains premium access immediately -> 200", async () => {
    const res = await fetch(
      `${BASE_URL}/api/components/pipeline-kanban-board/source`,
      {
        headers: { Authorization: `Bearer ${freeCustomerToken}` },
      }
    );
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.sourceFiles.length > 0);
  });

  // 12. Admin revokes premium from customer (200)
  test("12. admin revokes premium -> 200", async () => {
    const res = await fetch(
      `${BASE_URL}/api/admin/customers/${freeCustomerId}/revoke-premium`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.isPremium, false);
  });

  // 13. Revoked customer is immediately blocked from subsequent premium requests (403)
  test("13. revoked customer is blocked from subsequent premium requests -> 403", async () => {
    const res = await fetch(
      `${BASE_URL}/api/components/pipeline-kanban-board/source`,
      {
        headers: { Authorization: `Bearer ${freeCustomerToken}` },
      }
    );
    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  // 14. Customer cannot grant themselves premium (403)
  test("14. customer cannot grant themselves premium -> 403", async () => {
    const res = await fetch(
      `${BASE_URL}/api/admin/customers/${freeCustomerId}/grant-premium`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${freeCustomerToken}` },
      }
    );
    assert.strictEqual(res.status, 403);
  });

  // 15. Premium customer cannot access drafts (404)
  test("15. premium user cannot access draft -> 404", async () => {
    const res = await fetch(
      `${BASE_URL}/api/components/customer-activity-feed/source`,
      {
        headers: { Authorization: `Bearer ${premiumCustomerToken}` },
      }
    );
    assert.strictEqual(res.status, 404);
  });

  // 16. Invalid component metadata rejected (400)
  test("16. invalid component metadata rejected -> 400", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/components`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        // Missing name, description, category
        version: "1.0.0",
      }),
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.message, "Validation failed");
  });

  // 17. Invalid upload format rejected (400)
  test("17. invalid file format upload rejected -> 400", async () => {
    // Create draft first
    const createRes = await fetch(`${BASE_URL}/api/admin/components`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: "Test Widget",
        slug: testComponentSlug,
        description: "Test widget for automated verification",
        category: "Testing",
        version: "1.0.0",
      }),
    });
    const createData = await createRes.json();
    assert.strictEqual(createRes.status, 201);
    testComponentId = createData.data._id;

    // Attempt multipart upload with disallowed extension (.exe)
    const boundary = "----TestBoundary" + Math.random().toString(16);
    const payload =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="files"; filename="malicious.exe"\r\n` +
      `Content-Type: application/octet-stream\r\n\r\n` +
      `binary_executable_data\r\n` +
      `--${boundary}--\r\n`;

    const uploadRes = await fetch(
      `${BASE_URL}/api/admin/components/${testComponentId}/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
        },
        body: payload,
      }
    );

    assert.strictEqual(uploadRes.status, 400);
    const uploadBody = await uploadRes.json();
    assert.strictEqual(uploadBody.success, false);
    assert.match(uploadBody.message, /Unsupported file type/);
  });

  // 18. Oversized upload rejected (400)
  test("18. oversized upload rejected -> 400", async () => {
    const boundary = "----TestBoundary" + Math.random().toString(16);
    // Construct payload > 5MB
    const bigContent = "a".repeat(6 * 1024 * 1024);
    const payload =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="files"; filename="LargeFile.tsx"\r\n` +
      `Content-Type: text/plain\r\n\r\n` +
      `${bigContent}\r\n` +
      `--${boundary}--\r\n`;

    const uploadRes = await fetch(
      `${BASE_URL}/api/admin/components/${testComponentId}/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
        },
        body: payload,
      }
    );

    assert.strictEqual(uploadRes.status, 400);
    const uploadBody = await uploadRes.json();
    assert.strictEqual(uploadBody.success, false);
    assert.match(uploadBody.message, /exceeds maximum size/i);
  });

  // 19. Invalid dependency declaration rejected (400)
  test("19. invalid dependency declaration rejected -> 400", async () => {
    const res = await fetch(
      `${BASE_URL}/api/admin/components/${testComponentId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          declaredDependencies: {
            "invalid-package": 12345, // Not a string!
          },
        }),
      }
    );
    assert.strictEqual(res.status, 400);
  });

  // 20. Published component appears in public catalogue (200)
  test("20. published component appears in public catalogue -> 200", async () => {
    // Add valid source file to draft
    await fetch(`${BASE_URL}/api/admin/components/${testComponentId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        sourceFiles: [
          {
            filename: "TestWidget.tsx",
            content: "export const TestWidget = () => <div>Hello</div>;",
            fileType: "tsx",
          },
        ],
        declaredDependencies: { react: "^18.0.0" },
      }),
    });

    // Publish component
    const pubRes = await fetch(
      `${BASE_URL}/api/admin/components/${testComponentId}/publish`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    assert.strictEqual(pubRes.status, 200);

    // Verify presence in public catalogue
    const catRes = await fetch(`${BASE_URL}/api/components`);
    assert.strictEqual(catRes.status, 200);
    const catBody = await catRes.json();
    const found = catBody.data.find(
      (c: any) => c.slug === testComponentSlug
    );
    assert.ok(found, "Published component should appear in public catalogue");
  });

  // 21. Unpublished component disappears from public catalogue (200)
  test("21. unpublished component disappears from public catalogue -> 200", async () => {
    // Unpublish
    const unpubRes = await fetch(
      `${BASE_URL}/api/admin/components/${testComponentId}/unpublish`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    assert.strictEqual(unpubRes.status, 200);

    // Verify absence in public catalogue
    const catRes = await fetch(`${BASE_URL}/api/components`);
    const catBody = await catRes.json();
    const found = catBody.data.find(
      (c: any) => c.slug === testComponentSlug
    );
    assert.strictEqual(
      found,
      undefined,
      "Unpublished component must not appear in public catalogue"
    );
  });

  // 22. Refresh token works to issue a new access token (200)
  test("22. refresh token works -> 200", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: freeCustomerRefreshToken }),
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.accessToken);
  });

  // 23. Revoked refresh token fails (401)
  test("23. revoked refresh token fails -> 401", async () => {
    const fakeToken = "revoked_or_tampered_token";
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: fakeToken }),
    });
    assert.strictEqual(res.status, 401);
  });

  // 24. Logout invalidates refresh token (401 on subsequent refresh)
  test("24. logout invalidates refresh token -> 401 on refresh", async () => {
    // Login new session
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: env.FREE_CUSTOMER_EMAIL,
        password: env.FREE_CUSTOMER_PASSWORD,
      }),
    });
    const loginData = await loginRes.json();
    const sessionToken = loginData.data.accessToken;
    const sessionRefreshToken = loginData.data.refreshToken;

    // Logout
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken: sessionRefreshToken }),
    });
    assert.strictEqual(logoutRes.status, 200);

    // Subsequent refresh must fail
    const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: sessionRefreshToken }),
    });
    assert.strictEqual(refreshRes.status, 401);
  });

  // 25. Expired or invalid access token rejected (401)
  test("25. expired or invalid access token rejected -> 401", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: "Bearer malformed.jwt.token" },
    });
    assert.strictEqual(res.status, 401);
  });
});
