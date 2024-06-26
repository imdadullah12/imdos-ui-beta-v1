import React from "react";
import Form from "./form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
} from "@/components/imdos-ui/dialog";

import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react";

import { useImdosUI } from "@/providers/ImdosProvider";
import clsx from "clsx";

const FormModal = ({ title, description, form }) => {
  const { formModal, setFormModal } = useImdosUI();

  return (
    <Modal
      backdrop={"blur"}
      className={clsx(
        "dark:bg-zinc-950 border pb-3 m-0",
        form?.layout?.size == "full" && "rounded-none overflow-y-auto"
      )}
      isOpen={formModal.show}
      isDismissable={false}
      placement={form?.layout?.position ?? "center"}
      size={form?.layout?.size ?? ""}
      onClose={() => setFormModal({ show: false })}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex bg-zinc-100 dark:bg-zinc-900 flex-col gap-1">
              {title}
            </ModalHeader>
            <ModalBody>
              <Form
                fields={form.fields}
                schema={form.schema}
                onSubmit={form.onSubmit}
                layout={form.layout ?? {}}
                onCancel={() => {
                  setFormModal({ show: false });
                }}
              />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
  return (
    <Dialog
      open={formModal.show}
      onOpenChange={() => setFormModal({ show: false })}
    >
      <DialogOverlay>
        <DialogContent className="max-h-[calc(100vh-40px)] overflow-y-scroll no-scrollbar">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <Form
            fields={form.fields}
            schema={form.schema}
            onSubmit={form.onSubmit}
            onCancel={() => {
              setFormModal({ show: false });
            }}
          />
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
};

export default FormModal;
