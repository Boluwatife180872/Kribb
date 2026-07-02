import { useUser } from "@clerk/expo"
import { useUserStore } from "../store/userStore";

export const useUserSync = () => {
    const { } = useUser()
    const setIsAdmin = useUserStore((state) => state.setIsAdmin);
}