"use client";

import { useFormStatus } from "react-dom";
import { type ComponentProps } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";

type Props = ComponentProps<"button"> & {
  pendingText?: string;
};

export function SubmitButton({ children, pendingText, ...props }: Props) {
  const { pending, action } = useFormStatus();

  const isPending = pending && action === props.formAction;

  return (
    <Button
      {...props}
      type="submit"
      disabled={isPending}
      aria-disabled={isPending}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {pendingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
