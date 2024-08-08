import React, { useState } from "react";
import { FormControl, FormLabel } from "@mui/material";

const DragDropFile = (props) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      props.onChange(e.dataTransfer.files);
    }
  };

  return (
    <FormControl
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      sx={{
        pt: "2%",
        px: "3%",
        height: "90%",
        width: "94%",
        textAlign: "center",
      }}
    >
      <FormLabel
        sx={{
          fontFamily: "League Spartan",
          fontSize: "1.5rem",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderStyle: "dashed",
          borderColor: "#cbd5e1",
          borderRadius: 10,
          backgroundColor: dragActive ? "#ffffff" : "#f8fafc",
          textDecorationLine: dragActive ? "underline" : "none",
        }}
      >
        Upload CSV Data Here!
      </FormLabel>
    </FormControl>
  );
};

export default DragDropFile;
