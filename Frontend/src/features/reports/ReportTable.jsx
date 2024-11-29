import styled from "styled-components";
import { getData } from "../../services/api";
import { useQuery } from "@tanstack/react-query";
import Spinner from "../../ui/Spinner";
import Button from "../../ui/Button";
import { FaDownload } from "react-icons/fa6";
import * as XLSX from "xlsx";
import {
  getIntegratedMeters,
  getMeasures,
  getMeters,
} from "../../services/getRequests";
//import AddMeter from "./AddMeter";
import ButtonArray from "../../ui/ButtonArray";
import MeterRow from "../meters/MeterRow";
import MeasureRow from "./MeasureRow";

const Table = styled.div`
  border: 1px solid var(--color-grey-200);
  font-size: 1.4rem;
  background-color: var(--color-grey-0);
  border-radius: 7px;
  overflow: hidden;
`;

const TableHeader = styled.header`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 0.3fr;
  column-gap: 2.4rem;
  align-items: center;

  background-color: var(--color-grey-50);
  border-bottom: 1px solid var(--color-grey-100);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-weight: 600;
  color: var(--color-grey-600);
  padding: 1.6rem 2.4rem;
`;

function ReportTable({ reportData }) {
  console.log("report data:", reportData);
  const {
    isLoading: isLoadingMeasures,
    data: measures,
    // error,
  } = useQuery({
    queryKey: ["measures", reportData],
    queryFn: () => getMeasures(reportData),
  });

  console.log(measures);

  if (isLoadingMeasures) return <Spinner />;
  // Function to export the meters data to Excel
  const exportToExcel = () => {
    // Create a worksheet from the data
    const worksheet = XLSX.utils.json_to_sheet(
      measures?.map((measure) => ({
        Fecha: measure.fecha,
        EAG_MP: measure.EAG_MP,
        EAC_MP: measure.EAC_MP,
        EAG_MR: measure.EAG_MR,
        EAC_MR: measure.EAC_MR,
      }))
    );

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Measures");

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, "Measures.xlsx");
  };

  return (
    <Table role="table">
      <TableHeader role="row">
        <div>FECHA</div>
        <div>KWH GENERADOS MP</div>
        <div>KWH RECIBIDOS MP</div>
        <div>KWH GENERADOS MR</div>
        <div>KWH RECIBIDOS MR</div>
        <ButtonArray>
          <Button onClick={exportToExcel} tooltip="Descargar perfil">
            <FaDownload />
          </Button>
        </ButtonArray>
      </TableHeader>
      {measures?.map((measure) => (
        <MeasureRow
          measure={measure}
          key={measures.indexOf(measure)}
        ></MeasureRow>
      ))}
    </Table>
  );
}

export default ReportTable;
