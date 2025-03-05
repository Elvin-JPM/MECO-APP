import styled from "styled-components";
import Select from "../../ui/Select";
import Tag from "../../ui/Tag";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getPlantsAndSubstations,
  getIntegratedMeters,
} from "../../services/getRequests";
import { useForm } from "react-hook-form";
import { getOclockDate } from "../../utils/dateFunctions";
import useGetStatistics from "./useGetStatistics";
import Spinner from "../../ui/Spinner";

const StyledForm = styled.form`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 1.5rem;
`;

function DashboardForm({ handleDashboardInfo }) {
  const [activeTag, setActiveTag] = useState("1day");
  const [totalDays, setTotalDays] = useState(1);
  const [queryParams, setQueryParams] = useState({
    medidorPrincipal: "13",
    medidorRespaldo: "14",
    fechaInicial: getOclockDate(
      new Date(new Date().setDate(new Date().getDate() - 1))
    ),
    fechaFinal: getOclockDate(new Date()),
  });

  const { register, handleSubmit, formState, watch } = useForm();
  const { errors } = formState;
  const activeTagRef = useRef(1);

  const selectedPlantaSub = watch("plantaSubestacion");
  const selectedPuntoMedicion = watch("puntoMedicion");

  const {
    data: stats,
    isLoading,
    isError,
    isSuccess,
    refetch,
  } = useGetStatistics(queryParams);

  const { data: plantsandsubs } = useQuery({
    queryKey: ["plantsandsubs"],
    queryFn: getPlantsAndSubstations,
  });

  const { data: integratedMeters } = useQuery({
    queryKey: ["integratedMeters", selectedPlantaSub],
    queryFn: () => getIntegratedMeters(selectedPlantaSub),
    enabled: !!selectedPlantaSub,
  });

  useEffect(() => {
    console.log("Active tag on effect: ", activeTag);
    const days = activeTag === "1day" ? 1 : activeTag === "7days" ? 7 : 30;
    setTotalDays(days);
  }, [activeTag]);

  useEffect(() => {
    if (selectedPuntoMedicion || activeTag) {
      console.log("inside 2nd useEffect");
      handleSubmit(onSubmit)();
    }
  }, [totalDays, selectedPuntoMedicion]);

  const uniqueMeters = integratedMeters?.filter(
    (item, index, array) =>
      array.findIndex((other) => other.description === item.description) ===
      index
  );

  const handleTagClick = (value) => {
    console.log("Clicked Tag:", value);
    setActiveTag(value);
  };

  const selectedMeterDescription = uniqueMeters?.find(
    (meter) => meter.id_punto_medicion === Number(selectedPuntoMedicion)
  )?.description;

  async function onSubmit(data) {
    const ionDataIds = integratedMeters?.filter(
      (meter) => Number(meter.id_punto_medicion) === Number(data?.puntoMedicion)
    );

    const medidorPrincipal =
      ionDataIds.find((medidor) => medidor.tipo === "PRINCIPAL") || 13;
    const medidorRespaldo =
      ionDataIds.find((medidor) => medidor.tipo === "RESPALDO") || 14;

    const today = new Date();
    const pastDay = new Date(today);
    pastDay.setDate(pastDay.getDate() - totalDays);

    const newQueryParams = {
      medidorPrincipal: medidorPrincipal?.id || 13,
      medidorRespaldo: medidorRespaldo?.id || 14,
      fechaInicial: getOclockDate(pastDay),
      fechaFinal: getOclockDate(today),
    };

    console.log("params: ", newQueryParams);
    setQueryParams(newQueryParams);
    handleDashboardInfo(stats);
  }

  handleDashboardInfo(stats);

  return (
    <>
      <StyledForm onSubmit={handleSubmit(onSubmit)}>
        <Select
          type="white"
          id="plantaSubestacion"
          {...register("plantaSubestacion", {
            required: "Este campo es obligatorio",
          })}
        >
          <option value="">Seleccione una planta/subestacion</option>
          {plantsandsubs?.map((plansub) => (
            <option key={plansub.id} value={plansub.id}>
              {plansub.nombre}
            </option>
          ))}
        </Select>
        <Select
          type="white"
          id="puntoMedicion"
          {...register("puntoMedicion", {
            required: "Este campo es obligatorio",
          })}
        >
          <option value="">Seleccione punto de medición</option>
          {uniqueMeters?.map((meter) => (
            <option key={meter.id_ion_data} value={meter.id_punto_medicion}>
              {meter.description}
            </option>
          ))}
        </Select>

        {["1day", "7days", "30days"].map((value, index) => (
          <Tag
            key={index}
            value={value}
            active={activeTag === value}
            onClick={() => {
              handleTagClick(value);
            }}
          >
            {value === "1day"
              ? "Ayer"
              : value === "7days"
              ? "7 días"
              : "30 días"}
          </Tag>
        ))}
      </StyledForm>
      {/* Display loading or result
      {isLoading && <Spinner />}
      {isError && <p>Error fetching data</p>}
      {isSuccess && <div>{JSON.stringify(stats)}</div>} */}
    </>
  );
}

export default DashboardForm;
