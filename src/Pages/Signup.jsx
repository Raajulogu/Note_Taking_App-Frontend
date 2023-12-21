import { Button, TextField } from "@mui/material";
import { useFormik } from "formik";
import React, { useState } from "react";
import * as yup from "yup";
import "./Signup.css";
import axios from "axios";
import asserts from "../assert";
import { useNavigate } from "react-router-dom";

//Backend URL
const api_url = asserts.backend_url;

//Validation Schema
let fieldValidationSchema = yup.object({
  name: yup.string().required("Please Enter your Name"),
  email: yup.string().required("Please Enter your Email"),
  password: yup.string().required("Create New Password"),
  phone: yup.string().required("Please Enter your contact Number")
});
const SignUp = () => {
  let [loading, setLoading] = useState(null);
  let navigate = useNavigate();
  let { handleSubmit, handleChange, values, errors } = useFormik({
    initialValues: {
      name: "",
      password: "",
      email: "",
      phone: ""
    },
    validationSchema: fieldValidationSchema,
    onSubmit: (user) => {
      handleSignUp(user);
    },
  });

  async function handleSignUp(user) {
    setLoading(1);
    try {
      let response = await axios.post(`${api_url}/user/signup`, user);
      localStorage.setItem("token", response.data.token);
      navigate("/");
    } catch (error) {
      alert("Singup error, please try later");
      console.log("SignUp error", error);
      setLoading(false);
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h1>Sign Up</h1>
        <br />
        <form onSubmit={handleSubmit} className="signup-form">
          <TextField
            name="name"
            type="name"
            label="Name"
            placeholder="Enter your name"
            value={values.name}
            onChange={handleChange}
          />
          {errors.name ? (
            <div style={{ color: "crimson" }}>{errors.name}</div>
          ) : (
            ""
          )}
          <br />
          <TextField
            name="email"
            type="email"
            label="Email"
            placeholder="Enter your email"
            value={values.email}
            onChange={handleChange}
          />
          {errors.email ? (
            <div style={{ color: "crimson" }}>{errors.email}</div>
          ) : (
            ""
          )}
          <br />
          <TextField
            name="phone"
            type="phone"
            label="Phone"
            placeholder="Enter your Phone Number"
            value={values.phone}
            onChange={handleChange}
          />
          {errors.phone ? (
            <div style={{ color: "crimson" }}>{errors.phone}</div>
          ) : (
            ""
          )}
          <br />
          <TextField
            name="password"
            type="password"
            label="Password"
            placeholder="Creat New Password"
            value={values.password}
            onChange={handleChange}
          />
          {errors.password ? (
            <div style={{ color: "crimson" }}>{errors.password}</div>
          ) : (
            ""
          )}
          <br />
          <div className="submit-btn">
            {loading ? (
              <Button variant="contained" type="submit">
                Signing Up...
              </Button>
            ) : (
              <Button variant="contained" type="submit">
                Sign Up
              </Button>
            )}
          </div>
        </form>
        <br />
        <div>
          <p className="log-btn">
            Already have an account ? <a href="/login">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
