import { ChartResult } from '@site/src/api/explorer';
import React, { useMemo } from 'react';
import { isNonemptyString, nonEmptyArray, notNullish } from '@site/src/utils/value';
import { styled } from '@mui/material';

export default function TableChart ({ title, data, columns, fields: propFields }: ChartResult & { data: any[], fields?: Array<{ name: string }> }) {
  const fields = useMemo(() => {
    if (nonEmptyArray(columns)) {
      return columns.map((name: string) => ({ name }));
    } else if (notNullish(propFields)) {
      return propFields;
    } else {
      if (data.length > 0) {
        return Object.keys(data[0]).map(name => ({ name }));
      } else {
        return [{ name: '' }];
      }
    }
  }, [data, columns, propFields]);
  return (
    <TableContainer>
      <Table className="clearTable">
        <thead>
        {isNonemptyString(title) && (
          <tr>
            <th colSpan={fields.length} align="center">{title}</th>
          </tr>
        )}
        <tr>
          {fields.map(({ name }) => <th key={name}>{name}</th>)}
        </tr>
        </thead>
        <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {fields.map(({ name }) => <td key={name}>{row[name]}</td>)}
          </tr>
        ))}
        </tbody>
      </Table>
    </TableContainer>
  );
}

const TableContainer = styled('div')`
  overflow: scroll;
`;

const Table = styled('table')`
  font-size: 12px;
  display: table;
  min-width: 100%;
`;
