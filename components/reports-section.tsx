"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUp, ArrowDown, X, Printer } from "lucide-react";
import { type Client, defaultClients } from "@/lib/project-data";
import {
  fetchAllTimeEntries,
  fetchAllSubscriptions,
  fetchClients,
  type TimeEntryWithClient,
  type SubscriptionWithClient,
} from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { handlePrint } from "@/lib/print";


function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type TimeSortKey = "date" | "hours" | "cost";
type SubSortKey = "name" | "category" | "amount";
type SortDir = "asc" | "desc";

export function ReportsSection() {
  const { supabase } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [entries, setEntries] = useState<TimeEntryWithClient[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithClient[]>(
    [],
  );
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [clientFilter, setClientFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");

  // Sort — time entries
  const [timeSortKey, setTimeSortKey] = useState<TimeSortKey>("date");
  const [timeSortDir, setTimeSortDir] = useState<SortDir>("desc");

  // Sort — subscriptions
  const [subSortKey, setSubSortKey] = useState<SubSortKey>("name");
  const [subSortDir, setSubSortDir] = useState<SortDir>("asc");

  useEffect(() => {
    let cancelled = false;
    setMounted(false);
    setError(null);

    async function load() {
      try {
        const [clientRows, timeRows, subRows] = await Promise.all([
          fetchClients(supabase),
          fetchAllTimeEntries(supabase),
          fetchAllSubscriptions(supabase),
        ]);
        if (cancelled) return;
        setClients(clientRows.length > 0 ? clientRows : defaultClients);
        setEntries(timeRows);
        setSubscriptions(subRows);
      } catch (err) {
        if (!cancelled) {
          setClients(defaultClients);
          setError(err instanceof Error ? err.message : "Failed to load data");
        }
      } finally {
        if (!cancelled) setMounted(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  // Build client lookup maps
  const clientNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of clients) map[c.id] = c.name;
    return map;
  }, [clients]);

  const clientRateMap = useMemo(() => {
    const map: Record<string, number | null> = {};
    for (const c of clients) map[c.id] = c.hourlyRate;
    return map;
  }, [clients]);

  const clientFlatRateMap = useMemo(() => {
    const map: Record<string, number | null> = {};
    for (const c of clients) map[c.id] = c.flatRate;
    return map;
  }, [clients]);

  function getClientName(clientId: string): string {
    return clientNameMap[clientId] ?? clientId;
  }

  function getRate(clientId: string): number | null {
    return clientRateMap[clientId] ?? null;
  }

  function getFlatRate(clientId: string): number | null {
    return clientFlatRateMap[clientId] ?? null;
  }

  // Derive available months from entries
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    for (const e of entries) {
      months.add(e.date.slice(0, 7));
    }
    return Array.from(months).sort().reverse();
  }, [entries]);

  const hasActiveFilter =
    clientFilter !== "all" ||
    monthFilter !== "all" ||
    dateFrom !== "" ||
    dateTo !== "" ||
    search !== "";

  function clearFilters() {
    setClientFilter("all");
    setMonthFilter("all");
    setDateFrom("");
    setDateTo("");
    setSearch("");
  }

  // Filtered time entries
  const filteredEntries = useMemo(() => {
    const q = search.toLowerCase();
    return entries.filter((e) => {
      if (clientFilter !== "all" && e.clientId !== clientFilter) return false;
      if (monthFilter !== "all" && !e.date.startsWith(monthFilter))
        return false;
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo && e.date > dateTo) return false;
      if (
        q &&
        !e.tasks.toLowerCase().includes(q) &&
        !e.notes.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [entries, clientFilter, monthFilter, dateFrom, dateTo, search]);

  // Filtered subscriptions (client + search only; date/month don't apply)
  const filteredSubs = useMemo(() => {
    const q = search.toLowerCase();
    return subscriptions.filter((s) => {
      if (clientFilter !== "all" && s.clientId !== clientFilter) return false;
      if (
        q &&
        !s.name.toLowerCase().includes(q) &&
        !s.category.toLowerCase().includes(q) &&
        !s.notes.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [subscriptions, clientFilter, search]);

  // Sorted time entries
  const sortedEntries = useMemo(() => {
    const copy = [...filteredEntries];
    copy.sort((a, b) => {
      let cmp = 0;
      if (timeSortKey === "date") {
        cmp = a.date.localeCompare(b.date);
      } else if (timeSortKey === "hours") {
        cmp = a.totalHours - b.totalHours;
      } else {
        cmp = a.totalHours * (getRate(a.clientId) ?? 0) - b.totalHours * (getRate(b.clientId) ?? 0);
      }
      return timeSortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filteredEntries, timeSortKey, timeSortDir]);

  // Sorted subscriptions
  const sortedSubs = useMemo(() => {
    const copy = [...filteredSubs];
    copy.sort((a, b) => {
      let cmp = 0;
      if (subSortKey === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (subSortKey === "category") {
        cmp = a.category.localeCompare(b.category);
      } else {
        // Compare annualized amounts
        const aAnnual = a.billingCycle === "monthly" ? a.amount * 12 : a.amount;
        const bAnnual = b.billingCycle === "monthly" ? b.amount * 12 : b.amount;
        cmp = aAnnual - bAnnual;
      }
      return subSortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filteredSubs, subSortKey, subSortDir]);

  // Summary stats
  const totalHours = filteredEntries.reduce((sum, e) => sum + e.totalHours, 0);

  // For hourly clients: sum hours * rate. For flat-rate clients: sum flat rate once per client.
  const hourlyCost = filteredEntries.reduce((sum, e) => {
    if (getFlatRate(e.clientId) != null) return sum;
    return sum + e.totalHours * (getRate(e.clientId) ?? 0);
  }, 0);
  const flatRateClientsInFilter = new Set(
    filteredEntries.map((e) => e.clientId).filter((id) => getFlatRate(id) != null),
  );
  const flatCost = Array.from(flatRateClientsInFilter).reduce(
    (sum, id) => sum + (getFlatRate(id) ?? 0),
    0,
  );
  const totalTimeCost = hourlyCost + flatCost;

  const totalSubsMonthly = filteredSubs.reduce((sum, s) => {
    if (s.billingCycle === "monthly") return sum + s.amount;
    return sum + s.amount / 12;
  }, 0);
  const totalSubsAnnual = totalSubsMonthly * 12;

  function toggleTimeSort(key: TimeSortKey) {
    if (timeSortKey === key) {
      setTimeSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setTimeSortKey(key);
      setTimeSortDir("desc");
    }
  }

  function toggleSubSort(key: SubSortKey) {
    if (subSortKey === key) {
      setSubSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSubSortKey(key);
      setSubSortDir(key === "amount" ? "desc" : "asc");
    }
  }

  function TimeSortIndicator({ column }: { column: TimeSortKey }) {
    if (timeSortKey !== column) return null;
    return timeSortDir === "asc" ? (
      <ArrowUp className="inline h-3 w-3 ml-1" />
    ) : (
      <ArrowDown className="inline h-3 w-3 ml-1" />
    );
  }

  function SubSortIndicator({ column }: { column: SubSortKey }) {
    if (subSortKey !== column) return null;
    return subSortDir === "asc" ? (
      <ArrowUp className="inline h-3 w-3 ml-1" />
    ) : (
      <ArrowDown className="inline h-3 w-3 ml-1" />
    );
  }

  if (!mounted) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Loading reports...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-destructive">
            {error}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Print Button */}
      <div className="flex justify-end print:hidden">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={handlePrint}
        >
          <Printer className="h-4 w-4" />
          Print Report
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Time Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{filteredEntries.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono">
              {totalHours.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hourly Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono text-primary">
              {formatCurrency(totalTimeCost)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono text-primary">
              {formatCurrency(totalSubsAnnual)}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                /yr
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="print:hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Filters</CardTitle>
            {hasActiveFilter && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1.5 h-3.5 w-3.5" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="flex flex-col gap-1.5">
              <Label>Client</Label>
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Month</Label>
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {availableMonths.map((m) => {
                    const [y, mo] = m.split("-");
                    const label = new Date(
                      Number(y),
                      Number(mo) - 1,
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    });
                    return (
                      <SelectItem key={m} value={m}>
                        {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Date From</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Date To</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Search</Label>
              <Input
                type="text"
                placeholder="Search tasks/notes/names..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Time Entries</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleTimeSort("date")}
                >
                  Date
                  <TimeSortIndicator column="date" />
                </TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead>Time Range</TableHead>
                <TableHead
                  className="cursor-pointer select-none text-right"
                  onClick={() => toggleTimeSort("hours")}
                >
                  Hours
                  <TimeSortIndicator column="hours" />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-right"
                  onClick={() => toggleTimeSort("cost")}
                >
                  Cost
                  <TimeSortIndicator column="cost" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEntries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No time entries match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                sortedEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap font-medium">
                      {formatDate(entry.date)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {getClientName(entry.clientId)}
                    </TableCell>
                    <TableCell className="max-w-[280px] text-muted-foreground">
                      {entry.tasks}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {entry.timeRange}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {entry.totalHours.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {getFlatRate(entry.clientId) != null
                        ? "\u2014"
                        : getRate(entry.clientId) != null
                          ? formatCurrency(entry.totalHours * getRate(entry.clientId)!)
                          : "TBD"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {sortedEntries.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} className="font-semibold">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {totalHours.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-primary">
                    {formatCurrency(totalTimeCost)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Software Subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSubSort("name")}
                >
                  Name
                  <SubSortIndicator column="name" />
                </TableHead>
                <TableHead>Client</TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSubSort("category")}
                >
                  Category
                  <SubSortIndicator column="category" />
                </TableHead>
                <TableHead>Billing Cycle</TableHead>
                <TableHead>Renewal Date</TableHead>
                <TableHead
                  className="cursor-pointer select-none text-right"
                  onClick={() => toggleSubSort("amount")}
                >
                  Amount
                  <SubSortIndicator column="amount" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSubs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No subscriptions match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                sortedSubs.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.name}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {getClientName(sub.clientId)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {sub.category}
                    </TableCell>
                    <TableCell className="capitalize">
                      {sub.billingCycle}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {sub.renewalDate ? formatDate(sub.renewalDate) : "\u2014"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(sub.amount)}
                      <span className="ml-1 text-muted-foreground">
                        /{sub.billingCycle === "monthly" ? "mo" : "yr"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {sortedSubs.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={5} className="font-semibold">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-primary">
                    {formatCurrency(totalSubsAnnual)}
                    <span className="ml-1 font-normal text-muted-foreground">
                      /yr
                    </span>
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Grand Total */}
      <Card className="ml-auto sm:max-w-[50%]">
        <CardHeader>
          <CardTitle>Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end">
            <div className="flex flex-col items-end">
              <div className="flex flex-col gap-0.5 items-end text-muted-foreground">
                <div className="flex items-baseline gap-2">
                  <span>Time Tracking</span>
                  <span className="font-mono">
                    {formatCurrency(totalTimeCost)}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span>Subscriptions</span>
                  <span className="font-mono">
                    {formatCurrency(totalSubsAnnual)}
                  </span>
                </div>
              </div>
              <div className="mt-1 border-t border-border pt-1 w-full text-right">
                <span className="font-mono font-bold text-primary">
                  {formatCurrency(totalTimeCost + totalSubsAnnual)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
