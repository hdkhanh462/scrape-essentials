import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type DialogWrapperProps = React.PropsWithChildren & {
  title: string;
  open?: boolean;
  trigger?: React.ReactNode;
  footer?: React.ReactNode;
  description?: string;
  onOpenChange?(open: boolean): void;
};

export default function DialogWrapper({
  title,
  open,
  trigger,
  footer,
  description,
  children,
  onOpenChange,
}: DialogWrapperProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger}
      <DialogContent
        className="max-h-[90vh] overflow-y-auto"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
