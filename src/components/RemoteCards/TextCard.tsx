import * as React from "react";
import {CardContent, Stack} from "@mui/material";
import BasicCard, {BaseCardProps} from "./BasicCard";

interface TextCardProps extends BaseCardProps {
}

export default function TextCard(props: TextCardProps) {
  const {height, children} = props;

  return <BasicCard {...props}>
    <CardContent style={{height: height}}>
      <Stack direction="column" justifyContent="left" alignItems="top" style={{height: "100%"}}>
        {children}
      </Stack>
    </CardContent>
  </BasicCard>;
}
