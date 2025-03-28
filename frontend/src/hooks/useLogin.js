import { useState } from "react";
import { useAuthContext } from "./useAuthContext.js";
import axios from "axios";
import { actions } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export const useLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);

  const { dispatch } = useAuthContext();
  const navigate = useNavigate();

  const login = async (email, password) => {
    // reset loading and error to initial state whenever login hook is called
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // include cookies with request
        }
      );

      const user = response.data?.user;
      //   console.log("useLogin.js : ", response);
      console.log(user);

      // storing user data from server in authContext
      dispatch({ type: actions.LOGIN, payload: user });
      // redirect to home page after successful login
      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      setError(err.response.data.message);
    } finally {
      setIsLoading(false); // set loading to false after login process is complete
    }
  };

  return { login, isLoading, error };
};
