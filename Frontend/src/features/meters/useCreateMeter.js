import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createMeter as createMeterApi } from "../../services/postRequests";

function useCreateMeter()
{
  const queryClient = useQueryClient();
  const { mutate: createMeter, isLoading: isCreating } = useMutation({
    mutationFn: createMeterApi,
    onSuccess: () => {
      toast.success("Medidor creado exitosamente!");
      queryClient.invalidateQueries({ queryKey: ["meters"] });
    },
    onError: (err) => toast.error(err.message),
  });
    
    return {isCreating, createMeter}
}

export default useCreateMeter;
