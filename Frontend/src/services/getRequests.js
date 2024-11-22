import { getData } from "./api";

export async function getMeters() {
  const response = await getData("/meters");
  return response;
}

export async function getPlantsAndSubstations() {
  const response = await getData("/plantssubs");
  return response;
}

export async function getMeterModels() {
  const response = await getData("/meter_models");
  console.log(response);
  return response;
}
