import { useForm } from "react-hook-form";
import { useEffect, useRef } from "react";
import Input from "../../ui/Input"; // Your custom Input component
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Button from "../../ui/Button";
import { useQuery } from "@tanstack/react-query";
import {
  getIntegratedMeters,
  getPlantsAndSubstations,
} from "../../services/getRequests";
import Select from "../../ui/Select";

function GenerateReportForm({
  handleShowReportTable,
  handleReportData,
  handleEnergyTags,
  handlePageReset,
}) {
  const nombrePlantaRef = useRef(null);
  const { register, handleSubmit, formState, setValue, watch } = useForm();
  const { errors } = formState;

  const selectedPlantaSub = watch("plantaSubestacion");
  const selectedPuntoMedicion = watch("puntoMedicion");

  const { isLoadingPlantsSubs, data: plantsandsubs } = useQuery({
    queryKey: ["plantsandsubs"],
    queryFn: getPlantsAndSubstations,
  });

  const { data: integratedMeters } = useQuery({
    queryKey: ["integratedMeters", selectedPlantaSub],
    queryFn: () => getIntegratedMeters(selectedPlantaSub),
    enabled: !!selectedPlantaSub,
  });

  const uniqueMeters = integratedMeters?.filter(
    (item, index, array) =>
      array.findIndex((other) => other.description === item.description) ===
      index
  );

  const selectedMeterDescription = uniqueMeters?.find(
    (meter) => meter.id_punto_medicion === Number(selectedPuntoMedicion)
  )?.description;

  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    setValue("fechaInicial", formatDateForInput(yesterday));
    setValue("fechaFinal", formatDateForInput(today));
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  async function onSubmit(data) {
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
      medidorPrincipal: medidorPrincipal?.id,
      medidorRespaldo: medidorRespaldo?.id,
      tipoMedida: data?.tipoMedida,
      fechaInicial: data?.fechaInicial,
      fechaFinal: data?.fechaFinal,
      puntoMedicion: Number(data?.puntoMedicion),
      nombrePuntoMedicion: selectedMeterDescription, // Include the meter description
    };

    console.log("params: ", queryParams);

    handleEnergyTags(data?.tipoMedida);
    handleShowReportTable();
    handleReportData(queryParams);
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormRow
        label="Planta/Subestación"
        error={errors?.integratedMeters?.message}
      >
        <Select
          type="white"
          id="plantaSubestacion"
          {...register("plantaSubestacion", {
            required: "Este campo es obligatorio",
          })}
          onChange={(e) => {
            setValue("plantaSubestacion", e.target.value);
            handlePageReset();
          }}
        >
          <option value="">Seleccione una opción</option>
          {plantsandsubs?.map((plansub) => (
            <option key={plansub.id} value={plansub.id}>
              {plansub.nombre}
            </option>
          ))}
        </Select>
      </FormRow>

      <FormRow
        label="Punto de medición"
        error={errors?.integratedMeters?.message}
      >
        <Select
          type="white"
          id="puntoMedicion"
          {...register("puntoMedicion", {
            required: "Este campo es obligatorio",
          })}
          onChange={(e) => {
            setValue("puntoMedicion", e.target.value);
            handlePageReset();
          }}
        >
          <option value="">Seleccione una opción</option>
          {!integratedMeters && <option>Loading...</option>}
          {uniqueMeters?.map((meter) => (
            <option key={meter.id_ion_data} value={meter.id_punto_medicion}>
              {meter.description}
            </option>
          ))}
        </Select>
      </FormRow>

      <FormRow label="Tipo de medida" error={errors?.integratedMeters?.message}>
        <Select
          type="white"
          name="tipoMedida"
          id="tipoMedida"
          {...register("tipoMedida", {
            required: "Este campo es obligatorio",
          })}
          defaultValue="energiaActivaIntervalo"
          onChange={handlePageReset}
        >
          <option value="energiaActivaIntervalo">
            Energia Activa Intervalo
          </option>
          <option value="energiaReactivaIntervalo">
            Energia Reactiva Intervalo
          </option>
          <option value="energiaActivaAcumulada">
            Energia Activa Acumulada
          </option>
          <option value="energiaReactivaAcumulada">
            Energia Reactiva Acumulada
          </option>
        </Select>
      </FormRow>

      <FormRow label="Fecha inicial">
        <Input
          type="datetime-local"
          id="fechaInicial"
          defaultValue={formatDateForInput(yesterday)}
          {...register("fechaInicial", {
            required: "Este campo es obligatorio",
          })}
          onChange={handlePageReset}
        />
      </FormRow>

      <FormRow label="Fecha final">
        <Input
          type="datetime-local"
          id="fechaFinal"
          defaultValue={formatDateForInput(today)}
          {...register("fechaFinal", {
            required: "Este campo es obligatorio",
          })}
          onChange={handlePageReset}
        />
      </FormRow>

      <Button type="submit" size="medium" variation="primary">
        Generar Reporte
      </Button>
    </Form>
  );
}

export default GenerateReportForm;
