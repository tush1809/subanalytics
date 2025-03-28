import axios from "axios";
import { actions } from "../context/AuthContext";
import { useAuthContext } from "./useAuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export const useLogout = () => {
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/auth/logout`,
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        dispatch({ type: actions.LOGOUT });
        navigate("/login");
      }
    } catch (error) {
      console.log("error logging out: ", error);
    }
  };

  return { logout };
};
