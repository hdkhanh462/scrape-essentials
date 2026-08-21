import type { DialogWrapperProps } from "@/components/dialog-wrapper";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type Props = Omit<React.ComponentProps<typeof Sheet>, "children"> &
  DialogWrapperProps & { children?: React.ReactNode };

export const SheetWrapper: React.FC<Props> = (props) => {
  const { title, description, trigger, children, footer, className, ...rest } =
    props;

  return (
    <Sheet {...rest}>
      {trigger && <SheetTrigger render={trigger as React.ReactElement} />}
      <SheetContent
        className={cn("min-w-lg overflow-y-auto", className)}
        aria-describedby={undefined}
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        {children}
        {footer && <SheetFooter>{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  );
};
