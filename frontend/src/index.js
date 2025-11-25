import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/index.css";
import App from "@/App";
import PrintableReport from "@/components/PrintableReport";
import SummaryReport from "@/components/SummaryReport";
import DailySummarySheet from "@/components/DailySummarySheet";

// Get auth token from localStorage for protected routes
const getAuthToken = () => localStorage.getItem("auth_token");

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/report/:sessionCode" element={<PrintableReport />} />
        <Route path="/summary/:sessionCode" element={<SummaryReport />} />
        <Route path="/daily-summary/:date" element={<DailySummarySheet authToken={getAuthToken()} />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
