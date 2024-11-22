import styled from "styled-components";
import { getData } from "../../services/api";
import { useQuery } from "@tanstack/react-query";
import Spinner from "../../ui/Spinner";
import MeterRow from "./MeterRow";
import Button from "../../ui/Button";
import { FaDownload } from "react-icons/fa6";
import * as XLSX from "xlsx";
import { getMeters } from "../../services/getRequests";

const Table = styled.div`
  border: 1px solid var(--color-grey-200);
  font-size: 1.4rem;
  background-color: var(--color-grey-0);
  border-radius: 7px;
  overflow: hidden;
`;

const TableHeader = styled.header`
  display: grid;
  grid-template-columns: 0.2fr 1fr 1fr 1fr 1fr 1fr 0.2fr;
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

function MetersTable() {
  const {
    isLoading,
    data: meters,
    // error,
  } = useQuery({
    queryKey: ["meters"],
    queryFn: getMeters,
  });

  if (isLoading) return <Spinner />;
  console.log(meters);

  // Function to export the meters data to Excel
  const exportToExcel = () => {
    // Create a worksheet from the data
    const worksheet = XLSX.utils.json_to_sheet(
      meters.map((meter) => ({
        Plant: meter.nombre_planta,
        IP: meter.ip,
        Code: meter.id_punto,
        Substation: meter.subestacion,
        Series: meter.serie,
      }))
    );

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Meters");

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, "Meters.xlsx");
  };

  return (
    <Table role="table">
      <TableHeader role="row">
        <div></div>
        <div>PLANTA/SUBESTACION</div>
        <div>IP</div>
        <div>CODIGO DEL PUNTO</div>
        <div>SUBESTACION</div>
        <div>SERIE</div>
        <Button onClick={exportToExcel}>
          <FaDownload />
        </Button>
      </TableHeader>
      {meters.map((meter) => (
        <MeterRow meter={meter} key={meter.id}></MeterRow>
      ))}
    </Table>
  );
}

export default MetersTable;
