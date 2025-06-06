import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { editSubstitution as editSubstitutionApi } from "../../services/updateRequests";
function useEditSubstitution() {
  const queryClient = useQueryClient();
  const { mutate: editSubstitutionReport, isLoading: isEditing } =
    useMutation({
      mutationFn: editSubstitutionApi,
      onSuccess: () => {
        toast.success("Substitution report edited successfully");
        // Invalidate the substitution query to refresh the data
        queryClient.invalidateQueries({ queryKey: ["substitution"] });
      },
      onError: (err) => toast.error(err.message),
    });

  return { isEditing, editSubstitutionReport };
}

export default useEditSubstitution;
