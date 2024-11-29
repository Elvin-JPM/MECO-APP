import { useState } from "react";
import GenerateReportForm from "../features/reports/GenerateReportForm";
import ReportTable from "../features/reports/ReportTable";

function Reports() {
  const [showReportTable, setShowReportTable] = useState(false);
  const [reportData, setReportData] = useState({});
  const handleShowReportTable = () => {
    setShowReportTable(true);
  };

  const handleReportData = (data) => {
    setReportData(data);
  };

  return (
    <div>
      <h2>Informes</h2>
      <GenerateReportForm
        handleShowReportTable={handleShowReportTable}
        handleReportData={handleReportData}
      />
      {showReportTable && <ReportTable reportData={reportData} />}
    </div>
  );
}

export default Reports;
