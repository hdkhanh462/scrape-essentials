import { Activity } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  footerFixedBottom?: boolean;
  className?: string;
};

export default function CardWrapper({
  title,
  description,
  children,
  footer,
  footerFixedBottom,
  className,
}: Props) {
  return (
    <Card className={cn("w-full border-0", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <Activity mode={description ? "visible" : "hidden"}>
          <CardDescription>{description}</CardDescription>
        </Activity>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && (
        <CardFooter
          className={cn(
            footerFixedBottom && "fixed right-0 bottom-0 left-0 border-t",
          )}
        >
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
