"use client";
import {
  EmployeeToDisplay,
} from "@/app/lib/models";
import * as actions from "@/actions";
import { useActionState, useEffect } from "react";
import Datepicker from "../bdatepicker";
import FormButton from "../common/form-button";
import Tiptap from "../common/tiptap";
import { useState } from "react";
import { toast } from "react-toastify";


interface UpdateBasicEmployeeProps {
  personalData: EmployeeToDisplay;
}

export default function UpdateBasicDataCard({
  personalData,
}: UpdateBasicEmployeeProps) {
  const value = {
    otherDPP: personalData.otherDPP || "",
    otherDPPValue: personalData.otherDPPValue || "",
    shifts: personalData.shifts || "",
    shiftsValue: personalData.shiftsValue || "",
    healthStatus: personalData.healthStatus || "",
    smoker: personalData.smoker || "",
    practice: personalData.practice || "",
    execution: personalData.execution || "",
    valueOfExecution: personalData.valueOfExecution || "",
    dateOfEmployment: personalData.dateOfEmployment || "",
    recruitment: personalData.recruitment || "",
    comment: personalData.comment || "",
  };

  const [state, action, isPending] = useActionState(
    actions.updatePersonalEmployee,
    null
  );

  const [commentValue, setCommentValue] = useState(value.comment);
  const commentHandler = (value: string) => {
    setCommentValue(value);
  };

  useEffect(() => {
    if (state?.uploadError) {
      toast.warn("Záznam se nepodařilo uložit.", {
        autoClose: 5000,
        hideProgressBar: false,
        theme: "dark",
      });
    }
  }, [state?.uploadError]);
  


  return (
    <form action={action} className="bg-white dark:bg-slate-900 h-full ">
      <input type="hidden" name="id" value={personalData.id} />
      <input type="hidden" name="uploadError" value="" />
      <div className="flex justify-center md:justify-start">
        <div className="relative">
          <div className="px-4 sm:px-6  py-2 w-full max-w-[96rem] mx-auto">
            <div>
              <h2 className="text-2xl text-slate-800 dark:text-slate-100 font-bold mb-6">
                Údaje z přijímacího řízení
              </h2>
              <div className="grid gap-5 md:grid-cols-3">
                {/* Select */}
                <div className="w-full">
                  <label
                    className="block text-sm font-medium mb-1 w-full"
                    htmlFor="recruitment"
                  >
                    Inzerce
                  </label>
                  <select
                    id="recruitment"
                    className="form-select w-full bg-white dark:bg-slate-900"
                    name="recruitment"
                    defaultValue={value.recruitment}
                  >
                    <option>NaN</option>
                    <option>Firemní web</option>
                    <option>Inzertní weby</option>
                    <option>Facebook</option>
                    <option>Jiné sociální sítě</option>
                    <option>Tištěná inzerce</option>
                    <option>Doporučení zaměstnance</option>
                    <option>Jiné osobní doporučení</option>
                    <option>Ostatní</option>
                    <option>Není vyžadováno</option>
                  </select>
                  <div className="text-xs mt-1 text-rose-500 w-full">
                    {state?.recruitment && <span>{state.recruitment}</span>}
                  </div>
                </div>

                {/* Select praxe start */}
                <div className="w-full">
                  <label
                    className="block text-sm font-medium mb-1 w-full"
                    htmlFor="practice"
                  >
                    Praxe
                  </label>
                  <select
                    id="practice"
                    className="form-select w-full bg-white dark:bg-slate-900"
                    name="practice"
                    defaultValue={value.practice}
                  >
                    <option>NaN</option>
                    <option>Ne</option>
                    <option>0 až 1 rok</option>
                    <option>1 až 2 roky</option>
                    <option>2 až 5 roků</option>
                    <option>5 let a více</option>
                    <option>Není vyžadováno</option>
                  </select>
                  <div className="text-xs mt-1 text-rose-500 w-full">
                    {state?.practice && <span>{state.practice}</span>}
                  </div>
                </div>
                {/* Select praxe end */}

                {/* Select healthStatus start */}
                <div className="w-full">
                  <label
                    className="block text-sm font-medium mb-1 w-full"
                    htmlFor="healthStatus"
                  >
                    Zdravotní stav
                  </label>
                  <select
                    id="healthStatus"
                     className="form-select w-full bg-white dark:bg-slate-900"
                    name="healthStatus"
                    defaultValue={value.healthStatus}
                  >
                    <option>NaN</option>
                    <option>Dobrý</option>
                    <option>Omezení nočních směn</option>
                    <option>Omezení pochůzek</option>
                    <option>Jiná omezení</option>
                    <option>Není vyžadováno</option>
                  </select>
                  <div className="text-xs mt-1 text-rose-500">
                    {state?.healthStatus && <span>{state.healthStatus}</span>}
                  </div>
                </div>
                {/* Select healthStatus end */}

                {/* Select healthStatus start */}
                <div className="w-full">
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="smoker"
                  >
                    Kuřák
                  </label>
                  <select
                    id="smoker"
                    className="form-select w-full bg-white dark:bg-slate-900"
                    name="smoker"
                    defaultValue={value.smoker}
                  >
                    <option>NaN</option>
                    <option>Ano</option>
                    <option>Ne</option>
                    <option>Občasný</option>
                    <option>Není vyžadováno</option>
                  </select>
                  <div className="text-xs mt-1 text-rose-500 w-full">
                    {state?.smoker && <span>{state.smoker}</span>}
                  </div>
                </div>

                {/* Select shifts start */}
                <div className="w-full">
                  <label
                    className="block text-sm font-medium mb-1 w-full"
                    htmlFor="shifts"
                  >
                    Preferované směny
                  </label>
                  <select
                    id="shifts"
                    className="form-select w-full bg-white dark:bg-slate-900"
                    name="shifts"
                    defaultValue={value.shifts}
                  >
                    <option>NaN</option>
                    <option>Denní</option>
                    <option>Noční</option>
                    <option>Vše</option>
                    <option>Není vyžadováno</option>
                  </select>
                  <div className="text-xs mt-1 text-rose-500 w-full">
                    {state?.shifts && <span>{state.shifts}</span>}
                  </div>
                </div>
                {/* Select shifts end */}
                {/* Select shiftsValue start */}

                <div className="w-full">
                  <div className="w-full">
                    <label
                      className="block text-sm font-medium mb-1 w-full"
                      htmlFor="shiftsValue"
                    >
                      Preferovaný počet směn
                    </label>
                    <input
                      id="shiftsValue"
                      className="form-input w-full"
                      type="number"
                      name="shiftsValue"
                      defaultValue={+value.shiftsValue}
                    />
                  </div>
                  <div className="text-xs mt-1 text-rose-500 w-full">
                    {state?.shiftsValue && <span>{state.shiftsValue}</span>}
                  </div>
                </div>
                {/* Select shiftsValue end */}
                {/*dateOfEmployment Start */}
                <div className="w-full">
                  <div className="w-full">
                    <div className="flex items-center justify-between w-full">
                      <label
                        className="block text-sm font-medium mb-1 w-full"
                        htmlFor="dateOfEmployment"
                      >
                        Preferované datum nástupu
                      </label>
                    </div>
                    <Datepicker
                      defaultValue={value.dateOfEmployment?.toString()}
                      id="dateOfEmployment"
                    />
                    <div className="text-xs mt-1 text-rose-500 w-full">
                      {state?.dateOfEmployment && (
                        <span>{state.dateOfEmployment?.toString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                {/*dateOfEmployment End */}

                {/* Select otherDPP start */}
                <div className="w-full">
                  <label
                    className="block text-sm font-medium mb-1 w-full"
                    htmlFor="otherDPP"
                  >
                    Jiné DPP
                  </label>
                  <select
                    id="otherDPP"
                    className="form-select w-full bg-white dark:bg-slate-900"
                    name="otherDPP"
                    defaultValue={value.otherDPP}
                  >
                    <option>NaN</option>
                    <option>Ne</option>
                    <option>Ano</option>
                  </select>
                  <div className="text-xs mt-1 text-rose-500 w-full">
                    {state?.otherDPP && <span>{state.otherDPP}</span>}
                  </div>
                </div>
                {/* Select otherDPP end */}
                {/* Select otherDPPValue start */}
                <div>
                  <label
                    className="block text-sm font-medium mb-1 w-full"
                    htmlFor="otherDPPValue"
                  >
                    Výdělek u jiných DPP
                  </label>
                  <select
                    id="otherDPPValue"
                    className="form-select w-full bg-white dark:bg-slate-900"
                    name="otherDPPValue"
                    defaultValue={value.otherDPPValue}
                  >
                    <option>0</option>
                    <option>do 7.500,-Kč</option>
                    <option>do 10.500,-Kč</option>
                    <option>do 17.500,-Kč</option>
                    <option>více než 17.500,-Kč</option>
                  </select>
                  <div className="text-xs mt-1 text-rose-500 w-full">
                    {state?.otherDPPValue && (
                      <span>{state?.otherDPPValue}</span>
                    )}
                  </div>
                </div>
                {/* Select otherDPPValue end */}
                {/* Select exekuce start */}
                <div className="w-full">
                  <label
                    className="block text-sm font-medium mb-1 w-full"
                    htmlFor="execution"
                  >
                    Exekuce
                  </label>
                  <select
                    id="execution"
                    className="form-select w-full bg-white dark:bg-slate-900"
                    name="execution"
                    defaultValue={value.execution}
                  >
                    <option>NaN</option>
                    <option>Ne</option>
                    <option>Ano a řeší</option>
                    <option>Ano a neřeší</option>
                    <option>Není vyžadováno</option>
                  </select>
                  <div className="text-xs mt-1 text-rose-500 w-full">
                    {state?.execution && <span>{state.execution}</span>}
                  </div>
                </div>
                {/* Select exekuce end */}

                {/* Select hodnota exekuce start */}
                <div className="w-full">
                  <label
                    className="block text-sm font-medium mb-1 w-full"
                    htmlFor="valueOfExecution"
                  >
                    Částka exekuce
                  </label>
                  <select
                    id="valueOfExecution"
                    className="form-select w-full bg-white dark:bg-slate-900"
                    name="valueOfExecution"
                    defaultValue={value.valueOfExecution}
                  >
                    <option>0</option>
                    <option>neví</option>
                    <option>do 100k</option>
                    <option>do 500k</option>
                    <option>do 1M</option>
                    <option>více než 1M</option>
                  </select>
                  <div className="text-xs mt-1 text-rose-500 w-full">
                    {state?.valueOfExecution && (
                      <span>{state?.valueOfExecution}</span>
                    )}
                  </div>
                </div>
                {/* Select exekuce end */}
              </div>
            </div>

            {/* Údaje z přijímacího řízení end*/}
            {/* Poznámka  start*/}
            <div className=" mb-8">
              {/* Components */}
              <div className="space-y-8 mt-8">
                {/* My form */}
                <div>
                  <h2 className="text-2xl text-slate-800 dark:text-slate-100 font-bold mb-6">
                    Poznámka
                  </h2>
                  <div className="grid gap-5 md:grid-cols-1">
                    <div className="grow">
                      <input
                        id="comment"
                        className="form-textarea w-full focus:border-slate-300 hidden"
                        readOnly
                        placeholder="Poznámka…"
                        name="comment"
                        value={commentValue}
                      />

                      <Tiptap
                        defaultValue={value.comment}
                        name="comment"
                        id="comment"
                        placeholder="Poznámka…"
                        onChange={commentHandler}
                        
                      />
                      <div className="text-xs mt-1 text-rose-500">
                        {state?.comment && <span>{state?.comment}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Poznámka  end*/}
          </div>
          <div className="flex justify-center items-center p-6 ">
            <FormButton
              color="indigo-500"
              isLoading={isPending}
              disabled={isPending}
            >
              Uložit záznam
            </FormButton>
          </div>
        </div>
      </div>
    </form>
  );
}
