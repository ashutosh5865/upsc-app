import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Today from "./pages/Today";
import Subjects from "./pages/Subjects";
import Analytics from "./pages/Analytics";
import Schedule from "./pages/Schedule";
import Mocks from "./pages/Mocks";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/today" element={<Today />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/mocks" element={<Mocks />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;