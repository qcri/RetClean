import Radio from "@mui/material/Radio";
import Checkbox from "@mui/material/Checkbox";
import RadioGroup from "@mui/material/RadioGroup";
import FormGroup from "@mui/material/FormGroup";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";

const TemporaryDrawer = (props) => {
  const Item = styled(Paper)(({ theme }) => ({
    textAlign: "center",
    color: theme.palette.text.secondary,
    height: 60,
    lineHeight: "60px",
  }));

  return (
    <div>
      <Drawer
        anchor={"left"}
        open={props.show}
        onClose={props.toggleDrawer(false)}
      >
        <Box sx={{ width: 400 }} role="presentation">
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem />}
          >
            <Box sx={{ width: 200 }}>
              <Item elevation={0}>Target Column</Item>
              <FormControl sx={{ padding: "0px 15px" }}>
                <RadioGroup
                  value={props.target}
                  onChange={(e) => props.selectTarget(parseInt(e.target.value))}
                >
                  {props.columns.map((col, index) => (
                    <FormControlLabel
                      value={index}
                      control={<Radio />}
                      label={col.title}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>

            <Box sx={{ width: 200 }}>
              <Item elevation={0}>Pivot Columns</Item>
              <FormControl sx={{ padding: "0px 15px" }}>
                <FormGroup>
                  {props.columns.map((col, index) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={props.pivots[index]}
                          onChange={(e) => {
                            let newPivots = [...props.pivots];
                            newPivots[index] = e.target.checked;
                            props.selectPivots(newPivots);
                          }}
                        />
                      }
                      label={col.title}
                    />
                  ))}
                </FormGroup>
              </FormControl>
            </Box>
          </Stack>
        </Box>
      </Drawer>
    </div>
  );
};

export default TemporaryDrawer;
