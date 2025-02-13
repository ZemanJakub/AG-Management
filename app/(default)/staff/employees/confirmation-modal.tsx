import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";

interface ConfirmationModalProps {
  onConfirm: () => void;
  openModal: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  openModal,  
  onConfirm
  
}) => {

  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  useEffect(() => {
    if(openModal){
      onOpen();
    }
  }, [openModal]);

  const handleConfirm = () => {
    onConfirm();
    onOpenChange();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onOpenChange}>
        <ModalContent>
          <ModalHeader>Potvrzení smazání</ModalHeader>
          <ModalBody>
            Opravdu chcete smazat vybrané  záznamy? Tato akce je nevratná.
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onPress={onOpenChange}>
              Zrušit
            </Button>
            <Button color="danger" onPress={handleConfirm}>
              Smazat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ConfirmationModal;