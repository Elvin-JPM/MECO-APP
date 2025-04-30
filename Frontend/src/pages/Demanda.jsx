import DemandTable from "../features/demanda/DemandTable";
import Heading from "../ui/Heading";
import styled from "styled-components";
import Form from "../ui/Form";
import FormRow from "../ui/FormRow";
import Input from "../ui/Input";
import { useForm } from "react-hook-form";
import { getYesterdayDateFormatted } from "../utils/dateFunctions";
import { formatDateInput } from "../utils/dateFunctions";
import { useState } from "react";
import Button from "../ui/Button";
import { FaDownload } from "react-icons/fa6";

const StyledDemanda = styled.div`
  overflow: visible;
  display: flex;
  flex-direction: column;
  margin-top: 0;
  padding-top: 0;
  gap: 0.5rem;

  ::-webkit-scrollbar {
    width: 8px; /* Width of the scrollbar */
  }

  ::-webkit-scrollbar-track {
    background: transparent; /* Transparent track */
  }

  ::-webkit-scrollbar-thumb {
    background: var(--color-grey-300); /* Color of the thumb */
    border-radius: 4px; /* Rounded corners */
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #555; /* Darker color on hover */
  }
`;

const StyledBar = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--color-grey-50);
  padding: 0.7rem 2rem;
  border-radius: 0.7rem;
  justify-content: space-between;
  border: 1px solid var(--color-grey-200);
`;

function Demanda() {
  const { register, handleSubmit, formState, watch } = useForm();
  const { errors } = formState;

  const [fecha, setFecha] = useState(() => getYesterdayDateFormatted());
  const [isDownloadReport, setIsDownloadReport] = useState(false);

  const yesterday = getYesterdayDateFormatted();

  const handleDateChange = (e) => {
    setFecha(e.target.value);
  };

  const handleDownloadClick = () => {
    setIsDownloadReport(true);
    setTimeout(() => setIsDownloadReport(false), 1000); // Reset after download
  };

  return (
    <StyledDemanda>
      <Heading>Demanda Horaria por Barra</Heading>

      <StyledBar>
        <div>
          <label style={{ marginRight: "3rem" }}>Fecha:</label>
          <Input
            type="date"
            id="fecha"
            defaultValue={yesterday}
            {...register("fecha", { required: "Este campo es obligatorio" })}
            onChange={handleDateChange}
          />
        </div>
        <Button
          onClick={handleDownloadClick}
          tooltip="Descargar"
          size="medium"
          variation="primary"
        >
          <FaDownload />
        </Button>
      </StyledBar>

      <DemandTable fecha={fecha} isDownloadReport={isDownloadReport} />
    </StyledDemanda>
  );
}

export default Demanda;
