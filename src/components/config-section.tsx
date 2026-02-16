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
import { envVarGroups, clientResponses } from "@/lib/project-data"

export function ConfigSection() {
  return (
    <div className="flex flex-col gap-6">
      {/* Client Discovery Responses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Client Discovery Responses</CardTitle>
          <p className="text-sm text-muted-foreground">
            Submitted {clientResponses.submissionDate} by{" "}
            {clientResponses.respondentEmail}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {clientResponses.answers.map((a) => (
              <div
                key={a.question}
                className="flex flex-col gap-1.5 rounded-lg border border-border p-3"
              >
                <p className="text-sm font-medium text-foreground">
                  {a.question}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {a.selected.map((s) => (
                    <Badge key={s} variant="secondary" className="font-normal">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            Environment Variables & Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {envVarGroups.map((group) => (
            <div key={group.category}>
              <h4 className="mb-2 font-semibold text-foreground">
                {group.category}
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Variable</TableHead>
                    <TableHead>Location / Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.vars.map((v) => (
                    <TableRow key={v.name}>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                          {v.name}
                        </code>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {v.location}
                        </span>
                        {v.note && (
                          <Badge
                            variant="destructive"
                            className="ml-2 text-xs"
                          >
                            {v.note}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
