import React from "react";
import { useForm } from "react-hook-form";
import Input from "../../ui/Input"; // Your custom Input component
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Button from "@mui/material/Button";
import { useQuery } from "@tanstack/react-query";
import { getIntegratedMeters } from "../../services/getRequests";
import Select from "../../ui/Select";

function GenerateReportForm({ handleShowReportTable, handleReportData }) {
  const { register, handleSubmit, reset, getValues, formState } = useForm();
  const { errors } = formState;

  const {
    isLoading: isLoadingIntegratedMeters,
    data: integratedMeters,
    // error,
  } = useQuery({
    queryKey: ["integratedMeters"],
    queryFn: getIntegratedMeters,
  });

  async function onSubmit(data) {
    //const formData = new FormData();

    const ionDataIds = integratedMeters?.filter(
      (meter) => Number(meter.id_punto_medicion) === Number(data?.puntoMedicion)
    );

    const medidorPrincipal = ionDataIds.find(
      (medidor) => medidor.tipo === "PRINCIPAL"
    );
    const medidorRespaldo = ionDataIds.find(
      (medidor) => medidor.tipo === "RESPALDO"
    );

    const queryParams = {
      medidorPrincipal: medidorPrincipal?.id_ion_data,
      medidorRespaldo: medidorRespaldo?.id_ion_data,
      fechaInicial: data?.fechaInicial,
      fechaFinal: data?.fechaFinal,
    };

    handleShowReportTable();
    handleReportData(queryParams);
  }

  const uniqueMeters = integratedMeters?.filter(
    (item, index, array) =>
      array.findIndex((other) => other.description === item.description) ===
      index
  );

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {/* Punto de medición field */}
      <FormRow
        label="Punto de medición"
        error={errors?.integratedMeters?.message}
      >
        <Select id="puntoMedicion" {...register("puntoMedicion")}>
          <option value="">Seleccione una opción</option>
          {uniqueMeters?.map((meter) => (
            <option key={meter.id_ion_data} value={meter.id_punto_medicion}>
              {meter.description}
            </option>
          ))}
        </Select>
      </FormRow>

      {/* Fecha inicial field with datetime-local */}
      <FormRow label="Fecha inicial">
        <Input
          type="datetime-local"
          id="fechaInicial"
          {...register("fechaInicial", {
            required: "Este campo es obligatorio",
          })}
        />
      </FormRow>

      {/* Fecha final field with datetime-local */}
      <FormRow label="Fecha final">
        <Input
          type="datetime-local"
          id="fechaFinal"
          {...register("fechaFinal", {
            required: "Este campo es obligatorio",
          })}
        />
      </FormRow>

      <Button type="submit" variant="contained">
        Generate Report
      </Button>
    </Form>
  );
}

export default GenerateReportForm;
