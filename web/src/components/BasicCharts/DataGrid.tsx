import React from 'react';
import styles from './data-grid.module.css';

export type DataGridColumn<T, F extends keyof T = keyof T> = {
  field: F;
  title: string;
  render?: (field: T[F], data: T, n: number) => any;
};

interface DataGridProps<T> {
  data?: T[];
  columns: Array<DataGridColumn<T>>;
  loading?: boolean;
}

export default function DataGrid<Q> ({ columns, data }: DataGridProps<Q>) {
  return (
    <table className={styles.dataGridTable}>
      <thead>
      <tr>
        {columns.map(({ title, field }) => <th key={field as string}>{title}</th>)}
      </tr>
      </thead>
      <tbody>
      {data?.map((row, i) => (
        <tr key={i}>
          {columns.map(({ field, render }) => (
            <td key={field as string}>
              { render?.(row[field], row, i) ?? row[field]}
            </td>
          ))}
        </tr>
      ))}
      </tbody>
    </table>
  );
}
