import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { approveReport as approveReportApi } from "../../services/updateRequests";
function useApproveReport() {
  const queryClient = useQueryClient();
  const { mutate: approveReport, isLoading: isApproving } = useMutation({
    mutationFn: approveReportApi,
    onSuccess: () => {
      toast.success("Reporte aprobado correctamente!");
      // Invalidate the substitution query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["substitutionReports"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isApproving, approveReport };
}

export default useApproveReport;
