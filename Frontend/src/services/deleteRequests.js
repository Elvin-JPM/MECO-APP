import { deleteData } from "./api";

export const deleteReport = (id) => {
  return deleteData(`/reports/${id}`);
};
