import React, {PropsWithChildren} from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import CodeBlock from "@theme/CodeBlock";
import Details from "@theme/Details";


export const renderCodes = sql => {
  let content = undefined;
  if (!sql) {
    content = (
      <Box sx={{pt: 0.5}}>
        <Skeleton width="80%" />
        <Skeleton width="50%" />
        <Skeleton width="70%" />
      </Box>
    )
  } else {
    content = (
      <CodeBlock className='language-sql'>
        {sql}
      </CodeBlock>
    )
  }
  return content
}


export default function ChartWithSql ({ sql, children }: PropsWithChildren<{ sql?: string }>) {
  return (
    <>
      <Details summary={<summary>Click here to expand SQL</summary>}>
        {renderCodes(sql)}
      </Details>
      {children}
    </>
  )
}

