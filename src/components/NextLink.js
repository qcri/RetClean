import React from "react";
import { Link } from "react-router-dom";
import { Box, Button } from "@mui/material";

const NextLink = (props) => {
  return (
    <div>
      <Box m={10} display="flex" justifyContent="center" alignItems="center">
        <Button
          component={Link}
          to={props.next}
          disabled={props.disabled}
          variant="contained"
          size="large"
        >
          {props.text}
        </Button>
      </Box>
    </div>
  );
};

export default NextLink;
