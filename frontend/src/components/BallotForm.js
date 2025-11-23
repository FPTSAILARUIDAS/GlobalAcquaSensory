import { useState } from "react";
import { CheckCircle, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const BallotForm = ({ panelistNumber, onSubmit, initialData, onBack }) => {
  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0, 5);
    return { date, time };
  };

  const { date: currentDate, time: currentTime } = getCurrentDateTime();

  const [formData, setFormData] = useState({
    panelistName: initialData?.panelistName || "",
    productType: initialData?.productType || "",
    productCode: initialData?.productCode || "",
    dateOfMfg: initialData?.dateOfMfg || "",
    controlSampleCode: initialData?.controlSampleCode || "",
    productTime: initialData?.productTime || "",
    testingCompletionDate: initialData?.testingCompletionDate || currentDate,
    testingCompletionTime: initialData?.testingCompletionTime || currentTime,
    appearance: initialData?.appearance || { status: "IN", reason: "", otherReason: "" },
    odour: initialData?.odour || { status: "IN", reason: "", otherReason: "" },
    taste: initialData?.taste || { status: "IN", reason: "", otherReason: "" },
    remarks: initialData?.remarks || "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTestChange = (testName, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [testName]: {
        ...prev[testName],
        [field]: value,
        ...(field === "status" && value === "IN" ? { reason: "", otherReason: "" } : {}),
        ...(field === "reason" && value !== "Other" ? { otherReason: "" } : {}),
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const appearanceReasons = [
    "Turbid",
    "Discolored",
    "Contains Particles",
    "Cloudy",
    "Sediment Present",
    "Other",
  ];

  const odourReasons = [
    "Chlorine Smell",
    "Musty",
    "Chemical",
    "Rotten Eggs",
    "Petroleum",
    "Earthy",
    "Other",
  ];

  const tasteReasons = [
    "Bitter",
    "Salty",
    "Metallic",
    "Chemical",
    "Earthy",
    "Sweet",
    "Sour",
    "Other",
  ];

  const renderTestSection = (testName, label, reasons, testId) => (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-sm">
          {testName === "appearance" ? "A" : testName === "odour" ? "O" : "T"}
        </div>
        {label}
      </h3>

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-3 block">Status *</Label>
          <RadioGroup
            value={formData[testName].status}
            onValueChange={(value) => handleTestChange(testName, "status", value)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="IN"
                id={`${testId}-in`}
                data-testid={`${testId}-in`}
                className="border-2 border-green-500 text-green-600"
              />
              <Label
                htmlFor={`${testId}-in`}
                className="text-base font-semibold text-green-700 cursor-pointer"
              >
                IN
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="OUT"
                id={`${testId}-out`}
                data-testid={`${testId}-out`}
                className="border-2 border-red-500 text-red-600"
              />
              <Label
                htmlFor={`${testId}-out`}
                className="text-base font-semibold text-red-700 cursor-pointer"
              >
                OUT
              </Label>
            </div>
          </RadioGroup>
        </div>

        {formData[testName].status === "OUT" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 bg-white rounded-lg p-4 border border-red-200">
            <div className="flex items-start space-x-2 mb-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">Sample marked as OUT</p>
                <p className="text-xs text-red-600">Please specify the reason below</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${testId}-reason`} className="text-sm font-semibold text-gray-700">
                Reason *
              </Label>
              <Select
                value={formData[testName].reason}
                onValueChange={(value) => handleTestChange(testName, "reason", value)}
                required={formData[testName].status === "OUT"}
              >
                <SelectTrigger
                  data-testid={`${testId}-reason-select`}
                  className="border-red-300 focus:border-red-500 focus:ring-red-500"
                >
                  <SelectValue placeholder="Select reason for OUT" />
                </SelectTrigger>
                <SelectContent>
                  {reasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData[testName].reason === "Other" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label htmlFor={`${testId}-other`} className="text-sm font-semibold text-gray-700">
                  Specify Other Reason *
                </Label>
                <Input
                  id={`${testId}-other`}
                  data-testid={`${testId}-other-input`}
                  value={formData[testName].otherReason}
                  onChange={(e) => handleTestChange(testName, "otherReason", e.target.value)}
                  placeholder="Enter specific reason..."
                  required={formData[testName].reason === "Other"}
                  className="border-red-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Panelist {panelistNumber} - Ballot Entry
        </h2>
        <p className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
          Complete the sensory evaluation form below
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Panelist Information */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Panelist Information
          </h3>
          <div className="space-y-2">
            <Label htmlFor="panelistName" className="text-sm font-semibold text-gray-700">
              Panelist Name *
            </Label>
            <Input
              id="panelistName"
              data-testid="input-panelist-name"
              value={formData.panelistName}
              onChange={(e) => handleChange("panelistName", e.target.value)}
              placeholder="e.g., John Doe"
              required
              className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Product Information */}
        <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Product Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Product Type */}
            <div className="space-y-2">
              <Label htmlFor="productType" className="text-sm font-semibold text-gray-700">
                Product Type *
              </Label>
              <Input
                id="productType"
                data-testid="input-product-type"
                value={formData.productType}
                onChange={(e) => handleChange("productType", e.target.value)}
                placeholder="e.g., Packaged Drinking Water"
                required
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Product Code */}
            <div className="space-y-2">
              <Label htmlFor="productCode" className="text-sm font-semibold text-gray-700">
                Product Code *
              </Label>
              <Input
                id="productCode"
                data-testid="input-product-code"
                value={formData.productCode}
                onChange={(e) => handleChange("productCode", e.target.value)}
                placeholder="e.g., PDW-2025-001"
                required
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Date of Manufacturing */}
            <div className="space-y-2">
              <Label htmlFor="dateOfMfg" className="text-sm font-semibold text-gray-700">
                Date of Manufacturing *
              </Label>
              <Input
                id="dateOfMfg"
                data-testid="input-date-of-mfg"
                type="date"
                value={formData.dateOfMfg}
                onChange={(e) => handleChange("dateOfMfg", e.target.value)}
                required
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Control Sample Code */}
            <div className="space-y-2">
              <Label htmlFor="controlSampleCode" className="text-sm font-semibold text-gray-700">
                Control Sample Code *
              </Label>
              <Input
                id="controlSampleCode"
                data-testid="input-control-sample-code"
                value={formData.controlSampleCode}
                onChange={(e) => handleChange("controlSampleCode", e.target.value)}
                placeholder="e.g., CTRL-001"
                required
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Product Time */}
            <div className="space-y-2">
              <Label htmlFor="productTime" className="text-sm font-semibold text-gray-700">
                Product Time *
              </Label>
              <Input
                id="productTime"
                data-testid="input-product-time"
                type="time"
                value={formData.productTime}
                onChange={(e) => handleChange("productTime", e.target.value)}
                required
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Sensory Testing */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Sensory Testing
          </h3>
          
          {renderTestSection("appearance", "Appearance", appearanceReasons, "test-appearance")}
          {renderTestSection("odour", "Odour", odourReasons, "test-odour")}
          {renderTestSection("taste", "Taste", tasteReasons, "test-taste")}
        </div>

        {/* Remarks */}
        <div className="space-y-2">
          <Label htmlFor="remarks" className="text-sm font-semibold text-gray-700">
            Remarks
          </Label>
          <Textarea
            id="remarks"
            data-testid="textarea-remarks"
            value={formData.remarks}
            onChange={(e) => handleChange("remarks", e.target.value)}
            placeholder="Additional observations or comments..."
            rows={4}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          {onBack && (
            <Button
              type="button"
              data-testid="back-to-previous-btn"
              onClick={onBack}
              variant="outline"
              className="flex items-center space-x-2 border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Previous</span>
            </Button>
          )}
          <div className={onBack ? "" : "ml-auto"}>
            <Button
              type="submit"
              data-testid="submit-ballot-btn"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-6 rounded-xl font-semibold shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Submit Ballot</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BallotForm;