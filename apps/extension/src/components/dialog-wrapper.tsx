import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type DialogWrapperProps = {
  title: string;
  description?: string;
  trigger?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

type Props = Omit<React.ComponentProps<typeof Dialog>, "children"> &
  DialogWrapperProps & { children?: React.ReactNode };

export const DialogWrapper: React.FC<Props> = (props) => {
  const { title, description, trigger, children, footer, className, ...rest } =
    props;

  return (
    <Dialog {...rest}>
      {trigger && <DialogTrigger render={trigger as React.ReactElement} />}
      <DialogContent className={className} aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
};
