"use client";

import Image from "next/image";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import PendingLook from "@/components/pending-look";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { toast } from "react-toastify";
import ImageCropper from "@/components/helpers/ImageCropper";
import PencilIcon from "@/components/my-icons/PencilIcon";

interface UpdatePhotoInfoProps {
  id: string;
  firstName: string;
  secondName: string;
  photo: string;
}
interface UploadHandlerInfoProps {
  bigPhoto: string;
  smallPhoto: string;
}

export default function UpdatePhoto({
  id,
  photo,
  firstName,
  secondName,
}: UpdatePhotoInfoProps) {
  const info: UpdatePhotoInfoProps = {
    id: id,
    firstName: firstName,
    secondName: secondName,
    photo: `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${photo}`,
  };
  
  const { pending } = useFormStatus();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [picture, setPicture] = useState(
  `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${photo}`
  );
  const uploadHandler = async (data: UploadHandlerInfoProps) => {
    toast.info("Nahrávám fotografii.", {
      autoClose: 2000,
      hideProgressBar: false,
      theme: "dark",
    });

    // upravit z api na server action
    onOpenChange();
    const dataToSend = {
      smallPhoto: data.smallPhoto,
      bigPhoto: data.bigPhoto,
      ...info,
    };
    const result = await fetch("/api/saveImage", {
      method: "POST",
      body: JSON.stringify({ dataToSend }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    toast.dismiss();
    if (result.status === 200) {
      setTimeout(() => {
        toast.success("Fotografie uložena.", {
          autoClose: 2000,
          hideProgressBar: true,
          theme: "dark",
        });
      }, 1000);
      setPicture(data.smallPhoto);
    } else {
      const text = await result.text();
      toast.warn(`${text}`, {
        autoClose: 5000,
        hideProgressBar: true,
        theme: "dark",
        });
    }
  };
  // const uploadHandler = async (data: UploadHandlerInfoProps) => {
  //   toast.info("Nahrávám fotografii.", {
  //     autoClose: 2000,
  //     hideProgressBar: false,
  //     theme: "dark",
  //   });

  //   // upravit z api na server action
  //   onOpenChange();
  //   const dataToSend = {
  //     smallPhoto: data.smallPhoto,
  //     bigPhoto: data.bigPhoto,
  //     ...info,
  //   };
    
  //   const result = await fetch("/api/saveImage", {
  //     method: "POST",
  //     body: JSON.stringify({ dataToSend }),
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   });
  //   toast.dismiss();
  //   if (result.status === 200) {
  //     setTimeout(() => {
  //       toast.success("Fotografie uložena.", {
  //         autoClose: 2000,
  //         hideProgressBar: true,
  //         theme: "dark",
  //       });
  //     }, 1000);
  //     setPicture(data.smallPhoto);
  //   } else {
  //     const text = await result.text();
  //     toast.warn(`${text}`, {
  //       autoClose: 5000,
  //       hideProgressBar: true,
  //       theme: "dark",
  //       });
  //   }
  // };

  return (
    <div className="inline-flex -ml-1 -mt-1 mb-2 sm:mb-0">
      <form>
        <div className="flex flex-col items-center md:flex-row md:items-center relative">
          <div>
            <div className="relative">
              <Button
                isIconOnly
                color="secondary"
                variant="faded"
                aria-label="Take a photo"
                className="absolute -bottom-5 left-0 right-0 m-auto w-fit p-[.35rem] rounded-full bg-[linear-gradient(135deg,var(--tw-gradient-stops))] from-violet-500/[0.8] dark:from-violet-500/[0.95] to-violet-500/[0.34] hover:bg-gray-700 border border-gray-600"
                title="Change photo"
                onPress={onOpen}
              >
                <PencilIcon className="text-slate-200"/>
              </Button>
              <div className="rounded-full border-2 border-[linear-gradient(135deg,var(--tw-gradient-stops))] from-violet-500/[0.8] dark:from-violet-500/[0.95] to-violet-500/[0.34] z-10">
                <PendingLook className="w-32 h-32 flex items-center justify-center bg-white text-slate-200 dark:bg-slate-900 rounded-full z-20">
                  <Image
                    className="rounded-full z-20"
                    src={picture}
                    width={128}
                    height={128}
                    style={{ width: "128px", height: "128px" }}
                    alt="Avatar"
                  />
                </PendingLook>
                <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                  <ModalContent className="overflow-y-auto max-h-screen scrollbar-hide   bg-white dark:bg-slate-800 shadow-lg rounded-lg border border-slate-200 dark:border-slate-700">
                    {(onClose) => (
                      <>
                        <ModalHeader className="flex flex-col gap-1">
                          Změnit fotografii
                        </ModalHeader>
                        <ModalBody>
                          <ImageCropper
                            uploadHandler={uploadHandler}
                            // info={info}
                          />
                        </ModalBody>
                        <ModalFooter>
                          <Button
                            color="secondary"
                            variant="light"
                            onPress={onClose}
                          >
                            Zavřít
                          </Button>
                        </ModalFooter>
                      </>
                    )}
                  </ModalContent>
                </Modal>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
