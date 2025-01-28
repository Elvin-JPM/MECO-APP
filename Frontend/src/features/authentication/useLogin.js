import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { login as loginApi } from "../../services/postRequests";

function useLogin(onSuccessCallback, handleIsLoggin) {
  const queryClient = useQueryClient();
  const { mutate: login, isLoading: isAuthenticating } = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["login"] });

      if (onSuccessCallback) {
        onSuccessCallback(data);
      }
    },
    onError: (err) => {
      console.log("error at custom hook", err);
      toast.error(
        err?.response?.data?.error?.lde_message ||
          err?.response?.data?.error ||
          err.message ||
          "Login failed"
      );
      //handleIsLoggin();
    },
  });

  return { isAuthenticating, login };
}

export default useLogin;
