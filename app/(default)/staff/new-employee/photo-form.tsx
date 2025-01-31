"use client";

import React, { useActionState, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { fetchEmployeeBasicInformations } from "@/db/queries/employees";
import { Button, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import { startsWith } from "lodash";
import { uploadPhoto } from "@/actions";
import Form from "next/form";
import UpdatePhotoComponent from "./update-photo-component";
import { Management } from "./types";

interface Props {
  nextStep: () => void;
  onBack: () => void;
  newEmployeeFormPhotoInformations: string;
  employeeId?: string;
  management: Management[];
}

const PhotoFormPage = React.forwardRef<HTMLFormElement, Props>(
  (
    { nextStep, newEmployeeFormPhotoInformations, onBack, employeeId,management },
    ref
  ) => {
    const [newAvatar, setNewAvatar] = useState<string>("");
    const { data: employeeBasicData, error: employeeError } = useSWR(
      employeeId ? employeeId : null,
      fetchEmployeeBasicInformations
    );
    const formRef = useRef<HTMLFormElement>(null);

    const [state, uploadPhotoAction, isPending] = useActionState(uploadPhoto, {
      success: false,
      errors: "",
    });
    const background = "--heroui-background";
    const linearGradientBg = startsWith(background, "--")
      ? `hsl(var(${background}))`
      : background;

    const style = {
      border: "solid 2px transparent",
      backgroundImage: `linear-gradient(${linearGradientBg}, ${linearGradientBg}), linear-gradient(to right, #4051a0, #9353D3)`,
      backgroundOrigin: "border-box",
      backgroundClip: "padding-box, border-box",
    };

    useEffect(() => {
      if (state?.success) {
        toast.dismiss();
        toast.success("Data byla v pořádku uložena.", {
          autoClose: 2000,
          hideProgressBar: true,
          theme: "dark",
        });
        nextStep();
      }
      if (!state?.success && state?.errors !== "") {
        toast.dismiss();
        toast.error(state?.errors ?? "Data se nepodařilo uložit", {
          autoClose: 2000,
          hideProgressBar: true,
          theme: "dark",
        });
      }
    }, [state?.success, state?.errors]);

    if (isPending) {
      return (
        <>
          <div className="text-3xl font-bold leading-9 text-default-foreground">
            Fotografie 👋
          </div>
          <div className="flex w-full justify-center gap-2 mt-6">
            <h2 className="text-large text-default-500 mb-8">
              {newEmployeeFormPhotoInformations}
            </h2>
          </div>
          <div className="flex items-center justify-center">
            <Spinner color="secondary" label="Nahrávám data..." size="lg" />
          </div>
        </>
      );
    }
    if (employeeId === undefined || employeeId === null || employeeId === "" || !employeeBasicData?.photo) {
      return (
        <>
          <div className="text-3xl font-bold leading-9 text-default-foreground">
            Fotografie 👋
          </div>
          <div className="flex w-full justify-center gap-2 mt-6">
            <h2 className="text-large text-default-500 mb-8">
              {newEmployeeFormPhotoInformations}
            </h2>
          </div>
          <div className="flex items-center justify-center">
            <Spinner color="secondary" label="Nahrávám data..." size="lg" />
          </div>
        </>
      );
    }

    return (
      <>
        <div className="text-3xl font-bold leading-9 text-default-foreground">
          Fotografie 👋
        </div>
        <div className="py-2 text-medium text-default-500">
          <div className="flex w-full justify-center gap-2 mt-6">
            <h2 className="text-large text-default-500 mb-8">
              {newEmployeeFormPhotoInformations}
            </h2>
          </div>
          <div
            className={`grow  flex flex-col md:translate-x-0 transition-transform duration-300 ease-in-out translate-x-0`}
          >
            <div className="relative h-80 w-full  rounded-full mt-12 mb-12">
              <div className="absolute inset-0 flex items-center justify-center">
                <UpdatePhotoComponent
                  photo={
                    employeeBasicData?.photo ??
                    `699729d7-e5fb-48e8-930c-6510fc06eb03`
                  }
                  setUpdatedAvatarAction={(newAvatar: string) =>
                    setNewAvatar(newAvatar)
                  }
                  management={management} 
                />
              </div>
            </div>
          </div>
          <Form action={uploadPhotoAction}>
            <input type="hidden" name="photo" value={newAvatar || ""} />
            <input type="hidden" name="id" value={employeeId || ""} />
            <input
              type="hidden"
              name="firstName"
              value={employeeBasicData?.firstName || ""}
            />
            <input
              type="hidden"
              name="secondName"
              value={employeeBasicData?.secondName || ""}
            />
            <div className="mx-auto my-6 flex w-full items-center justify-center gap-x-4 lg:mx-0  mt-16">
              <Button
                className="rounded-medium border-default-200 text-medium font-medium text-default-500 w-32"
                variant="bordered"
                onPress={onBack}
              >
                <Icon icon="solar:arrow-left-outline" width={24} />
                Zpět
              </Button>

              <Button
                className="text-medium font-medium"
                type="submit"
                onPress={() => {
                  formRef.current?.requestSubmit(); // Ruční odeslání formuláře
                  toast.info("Ukládám data...", {
                    autoClose: 8000,
                    hideProgressBar: false,
                    theme: "dark",
                  });
                }}
                style={style}
              >
                Pokračovat
              </Button>
            </div>
          </Form>
        </div>
      </>
    );
  }
);

PhotoFormPage.displayName = "BasicForm";

export default PhotoFormPage;
