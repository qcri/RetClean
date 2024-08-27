import React from "react";
import { Stack, Button, TextField } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const FileInput = (props) => {
  return (
    <Stack direction="row" justifyContent="left">
      <Button
        startIcon={<UploadFileIcon />}
        disabled={props.disabled}
        disableElevation
        variant="contained"
        component="label"
        sx={{ px: 2 }}
      >
        Browse
        <input
          hidden
          type="file"
          accept=".csv"
          onChange={(e) => props.onChange(e.target.files)}
          multiple={props.type === "multiple"}
          webkitdirectory={props.type === "multiple" ? "true" : undefined}
        />
      </Button>
      <TextField
        fullWidth
        value={props.fileName}
        placeholder={
          props.type === "single" ? "No file selected" : "No folder selected"
        }
        InputProps={{ readOnly: true }}
      />
    </Stack>
  );
};

export default FileInput;
