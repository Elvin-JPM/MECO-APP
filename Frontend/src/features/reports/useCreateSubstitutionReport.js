import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createSubstitutionReport as createSubstitutionReportApi } from "../../services/postRequests";

function useCreateSubstitutionReport() {
  const queryClient = useQueryClient();
  const { mutate: createSubstitutionReport, isLoading: isCreating } = useMutation({
    mutationFn: createSubstitutionReportApi,
    onSuccess: () =>
    {
      toast.success("Substitution report created successfully");
      // Invalidate the substitution query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["substitution"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isCreating, createSubstitutionReport };
}

export default useCreateSubstitutionReport;
