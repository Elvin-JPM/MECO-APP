import { useMutation } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { getMeasures } from "../../services/getRequests";
import { formatDate } from "../../utils/dateFunctions";
import ExcelJS from "exceljs";

export default function useAllMeasuresStyling(reportData, energyTags) {
  const allMeasuresMutation = useMutation({
    mutationFn: () => getMeasures(reportData, -1),
    onSuccess: async (data) => {
      console.log("All inside the onSuccess callback: ", data?.data);

      // Create a new workbook and add a worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Measures");

      // Load an image from the public folder
      const imageBuffer = await fetch("/CND-LOGO.png").then((res) =>
        res.arrayBuffer()
      );

      // Add the image to the workbook
      const imageId = workbook.addImage({
        buffer: imageBuffer,
        extension: "png",
      });

      // Position the image in the worksheet
      worksheet.addImage(imageId, {
        tl: { col: 0, row: 0 }, // Top-left corner
        br: { col: 2, row: 3 }, // Bottom-right corner (spans first two columns and three rows)
        ext: {
          width: 120,
          height: 60,
        }, // Size of the image
      });

      // Merge cells from A1 to B3
      worksheet.mergeCells("A1:B3");
      // Merge cells from C1 to E3
      worksheet.mergeCells("C1:E1");
      worksheet.mergeCells("C2:E2");
      worksheet.mergeCells("C3:E3");

      // Define columns
      worksheet.columns = [
        { header: "FECHA", key: "fecha", width: 15 },
        { header: energyTags[0], key: "eag_mp", width: 18 },
        { header: energyTags[1], key: "eac_mp", width: 18 },
        { header: energyTags[2], key: "eag_mr", width: 18 },
        { header: energyTags[3], key: "eac_mr", width: 18 },
      ];

      // Add headers to the 4th row
      const headerRow = worksheet.getRow(4);
      worksheet.columns.forEach((column, index) => {
        headerRow.getCell(index + 1).value = column.header;
      });

      // Add rows starting from the 5th row
      data?.data.forEach((measure, rowIndex) => {
        const row = worksheet.getRow(rowIndex + 5); // Start from the 5th row
        row.getCell(1).value = formatDate(measure.fecha);
        row.getCell(2).value = measure.energia_del_mp;
        row.getCell(3).value = measure.energia_rec_mp;
        row.getCell(4).value = measure.energia_del_mr;
        row.getCell(5).value = measure.energia_rec_mr;
      });

      // Apply styles to the header row (4th row)
      headerRow.font = { bold: true, size: 12 }; // Bold header row
      headerRow.height = 25;
      headerRow.alignment = {
        vertical: "center",
        horizontal: "center",
      };
      headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        if (cell.value) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "5fd0df" },
          };
        }
      });
      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      // Ensure merged cells are empty
      worksheet.getCell("A1").value = "";
      worksheet.getCell("C1").value = "";

      worksheet.getCell("C1").value = `${reportData?.nombrePuntoMedicion}`;
      worksheet.getCell("C2").value = `Fecha inicial: ${formatDate(
        reportData?.fechaInicial
      )}`;
      worksheet.getCell("C3").value = `Fecha final: ${formatDate(
        reportData?.fechaFinal
      )}`;

      worksheet.getCell("C1").font = {
        size: 13,
        bold: true,
        color: { argb: "f29100" },
      };
      worksheet.getCell("C2").font = { size: 10 };
      worksheet.getCell("C3").font = { size: 10 };

      worksheet.getCell("C1").alignment = {
        vertical: "center",
        horizontal: "center",
      };
      worksheet.getCell("C2").alignment = {
        vertical: "center",
        horizontal: "center",
      };
      worksheet.getCell("C3").alignment = {
        vertical: "center",
        horizontal: "center",
      };

      // Generate buffer and create a downloadable link
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportData?.nombrePuntoMedicion}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });

  return { allMeasuresMutation };
}
