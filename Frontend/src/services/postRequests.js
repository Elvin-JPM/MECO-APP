import { postData } from "./api";

export async function createMeter(newMeter)
{
    const response = await postData("/newMeter", newMeter, {
      // Authorization: `${token}`,
      "Content-Type": "multipart/form-data",
    });
    return response;
}