import { postData } from "./api";

// CREAR NUEVO MEDIDOR
export async function createMeter(newMeter)
{
    const response = await postData("/newMeter", newMeter, {
      // Authorization: `${token}`,
      "Content-Type": "multipart/form-data",
    });
    return response;
}

// GUARDAR LOS DATOS DEL REPORTE PDF CREADO A PARTIR DE UNA VALIDACION O SUSTITUCION

export async function createSubstitutionReport(substitutionData) {
  const response = await postData("/createSubstitutionReport", substitutionData, {
    // Authorization: `${token}`,
    "Content-Type": "multipart/form-data",
  });
  return response;
}