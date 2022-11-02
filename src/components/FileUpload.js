import React from "react";
import { Box, Stack, TextField, Button } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const FileInput = (props) => {
  return (
    <div>
      <Box m={10} display="flex" justifyContent="center" alignItems="center">
        <Stack direction="row">
          <Button
            startIcon={<UploadFileIcon />}
            variant="contained"
            component="label"
          >
            Browse
            <input
              hidden
              type="file"
              accept=".csv, .json"
              onChange={props.onChange}
            />
          </Button>
          <TextField
            value={props.fileName}
            InputProps={{
              readOnly: true,
            }}
          />
        </Stack>
      </Box>
    </div>
  );
};

export default FileInput;
