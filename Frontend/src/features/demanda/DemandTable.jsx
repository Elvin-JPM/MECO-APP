import React, { useEffect } from "react";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import Spinner from "../../ui/Spinner";
import {
  getHourlyDemand,
  getNodesNames,
  getHourlyGeneration,
} from "../../services/getRequests";
import DemandRow from "./DemandRow";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import AreaChartDashboard from "../dashboard/AreaChartDashboard";

const TableContainer = styled.div`
  border: 1px solid var(--color-grey-200);
  font-size: 1.4rem;
  background-color: var(--color-grey-0);
  border-radius: 7px;
  overflow: auto;
  max-height: 80vh;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  position: sticky;
  top: 0;
  z-index: 2;
  background-color: var(--color-grey-50);
`;

const HeaderRow = styled.tr`
  display: grid;
  grid-template-columns: 130px 80px repeat(77, minmax(100px, 1fr));
`;

const HeaderCell = styled.th`
  padding: 1.5rem 2.4rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-weight: 700;
  color: var(--color-grey-600);
  font-size: 1.3rem;
  white-space: nowrap;
  border-bottom: 1px solid var(--color-grey-200);

  &:nth-child(1) {
    position: sticky;
    left: 0;
    z-index: 3;
    background-color: var(--color-grey-50);
  }

  &:nth-child(2) {
    position: sticky;
    left: 130px;
    z-index: 3;
    background-color: var(--color-grey-50);
    border-right: 1px solid var(--color-grey-100);
  }
`;

const TableBody = styled.tbody`
  display: block;
`;

function DemandTable({ fecha, isDownloadReport }) {
  console.log("fecha recibida: ", fecha);

  const { isLoading: isLoadingDemand, data: demand } = useQuery({
    queryKey: ["demand", fecha],
    queryFn: () => getHourlyDemand(fecha),
    keepPreviousData: true,
    enabled: !!fecha,
  });

  const { isLoading: isLoadingGeneration, data: generation } = useQuery({
    queryKey: ["generation", fecha],
    queryFn: () => getHourlyGeneration(fecha),
    keepPreviousData: true,
    enabled: !!fecha,
  });

  const result = [];

  if (isLoadingDemand) {
    console.log("Cargando demanda...");
  } else {
    for (const innerArray of demand) {
      let sum = 0;
      for (let i = 2; i < innerArray.length; i++) {
        sum += innerArray[i];
      }
      result.push({ fecha: innerArray[0], dato_energia: sum });
    }

    console.log("Demanda horaria: ", result); // Output: [12, 70, 4]
  }

  let generationArray = [];
  if (isLoadingGeneration) {
    console.log("Cargando generación...");
  } else if (generation?.data) {
    // Assuming generation.data is an array of arrays where each inner array has the format [hour, generationValue]
    generationArray = generation.data.map((hourGeneration) => ({
      fecha: hourGeneration[0],
      dato_energia: hourGeneration[1],
    }));
    console.log("Generación:", generationArray); // Output: [12, 70, 4]
  }

  const { isLoading: isLoadingNodes, data: nodes } = useQuery({
    queryKey: ["nodes"],
    queryFn: () => getNodesNames(),
    keepPreviousData: true,
  });

  useEffect(() => {
    if (isDownloadReport && demand && nodes) {
      exportToExcel({ fecha, demand, nodes });
    }
  }, [isDownloadReport, demand, nodes, fecha]);

  if (isLoadingNodes || isLoadingDemand) return <Spinner />;

  const exportToExcel = async ({ fecha, demand, nodes }) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Demanda Activa Nodal");

    // Header Row
    const headerRow = ["FECHA", "HORA", ...nodes.map((node) => node[1])];
    worksheet.addRow(headerRow);

    // Data Rows
    demand?.forEach((demand_hour) => {
      const row = [
        demand_hour[0],
        demand_hour[1],
        ...nodes.map((node, index) => demand_hour[index + 2] || 0),
      ];
      worksheet.addRow(row);
    });

    // Styling Header Row
    worksheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF29100" },
      };
      cell.border = {
        bottom: { style: "thick", color: { argb: "FF000000" } },
      };
      cell.alignment = { horizontal: "center" }; // Center headers
    });

    worksheet.getRow(1).font = { bold: true };

    // Styling Data Rows (Left Justify)
    for (let i = 2; i <= demand.length + 1; i++) {
      // Start from row 2 (data rows)
      worksheet.getRow(i).eachCell((cell) => {
        cell.alignment = { horizontal: "left" }; // Left justify data
      });
    }

    worksheet.columns.forEach((column) => {
      column.width = 15;
    });

    // Date and time styling
    worksheet.getColumn("A").numFmt = "dd-mmm-yyyy hh:mm";
    worksheet.getColumn("B").alignment = { horizontal: "center" };

    // Filename
    const dateParts = fecha.split("-");
    const day = dateParts[2].padStart(2, "0");
    const month = dateParts[1].padStart(2, "0");
    const year = dateParts[0];
    const filename = `${day}_${month}_${year}_demanda.xlsx`;

    // Download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <AreaChartDashboard
        title="Generación Horaria vs Demanda Horaria"
        profMP={generationArray}
        profMR={result}
        tipoGrafico="demanda"
        // xAxisLabel="Hora"
        // yAxisLabel="Generación (kW)"
      />
      <TableContainer>
        <Table>
          <TableHeader>
            <HeaderRow>
              <HeaderCell>FECHA</HeaderCell>
              <HeaderCell>HORA</HeaderCell>
              {nodes?.map((node) => (
                <HeaderCell key={node[0]}>{node[1]}</HeaderCell>
              ))}
            </HeaderRow>
          </TableHeader>
          <TableBody>
            {demand?.map((demand_hour, index) => (
              <DemandRow demand_hour={demand_hour} key={index} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default DemandTable;
