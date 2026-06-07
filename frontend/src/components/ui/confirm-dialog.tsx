"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "./button";
import { Modal } from "./modal";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" icon={<AlertTriangle size={16} />} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {message}
    </Modal>
  );
}
