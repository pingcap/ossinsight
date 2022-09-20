import React from "react";
import { TidbTableInfo } from "@ossinsight/api";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        Table Info
      </AccordionSummary>
      <AccordionDetails>
        <Table className="clearTable" size="small">
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
      </AccordionDetails>
    </Accordion>
  );
}