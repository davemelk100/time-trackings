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
  projectOverview,
  investmentSummary,
  timelinePhases,
} from "@/lib/project-data"

export function OverviewSection() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{projectOverview.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Client</span>
              <span className="font-medium">{projectOverview.client}</span>
              <span className="text-sm text-muted-foreground">
                {projectOverview.clientContact}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Consultant</span>
              <span className="font-medium">{projectOverview.consultant}</span>
              <span className="text-sm text-muted-foreground">
                {projectOverview.consultantEntity}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Details</span>
              <span className="text-sm">
                Rate: ${projectOverview.hourlyRate}/hr
              </span>
              <span className="text-sm">
                Duration: {projectOverview.projectDuration}
              </span>
              <span className="text-sm">
                Governing Law: {projectOverview.governingLaw}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {projectOverview.goals.map((goal) => (
              <Badge key={goal} variant="secondary" className="text-sm">
                {goal}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Investment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Total Investment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investmentSummary.map((row) => (
                <TableRow key={row.component}>
                  <TableCell className="font-medium">{row.component}</TableCell>
                  <TableCell>{row.cost}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        row.type === "one-time" ? "default" : "secondary"
                      }
                    >
                      {row.type}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phase</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timelinePhases.map((row) => (
                <TableRow key={row.phase}>
                  <TableCell className="font-medium">{row.phase}</TableCell>
                  <TableCell>{row.duration}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
