"use client";

import React from "react";
import { domAnimation, LazyMotion, m } from "framer-motion";

import MultistepSidebar from "./multistep-sidebar";
import SignUpForm from "./signup-form";
import CompanyInformationForm from "./company-information-form";
import ChooseAddressForm from "./choose-address-form";
import ReviewAndPaymentForm from "./review-and-payment-form";
import MultistepNavigationButtons from "./multistep-navigation-buttons";
import InformationsPolicy from "./informations-policy";
import { Checkbox } from "@nextui-org/react";

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

export default function Component() {
  const [[page, direction], setPage] = React.useState([0, 0]);
  const [isCheckboxChecked, setIsCheckboxChecked] = React.useState(false);

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

  const content = React.useMemo(() => {
    let component = <InformationsPolicy />;

    switch (page) {
      case 1:
        component = <InformationsPolicy />;
      case 2:
        component = <CompanyInformationForm />;
        break;
      case 3:
        component = <ChooseAddressForm />;
        break;
      case 4:
        component = <ReviewAndPaymentForm />;
        break;
      case 5:
        component = <SignUpForm />;
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
    >
      <div className="relative flex h-fit w-full flex-col pt-6 text-center  lg:justify-center lg:pt-0">
        {content}
        {page === 0 && (
          <div className="mt-4">
            <Checkbox
              defaultSelected={isCheckboxChecked}
              color="secondary"
              onChange={handleCheckboxChange}
            >
              Souhlasím se zpracováním osobních údajů.
            </Checkbox>
          </div>
        )}

        <MultistepNavigationButtons
          color="secondary"
          backButtonProps={{
            isDisabled: page === 0,
            hidden: page === 0,
            className: "w-32",
          }}
          nextButtonProps={{
            children: "Pokračovat",
            isDisabled: !isCheckboxChecked || page === 8,
            className: "w-32",
          }}
          onBack={onBack}
          onNext={onNext}
        />
      </div>
    </MultistepSidebar>
  );
}
