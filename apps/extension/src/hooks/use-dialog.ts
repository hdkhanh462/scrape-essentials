import { useState } from "react";

export const useDialog = () => {
  const [isOpen, setIsDialogOpen] = useState(false);

  const open = () => setIsDialogOpen(true);
  const close = () => setIsDialogOpen(false);
  const onChange = (open: boolean) => setIsDialogOpen(open);

  return { isOpen, open, close, onChange };
};
