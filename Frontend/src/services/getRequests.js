import { getData } from "./api";

export async function getMeters() {
  const response = await getData("/meters");
  return response;
}

export async function getMeter(id) {
  const response = await getData(`/meters/${id}`);
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

export async function getIntegratedMeters() {
  const response = await getData("/integratedMeters");
  return response;
}

export async function getMeasures(params) {
  console.log("Params at get measures: ", params);
  const response = await getData("/measures", {}, params);
  console.log(response);
  return response;
}
