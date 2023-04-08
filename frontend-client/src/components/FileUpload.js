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
        sx={{ px: "1.5rem" }}
      >
        Browse
        {props.type === "datalake" ? (
          <input
            hidden
            type="file"
            directory="directory"
            multiple
            webkitdirectory="webkitdirectory"
            onChange={(e) => props.onChange(e.target.files)}
          />
        ) : (
          <input
            hidden
            type="file"
            accept={props.type === "data" ? ".csv" : ".json"}
            onChange={(e) => props.onChange(e.target.files[0])}
          />
        )}
      </Button>
      <TextField
        fullWidth
        value={props.fileName}
        InputProps={{ readOnly: true }}
        sx={{ backgroundColor: "white" }}
      />
    </Stack>
  );
};

export default FileInput;
