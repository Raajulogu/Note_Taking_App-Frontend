import React, { useEffect, useState } from "react";
import Base from "../Base/Base";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";
import asserts from "../assert";
import Stack from "@mui/material/Stack";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

//Backend URL
const api_url = asserts.backend_url;

const Dashboard = () => {
  let navigate = useNavigate();
  let [data, setData] = useState();
  let [search, setSearch] = useState("");
  let [head, setHead] = useState("");
  let [body, setBody] = useState("");
  let [deadline, setDeadline] = useState("");

  useEffect(() => {
    let token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
    }

    //Fetching data
    let fetchAllData = async () => {
      try {
        const response = await axios.get(`${api_url}/notes/get-all-notes`, {
          headers: {
            "x-auth": token,
          },
        });
        setData(response.data.notes);
      } catch (error) {
        console.error("Error In Fetching Data:", error);
      }
    };
    //Calling fetch function
    fetchAllData();
  }, []);

  // Function for Modal
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  //Post a New Task in server
  async function postNewTask() {
    let token = localStorage.getItem("token");
    if (!head || !body || !deadline) {
      alert("Please Fill all the field");
      return 1;
    }
    const newNotes = {
      head,
      data: body,
      deadline,
    };
    const response = await axios.post(`${api_url}/notes/add-notes`, newNotes, {
      headers: {
        "x-auth": token,
      },
    });
    handleClose();
  }

  function handleChangeDate(newDate) {
    setDeadline(`${newDate.$D}/${newDate.$M + 1}/${newDate.$y}`);
  }

  return (
    <Base>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div className="input-box">
            <h1>Add Task</h1>
            <Typography variant="body2" color="text.secondary">
              Title
            </Typography>
            <TextField
              label="Title"
              variant="outlined"
              fullWidth
              sx={{ m: 1 }}
              placeholder="Enter Title of the Task"
              value={head}
              onChange={(e) => setHead(e.target.value)}
              type="text"
            />
            <Typography variant="body2" color="text.secondary">
              Body
            </Typography>
            <TextField
              label="Body"
              variant="outlined"
              fullWidth
              sx={{ m: 1 }}
              placeholder="Detailed Task"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              type="text"
            />
            <br />
            <Typography variant="body2" color="text.secondary">
              Deadline
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker onChange={handleChangeDate} />
            </LocalizationProvider>
            <br />
            <div className="card-btn">
              <Button onClick={handleClose} variant="outlined">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                onClick={() => postNewTask()}
              >
                Add
              </Button>
            </div>
          </div>
        </Box>
      </Modal>
      {data && (
        <div className="home-container">
          <div className="search-container">
            <TextField
              label="Search"
              sx={{ m: 5, width: "75ch" }}
              placeholder="search profile"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment>
                    <IconButton>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>

          {search.length > 0 ? (
            <div className="searched-content">
              {data.map((val, index) => (
                <div className="searched-data">
                  {(val.head.toLowerCase().includes(search.toLowerCase()) ||
                    val.data.toLowerCase().includes(search.toLowerCase())) && (
                    <Notes key={index} data={val} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="non-search content">
              <div className="add-btn">
                <Button variant="contained" onClick={handleOpen}>
                  Add Task
                </Button>
              </div>
              <div className="profile-titles">
                <h1>Your Tasks</h1>
              </div>
              <div className="profile-container">
                {data.length ? (
                  data.map((val, index) => <Notes key={index} data={val} />)
                ) : (
                  <div>{data.length <= 0 ? <p>No data found</p> : <p></p>}</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Base>
  );
};

const Notes = ({ data, user }) => {
  let [snackmsg, setSnackmsg] = useState("");
  let [head, setHead] = useState(data.head);
  let [body, setBody] = useState(data.data);
  let [deadline, setDeadline] = useState(data.deadline);
  let [isChecked, setIsChecked] = useState(false);
  let [id, setId] = useState("");
  let token = localStorage.getItem("token");

  //Set Task ID
  useEffect(() => {
    setId(data._id);
    setIsChecked(data.status);
  }, []);

  //Handle Edit
  async function handleEdit() {
    try {
      await axios.put(
        `${api_url}/notes/update-notes`,
        {
          head,
          data: body,
          deadline,
        },
        {
          headers: {
            "x-auth": token,
            id: id,
          },
        }
      );
      setSnackmsg("Task Edited Successfully");
      handleClick();
      handleCloseModal();
    } catch (error) {
      console.error("Error Editing Task:", error);
    }
  }

  //Handle Delete
  async function handleDelete() {
    let token = localStorage.getItem("token");
    try {
      await axios.delete(`${api_url}/notes/delete-notes`, {
        headers: {
          "x-auth": token,
          id: id,
        },
      });
      setSnackmsg(`Task Deleted`);
      handleClick();
    } catch (error) {
      console.error("Error Deleting Task:", error);
    }
  }

  //Snackbar Setup
  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(true);
  };
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  // Function for Modal
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };
  const [show, setShow] = React.useState(false);
  const handleOpen = () => setShow(true);
  const handleCloseModal = () => setShow(false);

  // Send Reminders
  const sendReminders = async () => {
    try {
      await axios.post(`${api_url}/notes/send-reminders`, {
        headers: {
          "x-auth": token,
          id: id,
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Calculate the time until 9:00 AM
  const calculateTimeUntil9AM = () => {
    const now = new Date();
    const targetTime = new Date(now);
    targetTime.setHours(9, 0, 0, 0);

    let timeUntil9AM = targetTime - now;
    if (timeUntil9AM < 0) {
      // If it's already past 9:00 AM today, schedule it for 9:00 AM tomorrow
      timeUntil9AM += 24 * 60 * 60 * 1000;
    }

    return timeUntil9AM;
  };

  // Call sendReminders every day at 9:00 AM
  setInterval(sendReminders, calculateTimeUntil9AM());
  //Handle Change Date
  function handleChangeDate(newDate) {
    setDeadline(`${newDate.$D}/${newDate.$M + 1}/${newDate.$y}`);
  }

  //Handle checkbox
  const handleChange = (event) => {
    setIsChecked(event.target.checked);
    handleStatus();
  };

  // Handle Task Status Change
  async function handleStatus() {
    try {
      await axios.put(
        `${api_url}/notes/update-status`,
        {},
        {
          headers: {
            "x-auth": token,
            id: id,
          },
        }
      );
      setSnackmsg("Status Updated Successfully");
      handleClick();
    } catch (error) {
      console.error("Error Editing Task:", error);
    }
  }

  return (
    <Card sx={{ maxWidth: 345, mb: 2 }} className="profiles-cards">
      <Modal
        open={show}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div className="input-box">
            <h1>Edit Task</h1>
            <Typography variant="body2" color="text.secondary">
              Title
            </Typography>
            <TextField
              label="Title"
              variant="outlined"
              fullWidth
              sx={{ m: 1 }}
              placeholder="Enter Title of the Task"
              value={head}
              onChange={(e) => setHead(e.target.value)}
              type="text"
            />
            <Typography variant="body2" color="text.secondary">
              Body
            </Typography>
            <TextField
              label="Body"
              variant="outlined"
              fullWidth
              sx={{ m: 1 }}
              placeholder="Detailed Task"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              type="text"
            />
            <br />
            <Typography variant="body2" color="text.secondary">
              Deadline
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker onChange={handleChangeDate} />
            </LocalizationProvider>
            <br />
            <div className="card-btn">
              <Button onClick={handleCloseModal} variant="outlined">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                onClick={() => handleEdit()}
              >
                Edit
              </Button>
            </div>
          </div>
        </Box>
      </Modal>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {data.head}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {data.data}
        </Typography>
        <br />
        <Typography variant="body2" color="text.secondary">
          Deadline: {data.deadline}
        </Typography>
      </CardContent>
      <FormControlLabel
        control={
          <Checkbox
            checked={isChecked}
            onChange={handleChange} // Add this line to handle the change event
            defaultChecked // This is not needed if you are using the state (isChecked in this case)
          />
        }
        label="Completed"
      />
      <CardActions className="card-btns">
        <Button variant="contained" onClick={handleOpen}>
          Edit
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => handleDelete()}
        >
          Delete
        </Button>
      </CardActions>
      <Stack spacing={2} sx={{ width: "100%" }}>
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert
            onClose={handleClose}
            severity="success"
            sx={{ width: "100%" }}
          >
            {snackmsg}
          </Alert>
        </Snackbar>
      </Stack>
    </Card>
  );
};

export default Dashboard;
