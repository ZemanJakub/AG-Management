"use client";

import React from "react";
import { Button } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { cn } from "@nextui-org/react";

import SupportCard from "./support-card";
import VerticalSteps from "./vertical-steps";

import RowSteps from "./row-steps";
import MultistepNavigationButtons from "./multistep-navigation-buttons";

export type MultiStepSidebarProps = React.HTMLAttributes<HTMLDivElement> & {
  currentPage: number;
  onBack: () => void;
  onNext: () => void;
  onChangePage: (page: number) => void;
};

// Upravené barvy
const stepperClasses = cn(
  // light
  "[--step-color:hsl(var(--nextui-secondary-400))]",
  "[--active-color:hsl(var(--nextui-secondary-400))]",
  "[--inactive-border-color:hsl(var(--nextui-secondary-200))]",
  "[--inactive-bar-color:hsl(var(--nextui-secondary-200))]",
  "[--inactive-color:hsl(var(--nextui-secondary-300))]",
  // dark
  "dark:[--step-color:rgba(255,255,255,0.1)]",
  "dark:[--active-color:hsl(var(--nextui-foreground-600))]",
  "dark:[--active-border-color:rgba(255,255,255,0.5)]",
  "dark:[--inactive-border-color:rgba(255,255,255,0.1)]",
  "dark:[--inactive-bar-color:rgba(255,255,255,0.1)]",
  "dark:[--inactive-color:rgba(255,255,255,0.2)]",
);

const MultiStepSidebar = React.forwardRef<HTMLDivElement, MultiStepSidebarProps>(
  ({ children, className, currentPage, onBack, onNext, onChangePage, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex h-[calc(100vh_-_40px)] w-full gap-x-2", className)}
        {...props}
      >
        <div className="hidden h-full w-[344px] flex-shrink-0 flex-col items-start gap-y-8 mt-2 ml-7 rounded-md bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300 px-8 py-6 shadow-small lg:flex dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 overflow-auto scrollbar-hidden">
          <div> 
            <div className="text-xl font-medium leading-7 text-secondary-800">
            Registrace zájemce o zaměstnání ve společnosti ARES GROUP s.r.o.
            </div>
            {/* <div className="mt-1 text-base font-medium leading-6 text-secondary-600">
            Registrace zájemce o zaměstnání ve společnosti ARES GROUP s.r.o.
            </div> */}
          </div>
          <VerticalSteps
            className={stepperClasses}
            color="secondary"
            currentStep={currentPage}
            steps={[
              {
                title: "Zacházení s údaji",
                description: "Jak budeme zacházet s tvými údaji?",
              },
              {
                title: "Seznámení",
                description: "Pojďme se poznat.",
              },
              {
                title: "Základní údaje",
                description: "Sděl nám své základní údaje.",
              },
              {
                title: "Kontaktní údaje",
                description: "Dej nám vědět jak tě můžeme kontaktovat.",
              },
              {
                title: "Kvalifikace a praxe",
                description: "Řekni nám něco o své kvalifikaci a praxi.",
              },
              {
                title: "Zdraví",
                description: "Prozraď nám pár informací o svém zdravotním stavu.",
              },
              {
                title: "Preference",
                description: "Jak si představuješ své pracovní nasazení?",
              },
              {
                title: "Závazky",
                description: "Jak jsou tvé stávající pracovní a finanční závazky?",
              },
              {
                title: "Jak jsi nás našel?",
                description: "",
              },
            ]}
            onStepChange={onChangePage}
          />
          {/* <SupportCard className="w-full backdrop-blur-lg lg:bg-blue-100/40 lg:shadow-none dark:lg:bg-blue-800/20" /> */}
        </div>
        <div className="flex h-full w-full flex-col items-center gap-4 md:p-4">
          <div className="sticky top-0 z-10 w-full  bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 py-4 shadow-small md:max-w-xl lg:hidden">
            <div className="flex justify-center">
              <RowSteps
                className={cn("pl-6", stepperClasses)}
                currentStep={currentPage}
                steps={[
                  { title: "Zacházení s údaji" },
                  { title: "Seznámení" },
                  { title: "Základní údaje" },
                  { title: "Kontaktní údaje" },
                  { title: "Kvalifikace a praxe" },
                  { title: "Zdraví" },
                  { title: "Preference" },
                  { title: "Závazky" },
                  { title: "Jak jsi nás našel?" },
                ]}
                onStepChange={onChangePage}
              />
            </div>
          </div>
          <div className="h-full w-full p-4 sm:max-w-md md:max-w-lg">
            {children}
            {/* <MultistepNavigationButtons
          color="secondary"
          className=" lg:hidden"
          backButtonProps={{
            className: "w-32",
          }}
          nextButtonProps={{
            children: "Pokračovat",
            // isDisabled: !isCheckboxChecked,
            className: "w-32",
          }}
          onBack={onBack}
          onNext={onNext}
        /> */}
            <SupportCard className="mx-auto w-full max-w-[252px] lg:hidden" />
          </div>
        </div>
      </div>
    );
  }
);

MultiStepSidebar.displayName = "MultiStepSidebar";

export default MultiStepSidebar;
