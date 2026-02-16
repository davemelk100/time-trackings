module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/components/theme-provider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>ThemeProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-themes/dist/index.mjs [app-ssr] (ecmascript)");
'use client';
;
;
function ThemeProvider({ children, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ThemeProvider"], {
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/theme-provider.tsx",
        lineNumber: 10,
        columnNumber: 10
    }, this);
}
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/supabase.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient,
    "createInvoice",
    ()=>createInvoice,
    "deleteAllAttachments",
    ()=>deleteAllAttachments,
    "deleteAttachment",
    ()=>deleteAttachment,
    "deleteClient",
    ()=>deleteClient,
    "deletePayable",
    ()=>deletePayable,
    "deletePayableByMatch",
    ()=>deletePayableByMatch,
    "deleteSubscription",
    ()=>deleteSubscription,
    "deleteTimeEntry",
    ()=>deleteTimeEntry,
    "fetchAllInvoices",
    ()=>fetchAllInvoices,
    "fetchAllPayables",
    ()=>fetchAllPayables,
    "fetchAllSubscriptions",
    ()=>fetchAllSubscriptions,
    "fetchAllTimeEntries",
    ()=>fetchAllTimeEntries,
    "fetchClients",
    ()=>fetchClients,
    "fetchInvoice",
    ()=>fetchInvoice,
    "fetchInvoices",
    ()=>fetchInvoices,
    "fetchPayables",
    ()=>fetchPayables,
    "fetchPayablesByInvoice",
    ()=>fetchPayablesByInvoice,
    "fetchSubscriptions",
    ()=>fetchSubscriptions,
    "fetchSubscriptionsByInvoice",
    ()=>fetchSubscriptionsByInvoice,
    "fetchTimeEntries",
    ()=>fetchTimeEntries,
    "fetchTimeEntriesByInvoice",
    ()=>fetchTimeEntriesByInvoice,
    "getAttachmentUrl",
    ()=>getAttachmentUrl,
    "insertClient",
    ()=>insertClient,
    "payableToRow",
    ()=>payableToRow,
    "rowToClient",
    ()=>rowToClient,
    "rowToInvoice",
    ()=>rowToInvoice,
    "rowToPayable",
    ()=>rowToPayable,
    "rowToSubscription",
    ()=>rowToSubscription,
    "rowToTimeEntry",
    ()=>rowToTimeEntry,
    "seedSubscriptions",
    ()=>seedSubscriptions,
    "seedTimeEntries",
    ()=>seedTimeEntries,
    "subscriptionToRow",
    ()=>subscriptionToRow,
    "timeEntryToRow",
    ()=>timeEntryToRow,
    "updateClientBillingPeriodEnd",
    ()=>updateClientBillingPeriodEnd,
    "updateClientBillingPeriodStart",
    ()=>updateClientBillingPeriodStart,
    "updateClientRate",
    ()=>updateClientRate,
    "updateInvoice",
    ()=>updateInvoice,
    "updateNextierMirror",
    ()=>updateNextierMirror,
    "uploadAttachment",
    ()=>uploadAttachment,
    "upsertPayable",
    ()=>upsertPayable,
    "upsertSubscription",
    ()=>upsertSubscription,
    "upsertTimeEntry",
    ()=>upsertTimeEntry
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-ssr] (ecmascript) <locals>");
;
function createClient() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://ccafzxwzswysovzlrplj.supabase.co"), ("TURBOPACK compile-time value", "sb_publishable__FCD8kqm8uGRPFHt8wJDOg_1vSHqyll"));
}
function rowToClient(row) {
    return {
        id: row.id,
        name: row.name,
        hourlyRate: row.hourly_rate != null ? Number(row.hourly_rate) : null,
        flatRate: row.flat_rate != null ? Number(row.flat_rate) : null,
        billingPeriodStart: row.billing_period_start ?? null,
        billingPeriodEnd: row.billing_period_end ?? null
    };
}
async function fetchClients(supabase) {
    const { data, error } = await supabase.from("clients").select("*").order("name", {
        ascending: true
    });
    if (error) throw error;
    return data.map(rowToClient);
}
async function insertClient(supabase, client) {
    const { error } = await supabase.from("clients").insert({
        id: client.id,
        name: client.name,
        hourly_rate: client.hourlyRate,
        flat_rate: client.flatRate
    });
    if (error) throw error;
}
async function deleteClient(supabase, id) {
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) throw error;
}
async function updateClientRate(supabase, clientId, hourlyRate, flatRate) {
    const { error } = await supabase.from("clients").update({
        hourly_rate: hourlyRate,
        flat_rate: flatRate
    }).eq("id", clientId);
    if (error) throw error;
}
async function updateClientBillingPeriodStart(supabase, clientId, date) {
    const { error } = await supabase.from("clients").update({
        billing_period_start: date
    }).eq("id", clientId);
    if (error) throw error;
}
async function updateClientBillingPeriodEnd(supabase, clientId, date) {
    const { error } = await supabase.from("clients").update({
        billing_period_end: date
    }).eq("id", clientId);
    if (error) throw error;
}
function rowToTimeEntry(row) {
    return {
        id: row.id,
        date: row.date,
        startTime: row.start_time,
        endTime: row.end_time,
        timeRange: row.time_range,
        totalHours: Number(row.total_hours),
        tasks: row.tasks,
        notes: row.notes,
        attachments: Array.isArray(row.attachments) ? row.attachments : [],
        links: Array.isArray(row.links) ? row.links : []
    };
}
function timeEntryToRow(entry, clientId) {
    return {
        id: entry.id,
        client_id: clientId,
        date: entry.date,
        start_time: entry.startTime,
        end_time: entry.endTime,
        time_range: entry.timeRange,
        total_hours: entry.totalHours,
        tasks: entry.tasks,
        notes: entry.notes,
        attachments: entry.attachments ?? [],
        links: entry.links ?? []
    };
}
function rowToSubscription(row) {
    return {
        id: row.id,
        name: row.name,
        category: row.category,
        billingCycle: row.billing_cycle,
        amount: Number(row.amount),
        renewalDate: row.renewal_date ?? "",
        notes: row.notes,
        attachments: Array.isArray(row.attachments) ? row.attachments : [],
        links: Array.isArray(row.links) ? row.links : []
    };
}
function subscriptionToRow(sub, clientId) {
    return {
        id: sub.id,
        client_id: clientId,
        name: sub.name,
        category: sub.category,
        billing_cycle: sub.billingCycle,
        amount: sub.amount,
        renewal_date: sub.renewalDate || null,
        notes: sub.notes,
        attachments: sub.attachments ?? [],
        links: sub.links ?? []
    };
}
async function fetchAllTimeEntries(supabase) {
    const { data, error } = await supabase.from("time_entries").select("*").order("date", {
        ascending: false
    });
    if (error) throw error;
    return data.map((row)=>({
            ...rowToTimeEntry(row),
            clientId: row.client_id
        }));
}
async function fetchAllSubscriptions(supabase) {
    const { data, error } = await supabase.from("subscriptions").select("*").order("name", {
        ascending: true
    });
    if (error) throw error;
    return data.map((row)=>({
            ...rowToSubscription(row),
            clientId: row.client_id
        }));
}
async function fetchAllPayables(supabase) {
    const { data, error } = await supabase.from("payables").select("*").order("date", {
        ascending: false
    });
    if (error) throw error;
    return data.map((row)=>({
            ...rowToPayable(row),
            clientId: row.client_id
        }));
}
async function fetchTimeEntries(supabase, clientId) {
    const { data, error } = await supabase.from("time_entries").select("*").eq("client_id", clientId).is("invoice_id", null).order("date", {
        ascending: true
    });
    if (error) throw error;
    return data.map(rowToTimeEntry);
}
async function upsertTimeEntry(supabase, entry, clientId) {
    const row = timeEntryToRow(entry, clientId);
    const { error } = await supabase.from("time_entries").upsert(row);
    if (error) throw error;
}
async function deleteTimeEntry(supabase, id) {
    const { error } = await supabase.from("time_entries").delete().eq("id", id);
    if (error) throw error;
}
async function seedTimeEntries(supabase, entries, clientId) {
    const rows = entries.map((e)=>{
        const row = timeEntryToRow(e, clientId);
        // Let Supabase generate UUIDs for seeded data
        delete row.id;
        return row;
    });
    const { error } = await supabase.from("time_entries").insert(rows);
    if (error) throw error;
}
async function fetchSubscriptions(supabase, clientId) {
    const { data, error } = await supabase.from("subscriptions").select("*").eq("client_id", clientId).is("invoice_id", null).order("name", {
        ascending: true
    });
    if (error) throw error;
    return data.map(rowToSubscription);
}
async function upsertSubscription(supabase, sub, clientId) {
    const row = subscriptionToRow(sub, clientId);
    const { error } = await supabase.from("subscriptions").upsert(row);
    if (error) throw error;
}
async function deleteSubscription(supabase, id) {
    const { error } = await supabase.from("subscriptions").delete().eq("id", id);
    if (error) throw error;
}
async function seedSubscriptions(supabase, subs, clientId) {
    const rows = subs.map((s)=>{
        const row = subscriptionToRow(s, clientId);
        delete row.id;
        return row;
    });
    const { error } = await supabase.from("subscriptions").insert(rows);
    if (error) throw error;
}
function rowToPayable(row) {
    return {
        id: row.id,
        description: row.description,
        amount: Number(row.amount),
        date: row.date,
        paid: row.paid,
        paidDate: row.paid_date ?? "",
        notes: row.notes,
        attachments: Array.isArray(row.attachments) ? row.attachments : [],
        links: Array.isArray(row.links) ? row.links : []
    };
}
function payableToRow(p, clientId) {
    return {
        id: p.id,
        client_id: clientId,
        description: p.description,
        amount: p.amount,
        date: p.date,
        paid: p.paid,
        paid_date: p.paidDate || null,
        notes: p.notes,
        attachments: p.attachments ?? [],
        links: p.links ?? []
    };
}
async function fetchPayables(supabase, clientId) {
    const { data, error } = await supabase.from("payables").select("*").eq("client_id", clientId).is("invoice_id", null).order("date", {
        ascending: false
    });
    if (error) throw error;
    return data.map(rowToPayable);
}
async function upsertPayable(supabase, payable, clientId) {
    const row = payableToRow(payable, clientId);
    const { error } = await supabase.from("payables").upsert(row);
    if (error) throw error;
}
async function deletePayable(supabase, id) {
    const { error } = await supabase.from("payables").delete().eq("id", id);
    if (error) throw error;
}
async function deletePayableByMatch(supabase, clientId, description, amount, date) {
    const { error } = await supabase.from("payables").delete().eq("client_id", clientId).eq("description", description).eq("amount", amount).eq("date", date);
    if (error) throw error;
}
async function updateNextierMirror(supabase, oldDescription, oldAmount, oldDate, updated) {
    const { error } = await supabase.from("payables").update({
        description: updated.description,
        amount: updated.amount,
        date: updated.date,
        notes: updated.notes,
        attachments: updated.attachments,
        links: updated.links ?? []
    }).eq("client_id", "nextier").eq("description", oldDescription).eq("amount", oldAmount).eq("date", oldDate);
    if (error) throw error;
}
async function uploadAttachment(supabase, file, clientId, entryId) {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${clientId}/${entryId}/${timestamp}-${safeName}`;
    const { error } = await supabase.storage.from("receipts").upload(path, file);
    if (error) throw error;
    return {
        name: file.name,
        path,
        size: file.size,
        uploadedAt: new Date().toISOString()
    };
}
function getAttachmentUrl(supabase, path) {
    const { data } = supabase.storage.from("receipts").getPublicUrl(path);
    return data.publicUrl;
}
async function deleteAttachment(supabase, path) {
    const { error } = await supabase.storage.from("receipts").remove([
        path
    ]);
    if (error) throw error;
}
async function deleteAllAttachments(supabase, attachments) {
    if (attachments.length === 0) return;
    const paths = attachments.map((a)=>a.path);
    const { error } = await supabase.storage.from("receipts").remove(paths);
    if (error) throw error;
}
function rowToInvoice(row) {
    return {
        id: row.id,
        clientId: row.client_id,
        invoiceNumber: row.invoice_number,
        periodStart: row.period_start ?? "",
        periodEnd: row.period_end ?? "",
        totalTime: Number(row.total_time),
        totalSubscriptions: Number(row.total_subscriptions),
        totalPayables: Number(row.total_payables),
        grandTotal: Number(row.grand_total),
        notes: row.notes,
        createdAt: row.created_at
    };
}
async function fetchInvoices(supabase, clientId) {
    const { data, error } = await supabase.from("invoices").select("*").eq("client_id", clientId).order("created_at", {
        ascending: false
    });
    if (error) throw error;
    return data.map(rowToInvoice);
}
async function fetchInvoice(supabase, invoiceId) {
    const { data, error } = await supabase.from("invoices").select("*").eq("id", invoiceId).single();
    if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
    }
    return rowToInvoice(data);
}
async function fetchAllInvoices(supabase) {
    const { data, error } = await supabase.from("invoices").select("*").order("created_at", {
        ascending: false
    });
    if (error) throw error;
    return data.map(rowToInvoice);
}
async function updateInvoice(supabase, invoiceId, updates) {
    const { data, error } = await supabase.from("invoices").update(updates).eq("id", invoiceId).select().single();
    if (error) throw error;
    return rowToInvoice(data);
}
async function fetchTimeEntriesByInvoice(supabase, invoiceId) {
    const { data, error } = await supabase.from("time_entries").select("*").eq("invoice_id", invoiceId).order("date", {
        ascending: true
    });
    if (error) throw error;
    return data.map(rowToTimeEntry);
}
async function fetchSubscriptionsByInvoice(supabase, invoiceId) {
    const { data, error } = await supabase.from("subscriptions").select("*").eq("invoice_id", invoiceId).order("name", {
        ascending: true
    });
    if (error) throw error;
    return data.map(rowToSubscription);
}
async function fetchPayablesByInvoice(supabase, invoiceId) {
    const { data, error } = await supabase.from("payables").select("*").eq("invoice_id", invoiceId).order("date", {
        ascending: false
    });
    if (error) throw error;
    return data.map(rowToPayable);
}
async function createInvoice(supabase, clientId, options = {}) {
    const { copySubscriptionsForward = false, notes = "", hourlyRateOverride, flatRateOverride, rateTbd = false } = options;
    // 1. Fetch current-period data + client info
    const [entries, subs, payables, clients] = await Promise.all([
        fetchTimeEntries(supabase, clientId),
        fetchSubscriptions(supabase, clientId),
        fetchPayables(supabase, clientId),
        fetchClients(supabase)
    ]);
    const client = clients.find((c)=>c.id === clientId);
    const hourlyRate = hourlyRateOverride !== undefined ? hourlyRateOverride : client?.hourlyRate ?? null;
    const flatRate = flatRateOverride !== undefined ? flatRateOverride : client?.flatRate ?? null;
    // Guard: don't create an invoice if there's nothing to archive
    if (entries.length === 0 && subs.length === 0 && payables.length === 0) {
        throw new Error("Nothing to archive – no time entries, subscriptions, or payables in the current period.");
    }
    // 2. Compute snapshot totals
    const totalHours = entries.reduce((sum, e)=>sum + e.totalHours, 0);
    const timeCost = rateTbd ? 0 : flatRate != null ? flatRate : hourlyRate != null ? totalHours * hourlyRate : 0;
    const monthlySubTotal = subs.reduce((sum, s)=>{
        if (s.billingCycle === "monthly") return sum + s.amount;
        return sum + s.amount / 12;
    }, 0);
    const subscriptionAnnual = monthlySubTotal * 12;
    const payablesTotal = payables.reduce((sum, p)=>sum + p.amount, 0);
    const isNextier = clientId === "nextier";
    const grandTotal = isNextier ? payablesTotal : timeCost + subscriptionAnnual - payablesTotal;
    // 3. Derive period dates from client billing fields, falling back to entry dates / today
    const dates = entries.map((e)=>e.date).filter(Boolean).sort();
    const periodStart = client?.billingPeriodStart || dates[0] || new Date().toISOString().slice(0, 10);
    const periodEnd = client?.billingPeriodEnd || new Date().toISOString().slice(0, 10);
    // 4. Generate invoice number
    const { count } = await supabase.from("invoices").select("*", {
        count: "exact",
        head: true
    }).eq("client_id", clientId);
    const num = ((count ?? 0) + 1).toString().padStart(3, "0");
    const invoiceNumber = `INV-${clientId}-${num}`;
    // 5. Insert invoice row
    const { data: invoiceData, error: invoiceError } = await supabase.from("invoices").insert({
        client_id: clientId,
        invoice_number: invoiceNumber,
        period_start: periodStart,
        period_end: periodEnd,
        total_time: Math.round(timeCost * 100) / 100,
        total_subscriptions: Math.round(subscriptionAnnual * 100) / 100,
        total_payables: Math.round(payablesTotal * 100) / 100,
        grand_total: Math.round(grandTotal * 100) / 100,
        notes
    }).select().single();
    if (invoiceError) throw invoiceError;
    const invoice = rowToInvoice(invoiceData);
    // 6. Stamp all current-period rows with the new invoice_id
    const entryIds = entries.map((e)=>e.id);
    const subIds = subs.map((s)=>s.id);
    const payableIds = payables.map((p)=>p.id);
    if (entryIds.length > 0) {
        const { error } = await supabase.from("time_entries").update({
            invoice_id: invoice.id
        }).in("id", entryIds);
        if (error) throw error;
    }
    if (subIds.length > 0) {
        const { error } = await supabase.from("subscriptions").update({
            invoice_id: invoice.id
        }).in("id", subIds);
        if (error) throw error;
    }
    if (payableIds.length > 0) {
        const { error } = await supabase.from("payables").update({
            invoice_id: invoice.id
        }).in("id", payableIds);
        if (error) throw error;
    }
    // 8. Optionally copy subscriptions forward as new current-period entries
    if (copySubscriptionsForward && subs.length > 0) {
        const newSubRows = subs.map((s)=>({
                client_id: clientId,
                name: s.name,
                category: s.category,
                billing_cycle: s.billingCycle,
                amount: s.amount,
                renewal_date: s.renewalDate || null,
                notes: s.notes,
                attachments: s.attachments ?? [],
                links: s.links ?? []
            }));
        const { error } = await supabase.from("subscriptions").insert(newSubRows);
        if (error) throw error;
    }
    // 9. Clear billing period dates on client after invoice creation
    if (client?.billingPeriodStart || client?.billingPeriodEnd) {
        const { error: clearError } = await supabase.from("clients").update({
            billing_period_start: null,
            billing_period_end: null
        }).eq("id", clientId);
        if (clearError) throw clearError;
    }
    return invoice;
}
}),
"[project]/src/lib/auth-context.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
function AuthProvider({ children, session }) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createClient"])(), []);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const isAdmin = session?.role === "admin";
    const clientId = session?.clientId ?? null;
    async function signIn(passcode) {
        const res = await fetch("/api/auth", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                passcode
            })
        });
        const data = await res.json();
        if (!res.ok) return {
            error: data.error ?? "Invalid passcode"
        };
        router.refresh();
        return {
            error: null,
            role: data.role,
            clientId: data.clientId
        };
    }
    async function signOut() {
        await fetch("/api/auth", {
            method: "DELETE"
        });
        router.push("/login");
        router.refresh();
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            supabase,
            isAdmin,
            clientId,
            signIn,
            signOut
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/lib/auth-context.tsx",
        lineNumber: 49,
        columnNumber: 5
    }, this);
}
function useAuth() {
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a07d054a._.js.map