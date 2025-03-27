import React from "react";

import { Route  , Routes} from "react-router-dom";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Login from "./pages/Login";

function App() {
  

  return (
    <>
      
        <Routes>
          <Route path="/dashboard" element={<Home/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/Signup" element={<Signup/>}/>
        </Routes>
    
    </>
  );
}

export default App;
