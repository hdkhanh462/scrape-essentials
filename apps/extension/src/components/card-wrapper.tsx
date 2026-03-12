import { Activity } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function CardWrapper({
  title,
  description,
  children,
  footer,
}: Props) {
  return (
    <Card className="w-full border-0">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <Activity mode={description ? "visible" : "hidden"}>
          <CardDescription>{description}</CardDescription>
        </Activity>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
