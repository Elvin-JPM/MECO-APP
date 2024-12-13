import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateMeasures as updateMeasuresApi } from "../../services/updateRequests";

function useUpdateMeasures(pageNumber, reportData) {
  const queryClient = useQueryClient();

  const { mutate: updateMeasures, isLoading: isUpdating } = useMutation({
    mutationFn: updateMeasuresApi,
    onMutate: () => {
      toast.loading("Updating measures...", { id: "update-toast" });
    },
    onSuccess: () => {
      toast.dismiss("update-toast");
      toast.success("Mediciones editadas exitosamente!");
      queryClient.invalidateQueries({
        queryKey: ["measures", pageNumber, reportData],
      });
    },
    onError: (err) => {
      toast.dismiss("update-toast");
      toast.error(err.message);
    },
  });

  return { isUpdating, updateMeasures };
}

export default useUpdateMeasures;

