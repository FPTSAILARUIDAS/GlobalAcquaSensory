import { useState } from "react";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BallotForm = ({ panelistNumber, onSubmit, initialData, onBack }) => {
  const [formData, setFormData] = useState({
    productType: initialData?.productType || "",
    productCode: initialData?.productCode || "",
    dateOfMfg: initialData?.dateOfMfg || "",
    controlSampleCode: initialData?.controlSampleCode || "",
    productTime: initialData?.productTime || "",
    temperature: initialData?.temperature || "",
    clarity: initialData?.clarity || "",
    color: initialData?.color || "",
    odor: initialData?.odor || "",
    taste: initialData?.taste || "",
    remarks: initialData?.remarks || "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

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
        <div className="grid md:grid-cols-2 gap-6">
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

          {/* Temperature */}
          <div className="space-y-2">
            <Label htmlFor="temperature" className="text-sm font-semibold text-gray-700">
              Temperature (°C)
            </Label>
            <Input
              id="temperature"
              data-testid="input-temperature"
              value={formData.temperature}
              onChange={(e) => handleChange("temperature", e.target.value)}
              placeholder="e.g., 22"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Clarity */}
          <div className="space-y-2">
            <Label htmlFor="clarity" className="text-sm font-semibold text-gray-700">
              Clarity
            </Label>
            <Select value={formData.clarity} onValueChange={(value) => handleChange("clarity", value)}>
              <SelectTrigger data-testid="select-clarity" className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Select clarity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Clear">Clear</SelectItem>
                <SelectItem value="Slightly Hazy">Slightly Hazy</SelectItem>
                <SelectItem value="Hazy">Hazy</SelectItem>
                <SelectItem value="Turbid">Turbid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color" className="text-sm font-semibold text-gray-700">
              Color
            </Label>
            <Select value={formData.color} onValueChange={(value) => handleChange("color", value)}>
              <SelectTrigger data-testid="select-color" className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Colorless">Colorless</SelectItem>
                <SelectItem value="Light Yellow">Light Yellow</SelectItem>
                <SelectItem value="Yellow">Yellow</SelectItem>
                <SelectItem value="Brown">Brown</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Odor */}
          <div className="space-y-2">
            <Label htmlFor="odor" className="text-sm font-semibold text-gray-700">
              Odor
            </Label>
            <Select value={formData.odor} onValueChange={(value) => handleChange("odor", value)}>
              <SelectTrigger data-testid="select-odor" className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Select odor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Odorless">Odorless</SelectItem>
                <SelectItem value="Mild">Mild</SelectItem>
                <SelectItem value="Chlorine">Chlorine</SelectItem>
                <SelectItem value="Musty">Musty</SelectItem>
                <SelectItem value="Chemical">Chemical</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Taste */}
          <div className="space-y-2">
            <Label htmlFor="taste" className="text-sm font-semibold text-gray-700">
              Taste
            </Label>
            <Select value={formData.taste} onValueChange={(value) => handleChange("taste", value)}>
              <SelectTrigger data-testid="select-taste" className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Select taste" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tasteless">Tasteless</SelectItem>
                <SelectItem value="Pleasant">Pleasant</SelectItem>
                <SelectItem value="Salty">Salty</SelectItem>
                <SelectItem value="Bitter">Bitter</SelectItem>
                <SelectItem value="Metallic">Metallic</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
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