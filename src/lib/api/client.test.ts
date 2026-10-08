import assert from "node:assert/strict";
import test from "node:test";
import {
  createEvent,
  queryBusiness,
  healthCheck,
  getAuthHeaders,
  getDashboardSummary,
  request,
} from "./client";
import type { SupabaseClient } from "@supabase/supabase-js";

// Mock environment variables for testing
process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

test("getAuthHeaders returns empty object in non-browser environment when no client is passed", async () => {
  const headers = await getAuthHeaders();
  assert.deepEqual(headers, {});
});

test("createEvent rejects unauthenticated request without calling fetch", async () => {
  let fetchCalled = false;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    fetchCalled = true;
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  };

  try {
    const result = await createEvent({
      business_id: "business_123",
      language: "en",
      event_type: "sale",
      data: { item: "shirt", quantity: 1, amount: 100 },
    });

    assert.equal(fetchCalled, false, "fetch should not be called when unauthenticated");
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, 401);
      assert.equal(result.code, "UNAUTHORIZED");
      assert.match(result.message, /Authentication required/i);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("queryBusiness rejects unauthenticated request without calling fetch", async () => {
  let fetchCalled = false;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    fetchCalled = true;
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  };

  try {
    const result = await queryBusiness({
      business_id: "business_123",
      language: "en",
      query: "How much did I sell today?",
    });

    assert.equal(fetchCalled, false, "fetch should not be called when unauthenticated");
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, 401);
      assert.equal(result.code, "UNAUTHORIZED");
      assert.match(result.message, /Authentication required/i);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("createEvent attaches Authorization header when provided explicitly", async () => {
  let capturedHeaders: Headers | null = null;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_input, init) => {
    capturedHeaders = new Headers(init?.headers);
    return new Response(
      JSON.stringify({
        success: true,
        event: { id: "ev-1", event_type: "sale", data: {} },
        message: "Sale recorded successfully",
      }),
      { status: 200 },
    );
  };

  try {
    const result = await createEvent(
      {
        business_id: "business_123",
        language: "en",
        event_type: "sale",
        data: { item: "shirt", quantity: 1, amount: 100 },
      },
      { Authorization: "Bearer valid-jwt-token" },
    );

    assert.equal(result.ok, true);
    assert.ok(capturedHeaders !== null, "fetch should be called");
    const headers = capturedHeaders as Headers;
    assert.equal(headers.get("Authorization"), "Bearer valid-jwt-token");
    assert.notEqual(headers.get("Authorization"), "Bearer undefined");
    assert.equal(headers.get("Content-Type"), "application/json");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("queryBusiness attaches Authorization header when provided explicitly", async () => {
  let capturedHeaders: Headers | null = null;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_input, init) => {
    capturedHeaders = new Headers(init?.headers);
    return new Response(
      JSON.stringify({
        success: true,
        query_type: "metrics",
        result: { total: 500 },
        message: "Here are your metrics",
      }),
      { status: 200 },
    );
  };

  try {
    const result = await queryBusiness(
      {
        business_id: "business_123",
        language: "en",
        query: "What are my total sales?",
      },
      { Authorization: "Bearer valid-jwt-token" },
    );

    assert.equal(result.ok, true);
    assert.ok(capturedHeaders !== null, "fetch should be called");
    const headers = capturedHeaders as Headers;
    assert.equal(headers.get("Authorization"), "Bearer valid-jwt-token");
    assert.notEqual(headers.get("Authorization"), "Bearer undefined");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("healthCheck succeeds without requiring Authorization header", async () => {
  let capturedHeaders: Headers | null = null;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_input, init) => {
    capturedHeaders = new Headers(init?.headers);
    return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
  };

  try {
    const result = await healthCheck();
    assert.equal(result.ok, true);
    assert.ok(capturedHeaders !== null);
    const headers = capturedHeaders as Headers;
    assert.equal(headers.has("Authorization"), false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("backend 401 error response with FastAPI detail is correctly parsed", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    return new Response(
      JSON.stringify({ detail: "Authorization header is required." }),
      { status: 401 },
    );
  };

  try {
    const result = await queryBusiness(
      {
        business_id: "business_123",
        language: "en",
        query: "Test query",
      },
      { Authorization: "Bearer rejected-or-expired-token" },
    );

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, 401);
      assert.equal(result.code, "UNAUTHORIZED");
      assert.equal(result.message, "Authorization header is required.");
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("getAuthHeaders extracts valid session token from SupabaseClient", async () => {
  const mockClient = {
    auth: {
      getSession: async () => ({
        data: {
          session: {
            access_token: "mock-supabase-access-token-12345",
          },
        },
      }),
    },
  } as unknown as SupabaseClient;

  const authHeaders = await getAuthHeaders(mockClient);
  assert.deepEqual(authHeaders, {
    Authorization: "Bearer mock-supabase-access-token-12345",
  });
});

test("getAuthHeaders safely ignores missing or invalid session tokens", async () => {
  const cases = [
    null,
    { access_token: undefined },
    { access_token: "" },
    { access_token: "   " },
    { access_token: "undefined" },
    { access_token: "null" },
  ];

  for (const sessionData of cases) {
    const mockClient = {
      auth: {
        getSession: async () => ({
          data: {
            session: sessionData,
          },
        }),
      },
    } as unknown as SupabaseClient;

    const authHeaders = await getAuthHeaders(mockClient);
    assert.deepEqual(authHeaders, {}, `Expected empty headers for ${JSON.stringify(sessionData)}`);
  }
});

test("getDashboardSummary rejects unauthenticated request without calling fetch", async () => {
  let fetchCalled = false;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    fetchCalled = true;
    return new Response(JSON.stringify({}), { status: 200 });
  };

  try {
    const result = await getDashboardSummary();
    assert.equal(fetchCalled, false, "fetch should not be called when unauthenticated");
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, 401);
      assert.equal(result.code, "UNAUTHORIZED");
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("getDashboardSummary attaches Authorization header and parses dashboard response", async () => {
  let capturedHeaders: Headers | null = null;
  const originalFetch = globalThis.fetch;
  const mockDashboard = {
    sales_today: { amount: 1500, currency: "ETB", count: 3 },
    expenses_today: { amount: 450, currency: "ETB", count: 2 },
    customer_debt: {
      total: 800,
      currency: "ETB",
      customers: [{ customer: "Abebe", amount: 800, currency: "ETB" }],
    },
    inventory: {
      total_items: 12,
      low_stock_count: 1,
      items: [{ item: "hat", quantity: 2, unit: "pcs" }],
    },
    recent_activity: [
      {
        id: "evt_1",
        type: "sale",
        description: "Sale: 1 hat",
        amount: 250,
        currency: "ETB",
        timestamp: "2026-10-08T18:00:00Z",
      },
    ],
  };

  globalThis.fetch = async (_input, init) => {
    capturedHeaders = new Headers(init?.headers);
    return new Response(JSON.stringify(mockDashboard), { status: 200 });
  };

  try {
    const result = await getDashboardSummary({ Authorization: "Bearer test-jwt-token" });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.sales_today.amount, 1500);
      assert.equal(result.data.inventory.total_items, 12);
      assert.equal(result.data.recent_activity.length, 1);
    }
    assert.ok(capturedHeaders !== null);
    const headers = capturedHeaders as Headers;
    assert.equal(headers.get("Authorization"), "Bearer test-jwt-token");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("request normalizes duplicate slashes and trailing slashes", async () => {
  let requestedUrl: string | null = null;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    requestedUrl = typeof input === "string" ? input : (input as Request).url;
    return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
  };

  try {
    await request({
      path: "//api/v1/dashboard/",
      requiresAuth: false,
    });
    assert.equal(requestedUrl, "https://api.example.com/api/v1/dashboard");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("request returns NOT_FOUND code on 404 response", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    return new Response(JSON.stringify({ detail: "Not Found" }), { status: 404 });
  };

  try {
    const result = await request({
      path: "/api/v1/nonexistent",
      requiresAuth: false,
    });
    assert.equal("ok" in result, false);
    if (!("ok" in result)) {
      assert.equal(result.response.status, 404);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});


