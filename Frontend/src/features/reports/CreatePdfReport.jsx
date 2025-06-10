import { useEffect, useState, useRef } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDate } from "../../utils/dateFunctions";
import { useUser } from "../authentication/UserProvider";

function CreatePdfReport({ formData, rowsToEdit }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const { userData } = useUser();
  const pdfGenerated = useRef(false);

  console.log("Rows to edit on CreatePdfReport:", rowsToEdit);

  const approvedReport = formData?.aprobado === 1 ? true : false;
  // Ordena las filas que vienen del formulario por fecha
  const sortedRows = [...rowsToEdit].sort((a, b) => {
    const parseDate = (dateString) => {
      const [datePart, timePart] = dateString.split(" ");
      const [day, month, year] = datePart.split("-").map(Number);
      const [hours, minutes] = timePart.split(":").map(Number);
      return new Date(year, month - 1, day, hours, minutes);
    };
    return parseDate(a.fecha) - parseDate(b.fecha);
  });

  useEffect(() => {
    if (pdfGenerated.current) return;
    pdfGenerated.current = true;

    // Genera el PDF una vez que se tienen los datos del formulario y las filas a editar
    const generatePdf = async () => {
      try {
        // Inicializa un nuevo documento PDF
        const doc = new jsPDF({
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        });

        const pageWidth = doc.internal.pageSize.width;
        const maxWidth = 140;
        const today = new Date();
        const formattedDate = `${String(today.getDate()).padStart(
          2,
          "0"
        )}-${String(today.getMonth() + 1).padStart(
          2,
          "0"
        )}-${today.getFullYear()}`;

        // Configura los tres rectángulos de colores en la parte superior
        doc.setFillColor(95, 208, 223);
        doc.rect(0, 0, pageWidth / 3, 4, "F");
        doc.setFillColor(242, 145, 0);
        doc.rect(pageWidth / 3, 0, pageWidth / 3, 4, "F");
        doc.setFillColor(226, 6, 19);
        doc.rect((pageWidth / 3) * 2, 0, pageWidth / 3, 4, "F");

        // Agrega el logo y los textos de encabezado
        try {
          const imgUrl = `${window.location.origin}/logo-CND-horizontal.png`;
          const imgData = await fetch(imgUrl).then((res) => res.blob());
          const base64data = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(imgData);
          });
          doc.addImage(base64data, "PNG", 2, 7, 35, 6);
        } catch (error) {
          console.warn("Could not load logo:", error);
        }

        doc.setFont("times");
        doc.setFontSize(10);
        doc.text("Validación, Cálculo y Sustitución de mediciones", 132, 12);
        doc.setFontSize(14);
        doc.setFont("times", "bold");
        doc.text("Validación, Cálculo y Sustitución de mediciones", 2, 25);

        doc.setFont("times", "normal");
        doc.setFontSize(10);
        doc.text(
          "Dirección:   Tecnoglogías de la Información y Telecomunicaciones",
          2,
          35
        );
        doc.text("Departamento:  Medición Comercial", 2, 40);
        doc.text(
          `Fecha: ${
            formData?.fechaCreacion
              ? formatDate(formData?.fechaCreacion)
              : formattedDate
          }`,
          2,
          45
        );

        doc.text(`${formData.agente}`, 65, 55);
        doc.text(`${formData.nombreCentral}`, 65, 71);
        doc.text(`${formData.codigoPunto}`, 65, 63);
        doc.text(`${formData.designacion}`, 165, 71);

        doc.setFont("times", "bold");
        doc.setFontSize(11);

        doc.text("Agente:", 2, 55);
        doc.text("Nombre de la central:", 2, 71);
        doc.text("Código del punto:", 2, 63);
        doc.text("Designación:", 142, 71);

        const linesNames = [
          "Resumen del problema reportado:",
          "Razon del problema:",
          "Consecuencia:",
          "Elaborado por:",
          "Basamento en NT-MC:",
          "Tipo de mediciones afectadas:",
          "Tipo de mediciones disponibles:",
          "Procedimiento a utilizar:",
          "Dias tipo utilizados para el calculo:",
          "Rango de datos sutituidos:",
        ];

        const linesValues = [
          formData.resumenProblema,
          formData.razonProblema,
          formData.consecuencia,
          formData.validadoPor || userData.fullName,
          "3.3.2 Sustitución;  El ODS solamente modificará toda o parte de las lecturas de mediciones comerciales (con propósitos de liquidaciones) ante datos faltantes o cuando la validación basada en calificadores indique que toda o parte de una medición es inválida.",
          formData.medicionesAfectadas,
          formData.medicionesDisponibles,
          formData.procedimiento,
          formData.diasTipo,
          formatDate(formData.fechaInicial) +
            " - " +
            formatDate(formData.fechaFinal),
        ];

        let y = 81;
        linesValues.forEach((line, index) => {
          const textLines = doc.splitTextToSize(line, maxWidth);
          const textHeight = textLines.length * 4;

          doc.setFont("times", "bold");
          doc.text(linesNames[index], 2, y);
          doc.setFont("times", "normal");
          doc.text(textLines, 65, y);

          y += textHeight + 5;
        });

        const formatEnergia = (value) =>
          value ? parseFloat(value).toFixed(4) : "0.0000";

        const tableData = sortedRows.map((row) => [
          row.fecha,
          formatEnergia(row.energia_del_mp),
          formatEnergia(row.energia_rec_mp),
          formatEnergia(row.energia_del_mr),
          formatEnergia(row.energia_rec_mr),
          formatEnergia(row.energia_del_mp_new),
          formatEnergia(row.energia_rec_mp_new),
          formatEnergia(row.energia_del_mr_new),
          formatEnergia(row.energia_rec_mr_new),
        ]);

        y += 3;
        doc.setFontSize(9);
        doc.setFont("times", "bold");
        doc.setFillColor(95, 208, 223);
        const originalesWidth = doc.getTextWidth("VALORES ORIGINALES") + 30;
        doc.rect(45, y - 4, originalesWidth - 0.5, 4, "F");
        doc.text("VALORES ORIGINALES", 61, y - 1);

        doc.setFillColor(95, 208, 223);
        const sustitucionWidth = doc.getTextWidth("VALORES SUSTITUCIÓN") + 20;
        doc.rect(
          65 + originalesWidth,
          y - 4,
          sustitucionWidth + 1.2,
          4,
          "F"
        );
        doc.text("VALORES SUSTITUCIÓN", 60 + originalesWidth + 16, y - 1);

        const headers = [
          [
            { content: "FECHA", rowSpan: 2 },
            { content: "MEDIDOR PRINCIPAL", colSpan: 2 },
            { content: "MEDIDOR RESPALDO", colSpan: 2 },
            { content: "MEDIDOR PRINCIPAL", colSpan: 2 },
            { content: "MEDIDOR RESPALDO", colSpan: 2 },
          ],
          [
            { content: "kWh del int" },
            { content: "kWh rec int" },
            { content: "kWh del int" },
            { content: "kWh rec int" },
            { content: "kWh del int" },
            { content: "kWh rec int" },
            { content: "kWh del int" },
            { content: "kWh rec int" },
          ],
        ];

        // Changed to use autoTable as a function
        autoTable(doc, {
          head: headers,
          body: tableData,
          startY: y,
          theme: "grid",
          styles: {
            fontSize: 7,
            halign: "center",
            valign: "middle",
            cellPadding: 2,
            lineWidth: 0.2,
            lineColor: [0, 0, 0],
            textColor: [0, 0, 0],
          },
          headStyles: {
            fillColor: [241, 245, 249],
            textColor: 0,
            fontStyle: "normal",
            cellPadding: 2,
            lineWidth: 0.2,
          },
          bodyStyles: {
            minCellHeight: 5,
            cellPadding: 2,
            lineWidth: 0.2,
          },
          alternateRowStyles: {
            fillColor: [254, 254, 254],
          },
          didParseCell: (data) => {
            if (data.section === "body") {
              data.cell.styles.visibility = "visible";

              const redColumns = [1, 2, 3, 4];
              if (redColumns.includes(data.column.index)) {
                const row = sortedRows[data.row.index];
                const original = parseFloat(
                  String(
                    row[
                      `energia_${
                        data.column.index === 1
                          ? "del_mp"
                          : data.column.index === 2
                          ? "rec_mp"
                          : data.column.index === 3
                          ? "del_mr"
                          : "rec_mr"
                      }`
                    ] || "0"
                  ).replace(/,/g, "")
                );
                const updated = parseFloat(
                  String(
                    row[
                      `energia_${
                        data.column.index === 1
                          ? "del_mp_new"
                          : data.column.index === 2
                          ? "rec_mp_new"
                          : data.column.index === 3
                          ? "del_mr_new"
                          : "rec_mr_new"
                      }`
                    ] || "0"
                  ).replace(/,/g, "")
                );

                if (original !== updated || updated == 0 && !row.or_del_mp) {
                  data.cell.styles.fillColor = [255, 240, 240]; // Light red background
                  data.cell.styles.textColor = [255, 0, 0];
                }
              }
            }
          },
          willDrawCell: (data) => {
            if (
              data.row.index === 0 ||
              data.row.index === sortedRows.length - 1
            ) {
              data.cell.styles.fillColor = [255, 255, 255];
            }
            return true;
          },
        });

        const finalY = doc.lastAutoTable.finalY + 35;
        if (finalY + 15 > doc.internal.pageSize.height) {
          doc.addPage();
          // For new page case
          if (approvedReport) {
            try {
              const imgUrl = `${window.location.origin}/Firma_Jefe_Medicion.png`;
              const imgData = await fetch(imgUrl).then((res) => res.blob());
              const base64data = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(imgData);
              });
              // Add image (20mm width, auto height, positioned above line)
              doc.addImage(base64data, "PNG", 78, 13, 55, 30); // x, y, width, height
            } catch (error) {
              console.warn("Could not load approval stamp:", error);
            }
          }

          doc.line(70, 40, 140, 40);
          doc.setFont("times", "bold");
          doc.text("Ing. Cristobal Padilla", 105, 46, { align: "center" });
          doc.setFont("times", "normal");
          doc.text("Jefe de Medición Comercial", 105, 52, { align: "center" });
        } else {
          // For same page case
          doc.setDrawColor(0);
          if (approvedReport) {
            try {
              const imgUrl = `${window.location.origin}/Firma_Jefe_Medicion.png`;
              const imgData = await fetch(imgUrl).then((res) => res.blob());
              const base64data = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(imgData);
              });
              // Add image (20mm width, centered above line)
              doc.addImage(base64data, "PNG", 78, finalY - 27, 55, 30); // x, y, width, height
            } catch (error) {
              console.warn("Could not load approval stamp:", error);
            }
          }
          doc.line(70, finalY, 140, finalY);
          doc.setFont("times", "bold");
          doc.text("Ing. Cristobal Padilla", 105, finalY + 6, {
            align: "center",
          });
          doc.setFont("times", "normal");
          doc.text("Jefe de Medición Comercial", 105, finalY + 12, {
            align: "center",
          });
        }

        const pdfBlob = doc.output("blob");
        // getPdfFile(pdfBlob);
        setPdfUrl(URL.createObjectURL(pdfBlob));
      } catch (error) {
        console.error("PDF generation failed:", error);
      }
    };

    generatePdf();

    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [formData, rowsToEdit, userData]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <div
        style={{
          marginTop: "20px",
          display: "inline-block",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          overflow: "hidden",
          animation: "fadeIn 0.5s ease-in-out",
          backgroundColor: "#ffffff",
        }}
      >
        {pdfUrl ? (
          <embed
            type="application/pdf"
            src={pdfUrl}
            title="PDF Viewer"
            style={{ width: "60vw", height: "800px", border: "none" }}
          />
        ) : (
          <p>Loading PDF...</p>
        )}
      </div>
    </div>
  );
}

export default CreatePdfReport;
