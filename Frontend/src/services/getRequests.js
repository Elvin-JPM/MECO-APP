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

export async function getReport(reportName) {
  const response = await getData(`/report/${reportName}`);
  return response;
}

export async function getSubstitutionReports() {
  const response = await getData(`/substitutionReports`);
  return response;
}

export async function getStatistics(data) {
  console.log("Data received at getStatistics: ", data);
  const response = await getData(`/statistics`, {}, data);
  return response;
}

export async function getHourlyDemand(fecha) {
  const response = await getData(`/demanda_nacional`, {}, { fecha: fecha });
  console.log("Data received at getHourlyDemand: ", response);
  return response;
}
export async function getHourlyGeneration(fecha) {
  const response = await getData(`/generacion_horaria`, {}, { fecha: fecha });
  console.log("Data received at getHourlyGeneration: ", response);
  return response;
}

export async function getNodesNames() {
  const response = await getData(`/nodes_names`);
  console.log("Data received at getNodesNames ", response);
  return response;
}

export async function getMetersInfo() {
  const response = await getData(`/meters_info`);
  console.log("Data received at getMetersInfo ", response);
  return response;
}

export async function getMeterCommStatusPing(ipAddress) {
  try {
    const response = await getData(`/ping/${ipAddress}`);
    return response;
  } catch (error) {
    console.error("Error in getMeterCommStatusPing:", error);
    return { success: false, message: error.message || "Ping failed" };
  }
}

export async function getMeasurementPoints() {
  const response = await getData("/measurementPoints");
  return response;
}

export async function getSubstations() {
  const response = await getData("/substations");
  return response;
}
