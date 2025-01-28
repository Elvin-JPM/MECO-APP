import { postData } from "./api";

// Login
export async function login(userData) {
  try {
    console.log("User data received at login endpoint: ", userData);
    const response = await postData("/login", userData, {
      // Authorization: `${token}`,
      "Content-Type": "application/json",
    });
    console.log("Data received at login from the backend: ", response);
    return response;
  } catch (error) {
    console.log("Error at login: ", error);
    throw error;
  }
}

// Logout

export async function logout() {
  try {
    const response = await postData("/logout");
    console.log(response);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// CREAR NUEVO MEDIDOR
export async function createMeter(newMeter) {
  const response = await postData("/newMeter", newMeter, {
    // Authorization: `${token}`,
    "Content-Type": "multipart/form-data",
  });
  return response;
}

// GUARDAR LOS DATOS DEL REPORTE PDF CREADO A PARTIR DE UNA VALIDACION O SUSTITUCION

export async function createSubstitutionReport(substitutionData) {
  const response = await postData(
    "/createSubstitutionReport",
    substitutionData,
    {
      // Authorization: `${token}`,
      "Content-Type": "multipart/form-data",
    }
  );
  return response;
}
