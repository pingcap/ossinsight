import React from "react";
import { styled } from "@mui/material/styles";
import { ArrowDownIcon, ArrowUpIcon } from "@primer/octicons-react";

export const Border = styled('div')({
  border: 'rgba(255,255,255,15%) 1px solid',
  borderRadius: 6,
  padding: '8px 16px',
});

export const DiffTag = styled('span')({
  color: '#E9EAEE',
  fontSize: 12,
  fontWeight: 'bold',
});

export const DiffIcon = ({ value }: { value: string }) => {
  const num = parseInt(value);
  if (num > 0) {
    return <ArrowUpIcon />;
  } else if (num < 0) {
    return <ArrowDownIcon />;
  } else {
    return <></>;
  }
};

export const Diff = ({ value }: { value: string }) => {
  return (
    <DiffTag>
      <DiffIcon value={value} />
      {value}
    </DiffTag>
  );
};
