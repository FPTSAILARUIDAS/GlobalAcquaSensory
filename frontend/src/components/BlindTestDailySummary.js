import InteractiveSummaryReport from "@/components/InteractiveSummaryReport";

const BLIND_TEST_CONFIG = {
  testType: "Blind Test",
  testTypeFilter: "blind",
  reportTitle: "Sensory Blind Test Summary Report",
  routePrefix: "blind-test-summary",
  storageKeyPrefix: "blind",
  themeColor: "#9333ea",
  themeColorDark: "#7e22ce",
  themeColorLight: "#d8b4fe",
  themeBorderClass: "border-purple-600",
  themeGradientFrom: "#faf5ff",
  themeGradientTo: "#eef2ff",
};

const BlindTestDailySummary = () => (
  <InteractiveSummaryReport config={BLIND_TEST_CONFIG} />
);

export default BlindTestDailySummary;
