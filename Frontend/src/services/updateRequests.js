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
