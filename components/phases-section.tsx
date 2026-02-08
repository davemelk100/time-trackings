import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { phases } from "@/lib/project-data"

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(n)
}

export function PhasesSection() {
  return (
    <div className="flex flex-col gap-8">
      {phases.map((phase) => (
        <div key={phase.id} className="flex flex-col gap-4">
          {/* Phase header */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-xl">{phase.name}</CardTitle>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{phase.timeline}</Badge>
                  <span className="text-lg font-semibold">
                    {formatCurrency(phase.fixedCost)}
                  </span>
                </div>
              </div>
              {phase.baseHours && (
                <p className="text-sm text-muted-foreground">
                  {phase.baseHours} hours @ ${phase.fixedCost / phase.baseHours}
                  /hr
                </p>
              )}
            </CardHeader>
          </Card>

          {/* Scope of Work */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scope of Work</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {phase.scope.map((group) => (
                  <div key={group.category} className="flex flex-col gap-2">
                    <h4 className="font-semibold text-foreground">
                      {group.category}
                    </h4>
                    <ul className="flex flex-col gap-1">
                      {group.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Deliverables */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deliverables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {phase.deliverables.map((d) => (
                  <Badge key={d} variant="outline">
                    {d}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Milestone</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Trigger</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {phase.payments.map((p) => (
                    <TableRow key={p.label}>
                      <TableCell className="font-medium">{p.label}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Progress
                            value={p.percentage}
                            className="h-2 w-20"
                          />
                          <span className="text-sm">{p.percentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(p.amount)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {p.trigger}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}
