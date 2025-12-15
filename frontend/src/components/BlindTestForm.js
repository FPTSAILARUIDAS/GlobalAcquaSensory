import { useState, useEffect } from "react";
import { CheckCircle, ArrowLeft, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";

const API = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001/api";

const BlindTestForm = ({ panelistNumber, onSubmit, onBack }) => {
  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0, 5);
    return { date, time };
  };

  const { date: currentDate, time: currentTime } = getCurrentDateTime();

  // Color codes for blind test
  const colorCodes = [
    { id: "control", label: "Control", color: "Control" },
    { id: "yellow", label: "Yellow", color: "Yellow" },
    { id: "brown", label: "Brown", color: "Brown" },
    { id: "blue", label: "Blue", color: "Blue" },
    { id: "green", label: "Green", color: "Green" },
    { id: "red", label: "Red", color: "Red" },
    { id: "purple", label: "Purple", color: "Purple" },
    { id: "white", label: "White", color: "White" },
    { id: "black", label: "Black", color: "Black" },
  ];

  const [formData, setFormData] = useState({
    panelistName: "",
    testDate: currentDate,
    testTime: currentTime,
    roundNo: "",
    samples: colorCodes.map(code => ({
      id: code.id,
      colorCode: code.color,
      status: code.id === "control" ? "IN" : "",
      offNote: ""
    })),
    signatureFile: null,
    signaturePreview: null,
  });

  // Load stored signature on mount
  useEffect(() => {
    const loadStoredSignature = async () => {
      try {
        const storedAuth = localStorage.getItem("auth");
        if (!storedAuth) return;
        
        const auth = JSON.parse(storedAuth);
        const token = auth.token;
        
        const response = await axios.get(`${API}/users/signature`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.signature) {
          setFormData(prev => ({
            ...prev,
            signaturePreview: response.data.signature
          }));
        }
      } catch (error) {
        console.log("No stored signature found");
      }
    };
    
    loadStoredSignature();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSampleChange = (sampleId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      samples: prev.samples.map(sample =>
        sample.id === sampleId ? { ...sample, [field]: value } : sample
      )
    }));
  };

  // Get background color for each sample code
  const getColorStyle = (colorCode) => {
    const colorMap = {
      "Control": { backgroundColor: "#e5e7eb", color: "#000" },
      "Yellow": { backgroundColor: "#fef08a", color: "#000" },
      "Brown": { backgroundColor: "#a16207", color: "#fff" },
      "Blue": { backgroundColor: "#3b82f6", color: "#fff" },
      "Green": { backgroundColor: "#22c55e", color: "#000" },
      "Red": { backgroundColor: "#ef4444", color: "#fff" },
      "Purple": { backgroundColor: "#a855f7", color: "#fff" },
      "White": { backgroundColor: "#ffffff", color: "#000", border: "2px solid #000" },
      "Black": { backgroundColor: "#000000", color: "#fff" },
    };
    return colorMap[colorCode] || {};
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          signatureFile: file,
          signaturePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSignatureForFutureUse = async () => {
    if (!formData.signaturePreview) {
      alert("Please upload a signature first");
      return;
    }
    
    try {
      const storedAuth = localStorage.getItem("auth");
      if (!storedAuth) return;
      
      const auth = JSON.parse(storedAuth);
      const token = auth.token;
      
      await axios.post(`${API}/users/signature`, 
        { signature: formData.signaturePreview },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert("Signature saved successfully! It will be automatically loaded for future tests.");
    } catch (error) {
      alert("Failed to save signature");
    }
  };

  const removeSignature = () => {
    setFormData(prev => ({
      ...prev,
      signatureFile: null,
      signaturePreview: null
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all samples have status
    const allSamplesComplete = formData.samples.every(s => 
      s.id === "control" || s.status !== ""
    );
    
    if (!allSamplesComplete) {
      alert("Please mark all samples as IN or OUT");
      return;
    }
    
    // Validate OUT samples have off notes
    const outSamplesValid = formData.samples.every(s =>
      s.status !== "OUT" || (s.status === "OUT" && s.offNote.trim() !== "")
    );
    
    if (!outSamplesValid) {
      alert("Please provide OFF Note description for all OUT samples (Mandatory)");
      return;
    }
    
    // Validate signature
    if (!formData.signaturePreview) {
      alert("Please upload your signature");
      return;
    }
    
    const submissionData = {
      ...formData,
      signature: formData.signaturePreview
    };
    
    onSubmit(submissionData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-purple-700 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          🎯 Sensory Blind Test
        </h2>
        <p className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
          Compare samples against control reference using color codes
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Panelist Information */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Panelist Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="panelistName" className="text-sm font-semibold text-gray-700">
                Name of the Panelist *
              </Label>
              <Input
                id="panelistName"
                value={formData.panelistName}
                onChange={(e) => handleChange("panelistName", e.target.value)}
                placeholder="Enter panelist name"
                required
                className="border-purple-300 focus:border-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testDate" className="text-sm font-semibold text-gray-700">
                Date of Evaluation *
              </Label>
              <Input
                id="testDate"
                type="date"
                value={formData.testDate}
                onChange={(e) => handleChange("testDate", e.target.value)}
                required
                className="border-purple-300 focus:border-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roundNo" className="text-sm font-semibold text-gray-700">
                Round No *
              </Label>
              <Input
                id="roundNo"
                type="number"
                value={formData.roundNo}
                onChange={(e) => handleChange("roundNo", e.target.value)}
                placeholder="Enter round number"
                required
                min="1"
                className="border-purple-300 focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Test Objective */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Test Objective:</h4>
          <p className="text-sm text-blue-800">
            A Sample is judged as being "IN" or "OUT" using a control reference.
          </p>
          <ul className="text-sm text-blue-800 mt-2 space-y-1 ml-4">
            <li>• <strong>IN:</strong> Sample is identical to control or within acceptable variability</li>
            <li>• <strong>OUT:</strong> Sample is different and unacceptable</li>
          </ul>
          <p className="text-sm text-red-600 font-semibold mt-2">
            For OUT Samples, OFF Note description is MANDATORY
          </p>
        </div>

        {/* Samples Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-2 border-gray-300">
            <thead>
              <tr className="bg-purple-600 text-white">
                <th className="border-2 border-gray-300 px-4 py-3 text-left font-bold">Sl No</th>
                <th className="border-2 border-gray-300 px-4 py-3 text-left font-bold">Sample Color Code</th>
                <th className="border-2 border-gray-300 px-4 py-3 text-center font-bold">IN/OUT</th>
                <th className="border-2 border-gray-300 px-4 py-3 text-left font-bold">OFF Note Description</th>
              </tr>
            </thead>
            <tbody>
              {formData.samples.map((sample, index) => (
                <tr key={sample.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border-2 border-gray-300 px-4 py-3">
                    {sample.id === "control" ? "Control" : index}
                  </td>
                  <td className="border-2 border-gray-300 px-4 py-3 font-semibold" style={getColorStyle(sample.colorCode)}>
                    {sample.colorCode}
                  </td>
                  <td className="border-2 border-gray-300 px-4 py-3">
                    {sample.id === "control" ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                        IN (Control)
                      </span>
                    ) : (
                      <Select
                        value={sample.status}
                        onValueChange={(value) => handleSampleChange(sample.id, "status", value)}
                        required
                      >
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IN">IN</SelectItem>
                          <SelectItem value="OUT">OUT</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </td>
                  <td className="border-2 border-gray-300 px-4 py-3">
                    {sample.id === "control" ? (
                      <span className="text-gray-400 text-sm">N/A</span>
                    ) : sample.status === "OUT" ? (
                      <Input
                        value={sample.offNote}
                        onChange={(e) => handleSampleChange(sample.id, "offNote", e.target.value)}
                        placeholder="Describe OFF note (Mandatory)"
                        required
                        className="border-red-300 focus:border-red-500"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signature Upload */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
          <div className="space-y-2">
            <Label htmlFor="signature" className="text-sm font-semibold text-gray-700">
              Upload Signature *
            </Label>
            {!formData.signaturePreview ? (
              <div className="flex items-center space-x-2">
                <Input
                  id="signature"
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                  className="border-purple-300 focus:border-purple-500"
                />
                <Upload className="w-5 h-5 text-purple-600" />
              </div>
            ) : (
              <div className="relative inline-block">
                <img
                  src={formData.signaturePreview}
                  alt="Signature preview"
                  className="max-w-xs h-24 border-2 border-purple-300 rounded-lg object-contain bg-white p-2"
                />
                <button
                  type="button"
                  onClick={removeSignature}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500">Upload your signature image (Max 5MB)</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-4">
          {onBack && (
            <Button
              type="button"
              onClick={onBack}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          )}
          <Button
            type="submit"
            className="ml-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center space-x-2 px-8"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Submit Blind Test</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BlindTestForm;
