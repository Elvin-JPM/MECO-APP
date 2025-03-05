import { useQuery } from "@tanstack/react-query";
import { getStatistics } from "../../services/getRequests";

export default function useGetStatistics(queryParams) {
  const { data, isLoading, isError, isSuccess, refetch } = useQuery({
    queryKey: ["statistics", queryParams], // Key as an array of [key, params]
    queryFn: () => getStatistics(queryParams), // Function to fetch data
    enabled: !!queryParams, // This will only run the query if queryParams are provided
    refetchOnWindowFocus: false, // Optional: Disable refetch on window focus
    keepPreviousData: true, // Optional: Keep previous data while fetching new data
  });

  return { data, isLoading, isError, isSuccess, refetch };
}
