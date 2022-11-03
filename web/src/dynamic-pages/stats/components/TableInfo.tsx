import React from 'react';
import { TidbTableInfo } from '@ossinsight/api';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import format from 'human-format';
import { notFalsy, coalesceFalsy } from '@site/src/utils/value';

const entries: Array<{ key: keyof TidbTableInfo, humanFormat?: any }> = [
  { key: 'tableSchema' },
  { key: 'tableName' },
  { key: 'tableRows', humanFormat: {} },
  { key: 'avgRowLength', humanFormat: { unit: 'B' } },
  { key: 'dataLength', humanFormat: { unit: 'B' } },
  { key: 'indexLength', humanFormat: { unit: 'B' } },
  { key: 'createTime' },
  { key: 'tableCollation' },
  { key: 'createOptions' },
  { key: 'rowIdShardingInfo' },
  { key: 'pkType' },
];

export default function TableInfo ({ info }: { info: TidbTableInfo | undefined }) {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        Table Info
      </AccordionSummary>
      <AccordionDetails>
        <Table className="clearTable" size="small">
          <TableBody>
            {entries.map(({ key, humanFormat }) => (
              <TableRow key={key}>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {key}
                </TableCell>
                <TableCell>
                  {notFalsy(humanFormat) ? format(coalesceFalsy(info?.[key], 0), humanFormat) : coalesceFalsy(info?.[key], '--')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AccordionDetails>
    </Accordion>
  );
}
