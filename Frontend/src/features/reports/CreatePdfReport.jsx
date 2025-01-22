import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { formatDate } from "../../utils/dateFunctions";

function CreatePdfReport({ formData, rowsToEdit, getPdfFile }) {
  const [pdfUrl, setPdfUrl] = useState(null);

  console.log("Form data received at pdf: ", formData);

  useEffect(() => {
    const getFormattedDate = () => {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, "0"); // Ensures 2 digits
      const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based
      const year = today.getFullYear();

      return `${day}-${month}-${year}`;
    };

    const formattedDate = getFormattedDate();

    const generatePdf = async () => {
      const doc = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      });
      const pageWidth = doc.internal.pageSize.width;
      const maxWidth = 140;

      // Rectangle dimensions
      const rectHeight = 4;
      const rectWidth = pageWidth / 3;

      // Draw three rectangles with specified colors
      doc.setFillColor(95, 208, 223); // #5fd0df
      doc.rect(0, 0, rectWidth, rectHeight, "F");
      doc.setFillColor(242, 145, 0); // #f29100
      doc.rect(rectWidth, 0, rectWidth, rectHeight, "F");
      doc.setFillColor(226, 6, 19); // #e20613
      doc.rect(rectWidth * 2, 0, rectWidth, rectHeight, "F");

      // Add an image from the public folder
      const imgUrl = `${window.location.origin}/logo-CND-horizontal.png`; // Adjust your image name
      const imgData = await fetch(imgUrl).then((res) => res.blob());
      const reader = new FileReader();
      reader.readAsDataURL(imgData);
      reader.onloadend = () => {
        const base64data = reader.result;
        doc.addImage(base64data, "PNG", 2, 7, 35, 6);

        // Nombres de las lineas
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

        // Valores a usar en las lineas
        const linesValues = [
          formData.resumenProblema,
          formData.razonProblema,
          formData.consecuencia,
          "Josué Natanael García Ortiz",
          "3.3.2 Sustitución;  El ODS solamente modificará toda o parte de las lecturas de mediciones comerciales (con propósitos de liquidaciones) ante datos faltantes o cuando la validación basada en calificadores indique que toda o parte de una medición es inválida.",
          formData.medicionesAfectadas,
          formData.medicionesDisponibles,
          formData.procedimiento,
          formData.diasTipo,
          formatDate(formData.fechaInicial) +
            " - " +
            formatDate(formData.fechaFinal),
        ];

        // Add text below
        doc.setFont("times");
        doc.setFontSize(10);
        doc.text("Validación, Cálculo y Sustitución de mediciones", 132, 12);
        doc.setFontSize(14);
        doc.setFont("times", "bold");
        doc.text("Validación, Cálculo y Sustitución de mediciones", 2, 25);

        doc.setFont("times", "normal");
        doc.setFontSize(10);
        doc.text(
          `Dirección:   Tecnoglogías de la Información y Telecomunicaciones`,
          2,
          35
        );
        doc.text(`Departamento:  Medición Comercial`, 2, 40);
        doc.text(`Fecha: ${formattedDate}`, 2, 45);
        doc.text(`${formData.agente}`, 65, 55); // Nombre del agente
        doc.text(`${formData.nombreCentral}`, 65, 63); // Nombre de la central
        doc.text(`${formData.codigoPunto}`, 173, 55); // Codigo del punto
        doc.text(`${formData.designacion}`, 165, 63); // Codigo del punto
        // // Resumen del problema reportado

        // // Textos en Negrita
        doc.setFont("times", "bold");
        doc.setFontSize(11);
        doc.text("Agente:", 2, 55);
        doc.text(`Código del punto:`, 142, 55);
        doc.text("Nombre de la central:", 2, 63);
        doc.text("Designación:", 142, 63);

        let y = 73;

        linesValues.forEach((line, index) => {
          const textLines = doc.splitTextToSize(line, maxWidth);
          const textHeight = textLines.length * 4; // assuming 10 is the line height

          doc.setFont("times", "bold");
          doc.text(linesNames[index], 2, y);
          doc.setFont("times", "normal");
          doc.text(textLines, 65, y);

          y += textHeight + 5;
        });

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

        let data = [];
        for (const row of rowsToEdit) {
          data.push([
            row.fecha,
            row.energia_del_mp,
            row.energia_rec_mp,
            row.energia_del_mr,
            row.energia_rec_mr,
            row.energia_del_mp_new,
            row.energia_rec_mp_new,
            row.energia_del_mr_new,
            row.energia_rec_mr_new,
          ]);
        }

        console.log("Data for the subs table: ", data);

        y += 3;
        doc.setFontSize(9);
        doc.setFont("times", "bold");
        doc.setFillColor(95, 208, 223);
        doc.rect(41, y - 4, rectWidth + 6.3, 4, "F");
        doc.rect(41 + rectWidth + 6.7, y - 4, rectWidth + 8.3, 4, "F");
        doc.text("VALORES ORIGINALES", 61, y - 1);
        doc.text("VALORES SUSTITUCIÓN", 138, y - 1);
        // Create the table

        doc.setFontSize(8);
        doc.autoTable({
          head: headers,
          body: data,
          startY: y, // Position the table below the title
          theme: "grid",
          styles: {
            fontSize: 8,
            halign: "center", // Center align text in cells
            valign: "middle",
          },
          headStyles: {
            fillColor: [241, 245, 249], // Header background color as RGB array
            textColor: 0, // Header text color (black)
            fontStyle: "normal",
          },
          alternateRowStyles: {
            fillColor: [240, 240, 240], // Alternate row background color as RGB array
          },
          didParseCell: (cellData) => {
            const { row, column, cell, section } = cellData;

            // Apply styles only to the body section (exclude header)
            if (section === "body") {
              const redTextColumns = [1, 2, 3, 4]; // 0-based column indices for red text
              if (redTextColumns.includes(column.index)) {
                cell.styles.textColor = [255, 0, 0]; // Set text color to red
              }
            }
          },
        });

        const pdfBlob = doc.output("blob");
        console.log("pdf file at create pdfReport: ", pdfBlob);
        getPdfFile(pdfBlob);
        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);
      };
    };

    generatePdf();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.pdfWrapper}>
        {pdfUrl ? (
          <embed
            type="application/pdf"
            src={pdfUrl}
            title="PDF Viewer"
            style={styles.pdf}
          />
        ) : (
          <p>Loading PDF...</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    marginTop: "50px",
  },
  pdfWrapper: {
    marginTop: "20px",
    display: "inline-block",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    overflow: "hidden",
    animation: "fadeIn 0.5s ease-in-out",
    backgroundColor: "#ffffff", // Set a light background color
  },
  pdf: {
    width: "60vw",
    height: "800px",
    border: "none",
  },
};

// CSS for transitions
const globalStyles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

// Inject global styles
const styleTag = document.createElement("style");
styleTag.innerHTML = globalStyles;
document.head.appendChild(styleTag);

export default CreatePdfReport;
