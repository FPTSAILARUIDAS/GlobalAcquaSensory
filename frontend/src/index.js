import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/index.css";
import App from "@/App";
import PrintableReport from "@/components/PrintableReport";
import SummaryReport from "@/components/SummaryReport";
import DailySummarySheet from "@/components/DailySummarySheet";
import BlindTestDailySummary from "@/components/BlindTestDailySummary";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/report/:sessionCode" element={<PrintableReport />} />
        <Route path="/summary/:sessionCode" element={<SummaryReport />} />
        <Route path="/daily-summary/:date" element={<DailySummarySheet />} />
        <Route path="/blind-test-summary/:date" element={<BlindTestDailySummary />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
