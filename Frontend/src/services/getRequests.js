import { getData } from "./api";

export async function loginProtected() {
  try {
    const response = await getData("/protected"); // No need for the Authorization header
    console.log("Response at login protected: ", response);
    return response;
  } catch (error) {
    console.error("Error in loginProtected:", error);
    throw error;
  }
}

export async function getUser() {
  try {
    const response = await getData("/me");
    console.log("User obtained from the /me route: ", response);
    return response;
  } catch (error) {
    console.log("Error at getUser() from the /me route: ", error);
    throw error;
  }
}

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

export async function getAgente(idPunto) {
  const response = await getData(`/agentes/${idPunto}`);
  return response;
}
