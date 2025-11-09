import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Landing from "./pages/Landing";
import Students from "./pages/Students";
import Subjects from "./pages/Subjects";
import Grades from "./pages/Grades";

export default function App() {
  return (
    <>
      

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/students" element={<Students />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/grades" element={<Grades />} />
      </Routes>
    </>
  );
}
