import styled from "styled-components";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Input from "../../ui/Input";
import Form from "../../ui/Form";
import Button from "../../ui/Button";
import FileInput from "../../ui/FileInput";
import Textarea from "../../ui/Textarea";
import Select from "../../ui/Select";
import Option from "../../ui/Option";
import FormRow from "../../ui/FormRow";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import {
  getPlantsAndSubstations,
  getMeterModels,
  getMeter,
} from "../../services/getRequests";
import { useEffect } from "react";
import Spinner from "../../ui/Spinner";
import { useState } from "react";
import { postData } from "../../services/api";
import { createMeter } from "../../services/postRequests";

function CreateMeterForm({ meterId, nombrePlanta }) {
  //const { id: editId, ...editValues } = meterToEdit;
  //console.log("Edit values: ", editValues);

  const {
    isLoadingPlantsSubs,
    data: plantsandsubs,
    // error,
  } = useQuery({
    queryKey: ["plantsandsubs"],
    queryFn: getPlantsAndSubstations,
  });

  const {
    isLoadingMeterModels,
    data: meterModels,
    // error,
  } = useQuery({
    queryKey: ["meterModels"],
    queryFn: getMeterModels,
  });

  const {
    isLoadingMeter,
    data: meterToEdit,
    // error,
  } = useQuery({
    queryKey: ["meter", meterId],
    queryFn: () => getMeter(meterId),
    enabled: !!meterId,
  });

  console.log("meter to edit at form:", meterToEdit);
  const isEditSession = Boolean(meterToEdit);

  const { register, handleSubmit, reset, getValues, formState } = useForm({
    defaultValues: {
      plantssub: "",
      idPunto: "",
      ip: "",
      serie: "",
      modelo: "",
      puerto: "",
      fuenteExterna: "",
      integrado: "",
      activo: "",
    },
  });
  const { errors } = formState;

  function getMeterModelFromId(id) {
    const meterModel = meterModels?.find((item) => item.id === id); // Use .find() to get a single object
    return meterModel ? meterModel.modelo : ""; // Return the modelo if it exists, otherwise return an empty string
  }

  // Populate form values once meterToEdit is available
  useEffect(() => {
    if (meterToEdit && meterModels) {
      reset({
        plantssub: nombrePlanta || "",
        idPunto: meterToEdit[0].id_punto_medicion || "",
        ip: meterToEdit[0].ip || "",
        serie: meterToEdit[0].serie || "",
        modelo: meterToEdit[0].id_modelo || "",
        puerto: meterToEdit[0].numero_puerto || "",
        fuenteExterna: meterToEdit[0].fuente_externa === 1 ? "Si" : "No",
        integrado: meterToEdit[0].integrado === 1 ? "Si" : "No",
        activo: meterToEdit[0].activo === 1 ? "Si" : "No",
      });
    }
  }, [meterToEdit, meterModels, reset]);

  const queryClient = useQueryClient();
  const { mutate, isCreating } = useMutation({
    mutationFn: createMeter,
    onSuccess: () => {
      toast.success("Medidor creado exitosamente!");
      queryClient.invalidateQueries({ queryKey: ["meters"] });
      reset();
    },
    onError: (err) => toast.error(err.message),
  });

  const [imagePreview, setImagePreview] = useState(null);
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  async function onSubmit(data) {
    const formData = new FormData();

    // Append file
    const file = getValues("foto")[0]; // react-hook-form stores files as an array
    if (file) {
      formData.append("foto", file); // Ensure "foto" matches the backend field
    } else if (isEditSession && meterToEdit[0]?.foto) {
      formData.append("foto", meterToEdit[0].foto); // Use existing URL or data
    }

    // Append other fields
    formData.append("plantssub", data.plantssub);
    formData.append("idPunto", Number(data.idPunto));
    formData.append("ip", data.ip);
    formData.append("serie", data.serie.toUpperCase());
    formData.append("modelo", Number(data.modelo));
    formData.append("puerto", Number(data.puerto));
    formData.append("fuenteExterna", data.fuenteExterna === "Si" ? 1 : 0);
    formData.append("integrado", data.integrado === "Si" ? 1 : 0);
    formData.append("activo", data.activo === "Si" ? 1 : 0);

    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    // Mutate with FormData
    mutate(formData);
  }

  if (isLoadingMeter) {
    return <Spinner />;
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormRow label="Planta/Subestación" error={errors?.plantssub?.message}>
        <Select
          id="plantssub"
          disabled={isCreating}
          {...register("plantssub")}
          //   defaultValue={isEditSession && nombrePlanta}
        >
          <option value="">Seleccione una opción</option>
          {plantsandsubs?.map((plansub) => (
            <option key={plantsandsubs.indexOf(plansub)} value={plansub}>
              {plansub}
            </option>
          ))}
        </Select>
      </FormRow>

      <FormRow label="ID punto" error={errors?.idPunto?.message}>
        <Input
          type="number"
          min="100000"
          id="idPunto"
          disabled={isCreating}
          //   defaultValue={isEditSession && meterToEdit[0]?.id_punto_medicion}
          {...register("idPunto", {
            required: "Este campo es obligatorio",
            min: {
              value: 100000,
              message: "El número debe ser mayor o igual que 100000",
            },
          })}
        />
      </FormRow>

      <FormRow label="IP" error={errors?.ip?.message}>
        <Input
          type="text"
          maxLength="15"
          id="ip"
          disabled={isCreating}
          //   defaultValue={isEditSession && meterToEdit[0]?.ip}
          {...register("ip", {
            required: "Este campo es obligatorio",
            pattern: {
              value:
                /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
              message: "Por favor ingrese una dirección IPV4 válida",
            },
          })}
        />
      </FormRow>

      <FormRow label="Serie" error={errors?.serie?.message}>
        <Input
          type="text"
          id="serie"
          disabled={isCreating}
          //   defaultValue={isEditSession && meterToEdit[0]?.serie}
          {...register("serie", {
            required: "Este campo es obligatorio",
          })}
        />
      </FormRow>

      <FormRow label="Modelo" error={errors?.modelo?.message}>
        <Select
          id="modelo"
          disabled={isCreating}
          //   defaultValue={
          //     isEditSession && getMeterModelFromId(meterToEdit[0]?.id_modelo)
          //   }
          {...register("modelo", {
            required: "Este campo es obligatorio",
          })}
        >
          <Option value="">Seleccione un modelo</Option>
          {meterModels?.map((meterModel) => (
            <Option key={meterModel.id} value={meterModel.id}>
              {meterModel.modelo}
            </Option>
          ))}
        </Select>
      </FormRow>

      <FormRow label="Puerto" error={errors?.puerto?.message}>
        <Input
          type="number"
          min="1"
          max="65335"
          id="puerto"
          disabled={isCreating}
          //   defaultValue={isEditSession && meterToEdit[0]?.numero_puerto}
          {...register("puerto", {
            required: "Este campo es obligatorio",
          })}
        />
      </FormRow>

      {isEditSession && meterToEdit[0]?.foto && !imagePreview && (
        <div>
          <p>Imagen actual:</p>
          <img
            src={meterToEdit[0].foto} // Assuming this is a URL or base64 string
            alt="Current meter image"
            style={{ maxWidth: "200px", maxHeight: "200px" }}
          />
        </div>
      )}
      <FormRow label="Foto" error={errors?.foto?.message}>
        <FileInput
          accept="image/*"
          id="foto"
          name="foto"
          {...register("foto")}
          onChange={(e) => {
            handleFileChange(e); // Your file preview logic
            register("foto").onChange(e); // Ensure `react-hook-form` handles the input too
          }}
        />
      </FormRow>
      {imagePreview && (
        <div>
          <p>Vista previa:</p>
          <img
            src={imagePreview}
            alt="Selected preview"
            style={{ maxWidth: "200px", maxHeight: "200px" }}
          />
        </div>
      )}

      <FormRow label="Fuente Externa" error={errors?.fuenteExterna?.message}>
        <Select
          id="fuenteExterna"
          //   defaultValue={
          //     isEditSession && meterToEdit[0]?.fuente_externa === 1 ? "Si" : "No"
          //   }
          disabled={isCreating}
          {...register("fuenteExterna", {
            required: "Este campo es obligatorio",
          })}
        >
          <option value="">Select an option</option>
          <option value="Si">Si</option>
          <option value="No">No</option>
        </Select>
      </FormRow>

      <FormRow label="Integrado" error={errors?.integrado?.message}>
        <Select
          id="integrado"
          disabled={isCreating}
          //   defaultValue={
          //     isEditSession && meterToEdit[0]?.integrado === 1 ? "Si" : "No"
          //   }
          {...register("integrado", {
            required: "Este campo es obligatorio",
          })}
        >
          <option value="">Select an option</option>
          <option value="Si">Si</option>
          <option value="No">No</option>
        </Select>
      </FormRow>

      <FormRow label="Activo" error={errors?.activo?.message}>
        <Select
          id="activo"
          disabled={isCreating}
          //   defaultValue={
          //     isEditSession && meterToEdit[0]?.activo === 1 ? "Si" : "No"
          //   }
          {...register("activo", {
            required: "Este campo es obligatorio",
          })}
        >
          <option value="">Select an option</option>
          <option value="Si">Si</option>
          <option value="No">No</option>
        </Select>
      </FormRow>

      <FormRow>
        {/* type is an HTML attribute! */}
        <Button variation="secondary" type="reset">
          Cancel
        </Button>
        <Button disabled={isCreating}>Create meter</Button>
      </FormRow>
    </Form>
  );
}

export default CreateMeterForm;
