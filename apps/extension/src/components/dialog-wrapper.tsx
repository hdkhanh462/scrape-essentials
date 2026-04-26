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

type Props = React.ComponentProps<typeof Dialog> & DialogWrapperProps;

export const DialogWrapper: React.FC<Props> = (props) => {
  const { title, description, trigger, children, footer, className, ...rest } =
    props;

  return (
    <Dialog {...rest}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
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
