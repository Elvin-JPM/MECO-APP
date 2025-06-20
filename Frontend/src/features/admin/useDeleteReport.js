import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteReport as deleteReportApi } from "../../services/deleteRequests";
function useDeleteReport() {
  const queryClient = useQueryClient();
  const { mutate: deleteReport, isLoading: isDeleting } = useMutation({
    mutationFn: deleteReportApi,
    onSuccess: () => {
      toast.success("Reporte eliminado correctamente!");
      // Invalidate the substitution query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["substitutionReports"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isDeleting, deleteReport };
}

export default useDeleteReport;
