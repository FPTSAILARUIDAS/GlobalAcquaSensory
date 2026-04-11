import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Download, X, ArrowLeft, Save, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API } from "@/utils/api";

const OFF_NOTE_OPTIONS = [
  { value: "", label: "Select off-note" },
  { value: "IN", label: "IN" },
  { value: "Plastic", label: "Plastic" },
  { value: "Fruity", label: "Fruity" },
  { value: "Burnt Caramel", label: "Burnt Caramel" },
  { value: "Musty", label: "Musty" },
  { value: "Metallic", label: "Metallic" },
  { value: "Sulfurous", label: "Sulfurous" },
  { value: "Earthy", label: "Earthy" },
  { value: "Acetaldehyde", label: "Acetaldehyde" },
  { value: "Fermented", label: "Fermented" },
  { value: "Medicinal", label: "Medicinal" },
  { value: "Others", label: "Others" },
  { value: "NA", label: "NA" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Select" },
  { value: "IN", label: "IN" },
  { value: "OUT", label: "OUT" },
  { value: "NA", label: "NA" },
];

const COLOR_MAP = {
  Yellow: { bg: "#fef08a", text: "#000" },
  Brown: { bg: "#a16207", text: "#fff" },
  Blue: { bg: "#3b82f6", text: "#fff" },
  Green: { bg: "#22c55e", text: "#000" },
  Red: { bg: "#ef4444", text: "#fff" },
  Purple: { bg: "#a855f7", text: "#fff" },
  White: { bg: "#ffffff", text: "#000", border: "2px solid #000" },
  Black: { bg: "#000000", text: "#fff" },
  Control: { bg: "#e5e7eb", text: "#000" },
};

const InteractiveSummaryReport = ({ config }) => {
  const {
    testType,
    testTypeFilter,
    reportTitle,
    routePrefix,
    storageKeyPrefix,
    themeColor,
    themeColorDark,
    themeColorLight,
    themeBorderClass,
    themeGradientFrom,
    themeGradientTo,
  } = config;

  const { date } = useParams();
  const navigate = useNavigate();

  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [actualData, setActualData] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const [verifierName, setVerifierName] = useState("");
  const [signatureFile, setSignatureFile] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [verificationSaved, setVerificationSaved] = useState(false);

  useEffect(() => {
    fetchDailySummary();
  }, [date]);

  const fetchDailySummary = async () => {
    try {
      const storedAuth = localStorage.getItem("auth");
      let token = null;

      if (storedAuth) {
        try {
          const auth = JSON.parse(storedAuth);
          token = auth.token;
        } catch (e) {
          console.error("Failed to parse auth from localStorage");
        }
      }

      if (!token) {
        setMessage("Please login first to view daily summary. Close this window and login from the main page.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API}/admin/daily-summary/${date}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000,
      });

      const filteredSessions = response.data.sessions.filter(
        (s) => s.testType === testTypeFilter
      );

      setSummaryData({
        ...response.data,
        sessions: filteredSessions,
        totalSessions: filteredSessions.length,
      });

      initializeActualData(filteredSessions);
    } catch (error) {
      console.error("Failed to fetch daily summary:", error);
      if (error.response?.status === 401) {
        setMessage("Authentication failed. Please close this window and login again from the main page.");
      } else if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        setMessage("Request timed out. Please check your internet connection and try again.");
      } else if (error.code === "ERR_NETWORK" || error.message?.includes("Network Error")) {
        setMessage("Network error. Please check your internet connection and try again.");
      } else {
        setMessage(error.response?.data?.detail || "Failed to load summary data. Please try refreshing the page.");
      }
    } finally {
      setLoading(false);
    }
  };

  const initializeActualData = (sessions) => {
    const data = {};
    sessions.forEach((session, sessionIndex) => {
      session.ballots.forEach((ballot, ballotIndex) => {
        ballot.samples &&
          ballot.samples.forEach((sample, sampleIndex) => {
            const key = `${sessionIndex}-${ballotIndex}-${sampleIndex}`;
            data[key] = {
              actualOffNote: sample.actualOffNote || "",
              actualStatus: sample.actualStatus || "",
              otherOffNote: sample.otherOffNote || "",
            };
          });
      });
    });
    setActualData(data);
  };

  const handleActualDataChange = (key, field, value) => {
    setActualData((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const calculatePanelistPercentages = (session, ballot) => {
    const sessionIndex = summaryData.sessions.indexOf(session);
    const ballotIndex = session.ballots.indexOf(ballot);

    let totalSamples = 0;
    let offNoteMatches = 0;
    let statusMatches = 0;

    ballot.samples &&
      ballot.samples.forEach((sample, sampleIndex) => {
        if (sample.colorCode === "Control") return;

        const key = `${sessionIndex}-${ballotIndex}-${sampleIndex}`;
        const actual = actualData[key] || {};

        if (actual.actualOffNote === "NA" || actual.actualStatus === "NA") return;

        if (actual.actualOffNote && actual.actualStatus) {
          totalSamples++;

          if (actual.actualOffNote === "IN") {
            if (sample.status === "IN") offNoteMatches++;
          } else {
            const panelistOffNote = sample.offNote || "";
            const actualOffNoteValue = actual.actualOffNote === "Others" ? actual.otherOffNote : actual.actualOffNote;
            if (actualOffNoteValue && panelistOffNote.toLowerCase().includes(actualOffNoteValue.toLowerCase())) {
              offNoteMatches++;
            }
          }

          if (sample.status === actual.actualStatus) statusMatches++;
        }
      });

    if (totalSamples === 0) {
      return { offNotePercentage: null, statusPercentage: null, totalSamples: 0 };
    }

    return {
      offNotePercentage: Math.round((offNoteMatches / totalSamples) * 100),
      statusPercentage: Math.round((statusMatches / totalSamples) * 100),
      totalSamples,
    };
  };

  const calculatePercentages = (session, ballot, sampleIndex, sample) => {
    const key = `${summaryData.sessions.indexOf(session)}-${session.ballots.indexOf(ballot)}-${sampleIndex}`;
    const actual = actualData[key] || {};

    if (actual.actualOffNote === "NA" || actual.actualStatus === "NA") {
      return { offNoteMatch: null, statusMatch: null };
    }

    if (!actual.actualOffNote || !actual.actualStatus) {
      return { offNoteMatch: null, statusMatch: null };
    }

    let offNoteMatch = 0;
    if (actual.actualOffNote === "IN") {
      offNoteMatch = sample.status === "IN" ? 100 : 0;
    } else {
      const panelistOffNote = sample.offNote || "";
      const actualOffNoteValue = actual.actualOffNote === "Others" ? actual.otherOffNote : actual.actualOffNote;
      offNoteMatch = actualOffNoteValue && panelistOffNote.toLowerCase().includes(actualOffNoteValue.toLowerCase()) ? 100 : 0;
    }

    const statusMatch = sample.status === actual.actualStatus ? 100 : 0;
    return { offNoteMatch, statusMatch };
  };

  const saveActualData = async () => {
    try {
      localStorage.setItem(`actualData_${storageKeyPrefix}_${date}`, JSON.stringify(actualData));
      setIsEditing(false);
      alert("Actual data saved successfully!");
    } catch (error) {
      console.error("Failed to save actual data:", error);
      alert("Failed to save actual data");
    }
  };

  useEffect(() => {
    // Try new key format first, then fall back to legacy key (blind test used `actualData_${date}`)
    let savedData = localStorage.getItem(`actualData_${storageKeyPrefix}_${date}`);
    if (!savedData) {
      savedData = localStorage.getItem(`actualData_${date}`);
    }
    if (savedData) {
      try {
        setActualData(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse saved data");
      }
    }

    const savedVerification = localStorage.getItem(`verification_${storageKeyPrefix}_${date}`);
    if (savedVerification) {
      try {
        const verification = JSON.parse(savedVerification);
        setVerifierName(verification.verifierName || "");
        setSignaturePreview(verification.signature || null);
        setVerificationSaved(true);
      } catch (e) {
        console.error("Failed to parse saved verification");
      }
    }
  }, [date, storageKeyPrefix]);

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignatureFile(file);
        setSignaturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSignature = () => {
    setSignatureFile(null);
    setSignaturePreview(null);
  };

  const handleVerificationSave = () => {
    if (!verifierName || !signaturePreview) {
      alert("Please enter verifier name and upload signature");
      return;
    }
    const verificationData = {
      verifierName,
      signature: signaturePreview,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(`verification_${storageKeyPrefix}_${date}`, JSON.stringify(verificationData));
    setVerificationSaved(true);
    alert("Verification saved successfully!");
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const handleDownloadPDF = () => window.print();

  const getSampleStyle = (colorCode) => {
    const c = COLOR_MAP[colorCode] || { bg: "#ffffff", text: "#000" };
    return {
      backgroundColor: c.bg,
      color: c.text,
      border: c.border || "",
    };
  };

  // --- RENDER ---

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="summary-loading">
        <p className="text-lg">Loading summary...</p>
      </div>
    );
  }

  if (!summaryData || summaryData.totalSessions === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8" data-testid="summary-empty">
        <div className="max-w-7xl mx-auto">
          <Button onClick={() => navigate(-1)} variant="outline" className="mb-4" data-testid="back-btn">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className={`text-center mb-6 pb-4 border-b-4 bg-white rounded-lg p-6`} style={{ borderBottomColor: themeColor }}>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Global Acqua Pvt Ltd</h1>
            <p className="text-lg text-gray-600 mb-2">Sensory Quality Control</p>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: themeColor }}>
              {reportTitle}
            </h2>
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Date:</span>
              <span className="ml-2">{formatDate(date)}</span>
            </div>
          </div>

          <DateNavigation date={date} navigate={navigate} routePrefix={routePrefix} themeColor={themeColor} themeColorLight={themeColorLight} />

          <div className="bg-white rounded-lg p-8 text-center shadow-md" data-testid="no-sessions-msg">
            <p className="text-lg text-gray-600">No {testType} sessions found for {formatDate(date)}</p>
            <p className="text-sm text-gray-500 mt-2">Use the date navigation above to view other dates</p>
          </div>
        </div>
      </div>
    );
  }

  const totalPanelists = summaryData.sessions.reduce((sum, session) => sum + session.ballots.length, 0);

  return (
    <div className="min-h-screen bg-white p-8" data-testid="summary-report">
      {/* Action Buttons */}
      <div className="no-print flex items-center justify-end space-x-3 mb-6">
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2"
            style={{ backgroundColor: themeColor }}
            data-testid="edit-actual-values-btn"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Actual Values</span>
          </Button>
        ) : (
          <Button
            onClick={saveActualData}
            className="bg-emerald-600 hover:bg-emerald-700 flex items-center space-x-2"
            data-testid="save-changes-btn"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </Button>
        )}
        <Button
          onClick={handleDownloadPDF}
          className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
          data-testid="download-pdf-btn"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </Button>
        <Button onClick={() => navigate(-1)} variant="outline" className="flex items-center space-x-2" data-testid="close-btn">
          <X className="w-4 h-4" />
          <span>Close</span>
        </Button>
      </div>

      {/* Report Content */}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 pb-4 border-b-4" style={{ borderBottomColor: themeColor }}>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Global Acqua Pvt Ltd</h1>
          <p className="text-lg text-gray-600 mb-2">Sensory Quality Control</p>
          <h2 className="text-2xl font-semibold mb-3" style={{ color: themeColor }}>
            {reportTitle}
          </h2>
          <div className="flex justify-between items-center text-sm text-gray-700 max-w-4xl mx-auto">
            <div>
              <span className="font-semibold">Date:</span>
              <span className="ml-2">{formatDate(date)}</span>
            </div>
            <div>
              <span className="font-semibold">Total Sessions:</span>
              <span className="ml-2">{summaryData.totalSessions}</span>
            </div>
            <div>
              <span className="font-semibold">Total Panelists:</span>
              <span className="ml-2">{totalPanelists}</span>
            </div>
          </div>
        </div>

        {/* Date Navigation */}
        <DateNavigation date={date} navigate={navigate} routePrefix={routePrefix} themeColor={themeColor} themeColorLight={themeColorLight} />

        {/* Summary Table */}
        <div className="mb-8 overflow-x-auto">
          <table className="w-full border-2 border-gray-900" style={{ borderCollapse: "collapse" }} data-testid="summary-table">
            <thead>
              <tr style={{ backgroundColor: themeColor, color: "#fff" }}>
                <th className="border-2 border-gray-900 px-3 py-2 text-left text-xs font-bold">S.No</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-left text-xs font-bold">Panelist Name</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-center text-xs font-bold">Test Date</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-center text-xs font-bold">Round No</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-left text-xs font-bold">Sample Color Code</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-left text-xs font-bold">Actual Off Note</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-center text-xs font-bold">Actual IN/OUT</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-left text-xs font-bold">Panelist Submission Off Notes</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-center text-xs font-bold">Panelist IN/OUT</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-center text-xs font-bold">% Off-Note Match</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-center text-xs font-bold">% IN/OUT Match</th>
                <th className="border-2 border-gray-900 px-3 py-2 text-center text-xs font-bold">Meets Requirement</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let rowCounter = 0;
                return summaryData.sessions
                  .map((session, sessionIndex) =>
                    session.ballots.map((ballot, ballotIndex) => {
                      const ballotStartRow = rowCounter + 1;
                      const panelistPercentages = calculatePanelistPercentages(session, ballot);

                      return (
                        ballot.samples &&
                        ballot.samples.map((sample, sampleIndex) => {
                          rowCounter++;
                          const slNo = rowCounter;
                          const isControl = sample.colorCode === "Control";
                          const key = `${sessionIndex}-${ballotIndex}-${sampleIndex}`;
                          const actual = actualData[key] || { actualOffNote: "", actualStatus: "" };
                          const percentages = calculatePercentages(session, ballot, sampleIndex, sample);

                          return (
                            <tr
                              key={`${session.id}-${ballotIndex}-${sampleIndex}`}
                              className={slNo % 2 === 0 ? "bg-white" : "bg-gray-50"}
                              data-testid={`row-${slNo}`}
                            >
                              <td className="border-2 border-gray-900 px-3 py-2 text-xs">
                                {sampleIndex === 0 ? ballotStartRow : ""}
                              </td>
                              <td className="border-2 border-gray-900 px-3 py-2 text-xs">
                                {sampleIndex === 0 ? ballot.panelistName : ""}
                              </td>
                              <td className="border-2 border-gray-900 px-3 py-2 text-center text-xs">
                                {sampleIndex === 0 ? ballot.testDate : ""}
                              </td>
                              <td className="border-2 border-gray-900 px-3 py-2 text-center text-xs">
                                {sampleIndex === 0 ? ballot.roundNo : ""}
                              </td>
                              <td
                                className="border-2 border-gray-900 px-3 py-2 text-xs font-semibold"
                                style={getSampleStyle(sample.colorCode)}
                              >
                                {sample.colorCode}
                              </td>

                              {/* Actual Off Note */}
                              <td className="border-2 border-gray-900 px-2 py-2 text-xs">
                                {isControl
                                  ? "N/A"
                                  : isEditing
                                  ? (
                                    <div className="space-y-1">
                                      <select
                                        value={actual.actualOffNote}
                                        onChange={(e) => handleActualDataChange(key, "actualOffNote", e.target.value)}
                                        className="w-full px-1 py-1 text-xs border rounded focus:outline-none focus:ring-1"
                                        style={{ borderColor: themeColorLight }}
                                        data-testid={`off-note-select-${key}`}
                                      >
                                        {OFF_NOTE_OPTIONS.map((opt) => (
                                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                      </select>
                                      {actual.actualOffNote === "Others" && (
                                        <input
                                          type="text"
                                          value={actual.otherOffNote || ""}
                                          onChange={(e) => handleActualDataChange(key, "otherOffNote", e.target.value)}
                                          placeholder="Describe..."
                                          className="w-full px-1 py-1 text-xs border rounded focus:outline-none focus:ring-1"
                                          style={{ borderColor: themeColorLight }}
                                          data-testid={`off-note-other-${key}`}
                                        />
                                      )}
                                    </div>
                                  )
                                  : actual.actualOffNote === "Others"
                                  ? actual.otherOffNote || "Others"
                                  : actual.actualOffNote || "-"}
                              </td>

                              {/* Actual IN/OUT */}
                              <td className="border-2 border-gray-900 px-2 py-2 text-center text-xs">
                                {isControl ? (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">IN</span>
                                ) : isEditing ? (
                                  <select
                                    value={actual.actualStatus}
                                    onChange={(e) => handleActualDataChange(key, "actualStatus", e.target.value)}
                                    className="w-full px-1 py-1 text-xs border rounded focus:outline-none focus:ring-1"
                                    style={{ borderColor: themeColorLight }}
                                    data-testid={`status-select-${key}`}
                                  >
                                    {STATUS_OPTIONS.map((opt) => (
                                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                  </select>
                                ) : actual.actualStatus ? (
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                                      actual.actualStatus === "IN"
                                        ? "bg-green-100 text-green-700"
                                        : actual.actualStatus === "NA"
                                        ? "bg-gray-100 text-gray-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {actual.actualStatus}
                                  </span>
                                ) : (
                                  "-"
                                )}
                              </td>

                              {/* Panelist Off Notes */}
                              <td className="border-2 border-gray-900 px-3 py-2 text-xs">
                                {isControl ? "N/A" : sample.offNote || "-"}
                              </td>

                              {/* Panelist IN/OUT */}
                              <td className="border-2 border-gray-900 px-3 py-2 text-center text-xs">
                                {isControl ? (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                    IN (Control)
                                  </span>
                                ) : (
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                                      sample.status === "IN" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {sample.status}
                                  </span>
                                )}
                              </td>

                              {/* % Off-Note Match */}
                              {sampleIndex === 0 ? (
                                <td
                                  rowSpan={ballot.samples.length}
                                  className="border-2 border-gray-900 px-3 py-2 text-center text-sm font-bold"
                                >
                                  {panelistPercentages.offNotePercentage !== null ? (
                                    <div className="flex flex-col items-center">
                                      <span
                                        className={`px-3 py-2 rounded text-lg ${
                                          panelistPercentages.offNotePercentage >= 80
                                            ? "bg-green-200 text-green-800"
                                            : panelistPercentages.offNotePercentage >= 50
                                            ? "bg-yellow-200 text-yellow-800"
                                            : "bg-red-200 text-red-800"
                                        }`}
                                      >
                                        {panelistPercentages.offNotePercentage}%
                                      </span>
                                      <span className="text-xs text-gray-600 mt-1">
                                        ({panelistPercentages.totalSamples} samples)
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              ) : null}

                              {/* % IN/OUT Match */}
                              {sampleIndex === 0 ? (
                                <td
                                  rowSpan={ballot.samples.length}
                                  className="border-2 border-gray-900 px-3 py-2 text-center text-sm font-bold"
                                >
                                  {panelistPercentages.statusPercentage !== null ? (
                                    <div className="flex flex-col items-center">
                                      <span
                                        className={`px-3 py-2 rounded text-lg ${
                                          panelistPercentages.statusPercentage >= 80
                                            ? "bg-green-200 text-green-800"
                                            : panelistPercentages.statusPercentage >= 50
                                            ? "bg-yellow-200 text-yellow-800"
                                            : "bg-red-200 text-red-800"
                                        }`}
                                      >
                                        {panelistPercentages.statusPercentage}%
                                      </span>
                                      <span className="text-xs text-gray-600 mt-1">
                                        ({panelistPercentages.totalSamples} samples)
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              ) : null}

                              {/* Meets Requirement */}
                              <td className="border-2 border-gray-900 px-3 py-2 text-center text-xs">
                                {isControl ? (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                    ✓
                                  </span>
                                ) : percentages.offNoteMatch === 100 && percentages.statusMatch === 100 ? (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                    ✓
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                                    ✗
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      );
                    })
                  )
                  .flat()
                  .flat();
              })()}
            </tbody>
          </table>
        </div>

        {/* Verification Section */}
        <VerificationSection
          verificationSaved={verificationSaved}
          verifierName={verifierName}
          setVerifierName={setVerifierName}
          signaturePreview={signaturePreview}
          handleSignatureUpload={handleSignatureUpload}
          removeSignature={removeSignature}
          handleVerificationSave={handleVerificationSave}
          onEdit={() => {
            setVerificationSaved(false);
            setVerifierName("");
            setSignaturePreview(null);
            localStorage.removeItem(`verification_${storageKeyPrefix}_${date}`);
          }}
          themeColor={themeColor}
          themeColorLight={themeColorLight}
          themeGradientFrom={themeGradientFrom}
          themeGradientTo={themeGradientTo}
        />

        {/* Verified By Section for Print */}
        {verificationSaved && (
          <div className="print-only mb-8 border-t-2 pt-6" style={{ borderTopColor: themeColor }}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Verified By</h3>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Name:</p>
                <p className="text-base text-gray-900 mb-4">{verifierName}</p>
                <p className="text-sm font-semibold text-gray-700 mb-2">Signature:</p>
                <div className="border-2 border-gray-300 rounded p-2 inline-block">
                  <img src={signaturePreview} alt="Verifier Signature" className="h-16 object-contain" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t-2 border-gray-300 text-center text-sm text-gray-600">
          <p className="font-semibold">Generated by Global Acqua Pvt Ltd - Sensory Analysis System</p>
          <p className="mt-2">&copy; {new Date().getFullYear()} Global Acqua Pvt Ltd. All rights reserved.</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0.5in;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          body {
            background: white !important;
          }
          table {
            page-break-inside: avoid;
          }
          tr {
            page-break-inside: avoid;
          }
        }
        .print-only {
          display: none;
        }
      `}</style>
    </div>
  );
};

// --- Sub-components ---

const DateNavigation = ({ date, navigate, routePrefix, themeColor, themeColorLight }) => (
  <div
    className="mb-4 flex items-center justify-center space-x-4 no-print p-4 rounded-lg border"
    style={{ backgroundColor: themeColorLight, borderColor: themeColor + "40" }}
    data-testid="date-navigation"
  >
    <button
      onClick={() => {
        const currentDate = new Date(date);
        currentDate.setDate(currentDate.getDate() - 1);
        navigate(`/${routePrefix}/${currentDate.toISOString().split("T")[0]}`);
      }}
      className="px-4 py-2 text-white rounded-lg font-semibold hover:opacity-90"
      style={{ backgroundColor: themeColor }}
      data-testid="prev-day-btn"
    >
      &larr; Previous Day
    </button>
    <div className="flex items-center space-x-2">
      <label className="text-sm font-semibold text-gray-700">Select Date:</label>
      <input
        type="date"
        value={date}
        onChange={(e) => navigate(`/${routePrefix}/${e.target.value}`)}
        max={new Date().toISOString().split("T")[0]}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
        style={{ "--tw-ring-color": themeColor }}
        data-testid="date-picker"
      />
    </div>
    <button
      onClick={() => {
        const currentDate = new Date(date);
        currentDate.setDate(currentDate.getDate() + 1);
        const today = new Date().toISOString().split("T")[0];
        const nextDay = currentDate.toISOString().split("T")[0];
        if (nextDay <= today) {
          navigate(`/${routePrefix}/${nextDay}`);
        }
      }}
      disabled={date >= new Date().toISOString().split("T")[0]}
      className="px-4 py-2 text-white rounded-lg font-semibold hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed"
      style={{ backgroundColor: date >= new Date().toISOString().split("T")[0] ? undefined : themeColor }}
      data-testid="next-day-btn"
    >
      Next Day &rarr;
    </button>
  </div>
);

const VerificationSection = ({
  verificationSaved,
  verifierName,
  setVerifierName,
  signaturePreview,
  handleSignatureUpload,
  removeSignature,
  handleVerificationSave,
  onEdit,
  themeColor,
  themeColorLight,
  themeGradientFrom,
  themeGradientTo,
}) => (
  <div
    className="mb-8 rounded-xl p-6 border-2 shadow-sm no-print"
    style={{
      background: `linear-gradient(to bottom right, ${themeGradientFrom}, ${themeGradientTo})`,
      borderColor: themeColorLight,
    }}
    data-testid="verification-section"
  >
    <h3 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
      Verified By
    </h3>

    {verificationSaved ? (
      <div className="space-y-4">
        <div className="flex items-start justify-between bg-white rounded-lg p-4 border" style={{ borderColor: themeColorLight }}>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-700 mb-2">Verifier Name:</p>
            <p className="text-base text-gray-900" data-testid="verifier-name-display">{verifierName}</p>
            <p className="text-sm font-semibold text-gray-700 mt-4 mb-2">Signature:</p>
            <div className="rounded-lg p-3 bg-gray-50 inline-block border-2" style={{ borderColor: themeColorLight }}>
              <img src={signaturePreview} alt="Verifier Signature" className="max-w-xs h-20 object-contain" />
            </div>
          </div>
          <Button
            onClick={onEdit}
            variant="outline"
            className="ml-4 border-red-300 text-red-600 hover:bg-red-50"
            data-testid="edit-verification-btn"
          >
            Edit
          </Button>
        </div>
      </div>
    ) : (
      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Verifier Name *</label>
          <input
            type="text"
            value={verifierName}
            onChange={(e) => setVerifierName(e.target.value)}
            placeholder="Enter verifier name (e.g., BSL, Quality Manager)"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
            style={{ borderColor: themeColorLight }}
            data-testid="verifier-name-input"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Signature *</label>
          {!signaturePreview ? (
            <label htmlFor="verification-signature-upload" className="cursor-pointer">
              <div
                className="border-2 border-dashed rounded-lg p-6 hover:bg-opacity-50 transition-all text-center"
                style={{ borderColor: themeColorLight }}
              >
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke={themeColor} viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-sm font-semibold text-gray-700 mb-1">Click to upload signature</p>
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
              </div>
            </label>
          ) : (
            <div className="relative border-2 rounded-lg p-4 bg-white" style={{ borderColor: themeColorLight }}>
              <img src={signaturePreview} alt="Signature Preview" className="max-h-32 mx-auto" />
              <button
                type="button"
                onClick={removeSignature}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <input
            id="verification-signature-upload"
            type="file"
            accept="image/*"
            onChange={handleSignatureUpload}
            className="hidden"
          />
        </div>

        <Button
          onClick={handleVerificationSave}
          className="w-full text-white font-semibold py-3"
          style={{ backgroundColor: themeColor }}
          data-testid="save-verification-btn"
        >
          Save Verification
        </Button>
      </div>
    )}
  </div>
);

export default InteractiveSummaryReport;
