import { useTranslation } from "react-i18next";
import {
  DialogWrapper,
  type DialogWrapperProps,
} from "@/components/dialog-wrapper";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import type { useDialog } from "@/hooks/use-dialog";

type ActionProps = {
  label?: string;
  className?: string;
  isLoading?: boolean;
  override?: Omit<
    React.ComponentProps<typeof Button>,
    "className" | "onClick" | "children"
  >;
};

type Props = Pick<DialogWrapperProps, "title" | "description"> & {
  control: ReturnType<typeof useDialog>;
  cancelButton?: ActionProps;
  confirmButton?: ActionProps;
  onConfirm: () => void;
  children?: React.ReactNode;
};

export const ConfirmDialog: React.FC<Props> = (props) => {
  const { control, cancelButton, confirmButton, onConfirm, ...rest } = props;

  const { t } = useTranslation();

  return (
    <DialogWrapper
      {...rest}
      open={control.isOpen}
      onOpenChange={control.onChange}
      footer={
        <Field orientation="horizontal">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8"
            {...cancelButton?.override}
            onClick={control.close}
          >
            {cancelButton?.label || t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-8"
            {...confirmButton?.override}
            onClick={onConfirm}
          >
            {confirmButton?.isLoading ? (
              <Loader className="mr-2" isLoading />
            ) : null}
            {confirmButton?.label || t("common.confirm")}
          </Button>
        </Field>
      }
    />
  );
};
