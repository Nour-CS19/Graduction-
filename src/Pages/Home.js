import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const goToHeader = () => {
    navigate("/HomePage");
  };

  return (
    <div>
      <h1>Home Page</h1>
      <button onClick={goToHeader}>Go to Header</button>
    </div>
  );
};

export default Home;
