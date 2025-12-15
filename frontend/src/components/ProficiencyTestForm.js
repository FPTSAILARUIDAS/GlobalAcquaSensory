import { useState } from "react";
import { CheckCircle, ArrowLeft, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ProficiencyTestForm = ({ panelistNumber, onSubmit, onBack }) => {
  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0, 5);
    return { date, time };
  };

  const { date: currentDate, time: currentTime } = getCurrentDateTime();

  // Color codes for proficiency test
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

  const removeSignature = () => {
    setFormData(prev => ({
      ...prev,
      signatureFile: null,
      signaturePreview: null
    }));
  };

  const calculateOverallScore = () => {
    let totalScores = 0;
    let scoreCount = 0;
    
    formData.samples.forEach(sample => {
      const appearance = parseFloat(sample.appearanceScore) || 0;
      const odour = parseFloat(sample.odourScore) || 0;
      const taste = parseFloat(sample.tasteScore) || 0;
      
      if (appearance > 0) { totalScores += appearance; scoreCount++; }
      if (odour > 0) { totalScores += odour; scoreCount++; }
      if (taste > 0) { totalScores += taste; scoreCount++; }
    });
    
    if (scoreCount === 0) return "0.00";
    return (totalScores / scoreCount).toFixed(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all samples have scores
    const allSamplesComplete = formData.samples.every(s => 
      s.appearanceScore !== "" && s.odourScore !== "" && s.tasteScore !== ""
    );
    
    if (!allSamplesComplete) {
      alert("Please provide scores for all parameters in all samples");
      return;
    }
    
    // Validate signature
    if (!formData.signaturePreview) {
      alert("Please upload your signature");
      return;
    }
    
    const overallScore = calculateOverallScore();
    const submissionData = {
      ...formData,
      overallScore: overallScore,
      signature: formData.signaturePreview
    };
    
    onSubmit(submissionData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-green-700 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          ⭐ Proficiency Test
        </h2>
        <p className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
          Standard proficiency testing for sensory analysis skills
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Panelist Information */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Test Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="panelistName" className="text-sm font-semibold text-gray-700">
                Panelist Name *
              </Label>
              <Input
                id="panelistName"
                value={formData.panelistName}
                onChange={(e) => handleChange("panelistName", e.target.value)}
                placeholder="Enter panelist name"
                required
                className="border-green-300 focus:border-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testDate" className="text-sm font-semibold text-gray-700">
                Test Date *
              </Label>
              <Input
                id="testDate"
                type="date"
                value={formData.testDate}
                onChange={(e) => handleChange("testDate", e.target.value)}
                required
                className="border-green-300 focus:border-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testCode" className="text-sm font-semibold text-gray-700">
                Proficiency Test Code *
              </Label>
              <Input
                id="testCode"
                value={formData.testCode}
                onChange={(e) => handleChange("testCode", e.target.value)}
                placeholder="e.g., PT-2025-001"
                required
                className="border-green-300 focus:border-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider" className="text-sm font-semibold text-gray-700">
                Test Provider *
              </Label>
              <Input
                id="provider"
                value={formData.provider}
                onChange={(e) => handleChange("provider", e.target.value)}
                placeholder="e.g., External Lab / Internal"
                required
                className="border-green-300 focus:border-green-500"
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
                className="border-green-300 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Scoring Guide */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Scoring Guide (0-10 scale):</h4>
          <div className="text-sm text-blue-800 grid grid-cols-2 gap-2">
            <div>• 0-3: Poor/Unacceptable</div>
            <div>• 4-6: Fair/Acceptable</div>
            <div>• 7-8: Good</div>
            <div>• 9-10: Excellent</div>
          </div>
          <p className="text-sm text-green-700 font-semibold mt-2">
            Score each parameter (Appearance, Odour, Taste) for all color-coded samples
          </p>
        </div>

        {/* Samples Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-2 border-gray-300">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="border-2 border-gray-300 px-4 py-3 text-left font-bold">Sl No</th>
                <th className="border-2 border-gray-300 px-4 py-3 text-left font-bold">Sample Color Code</th>
                <th className="border-2 border-gray-300 px-4 py-3 text-center font-bold">Appearance Score (0-10)</th>
                <th className="border-2 border-gray-300 px-4 py-3 text-center font-bold">Odour Score (0-10)</th>
                <th className="border-2 border-gray-300 px-4 py-3 text-center font-bold">Taste Score (0-10)</th>
                <th className="border-2 border-gray-300 px-4 py-3 text-left font-bold">Observation</th>
              </tr>
            </thead>
            <tbody>
              {formData.samples.map((sample, index) => (
                <tr key={sample.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border-2 border-gray-300 px-4 py-3 font-semibold">
                    {sample.id === "control" ? "Control" : index}
                  </td>
                  <td className="border-2 border-gray-300 px-4 py-3 font-semibold">
                    {sample.colorCode}
                  </td>
                  <td className="border-2 border-gray-300 px-2 py-3">
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={sample.appearanceScore}
                      onChange={(e) => handleSampleChange(sample.id, "appearanceScore", e.target.value)}
                      placeholder="0-10"
                      required
                      className="border-green-300 focus:border-green-500 text-center"
                    />
                  </td>
                  <td className="border-2 border-gray-300 px-2 py-3">
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={sample.odourScore}
                      onChange={(e) => handleSampleChange(sample.id, "odourScore", e.target.value)}
                      placeholder="0-10"
                      required
                      className="border-green-300 focus:border-green-500 text-center"
                    />
                  </td>
                  <td className="border-2 border-gray-300 px-2 py-3">
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={sample.tasteScore}
                      onChange={(e) => handleSampleChange(sample.id, "tasteScore", e.target.value)}
                      placeholder="0-10"
                      required
                      className="border-green-300 focus:border-green-500 text-center"
                    />
                  </td>
                  <td className="border-2 border-gray-300 px-4 py-3">
                    <Input
                      value={sample.observation}
                      onChange={(e) => handleSampleChange(sample.id, "observation", e.target.value)}
                      placeholder="Optional notes"
                      className="border-green-300 focus:border-green-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Overall Assessment */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
          <h4 className="text-lg font-bold text-gray-800 mb-4">Overall Assessment</h4>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Calculated Overall Score
              </Label>
              <div className="text-3xl font-bold text-green-600">
                {calculateOverallScore()} / 10
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Average of all parameter scores across all samples
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comments" className="text-sm font-semibold text-gray-700">
                Additional Comments
              </Label>
              <Textarea
                id="comments"
                value={formData.comments}
                onChange={(e) => handleChange("comments", e.target.value)}
                placeholder="Enter any additional observations or comments"
                rows={4}
                className="border-green-300 focus:border-green-500"
              />
            </div>
            
            {/* Signature Upload */}
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
                    className="border-green-300 focus:border-green-500"
                  />
                  <Upload className="w-5 h-5 text-green-600" />
                </div>
              ) : (
                <div className="relative inline-block">
                  <img
                    src={formData.signaturePreview}
                    alt="Signature preview"
                    className="max-w-xs h-24 border-2 border-green-300 rounded-lg object-contain bg-white p-2"
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
            className="ml-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center space-x-2 px-8"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Submit Proficiency Test</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProficiencyTestForm;
