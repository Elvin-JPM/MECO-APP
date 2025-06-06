import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import Input from "../../ui/Input";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Button from "../../ui/Button";
import { useQuery } from "@tanstack/react-query";
import { getAgente } from "../../services/getRequests";
import Textarea from "../../ui/Textarea";
import Spinner from "../../ui/Spinner";
import CreatePdfReport from "./CreatePdfReport";
import useCreateSubstitutionReport from "./useCreateSubstitutionReport";
import { useUser } from "../../features/authentication/UserProvider";
import { newReportName } from "../../utils/dateFunctions";
import useEditSubstitution from "./useEditSubstitution";


function EditSubstitutionForm({ retrievedPdfData, handleShowModal }) {
  const { userData } = useUser();
  const [formData, setFormData] = useState(null);
  const [showPdfReport, setShowPdfReport] = useState(false);
  const { register, handleSubmit, formState, setValue } = useForm();
  const { errors } = formState;
  const { isEditing, editSubstitutionReport } = useEditSubstitution();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // function getPdfFile(pdfReport) {
  //   setPdfFile(pdfReport);
  // }

  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  function formatForDatetimeLocal(inputDateString) {
    const date = new Date(inputDateString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
  }

  useEffect(() => {
    if (retrievedPdfData) {
      setValue("agente", retrievedPdfData.agente || "");
      setValue("codigoPunto", retrievedPdfData.codigoPunto || "");
      setValue("nombreCentral", retrievedPdfData.nombreCentral || "N.A");
      setValue("designacion", retrievedPdfData.designacion || "");
      setValue("resumenProblema", retrievedPdfData.resumenProblema || "");
      setValue("razonProblema", retrievedPdfData.razonProblema || "");
      setValue("consecuencia", retrievedPdfData.consecuencia || "");
      setValue(
        "medicionesAfectadas",
        retrievedPdfData.medicionesAfectadas || ""
      );
      setValue(
        "medicionesDisponibles",
        retrievedPdfData.medicionesDisponibles || ""
      );
      setValue("diasTipo", retrievedPdfData.diasTipo || "");
      setValue("procedimiento", retrievedPdfData.procedimiento || "");
      setValue(
        "fechaInicial",
        retrievedPdfData.fechaInicial
          ? formatForDatetimeLocal(retrievedPdfData.fechaInicial)
          : formatDateForInput(yesterday)
      );

      setValue(
        "fechaFinal",
        retrievedPdfData.fechaFinal
          ? formatForDatetimeLocal(retrievedPdfData.fechaFinal)
          : formatDateForInput(today)
      );
    }
  }, [retrievedPdfData, setValue]);

  function onSubmit(data) {
    console.log(data);
    setFormData(data);
    setShowPdfReport((c) => !c);
  }

  function saveReportData(nombreReporte) {
    const formDataBackend = new FormData();
    // formDataBackend.append("file", pdfFile, "generated.pdf");
    Object.entries(formData).forEach(([key, value]) => {
      formDataBackend.append(key, value); // Add form data
    });

    formDataBackend.append("validadoPor", userData.username);
    // Adjuntar el nombre del reporte
    formDataBackend.append("nombreReporte", nombreReporte);
    formDataBackend.append(
      "rowsToEdit",
      JSON.stringify(retrievedPdfData.filas_editadas || [])
    );

    console.log("saveReportData: ");
    // Log all entries in the FormData
    for (let [key, value] of formDataBackend.entries()) {
      console.log(`${key}:`, value);
    }

    editSubstitutionReport(formDataBackend);
  }

  //   if (isLoadingAgente) return <Spinner />;
  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormRow label="Agente" error={errors?.agente?.message}>
          <Input
            type="text"
            id="agente"
            {...register("agente", { required: "Este campo es obligatorio" })}
            defaultValue=""
          />
        </FormRow>
        <FormRow label="Código del punto" error={errors?.codigoPunto?.message}>
          <Input
            type="text"
            id="codigoPunto"
            {...register("codigoPunto", {
              required: "Este campo es obligatorio",
            })}
            defaultValue=""
          />
        </FormRow>
        <FormRow
          label="Nombre de la central"
          error={errors?.nombreCentral?.message}
        >
          <Input
            type="text"
            id="nombreCentral"
            {...register("nombreCentral", {
              required: "Este campo es obligatorio",
            })}
            defaultValue=""
          />
        </FormRow>
        <FormRow label="Designación" error={errors?.designacion?.message}>
          <Input
            type="text"
            id="designacion"
            {...register("designacion", {
              required: "Este campo es obligatorio",
            })}
            defaultValue=""
          />
        </FormRow>
        <FormRow
          label="Resumen del problema reportado"
          error={errors?.resumenProblema?.message}
        >
          <Textarea
            id="resumenProblema"
            {...register("resumenProblema", {
              required: "Este campo es obligatorio",
            })}
          />
        </FormRow>
        <FormRow
          label="Razón del problema"
          error={errors?.razonProblema?.message}
        >
          <Textarea
            id="razonProblema"
            {...register("razonProblema", {
              required: "Este campo es obligatorio",
            })}
          />
        </FormRow>
        <FormRow label="Consecuencia" error={errors?.consecuencia?.message}>
          <Textarea
            id="consecuencia"
            {...register("consecuencia", {
              required: "Este campo es obligatorio",
            })}
          />
        </FormRow>
        <FormRow
          label="Tipos de medición afectadas"
          error={errors?.medicionesAfectadas?.message}
        >
          <Input
            id="medicionesAfectadas"
            placeholder="M1, M2, M3 ..."
            {...register("medicionesAfectadas", {
              required: "Este campo es obligatorio",
            })}
          />
        </FormRow>
        <FormRow
          label="Tipos de medición disponible"
          error={errors?.medicionesDisponibles?.message}
        >
          <Input
            id="medicionesDisponibles"
            placeholder="M1, M2, M3 ..."
            {...register("medicionesDisponibles", {
              required: "Este campo es obligatorio",
            })}
          />
        </FormRow>
        <FormRow label="Días tipo a usar" error={errors?.diasTipo?.message}>
          <Textarea
            id="diasTipo"
            {...register("diasTipo", {
              required: "Este campo es obligatorio",
            })}
          />
        </FormRow>
        <FormRow
          label="Procedimiento a utilizar"
          error={errors?.procedimiento?.message}
        >
          <Textarea
            id="procedimiento"
            {...register("procedimiento", {
              required: "Este campo es obligatorio",
            })}
          />
        </FormRow>
        <FormRow label="Rango de datos sustituidos">
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <p>Desde</p>
            <Input
              type="datetime-local"
              id="fechaInicial"
              {...register("fechaInicial", {
                required: "Este campo es obligatorio",
              })}
            />
            <p> Hasta </p>
            <Input
              type="datetime-local"
              id="fechaFinal"
              {...register("fechaFinal", {
                required: "Este campo es obligatorio",
              })}
            />
          </div>
        </FormRow>

        <Button type="submit" size="medium" variation="primary">
          Crear Reporte
        </Button>
      </Form>
      {showPdfReport && (
        <div>
          <CreatePdfReport
            formData={formData}
            rowsToEdit={retrievedPdfData.filas_editadas || []}
            // getPdfFile={getPdfFile}
          />
          <Button
            type="button"
            variation="primary"
            size="medium"
            onClick={() => {
              const reportName =
                retrievedPdfData.nombreReporte || newReportName();
              //   onUpdateMeasures(reportName);
              saveReportData(reportName);
              handleShowModal();
            }}
          >
            Guardar datos
          </Button>
        </div>
      )}
    </>
  );
}

export default EditSubstitutionForm;
