import axios from "axios";

const BASE_URL = import.meta.env.VITE_APP_URL;
axios.defaults.timeout = 50000;
axios.defaults.withCredentials = true;

// Add a request interceptor to include the access token in headers
axios.interceptors.request.use(
  (config) => {
    // You can add the access token to headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
let isRefreshing = false; // Flag to prevent multiple refresh attempts

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is due to an expired token and ensure we only attempt to refresh once
    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isRefreshing
    ) {
      console.log("Attempting to refresh token...");
      originalRequest._retry = true; // Mark the request as retried
      isRefreshing = true; // Set the flag to prevent other refresh attempts

      try {
        // Attempt to refresh the token
        const refreshResponse = await axios.post(
          `${BASE_URL}/refresh-token`,
          {},
          { withCredentials: true }
        );

        // Log the refresh response for debugging
        console.log("Token refresh successful:", refreshResponse);

        // Retry the original request with the new token
        const retryResponse = await axios(originalRequest);
        console.log("Original request retried successfully:", retryResponse);

        // Dispatch a custom event to trigger re-fetch of user data
        console.log("Dispatching tokenRefreshed event...");
        window.dispatchEvent(new Event("tokenRefreshed"));

        return retryResponse;
      } catch (refreshError) {
        console.error("Error refreshing token:", refreshError);

        // Redirect to login page if token refresh fails
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false; // Reset the flag
      }
    }

    // For other errors, reject the promise
    return Promise.reject(error);
  }
);

export async function postData(endpoint, requestBody = {}, headers = {}) {
  try {
    const response = await axios.post(BASE_URL + endpoint, requestBody, {
      headers: headers,
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error posting data:", error);
    throw error;
  }
}

export async function getData(endpoint, requestHeaders = {}, queryParams = {}) {
  try {
    console.log("Data received at getData: ", requestHeaders);
    const response = await axios.get(BASE_URL + endpoint, {
      headers: requestHeaders,
      params: queryParams,
      withCredentials: true,
    });
    console.log("response at getData: ", response);
    return response.data;
  } catch (error) {
    console.error("Error getting data:", error);
    throw error;
  }
}

export async function deleteData(endpoint, requestHeaders = {}) {
  try {
    const response = await axios.delete(BASE_URL + endpoint, {
      headers: requestHeaders,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting data:", error);
    throw error;
  }
}

export async function putData(endpoint, requestBody, requestHeaders = {}) {
  try {
    const response = await axios.put(BASE_URL + endpoint, requestBody, {
      headers: requestHeaders,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating data:", error);
    throw error;
  }
}
