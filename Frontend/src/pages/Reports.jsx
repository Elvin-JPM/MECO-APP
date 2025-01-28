import { useState } from "react";
import GenerateReportForm from "../features/reports/GenerateReportForm";
import ReportTable from "../features/reports/ReportTable";

function Reports() {
  const [showReportTable, setShowReportTable] = useState(false);
  const [reportData, setReportData] = useState({});
  const [tipoMedicion, setTipoMedicion] = useState("energiaActivaIntervalo");
  const [reportPageNumber, setReportPageNumber] = useState(1);
  const [energyTags, setEnergyTags] = useState([
    "KWH DEL MP",
    "KWH REC MP",
    "KWH DEL MR",
    "KWH REC MR",
  ]);

  const handleEnergyTags = (tipoMedicion) => {
    setTipoMedicion(tipoMedicion);
    if (tipoMedicion === "energiaActivaIntervalo") {
      setEnergyTags([
        "KWH DEL MP INT",
        "KWH REC MP INT",
        "KWH DEL MR INT",
        "KWH REC MR INT",
      ]);
    } else if (tipoMedicion === "energiaActivaAcumulada") {
      setEnergyTags(["KWH DEL MP", "KWH REC MP", "KWH DEL MR", "KWH REC MR"]);
    } else if (tipoMedicion === "energiaReactivaIntervalo") {
      setEnergyTags([
        "KVARH DEL MP INT",
        "KVARH REC MP INT",
        "KVARH DEL MR INT",
        "KVARH REC MR INT",
      ]);
    } else {
      setEnergyTags([
        "KVARH DEL MP",
        "KVARH REC MP",
        "KVARH DEL MR",
        "KVARH REC MR",
      ]);
    }
  };

  const handleShowReportTable = () => {
    setShowReportTable(true);
  };

  const handleReportData = (data) => {
    setReportData(data);
  };

  const handlePageReset = () => {
    setReportPageNumber(1);
    setShowReportTable(false);
  };

  return (
    <div>
      <h2>INFORMES</h2>
      <GenerateReportForm
        handleShowReportTable={handleShowReportTable}
        handleReportData={handleReportData}
        handleEnergyTags={handleEnergyTags}
        handlePageReset={handlePageReset}
      />
      {showReportTable && (
        <ReportTable
          reportData={reportData}
          energyTags={energyTags}
          tipoMedicion={tipoMedicion}
          //reportPageNumber={reportPageNumber}
        />
      )}
    </div>
  );
}

export default Reports;
