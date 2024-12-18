import axios from "axios";

const BASE_URL = import.meta.env.VITE_APP_URL;
axios.defaults.timeout = 10000;

export async function postData(endpoint, requestBody, headers) {
  try {
    const response = await axios.post(BASE_URL + endpoint, requestBody, {
      headers: headers,
    });
    return response;
  } catch (error) {
    console.error("Error posting data:", error);
  }
}

export async function getData(endpoint, requestHeaders, queryParams = {}) {
  try {
    const response = await axios.get(BASE_URL + endpoint, {
      headers: requestHeaders,
      params: queryParams, // Add the query parameters here
    });
    return response.data;
  } catch (error) {
    console.error("Error getting data:", error);
    throw error;
  }
}

export async function deleteData(endpoint, requestHeaders) {
//   const headers = requestHeaders;

  try {
    const response = await axios.delete(BASE_URL + endpoint, {
      headers: requestHeaders,
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting data:", error);
  }
}

export async function putData(endpoint, requestBody, requestHeaders={}) {
  try {
    const response = await axios.put(BASE_URL + endpoint, requestBody, {
      headers: requestHeaders,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating data:", error);
  }
}
