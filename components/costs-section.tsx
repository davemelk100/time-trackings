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
import {
  socialMediaCampaign,
  maintenance,
  thirdPartyCosts,
} from "@/lib/project-data"

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(n)
}

export function CostsSection() {
  return (
    <div className="flex flex-col gap-6">
      {/* Social Media Campaign */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-xl">Social Media Campaign</CardTitle>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">
                {formatCurrency(socialMediaCampaign.effectiveMonthly)}/mo
              </Badge>
              <span className="text-lg font-semibold">
                {formatCurrency(socialMediaCampaign.totalAnnual)}/yr
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Phases */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phase</TableHead>
                <TableHead>Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {socialMediaCampaign.phases.map((p) => (
                <TableRow key={p.name}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{p.name}</span>
                      <div className="flex flex-wrap gap-1">
                        {p.scope.map((s) => (
                          <Badge
                            key={s}
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap align-top">
                    {formatCurrency(p.cost)}
                    {p.annualCost && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({formatCurrency(p.annualCost)}/yr)
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Platforms */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Primary Platforms
              </h4>
              <div className="flex flex-wrap gap-2">
                {socialMediaCampaign.platforms.primary.map((p) => (
                  <Badge key={p}>{p}</Badge>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Secondary Platforms
              </h4>
              <div className="flex flex-wrap gap-2">
                {socialMediaCampaign.platforms.secondary.map((p) => (
                  <Badge key={p} variant="secondary">
                    {p}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">
              KPIs
            </h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Objective</TableHead>
                  <TableHead>Metric</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {socialMediaCampaign.kpis.map((k) => (
                  <TableRow key={k.objective}>
                    <TableCell className="font-medium">
                      {k.objective}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {k.metric}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Expected ROI */}
          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">
              Expected ROI (6-12 Month Goal)
            </h4>
            <div className="flex flex-wrap gap-3">
              {socialMediaCampaign.expectedROI.map((r) => (
                <Card key={r.metric} className="flex-1 min-w-[140px]">
                  <CardContent className="p-3 text-center">
                    <p className="text-lg font-semibold">{r.goal}</p>
                    <p className="text-xs text-muted-foreground">{r.metric}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">
              Ongoing Maintenance & Support
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">
                {formatCurrency(maintenance.monthlyFee)}/mo
              </Badge>
              <span className="font-semibold">
                {formatCurrency(maintenance.annualFee)}/yr
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {maintenance.includes.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <span className="block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Third-Party Costs */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">
              Third-Party Software & Subscriptions
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">
                {formatCurrency(thirdPartyCosts.monthlyRange.low)} –{" "}
                {formatCurrency(thirdPartyCosts.monthlyRange.high)}/mo
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">
            Annual estimate: {formatCurrency(thirdPartyCosts.annualRange.low)} –{" "}
            {formatCurrency(thirdPartyCosts.annualRange.high)}. All subscriptions
            are the responsibility of the Client.
          </p>
          <div className="flex flex-wrap gap-2">
            {thirdPartyCosts.categories.map((c) => (
              <Badge key={c} variant="outline">
                {c}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
