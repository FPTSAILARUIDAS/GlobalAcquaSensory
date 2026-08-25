import InteractiveSummaryReport from "@/components/InteractiveSummaryReport";

const PROFICIENCY_TEST_CONFIG = {
  testType: "SPPS Test",
  testTypeFilter: "proficiency",
  reportTitle: "SPPS Test Summary Report",
  routePrefix: "proficiency-test-summary",
  storageKeyPrefix: "proficiency",
  themeColor: "#16a34a",
  themeColorDark: "#15803d",
  themeColorLight: "#86efac",
  themeBorderClass: "border-green-600",
  themeGradientFrom: "#f0fdf4",
  themeGradientTo: "#ecfdf5",
};

const ProficiencyTestDailySummary = () => (
  <InteractiveSummaryReport config={PROFICIENCY_TEST_CONFIG} />
);

export default ProficiencyTestDailySummary;
