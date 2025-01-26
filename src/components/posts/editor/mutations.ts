import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { submitPost } from "./actions";

export function useSubmitPostMutation() {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: submitPost,
    onSuccess: () => {},
    onError: (error) => {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to post. Please try again.",
      });
    },
  });
  return mutation;
}
