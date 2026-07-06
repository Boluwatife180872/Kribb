import { useUser } from "@clerk/expo";
import { useEffect } from "react";
import { useUserStore } from "../store/userStore";
import { useSupabase } from "./useSupabase";

export const useUserSync = () => {
  const { user } = useUser();
  const setIsAdmin = useUserStore((state) => state.setIsAdmin);
  const authSupabase = useSupabase();

  useEffect(() => {
    if (!user) return;
    syncUser();
  }, [user]);

  const syncUser = async () => {
    try {
      // Use maybeSingle to avoid PGRST116 error when the user doesn't exist yet
      const { data, error } = await authSupabase
        .from("users")
        .select("clerk_id, is_admin")
        .eq("clerk_id", user!.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user:", error);
        throw error;
      }

      if (data) {
        setIsAdmin(data.is_admin ?? false);
        return;
      }

      const { data: newUser, error: insertError } = await authSupabase
        .from("users")
        .insert({
          clerk_id: user!.id,
          email: user!.emailAddresses[0].emailAddress,
          first_name: user!.firstName,
          last_name: user!.lastName,
          avatar_url: user!.imageUrl,
        })
        .select("is_admin")
        .single();

      if (insertError) {
        console.error("Error inserting new user:", insertError);
        throw insertError;
      }

      setIsAdmin(newUser?.is_admin ?? false);
    } catch (err) {
      console.error("Error in syncUser:", err);
      setIsAdmin(false);
    }
  };
};
