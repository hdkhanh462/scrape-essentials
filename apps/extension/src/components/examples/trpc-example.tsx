import { Activity, useRef, useState } from "react";
import CardWrapper from "@/components/card-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

export default function TRPCExample() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onOpenNewTab = async () => {
    setErrorMessage(null);
    const url = inputRef.current!.value;
    try {
      await trpc.openNewTab.mutate({ url });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  };

  return (
    <CardWrapper
      title="tRPC Example"
      footer={<Button onClick={onOpenNewTab}>Open new tab</Button>}
    >
      <Input ref={inputRef} placeholder={"Enter a URL..."} />
      <Activity mode={errorMessage ? "visible" : "hidden"}>
        <p className="text-red-500">{errorMessage}</p>
      </Activity>
    </CardWrapper>
  );
}
