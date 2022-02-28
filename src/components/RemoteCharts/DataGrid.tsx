import React from "react";
import {Queries} from "./queries";
import styles from './data-grid.module.css'

export type Column<Q extends keyof Queries> = {
  field: keyof Queries[Q]['data']
  title: string
}

interface DataGridProps<Q extends keyof Queries> {
  data?: Queries[Q]['data'][]
  columns: Column<Q>[]
  loading: boolean
}

export default function DataGrid<Q extends keyof Queries>({columns, data}: DataGridProps<Q>) {
  return (
    <table className={styles.dataGridTable}>
      <thead>
      <tr>
        {columns.map(({title, field}) => <th key={field as string}>{title}</th>)}
      </tr>
      </thead>
      <tbody>
      {data?.map(row => (
        <tr>
          {columns.map(({field}) => <td key={field as string}>{row[field]}</td>)}
        </tr>
      ))}
      </tbody>
    </table>
  )
}