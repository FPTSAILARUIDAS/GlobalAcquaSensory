import { useState } from "react";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    signature: "",
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
    
    onSubmit(formData);
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
                  <td className="border-2 border-gray-300 px-4 py-3 font-semibold">
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

        {/* Signature */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
          <div className="space-y-2">
            <Label htmlFor="signature" className="text-sm font-semibold text-gray-700">
              Signature *
            </Label>
            <Input
              id="signature"
              value={formData.signature}
              onChange={(e) => handleChange("signature", e.target.value)}
              placeholder="Enter your signature"
              required
              className="border-purple-300 focus:border-purple-500"
            />
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
