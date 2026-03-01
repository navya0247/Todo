import { Badge } from "@/components/ui/badge"
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants"
import type { SolutionStatus } from "@/lib/types"

export function StatusBadge({ status }: { status: SolutionStatus }) {
  return (
    <Badge className={STATUS_COLORS[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}
