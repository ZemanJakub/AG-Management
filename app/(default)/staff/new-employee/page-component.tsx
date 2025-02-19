"use client";

import React, { useState } from "react";
import { domAnimation, LazyMotion, m } from "framer-motion";

import MultistepSidebar from "./multistep-sidebar";
import MultistepNavigationButtons from "./multistep-navigation-buttons";
import InformationsPolicy from "./informations-policy";
import {
  Checkbox,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import PersonalTeam from "./personal-team";
import BasicFormPage from "./basic-form";
import { toast } from "react-toastify";
import { Management } from "./types";
import PreferencesFormPage from "./preferences-form";
import HealthFormPage from "./health-form-page";
import QualificationFormPage from "./qualification-form-page";
import CommitmentFormPage from "./commitment-form-page";
import HowDidYouFindUsFormPage from "./how-you-find-us-form-page";
import PhotoFormPage from "./photo-form";
import { on } from "events";

const variants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 30 : -30,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    y: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    y: direction < 0 ? 30 : -30,
    opacity: 0,
  }),
};

interface PageComponentProps {
  newEmployeeFormBasicInformations: string;
  newEmployeeFormDataAgreement: string;
  newEmployeeFormDataAgreementHeading: string;
  management: Management[];
  newEmployeePersonalTeamHeading: string;
  newEmployeePersonalTeamMainHeading: string;
  newEmployeePersonalTeamFooter: string;
  newEmployeeFormPersonalInformationsHeading: string;
  newEmployeeFormPreferencesHeading: string;
  newEmployeeFormHealthHeading: string;
  newEmployeeFormQualificationHeading: string;
  newEmployeeFormCommitmentHeading: string;
  newEmployeeFormHowDidYouFindUsHeading: string;
  newEmployeeFormPhotoInformations: string;
}
interface CheckboxChangeEvent {
  target: {
    checked: boolean;
  };
}
export default function PageComponent({
  newEmployeeFormPersonalInformationsHeading,
  newEmployeeFormBasicInformations,
  newEmployeeFormDataAgreement,
  newEmployeeFormDataAgreementHeading,
  management,
  newEmployeePersonalTeamHeading,
  newEmployeePersonalTeamMainHeading,
  newEmployeePersonalTeamFooter,
  newEmployeeFormPreferencesHeading,
  newEmployeeFormHealthHeading,
  newEmployeeFormQualificationHeading,
  newEmployeeFormCommitmentHeading,
  newEmployeeFormHowDidYouFindUsHeading,
  newEmployeeFormPhotoInformations,
}: PageComponentProps) {
  const [[page, direction], setPage] = React.useState([0, 0]);
  const [isCheckboxChecked, setIsCheckboxChecked] = React.useState(false);
  const [savedId, setSavedId] = useState("");
  const {isOpen, onOpen, onOpenChange} = useDisclosure();


  const handleCheckboxChange = (event: CheckboxChangeEvent) => {
    setIsCheckboxChecked(event.target.checked);
  };

  const paginate = React.useCallback((newDirection: number) => {
    setPage((prev) => {
      const nextPage = prev[0] + newDirection;

      if (nextPage < 0 || nextPage > 10) return prev;

      return [nextPage, newDirection];
    });
  }, []);

  const onChangePage = React.useCallback((newPage: number) => {
    setPage((prev) => {
      if (newPage < 0 || newPage > 10) return prev;
      const currentPage = prev[0];

      return [newPage, newPage > currentPage ? 1 : -1];
    });
  }, []);

  const onBack = React.useCallback(() => {
    paginate(-1);
  }, [paginate]);

  const onNext = React.useCallback(() => {
    paginate(1);
  }, [paginate]);

  const onNextWithId = React.useCallback(
    (savedId: string) => {
      setSavedId(savedId);
      paginate(1);
    },
    [paginate]
  );

  const onEnd = React.useCallback(() => {
    if (page >= 8) {
      onOpen(); // Otevře modal, když se dostane na poslední krok
    } else {
      paginate(1); // Jinak posune na další stránku
    }
  }, [page, paginate, onOpen]);

  const content = React.useMemo(() => {
    let component = (
      <InformationsPolicy
        newEmployeeFormDataAgreement={newEmployeeFormDataAgreement}
        newEmployeeFormDataAgreementHeading={
          newEmployeeFormDataAgreementHeading
        }
      />
    );

    switch (page) {
      case 1:
        component = (
          <PersonalTeam
            management={management}
            newEmployeePersonalTeamHeading={newEmployeePersonalTeamHeading}
            newEmployeePersonalTeamFooter={newEmployeePersonalTeamFooter}
            newEmployeePersonalTeamMainHeading={
              newEmployeePersonalTeamMainHeading
            }
          />
        );
        break;
      case 2:
        component = (
          <BasicFormPage
            nextStep={onNextWithId}
            onBack={onBack}
            newEmployeeFormBasicInformations={newEmployeeFormBasicInformations}
            employeeId={savedId}
          />
        );
        break;
      case 3:
        component = (
          <PhotoFormPage
            nextStep={onNext}
            onBack={onBack}
            newEmployeeFormPhotoInformations={newEmployeeFormPhotoInformations}
            employeeId={savedId}
            management={management}
          />
        );
        break;
      case 4:
        component = (
          <QualificationFormPage
            nextStep={onNext}
            onBack={onBack}
            newEmployeeFormQualificationHeading={
              newEmployeeFormQualificationHeading
            }
            employyeeId={savedId}
          />
        );
        break;
      case 5:
        component = (
          <HealthFormPage
            nextStep={onNext}
            onBack={onBack}
            newEmployeeFormHealthHeading={newEmployeeFormHealthHeading}
            employyeeId={savedId}
          />
        );
        break;
      case 6:
        component = (
          <PreferencesFormPage
            nextStep={onNext}
            onBack={onBack}
            newEmployeeFormPreferencesHeading={
              newEmployeeFormPreferencesHeading
            }
            employyeeId={savedId}
          />
        );
        break;
      case 7:
        component = (
          <CommitmentFormPage
            nextStep={onNext}
            onBack={onBack}
            newEmployeeFormCommitmentHeading={newEmployeeFormCommitmentHeading}
            employyeeId={savedId}
          />
        );
        break;
      case 8:
        component = (
          <HowDidYouFindUsFormPage
            nextStep={onEnd}
            onBack={onBack}
            newEmployeeFormHowDidYouFindUsHeading={
              newEmployeeFormHowDidYouFindUsHeading
            }
            employyeeId={savedId}
          />
        );
        break;
    }
    return (
      <LazyMotion features={domAnimation}>
        <m.div
          key={page}
          animate="center"
          className="col-span-12"
          custom={direction}
          exit="exit"
          initial="exit"
          transition={{
            y: {
              ease: "backOut",
              duration: 0.35,
            },
            opacity: { duration: 0.4 },
          }}
          variants={variants}
        >
          {component}
        </m.div>
      </LazyMotion>
    );
  }, [direction, page]);

  return (
    <MultistepSidebar
      currentPage={page}
      onBack={onBack}
      onChangePage={onChangePage}
      onNext={onNext}
      isCheckboxChecked={isCheckboxChecked}
      savedId={savedId}
    >
      <div
        className="relative flex h-fit w-full flex-col pt-6 text-center  lg:justify-center lg:pt-0"
        id="content"
      >
        {content}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="bg-white dark:bg-slate-800 dark:text-slate-200 text-slate-900">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  A to je nyní vše !
                </ModalHeader>
                <ModalBody>
                  <p>
                    Děkujeme za vyplnění formuláře. 
                  </p>
                  <p>
                    Pokud ještě nemáš domluvený pracovní pohovor, brzy se ti ozve někdo z našich personalistů a domluví s tebou termín.
                  </p>
                  <p>
                    Budeme se těšit až tě osobně poznáme a věříme, že naše spolupráce bude dlouhá a oboustranně prospěšná.
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button color="secondary" variant="light" onPress={()=>{
                    setPage([0, 0]);
                    setSavedId("");
                    onClose();
                    setIsCheckboxChecked(false);
                    }}>
                    Zavřít
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {page === 0 && (
          <div className="mt-4">
            <Checkbox
              defaultSelected={isCheckboxChecked}
              color="secondary"
              onChange={() => {
                handleCheckboxChange({
                  target: { checked: !isCheckboxChecked },
                });
                toast.dismiss();
              }}
            >
              <p className="text-gray-700 dark:text-gray-200">
                Souhlasím se zpracováním osobních údajů.
              </p>
            </Checkbox>
          </div>
        )}

        {(page === 0 || page === 1) && (
          <MultistepNavigationButtons
            color="secondary"
            backButtonProps={{
              isDisabled: page === 0,
              className: "w-32",
            }}
            nextButtonProps={{
              children: "Pokračovat",
              isDisabled: !isCheckboxChecked,
              className: "w-32",
            }}
            onBack={onBack}
            onNext={onNext}
          />
        )}
      </div>
    </MultistepSidebar>
  );
}
