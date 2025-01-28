import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { loginProtected as loginProtectedApi } from "../../services/getRequests";

function useLoginProtected(onSuccessProtectedLoginCallback) {
  const queryClient = useQueryClient();
  const { mutate: loginProtected, isLoading: isLoginProtected } = useMutation({
    mutationFn: loginProtectedApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["loginProtected"] });

      if (onSuccessProtectedLoginCallback) {
        onSuccessProtectedLoginCallback(data);
      }
      toast.success("Ingreso exitoso!");
    },
    onError: (err) => toast.error("Ocurrió un error!"),
  });

  return { isLoginProtected, loginProtected };
}

export default useLoginProtected;
