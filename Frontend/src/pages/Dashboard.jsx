import { useState } from "react";
import DashboardForm from "../features/dashboard/DashboardForm";
import DashboardRegistros from "../features/dashboard/DashboardRegistros";
import DashboardEnergia from "../features/dashboard/DashboardEnergia";
import AreaChartDashboard from "../features/dashboard/AreaChartDashboard";
function Dashboard() {
  const [dashboardInfo, setDashboardInfo] = useState(null);
  const handleDashboardInfo = (info) => {
    setDashboardInfo(info);
  };
  console.log("Dashboard info: ", dashboardInfo);
  return (
    <div>
      <DashboardForm handleDashboardInfo={handleDashboardInfo} />
      {dashboardInfo && (
        <DashboardRegistros
          countMP={dashboardInfo.data.countMP}
          countMR={dashboardInfo.data.countMR}
        />
      )}
      {dashboardInfo && (
        <DashboardEnergia
          powerMP={dashboardInfo.data.totPowerMP}
          powerMR={dashboardInfo.data.totPowerMR}
        />
      )}
      {dashboardInfo && (
        <AreaChartDashboard
          title="Comparacion kwh del medidor principal vs medidor de respaldo"
          profMP={dashboardInfo.data.profMP.filter(
            (row) => row.tipo_energia === "KWH_DEL_INT"
          )}
          profMR={dashboardInfo.data.profMR.filter(
            (row) => row.tipo_energia === "KWH_DEL_INT"
          )}
        />
      )}
      {dashboardInfo && (
        <AreaChartDashboard
          title="Comparacion kwh rec medidor principal vs medidor de respaldo"
          profMP={dashboardInfo.data.profMP.filter(
            (row) => row.tipo_energia === "KWH_REC_INT"
          )}
          profMR={dashboardInfo.data.profMR.filter(
            (row) => row.tipo_energia === "KWH_REC_INT"
          )}
        />
      )}
    </div>
  );
}

export default Dashboard;
