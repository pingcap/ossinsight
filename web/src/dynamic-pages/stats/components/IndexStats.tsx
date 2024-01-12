import React from 'react';
import { TidbIndexStats } from '@ossinsight/api';
import Link from '@docusaurus/Link';
import AnimatedNumber from 'react-awesome-animated-number';

import { Table, TableHead, TableCell, TableBody, TableRow } from '@mui/material';

export interface IndexStatsProps {
  stats: TidbIndexStats[];
  showTable?: boolean;
}

export default function IndexStats ({ stats, showTable = false }: IndexStatsProps) {
  return (
    <Table className="clearTable">
      <TableHead>
        <TableRow>
          {showTable
            ? (
              <TableCell>
                Table
              </TableCell>
              )
            : undefined}
          <TableCell>
            Index
          </TableCell>
          <TableCell>
            Calls
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {stats.map(stat => (
          <TableRow key={`${stat.tableName}.${stat.indexName}`}>
            {showTable
              ? (
                <TableCell>
                  <Link to={`/stats/tables/${stat.tableName}`}>
                    {stat.tableName}
                  </Link>
                </TableCell>
                )
              : undefined}
            <TableCell>
              {stat.indexName}
            </TableCell>
            <TableCell>
              <AnimatedNumber value={stat.calls ?? 0} hasComma duration={200} size={14} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
