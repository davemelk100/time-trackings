import { vi } from "vitest"

/**
 * Creates a chainable mock Supabase client.
 *
 * Every query-builder method (.select, .eq, .order, .insert, .upsert, .update, .delete)
 * returns the same chain so calls can be stacked. The chain is also a thenable —
 * awaiting it resolves to { data, error } configured via `_setResult`.
 *
 * Usage:
 *   const { client, chain } = createMockSupabase()
 *   chain._setResult([{ id: "1", name: "Acme" }], null)
 *   const result = await client.from("clients").select("*").order("name")
 *   // result === { data: [{ id: "1", name: "Acme" }], error: null }
 */
export function createMockSupabase() {
  let resultData: unknown = null
  let resultError: unknown = null

  const chain: Record<string, unknown> = {}

  // All chainable query-builder methods
  const methods = [
    "select",
    "eq",
    "order",
    "insert",
    "upsert",
    "update",
    "delete",
    "single",
    "limit",
    "range",
    "filter",
    "neq",
    "gt",
    "lt",
    "gte",
    "lte",
    "like",
    "ilike",
    "in",
    "is",
    "contains",
    "containedBy",
    "match",
    "not",
    "or",
    "textSearch",
  ]

  for (const method of methods) {
    chain[method] = vi.fn().mockReturnValue(chain)
  }

  // Make chain thenable so `await` resolves to { data, error }
  chain.then = (resolve: (val: unknown) => void) => {
    return Promise.resolve({ data: resultData, error: resultError }).then(resolve)
  }

  // Configure what the chain resolves to
  chain._setResult = (data: unknown, error: unknown = null) => {
    resultData = data
    resultError = error
  }

  // Storage mock
  const storageBucket: Record<string, unknown> = {
    upload: vi.fn().mockResolvedValue({ data: { path: "mock-path" }, error: null }),
    getPublicUrl: vi.fn().mockReturnValue({
      data: { publicUrl: "https://mock.supabase.co/storage/v1/object/public/receipts/mock-path" },
    }),
    remove: vi.fn().mockResolvedValue({ data: null, error: null }),
  }

  const client = {
    from: vi.fn().mockReturnValue(chain),
    storage: {
      from: vi.fn().mockReturnValue(storageBucket),
    },
  }

  return { client: client as any, chain: chain as any, storageBucket }
}
