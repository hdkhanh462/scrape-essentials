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
    <Card
      className={cn(
        "relative h-full min-h-0 w-full overflow-hidden border-0",
        className,
      )}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <Activity mode={description ? "visible" : "hidden"}>
          <CardDescription>{description}</CardDescription>
        </Activity>
      </CardHeader>
      <CardContent
        className={cn(
          "min-h-0",
          footerFixedBottom && "flex-1 overflow-y-scroll pb-28",
        )}
      >
        {children}
      </CardContent>
      {footer && (
        <CardFooter
          className={cn(
            footerFixedBottom &&
              "absolute right-0 bottom-0 left-0 z-10 border-t bg-muted",
          )}
        >
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
