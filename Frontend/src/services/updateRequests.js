import { putData } from "./api";

export async function updateMeter(meterToUpdate) {
  console.log("Payload being sent:", meterToUpdate);
  console.log("Meters id: ", meterToUpdate.get("id"));
  const response = await putData(
    `/updateMeter/${Number(meterToUpdate.get("id"))}`,
    meterToUpdate

    // {
    // Authorization: `${token}`,
    //"Content-Type": "multipart/form-data",
    //}
  );
  return response;
}

export async function updateMeasures(measuresToUpdate) {
  console.log("Rows to edit received at updateRequests.js: ", measuresToUpdate);
  // console.log("Meters id: ", meterToUpdate.get("id"));
  const response = await putData(
    `/updateMeasures`,
    measuresToUpdate

    // {
    // Authorization: `${token}`,
    //"Content-Type": "multipart/form-data",
    //}
  );
  return response;
}


// ACTUALIZAR LOS DATOS DEL REPORTE PDF CREADO A PARTIR DEL FORMULARIO DE EDICION
export async function editSubstitution(editSubstitutionData) {
  const response = await putData(
    "/editSubstitutionReport",
    editSubstitutionData,
    {
      // Authorization: `${token}`,
      "Content-Type": "multipart/form-data",
    }
  );
  return response;
}

// ACTUALIZA EL ESTADO DE UN REPORTE DE SUSTITUCION A APROBADO
export async function approveReport(reportId) {
  const response = await putData(`/approveReport/${reportId}`);
  return response;
}
