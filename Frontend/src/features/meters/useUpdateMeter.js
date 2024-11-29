import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateMeter as updateMeterApi} from "../../services/updateRequests";

function useUpdateMeter() {
  const queryClient = useQueryClient();
  const { mutate: updateMeter, isLoading: isUpdating } = useMutation({
    mutationFn: updateMeterApi,
    onSuccess: () => {
      toast.success("Medidor editado exitosamente!");
      queryClient.invalidateQueries({ queryKey: ["meters"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isUpdating, updateMeter };
}

export default useUpdateMeter;
