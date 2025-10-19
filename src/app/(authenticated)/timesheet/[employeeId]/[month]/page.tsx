import Link from "next/link"

import { ContentLayout } from "@/components/admin-panel/content-layout"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import EmployeeTimesheetDetails from "@/components/admin-panel/timesheet/EmployeeTimesheetDetails"

type TimesheetEmployeePageProps = {
  params: {
    employeeId: string
    month: string
  }
}

export default function TimesheetEmployeePage({ params }: TimesheetEmployeePageProps) {
  const { employeeId, month } = params

  return (
    <ContentLayout title="Timesheet">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/timesheet">Timesheet</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mt-6">
        <EmployeeTimesheetDetails employeeId={employeeId} month={month} />
      </div>
    </ContentLayout>
  )
}
