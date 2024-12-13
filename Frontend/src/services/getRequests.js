import { getData } from "./api";

export async function getMeters(page) {
  const response = await getData(`/meters?page=${page}`);
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

export async function getIntegratedMeters(puntoMedicionId) {
  const response = await getData(`/integratedMeters/${puntoMedicionId}`);
  return response;
}

export async function getMeasures(params, page) {
  const response = await getData(`/measures?page=${page}`, {}, params);
  return response;
}
