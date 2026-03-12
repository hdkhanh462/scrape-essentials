import type { DialogWrapperProps } from "@/components/dialog-wrapper";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function SheetWrapper({
  title,
  open,
  trigger,
  footer,
  description,
  children,
  onOpenChange,
}: DialogWrapperProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger}
      <SheetContent
        className="min-w-lg overflow-y-auto"
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
}
