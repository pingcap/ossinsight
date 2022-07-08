import React from "react";
import { CompanyContributionData, CompanyInfo, useCompanyContributions } from "./hooks";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Skeleton from "@mui/material/Skeleton";


interface CompaniesProps {
  company: CompanyInfo
}

const Companies = ({ company }: CompaniesProps) => {
  const { data, loading } = useCompanyContributions(company?.name)

  if (!company) {
    return <></>
  }

  return (
    <>
      <DataTable data={data?.data ?? []} loading={loading} />
    </>
  )
}

type Dimension = {
  key: keyof CompanyContributionData
  title: string
}

const DIMENSIONS: Dimension[] = [
  { key: 'contributions', title: 'Total Contributions' },
  { key: 'repo_name', title: 'Repository' },
  { key: 'pushes', title: 'Pushes' },
  { key: 'pull_requests', title: 'PRs' },
  { key: 'reviews', title: 'PR Reviews' },
  { key: 'review_comments', title: 'PR Review Comments' },
  { key: 'issues', title: 'Issues' },
  { key: 'issue_comments', title: 'Issue Comments' },
]

const DataTable = ({ data, loading }: { data: CompanyContributionData[], loading: boolean }) => {
  return (
    <Table>
      <TableHead>
      <TableRow>
        <TableCell variant='head'>Rank</TableCell>
        {DIMENSIONS.map(d => <TableCell key={d.key}>{d.title}</TableCell>)}
      </TableRow>
      </TableHead>
      <TableBody>
      {loading ? renderLoading() : renderData(data)}
      </TableBody>
    </Table>
  )
}

const renderData = (data: CompanyContributionData[]) => {
  return data.map((item, i) => (
    <TableRow>
      <TableCell variant='head'>#{i + 1}</TableCell>
      {DIMENSIONS.map(d => <TableCell key={d.key}>{item[d.key]}</TableCell>)}
    </TableRow>
  ))
}

const renderLoading = () => {
  return [0, 1, 2, 3, 4, 5].map((item, i) => (
    <TableRow>
      <TableCell variant='head'><Skeleton sx={{ display: 'inline-block' }} /></TableCell>
      {DIMENSIONS.map(d => <TableCell key={d.key}><Skeleton sx={{ display: 'inline-block', width: '100%' }} /></TableCell>)}
    </TableRow>
  ))
}

export default Companies
