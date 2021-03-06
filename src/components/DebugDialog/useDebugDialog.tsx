import { RemoteData } from "../RemoteCharts/hook";
import React, { useState } from "react";
import DebugDialog from "./DebugDialog";
import { useEventCallback } from "@mui/material";
import Button from "@mui/material/Button";
import CodeIcon from "@mui/icons-material/Code";

export interface UseDebugDialogParams extends Pick<RemoteData<any, any>, 'sql' | 'query' | 'params'> {

}

export interface UseDebugDialogResult {
  dialog: JSX.Element;
  button: JSX.Element;
  show: boolean;
}

export function useDebugDialog(params: UseDebugDialogParams): UseDebugDialogResult {
  const [showDebugModel, setShowDebugModel] = useState(false);

  const handleCloseDebugModel = useEventCallback(() => {
    setShowDebugModel(false);
  });

  const handleShowDebugModel = useEventCallback(() => {
    setShowDebugModel(true);
  });

  const dialog = (
    <DebugDialog
      query={params?.query}
      sql={params?.sql}
      params={params?.params}
      open={!!params && showDebugModel}
      onClose={handleCloseDebugModel}
    />
  );

  const button = (
    <Button
      size="small"
      onClick={handleShowDebugModel}
      endIcon={<CodeIcon />}
      disabled={!params}
    >
      SHOW SQL
    </Button>
  );

  return {
    dialog,
    button,
    show: showDebugModel,
  };
}