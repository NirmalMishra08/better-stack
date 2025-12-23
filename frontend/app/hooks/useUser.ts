import { fetchCurrentUser } from "@/lib/firebaseAuth";
import { useQuery } from "@tanstack/react-query";
import { User } from "firebase/auth";


export function useUser() {
    return useQuery<User | null>({
        queryKey: ["user"],
        queryFn: async () => await fetchCurrentUser() as Promise<User | null>,
        staleTime: Infinity,
        gcTime: Infinity
    })
}