// src/context/AuthContext.jsx
import { createContext, useReducer, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export const AuthContext = createContext();

export const actions = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
};

export const authReducer = (state, action) => {
  switch (action.type) {
    case actions.LOGIN: {
      const u = action.payload ?? null;
      return {
        ...state,
        user: u
          ? {
              firstname: u.firstname ?? "",
              lastname: u.lastname ?? "",
              email: u.email ?? "",
            }
          : null,
      };
    }
    case actions.LOGOUT:
      return { ...state, user: null };
    default:
      return state; // never return undefined
  }
};

export const AuthContextProvider = ({ children }) => {
  // Safe initial state: user can be null; never undefined
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/auth/get-user`, {
          withCredentials: true,
        });
        const user = response?.data?.user ?? null;
        if (user) {
          dispatch({ type: actions.LOGIN, payload: user });
          if (location.pathname === "/login") navigate("/dashboard");
        } else {
          dispatch({ type: actions.LOGOUT });
        }
      } catch (error) {
        const status = error?.response?.status;
        if (status === 401 || status === 404) {
          dispatch({ type: actions.LOGOUT });
          if (location.pathname !== "/login" && location.pathname !== "/signup") {
            navigate("/login");
          }
        } else {
          console.log("An unexpected error occurred.", error);
        }
      }
    };
    loadUser();
  }, [API_URL, location.pathname, navigate]);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
