import React from "react";
import { TidbTableInfo } from "@ossinsight/api";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";

const keys: (keyof TidbTableInfo)[] = [
  'tableSchema',
  'tableName',
  'tableRows',
  'avgRowLength',
  'dataLength',
  'indexLength',
  'createTime',
  'tableCollation',
  'createOptions',
  'rowIdShardingInfo',
  'pkType',
];

export default function TableInfo({ info }: { info: TidbTableInfo }) {
  return (
    <Table className="clearTable" size='small'>
      <TableBody>
        {keys.map(key => (
          <TableRow key={key}>
            <TableCell sx={{ fontWeight: 'bold' }}>
              {key}
            </TableCell>
            <TableCell>
              {info?.[key] || '--'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}