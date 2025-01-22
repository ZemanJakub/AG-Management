"use client";

import React, { useEffect, useState } from "react";
import { domAnimation, LazyMotion, m } from "framer-motion";

import MultistepSidebar from "./multistep-sidebar";
import ChooseAddressForm from "./choose-address-form";
import ReviewAndPaymentForm from "./review-and-payment-form";
import MultistepNavigationButtons from "./multistep-navigation-buttons";
import InformationsPolicy from "./informations-policy";
import { Checkbox } from "@nextui-org/react";
import PersonalTeam from "./personal-team";
import BasicFormPage from "./basic-form";
import { toast } from "react-toastify";
import { Management } from "./types";
import PersonalFormPage from "./personal-form";
import PreferencesFormPage from "./preferences-form";
import { fetchEmployeePersonalInformations } from "@/db/queries/employees";

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
}

export default function PageComponent({newEmployeeFormPersonalInformationsHeading,newEmployeeFormBasicInformations,newEmployeeFormDataAgreement,newEmployeeFormDataAgreementHeading,management,newEmployeePersonalTeamHeading,newEmployeePersonalTeamMainHeading,newEmployeePersonalTeamFooter,newEmployeeFormPreferencesHeading}: PageComponentProps) {
  const [[page, direction], setPage] = React.useState([0, 0]);
  const [isCheckboxChecked, setIsCheckboxChecked] = React.useState(false);
  const [savedId, setSavedId] = useState("")
  const [personalInformations, setPersonalInformations] = useState<
  Record<string, any> | null
>(null); // Stav pro data

  interface CheckboxChangeEvent {
    target: {
      checked: boolean;
    };
  }

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

  const onNextWithId = React.useCallback((savedId:string) => {
    setSavedId(savedId)
    paginate(1);
  }, [paginate]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (savedId) {
  //       try {
  //         console.log(savedId, "savedId");
  //         const savedData = await fetchEmployeePersonalInformations(savedId);
  //         console.log(savedData, "savedData");
  //         setPersonalInformations(savedData); // Nastavení dat do stavu
  //       } catch (error) {
  //         console.error("Failed to fetch data:", error);
  //         setPersonalInformations(null); // Nastavte na `null` v případě chyby
  //       }
  //     }
  //   };
  //   fetchData();
  // }, [savedId]);

  useEffect(() => {
  const fetchData = async () => {
      try {
        const savedData = await fetchEmployeePersonalInformations("b8a42eb8-bfc4-4b73-9b7c-4eb1be45cf41");
        console.log(savedData, "savedData");
        setPersonalInformations(savedData); // Nastavení dat do stavu
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setPersonalInformations(null); // Nastavte na `null` v případě chyby
      }
  };
  fetchData();

}, []);



  const content = React.useMemo(() => {
    let component = <InformationsPolicy newEmployeeFormDataAgreement={newEmployeeFormDataAgreement} newEmployeeFormDataAgreementHeading={newEmployeeFormDataAgreementHeading}/>;

    switch (page) {
      case 1:
        component = <PersonalTeam management={management} newEmployeePersonalTeamHeading={newEmployeePersonalTeamHeading} newEmployeePersonalTeamFooter={newEmployeePersonalTeamFooter}newEmployeePersonalTeamMainHeading={newEmployeePersonalTeamMainHeading}/>;
        break;
      case 2:
        component = <BasicFormPage nextStep={onNextWithId}  onBack={onBack} newEmployeeFormBasicInformations={newEmployeeFormBasicInformations} employyeeId={savedId} />;
        break;
      case 6:
        component = <PreferencesFormPage nextStep={onNext}  onBack={onBack} newEmployeeFormPreferencesHeading={newEmployeeFormPreferencesHeading} employyeeId={"b8a42eb8-bfc4-4b73-9b7c-4eb1be45cf41"}/>;
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
      <div className="relative flex h-fit w-full flex-col pt-6 text-center  lg:justify-center lg:pt-0" id="content">
        {content}
        {page === 0 && (
          <div className="mt-4">
            <Checkbox
              defaultSelected={isCheckboxChecked}
              color="secondary"
              onChange={()=>{
                handleCheckboxChange( {target: {checked: !isCheckboxChecked}})
                toast.dismiss()
              }}
            >
              <p className="text-gray-700 dark:text-gray-200">Souhlasím se zpracováním osobních údajů.</p>
            </Checkbox>
          </div>
        )}

        {page!=6 && page!=2 && page!=3 &&<MultistepNavigationButtons
          color="secondary"
            backButtonProps={{
            isDisabled: page === 0,
            className: "w-32",
          }}
          nextButtonProps={{
            children: "Pokračovat",
            isDisabled: !isCheckboxChecked || page === 8,
            className: "w-32",
          }}
          onBack={onBack}
          onNext={onNext}
        />}
      </div>
    </MultistepSidebar>
  );
}