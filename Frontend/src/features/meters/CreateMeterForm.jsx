import { useQuery } from "@tanstack/react-query";
import Input from "../../ui/Input";
import Form from "../../ui/Form";
import Textarea from "../../ui/Textarea";
import Button from "../../ui/Button";
import FileInput from "../../ui/FileInput";
import Select from "../../ui/Select";
import Option from "../../ui/Option";
import FormRow from "../../ui/FormRow";
import { useForm } from "react-hook-form";
import {
  getPlantsAndSubstations,
  getMeterModels,
  getMeter,
} from "../../services/getRequests";
import { useEffect } from "react";
import Spinner from "../../ui/Spinner";
import { useState } from "react";
import useCreateMeter from "./useCreateMeter";
import useUpdateMeter from "./useUpdateMeter";
import base64ToFile from "../../utils/base64ToFile";

function CreateMeterForm({
  meterId,
  nombrePlanta,
  handleShowForm,
  onCloseModal,
}) {
  const { isCreating, createMeter } = useCreateMeter();
  const { isUpdating, updateMeter } = useUpdateMeter();

  const [imagePreview, setImagePreview] = useState(null);

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
  const isEditSession = Boolean(meterToEdit);

  console.log("meter to edit at form:", meterToEdit);

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
      tipo: "",
      description: "",
    },
  });
  const { errors } = formState;

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
        tipo: meterToEdit[0].tipo || "",
        description: meterToEdit[0].description || "",
      });
    }
  }, [meterToEdit, meterModels, reset]);

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
    } else if (isEditSession) {
      const fileFromBase64 = base64ToFile(meterToEdit[0]?.foto, "foto"); // Use existing URL or data
      console.log("imaged converted", fileFromBase64);
      formData.append("foto", fileFromBase64);
    }

    // Append other fields
    formData.append("plantssub", data.plantssub.nombre);
    formData.append("idPunto", Number(data.idPunto));
    formData.append("ip", data.ip);
    formData.append("serie", data.serie.toUpperCase());
    formData.append("modelo", Number(data.modelo));
    formData.append("puerto", Number(data.puerto));
    formData.append("fuenteExterna", data.fuenteExterna === "Si" ? 1 : 0);
    formData.append("integrado", data.integrado === "Si" ? 1 : 0);
    formData.append("activo", data.activo === "Si" ? 1 : 0);
    formData.append("tipo", data.tipo);
    formData.append("description", data.description);
    isEditSession && formData.append("id", meterToEdit[0].id);

    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
    console.log("Data for insert: ", formData);
    // Mutate with FormData
    if (isEditSession) {
      updateMeter(formData, {
        onSuccess: () => {
          reset();
          handleShowForm?.() || onCloseModal?.();
        },
      });
    } else {
      createMeter(formData, {
        onSuccess: () => {
          reset();
          handleShowForm?.() || onCloseModal?.();
        },
      });
    }
  }

  if (isLoadingMeter) {
    return <Spinner />;
  }

  return (
    <>
      {isEditSession ? <h1>Editar medidor</h1> : <h1>Crear nuevo medidor</h1>}
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormRow label="Planta/Subestación" error={errors?.plantssub?.message}>
          <Select
            id="plantssub"
            disabled={isCreating}
            {...register("plantssub")}
          >
            <option value="">Seleccione una opción</option>
            {plantsandsubs?.map((plansub) => (
              <option key={plansub.id} value={plansub.id}>
                {plansub.nombre}
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
            {...register("serie", {
              required: "Este campo es obligatorio",
            })}
          />
        </FormRow>

        <FormRow label="Modelo" error={errors?.modelo?.message}>
          <Select
            id="modelo"
            disabled={isCreating}
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
            {...register("puerto", {
              required: "Este campo es obligatorio",
            })}
          />
        </FormRow>
        <FormRow label="Tipo" error={errors?.tipo?.message}>
          <Select
            id="tipo"
            disabled={isCreating}
            {...register("tipo", {
              required: "Este campo es obligatorio",
            })}
          >
            <option value="">Select an option</option>
            <option value="Principal">Principal</option>
            <option value="Respaldo">Respaldo</option>
          </Select>
        </FormRow>

        <FormRow label="Descripción" error={errors?.description?.message}>
          <Textarea
            id="description"
            disabled={isCreating}
            {...register("description", {
              required: "Este campo es obligatorio",
            })}
          ></Textarea>
        </FormRow>

        {isEditSession && meterToEdit[0]?.foto && !imagePreview && (
          <div>
            <p>Imagen actual:</p>
            <img
              src={`data:image/jpeg;base64,${meterToEdit[0].foto}`} // Assuming this is a URL or base64 string
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
              handleFileChange(e);
              register("foto").onChange(e);
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
          <Button
            variation="secondary"
            type="button"
            onClick={() => handleShowForm?.() || onCloseModal?.()}
          >
            Cancel
          </Button>
          <Button disabled={isCreating} type="submit">
            {isEditSession ? "Editar medidor" : "Crear medidor"}
          </Button>
        </FormRow>
      </Form>
    </>
  );
}

export default CreateMeterForm;


