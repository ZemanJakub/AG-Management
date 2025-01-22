"use client";


import * as actions from "@/actions";
import { Button, Tooltip } from "@nextui-org/react";



import { useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Datepicker from "../default-components/datepicker";

const forminitvalue = {
  uploadError: "",
  allerror: "",
  firstName: "",
  secondName: "",
  practice: "",
  execution: "",
  valueOfExecution: "",
  otherDPP: "",
  otherDPPValue: "",
  shifts: "",
  shiftsValue: "",
  healthStatus: "",
  smoker: "",
  dateOfEmployment: "",
  recruitment: "",
  distinction: "",
  phone: "",
  state: "",
  photo: "",
  kalhoty: "",
  triko: "",
  softschell: "",
  zimnibunda: "",
  mikina: "",
  boty: "",
  comment: "",
  dateOfBirth: "",
  email: "",
  acount: "",
  adress: "",
  pid: "",
  criminalRecord: "",
  healtCheck: "",
  certificate: "",
  insurance: "",
};

const initValue = {
  firstName: "",
  secondName: "",
  practice: "NaN",
  execution: "NaN",
  valueOfExecution: "0",
  otherDPP: "NaN",
  otherDPPValue: "NaN",
  shifts: "NaN",
  shiftsValue: 0,
  healthStatus: "NaN",
  smoker: "NaN",
  dateOfEmployment: "",
  distinction: "NaN",
  phone: "",
  state: "NaN",
  photo: "/images/DefaultAvatar.jpg",
  kalhoty: "NaN",
  triko: "NaN",
  softschell: "NaN",
  zimnibunda: "NaN",
  mikina: "NaN",
  boty: "NaN",
  comment: "NaN",
  dateOfBirth: "",
  recruitment: "NaN",
  email: "NaN",
  acount: "NaN",
  adress: "NaN",
  pid: "NaN",
  criminalRecord: "",
  healtCheck: "",
  certificate: "NaN",
  insurance: "NaN",
};

export default function NewEmployeeForm() {
  const [value, setValue] = useState(initValue);
  const [state, action, isPending] = useActionState(
    actions.createEmployee,
    null
  );
  useEffect(() => {
    if (state && Object.keys(state).length > 0) {
      toast.warn("Formulář obsahuje chyby, prosím opravte je a zkuste znovu.", {
        autoClose: 5000,
        hideProgressBar: false,
        theme: "dark",
      });
    }
  }, [state]);
  const handleInputChange = (e:any) => {
    const { name, value } = e.target;
    setValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // useEffect(() => {
  //   if (state?.uploadError) {
  //     toast.warn("Záznam se nepodařilo uložit.", {
  //       autoClose: 5000,
  //       hideProgressBar: false,
  //       theme: "dark",
  //     });
  //   }
  // }, [state?.uploadError]);

  return (
    <form
      className="relative bg-white dark:bg-slate-900 h-full"
      action={action}
    >
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl text-slate-800 dark:text-slate-100 font-bold">
            Nový zaměstnanec ✨
          </h1>
        </div>
        {/* Základní údaje start*/}
        <div className="border-t  border-slate-200 dark:border-slate-700  mb-6 ">
          {/* Components */}
          <div className="space-y-8 mt-8">
            {/* My form */}
            <div>
              <h2 className="text-2xl text-slate-800 dark:text-slate-100 font-bold mb-6">
                Základní údaje
              </h2>
              <div className="grid gap-5  md:grid-cols-3">
                {/* <div className="row-span-4 items-start grid grid-cols-2gap-4 items-center, justify-center"> */}
                {/* Start */}
                {/* <div>
                      <div className="w-32 h-48">
                        <label
                          className="block text-sm font-medium mb-1 text-center"
                          htmlFor="foto"
                        >
                          Fotografie
                        </label>
                        <img
                          src={value.photo}
                          alt="photo"
                          className=" w-32 h-40  border border-slate-200 dark:border-slate-700 rounded-md  object-cover"
                          id="foto"
                        />
                      </div>
                      <div className="relative mt-4 mb2 w-12 sm:w-32">
                        <label
                          className="block text-sm font-medium mb-1  bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-md"
                          htmlFor="photo"
                        >
                          <svg
                            className="flex sm:hidden w-4 h-4 fill-current opacity-50 shrink-0 "
                            viewBox="0 0 16 16"
                          >
                            <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                          </svg>
                          <span className="hidden sm:flex">Vybrat soubor</span>
                        </label>
                        <input
                          id="photo"
                          className=" custom-file-input  absolute inset-0 w-full h-full opacity-0 "
                          placeholder="Enter image URL"
                          type="file"
                          name="photo"
                          accept="image/*"
                        />
                      </div>
                      <div className="text-xs mt-1 text-rose-500">
                        {state?.photo && <span>{state?.photo}</span>}
                      </div>
                    </div> */}

                {/* End */}
                {/* </div> */}

                {/* firstName Start */}
                <div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="firstName"
                    >
                      Jméno <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="firstName"
                      className="form-input w-full"
                      type="text"
                      name="firstName"
                      defaultValue={value.firstName}
                      required
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="text-xs mt-1 text-rose-500">
                    {state?.firstName && <span>{state?.firstName}</span>}
                  </div>
                </div>
                {/* firstNameEnd */}
                {/* secondName Start */}
                <div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="secondName"
                    >
                      Příjmení <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="secondName"
                      className="form-input w-full"
                      type="text"
                      name="secondName"
                      defaultValue={value.secondName}
                      required
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="text-xs mt-1 text-rose-500">
                    {state?.secondName && <span>{state?.secondName}</span>}
                  </div>
                </div>
                {/* secondName End */}
                {/* distinction Start */}
                <div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="distinction"
                      >
                        Druhé jméno / rozlišení
                      </label>
                      <Tooltip
                        className="ml-2"
                        size="md"
                      >
                        <div className="text-sm text-slate-200">
                          V případě shody jmen se použije toto rozlišení.
                        </div>
                      </Tooltip>
                    </div>
                    <input
                      id="distinction"
                      className="form-input w-full"
                      type="text"
                      name="distinction"
                      defaultValue={value.distinction}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="text-xs mt-1 text-rose-500">
                    {state?.distinction && <span>{state?.distinction}</span>}
                  </div>
                </div>
                {/* distinction End */}
                {/* dateOfBirth Start */}
                <div>
                  <div>
                    <div className="flex items-center justify-between ">
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="dateOfBirth"
                      >
                        Datum narození<span className="text-rose-500">*</span>
                      </label>
                      <Tooltip
                        className="ml-28 pl-1"
                      
                        size="md"
                      
                      >
                        <div className="text-sm text-slate-200">
                          Rok lze přímo editovat.
                        </div>
                      </Tooltip>
                    </div>
                    <Datepicker
                      defaultValue={value.dateOfBirth}
                      id="dateOfBirth"
                      
                    />
                    <div className="text-xs mt-1 text-rose-500">
                      {state?.dateOfBirth && (
                        <span>{state?.dateOfBirth.toString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                {/* dateOfBirth End */}

                {/* Rodné číslo Start */}
                <div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="pid"
                    >
                      Rodné číslo
                    </label>
                    <input
                      id="pid"
                      className="form-input w-full"
                      type="text"
                      name="pid"
                      defaultValue={value.pid}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="text-xs mt-1 text-rose-500">
                    {state?.pid && <span>{state?.pid}</span>}
                  </div>
                </div>
                {/* Rodné číslo End */}

                {/* Select state start*/}
                <div className="w-full">
                  <label
                    className="block text-sm font-medium mb-1 w-full"
                    htmlFor="state"
                  >
                    Státní příslušnost
                  </label>
                  <select
                    id="state"
                    className="form-select w-full bg-white dark:bg-slate-900"
                    name="state"
                    defaultValue={value.state}
                    onChange={handleInputChange}
                  >
                    <option>NaN</option>
                    <option>CZ</option>
                    <option>SK</option>
                    <option>EU</option>
                    <option>Mimo EU</option>
                    <option>Není vyžadováno</option>
                  </select>
                  <div className="text-xs mt-1 text-rose-500 w-full">
                    {state?.state && <span>{state?.state}</span>}
                  </div>
                </div>
                {/* Select state end*/}
              </div>
            </div>
          </div>
        </div>
        {/* Základní údaje end*/}

        {/* Kontaktní  údaje  start*/}
        <div className="border-t border-slate-200 dark:border-slate-700 mb-8">
          {/* Components */}
          <div className="space-y-8 mt-8">
            {/* My form */}
            <div>
              <h2 className="text-2xl text-slate-800 dark:text-slate-100 font-bold mb-6">
                Kontaktní údaje
              </h2>
              <div className="grid gap-5 md:grid-cols-3">
                {/* Telefon Start */}
                <div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="phone"
                    >
                      Telefon <span className="text-rose-500">*</span>
                    </label>
                    <input
                     onChange={handleInputChange}
                      id="phone"
                      className="form-input w-full"
                      type="text"
                      name="phone"
                      defaultValue={value.phone}
                      required
                    />
                  </div>
                  <div className="text-xs mt-1 text-rose-500">
                    {state?.phone && <span>{state?.phone}</span>}
                  </div>
                </div>
                {/* Telefon End */}
                <div>
                  {/* Start */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="email"
                    >
                      Email
                    </label>
                    <input
                     onChange={handleInputChange}
                      id="email"
                      className="form-input w-full"
                      type="text"
                      name="email"
                      defaultValue={value.email}
                    />
                  </div>
                  <div className="text-xs mt-1 text-rose-500">
                    {state?.email && <span>{state?.email}</span>}
                  </div>
                  {/* End */}
                </div>
                {/* Start Číslo účtu*/}
                <div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="acount"
                    >
                      Číslo účtu
                    </label>
                    <input
                     onChange={handleInputChange}
                      id="acount"
                      className="form-input w-full"
                      type="text"
                      name="acount"
                      defaultValue={value.acount}
                    />
                  </div>
                  <div className="text-xs mt-1 text-rose-500">
                    {state?.acount && <span>{state?.acount}</span>}
                  </div>
                </div>
                {/* End Číslo účtu*/}
                {/* start adresa*/}
                <div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1 "
                      htmlFor="adress"
                    >
                      Adresa
                    </label>
                    <input id="adress"/>
                    <div className="text-xs mt-1 text-rose-500">
                      {state?.adress && <span>{state?.adress}</span>}
                    </div>
                  </div>
                </div>
                {/* End adresa*/}

                {/* Select */}
                {/* <div className="w-full">
                    <label
                      className="block text-sm font-medium mb-1 w-full"
                      htmlFor="declaration"
                    >
                      Prohlášení poplatníka
                    </label>
                    <select
                      id="declaration"
                      className="form-select w-full bg-white dark:bg-slate-900"
                      name="declaration"
                      defaultValue={value.declaration}
                    >
                      <option>NaN</option>
                      <option>ARES GROUP s.r.o.</option>
                      <option>FILDEN s.r.o.</option>
                      <option>Není vyžadováno</option>
                    </select>
                    <div className="text-xs mt-1 text-rose-500 w-full">
                      {state?.declaration && <span>{state?.declaration}</span>}
                    </div>
                  </div> */}

                {/* Select */}
                <div className="w-full">
                  <label
                    className="block text-sm font-medium mb-1 w-full"
                    htmlFor="insurance"
                  >
                    Zdravotní pojišťovna
                  </label>
                  <select
                    id="insurance"
                    className="form-select w-full bg-white dark:bg-slate-900"
                    name="insurance"
                    defaultValue={value.insurance}
                    onChange={handleInputChange}
                  >
                    <option>NaN</option>
                    <option>VZP</option>
                    <option>VOZP</option>
                    <option>ČPZP</option>
                    <option>OZP</option>
                    <option>ZPŠ</option>
                    <option>ZPMV</option>
                    <option>RBP</option>
                  </select>
                  <div className="text-xs mt-1 text-rose-500 w-full">
                    {state?.insurance && <span>{state?.insurance}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kontaktní údaje  end*/}

        {/* Kvalifikace  start*/}
        <div className="border-t border-slate-200 dark:border-slate-700 mb-8">
          {/* Components */}
          <div className="space-y-8 mt-8">
            {/* My form */}
            <div>
              <h2 className="text-2xl text-slate-800 dark:text-slate-100 font-bold mb-6">
                Kvalifikace
              </h2>
              <div className="grid gap-5 md:grid-cols-3">
                {/* Certificate Select Start */}
                <div className="w-full">
                  <label
                    className="block text-sm font-medium mb-1 w-full"
                    htmlFor="certificate"
                  >
                    Certifikát
                  </label>
                  <select
                   onChange={handleInputChange}
                    id="certificate"
                    className="form-select w-full bg-white dark:bg-slate-900"
                    name="certificate"
                  >
                    <option>NaN</option>
                    <option>Ano</option>
                    <option>Ne</option>
                    <option>Diplom</option>
                    <option>Není vyžadováno</option>
                  </select>
                  <div className="text-xs mt-1 text-rose-500 w-full">
                    {state?.certificate && <span>{state?.certificate}</span>}
                  </div>
                </div>
                {/* Certificate Select End */}
                {/* criminalRecord Start */}
                <div>
                  <div>
                    <div className="flex items-center justify-between w-full">
                      <label
                        className="block text-sm font-medium mb-1 w-full"
                        htmlFor="criminalRecord"
                      >
                        Výpis RT
                      </label>
                    </div>
                    <Datepicker
                      defaultValue={value.criminalRecord}
                      id="criminalRecord"
                    />
                  </div>
                  <div className="text-xs mt-1 text-rose-500 w-full">
                    {state?.criminalRecord && (
                      <span>{state?.criminalRecord?.toString()}</span>
                    )}
                  </div>
                </div>
                {/* criminalRecord End */}
                {/* healtCheck Start */}
                <div className="w-full">
                  <div className="flex items-center justify-between w-full">
                    <label
                      className="block text-sm font-medium mb-1 w-full"
                      htmlFor="healtCheck"
                    >
                      Zdravotní prohlídka
                    </label>
                  </div>
                  <Datepicker defaultValue={value.healtCheck} id="healtCheck" />
                  <div className="text-xs mt-1 text-rose-500 w-full">
                    {state?.healtCheck && (
                      <span>{state?.healtCheck.toString()}</span>
                    )}
                  </div>
                </div>
                {/* healtCheck End */}
              </div>
            </div>
          </div>
        </div>

        {/* Ostatní údaje  end*/}

        {/* Uniforma start*/}
        <div className="border-t border-b border-slate-200 dark:border-slate-700 mb-8 pb-6">
          {/* Components */}
          <div className="space-y-8 mt-8">
            {/* My form */}
            <div>
              <h2 className="text-2xl text-slate-800 dark:text-slate-100 font-bold mb-6">
                Orientační velikost uniformy
              </h2>
              <div className="grid gap-5 grid-cols-2 md:grid-cols-6">
                {/* Select */}
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="kalhoty"
                  >
                    Kalhoty
                  </label>
                  <select
                    id="kalhoty"
                    onChange={handleInputChange}
                    className="form-select w-full bg-white dark:bg-slate-900"
                    name="kalhoty"
                    defaultValue={value.kalhoty}
                  >
                    <option>NaN</option>
                    <option>M</option>
                    <option>L</option>
                    <option>XL</option>
                    <option>XXL</option>
                    <option>XXXL</option>
                    <option>XXXXL</option>
                  </select>
                  <div className="text-xs mt-1 text-rose-500">
                    {state?.kalhoty && <span>{state?.kalhoty}</span>}
                  </div>
                </div>

                {/* Select */}
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="triko"
                  >
                    Triko
                  </label>
                  <select
                   onChange={handleInputChange}
                    id="triko"
                    className="form-select w-full bg-white dark:bg-slate-900"
                    name="triko"
                    defaultValue={value.triko}
                  >
                    <option>NaN</option>
                    <option>M</option>
                    <option>L</option>
                    <option>XL</option>
                    <option>XXL</option>
                    <option>XXXL</option>
                    <option>XXXXL</option>
                  </select>
                  <div className="text-xs mt-1 text-rose-500">
                    {state?.triko && <span>{state?.triko}</span>}
                  </div>
                </div>

                {/* Select */}
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="softschell"
                  >
                    Softschell
                  </label>
                  <select
                   onChange={handleInputChange}
                    id="softschell"
                    className="form-select w-full bg-white dark:bg-slate-900"
                    name="softschell"
                    defaultValue={value.softschell}
                  >
                    <option>NaN</option>
                    <option>M</option>
                    <option>L</option>
                    <option>XL</option>
                    <option>XXL</option>
                    <option>XXXL</option>
                    <option>XXXXL</option>
                  </select>
                  <div className="text-xs mt-1 text-rose-500">
                    {state?.softschell && <span>{state?.softschell}</span>}
                  </div>
                </div>

                {/* Select */}
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="zimnibunda"
                  >
                    Zimní bunda
                  </label>
                  <select
                   onChange={handleInputChange}
                    id="zimnibunda"
                    className="form-select w-full bg-white dark:bg-slate-900"
                    name="zimnibunda"
                    defaultValue={value.zimnibunda}
                  >
                    <option>NaN</option>
                    <option>M</option>
                    <option>L</option>
                    <option>XL</option>
                    <option>XXL</option>
                    <option>XXXL</option>
                    <option>XXXXL</option>
                  </select>
                  <div className="text-xs mt-1 text-rose-500">
                    {state?.zimnibunda && <span>{state?.zimnibunda}</span>}
                  </div>
                </div>

                {/* Select */}
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="mikina"
                  >
                    Mikina
                  </label>
                  <select
                    id="mikina"
                    className="form-select w-full bg-white dark:bg-slate-900"
                    name="mikina"
                    defaultValue={value.mikina}
                    onChange={handleInputChange}
                  >
                    <option>NaN</option>
                    <option>M</option>
                    <option>L</option>
                    <option>XL</option>
                    <option>XXL</option>
                    <option>XXXL</option>
                    <option>XXXXL</option>
                  </select>
                  <div className="text-xs mt-1 text-rose-500">
                    {state?.mikina && <span>{state?.mikina}</span>}
                  </div>
                </div>

                {/* Select end*/}
                {/* Select */}
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="boty"
                  >
                    Boty
                  </label>
                  <select
                    id="boty"
                    className="form-select w-full bg-white dark:bg-slate-900"
                    name="boty"
                    defaultValue={value.boty}
                    onChange={handleInputChange}
                  >
                    <option>NaN</option>
                    <option>36</option>
                    <option>37</option>
                    <option>38</option>
                    <option>39</option>
                    <option>40</option>
                    <option>41</option>
                    <option>42</option>
                    <option>43</option>
                    <option>44</option>
                    <option>45</option>
                    <option>46</option>
                    <option>47</option>
                  </select>
                  <div className="text-xs mt-1 text-rose-500">
                    {state?.boty && <span>{state?.boty}</span>}
                  </div>
                </div>

                {/* Select end*/}
              </div>
            </div>
          </div>
        </div>

        {/* Uniforma end*/}
        {/* Základní údaje end*/}

        {/* Údaje z přijímacího řízení start*/}
        <div className="border-t border-slate-200 dark:border-slate-700 mb-8">
          {/* Components */}
          <div className="space-y-8 mt-8">
            {/* My form */}
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
                    onChange={handleInputChange}
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
                    {state?.recruitment && <span>{state?.recruitment}</span>}
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
                    onChange={handleInputChange}
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
                    {state?.practice && <span>{state?.practice}</span>}
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
                    onChange={handleInputChange}
                  >
                    <option>NaN</option>
                    <option>Dobrý</option>
                    <option>Omezení nočních směn</option>
                    <option>Omezení pochůzek</option>
                    <option>Jiná omezení</option>
                    <option>Není vyžadováno</option>
                  </select>
                  <div className="text-xs mt-1 text-rose-500">
                    {state?.healthStatus && <span>{state?.healthStatus}</span>}
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
                   onChange={handleInputChange}
                    id="smoker"
                    className="form-select w-full bg-white dark:bg-slate-900"
                    name="smoker"
                  >
                    <option>NaN</option>
                    <option>Ano</option>
                    <option>Ne</option>
                    <option>Občasný</option>
                    <option>Není vyžadováno</option>
                  </select>
                  <div className="text-xs mt-1 text-rose-500 w-full">
                    {state?.smoker && <span>{state?.smoker}</span>}
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
                   onChange={handleInputChange}
                    id="shifts"
                    className="form-select w-full bg-white dark:bg-slate-900"
                    name="shifts"
                  >
                    <option>NaN</option>
                    <option>Denní</option>
                    <option>Noční</option>
                    <option>Vše</option>
                    <option>Není vyžadováno</option>
                  </select>
                  <div className="text-xs mt-1 text-rose-500 w-full">
                    {state?.shifts && <span>{state?.shifts}</span>}
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
                     onChange={handleInputChange}
                      id="shiftsValue"
                      className="form-input w-full"
                      type="number"
                      name="shiftsValue"
                      defaultValue={0}
                    />
                  </div>
                  <div className="text-xs mt-1 text-rose-500 w-full">
                    {state?.acount && <span>{state?.acount}</span>}
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
                      defaultValue={value.dateOfEmployment}
                      id="dateOfEmployment"
                    />
                    <div className="text-xs mt-1 text-rose-500 w-full">
                      {state?.dateOfEmployment && (
                        <span>{state?.dateOfEmployment?.toString()}</span>
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
                   onChange={handleInputChange}
                    id="otherDPP"
                    className="form-select w-full bg-white dark:bg-slate-900"
                    name="otherDPP"
                  >
                    <option>NaN</option>
                    <option>Ne</option>
                    <option>Ano</option>
                  </select>
                  <div className="text-xs mt-1 text-rose-500 w-full">
                    {state?.otherDPP && <span>{state?.otherDPP}</span>}
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
                   onChange={handleInputChange}
                    id="otherDPPValue"
                    className="form-select w-full bg-white dark:bg-slate-900"
                    name="otherDPPValue"
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
                   onChange={handleInputChange}
                    id="execution"
                    className="form-select w-full bg-white dark:bg-slate-900"
                    name="execution"
                  >
                    <option>NaN</option>
                    <option>Ne</option>
                    <option>Ano a řeší</option>
                    <option>Ano a neřeší</option>
                    <option>Není vyžadováno</option>
                  </select>
                  <div className="text-xs mt-1 text-rose-500 w-full">
                    {state?.execution && <span>{state?.execution}</span>}
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
                   onChange={handleInputChange}
                    id="valueOfExecution"
                    className="form-select w-full bg-white dark:bg-slate-900"
                    name="valueOfExecution"
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
          </div>
        </div>
        {/* Údaje z přijímacího řízení end*/}

        {/* Poznámka  start*/}
        <div className="border-t border-slate-200 dark:border-slate-700 mb-8">
          {/* Components */}
          <div className="space-y-8 mt-8">
            {/* My form */}
            <div>
              <h2 className="text-2xl text-slate-800 dark:text-slate-100 font-bold mb-6">
                Poznámka
              </h2>
              <div className="grid gap-5 md:grid-cols-1">
                <div className="grow">
                  {/* <label htmlFor="comment" className="sr-only">
                Poznámka…
              </label> */}
                  <textarea
                    id="comment"
                    className="form-textarea w-full focus:border-slate-300"
                    rows={6}
                    placeholder="Poznámka…"
                    defaultValue={value.comment}
                    name="comment"
                     onChange={handleInputChange}
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

        <div className="w-full flex items-center justify-center border-t border-b border-slate-200 dark:border-slate-700  mt-6 mb-6 pt-6 pb-6">
          {/* Save button start*/}

          <Button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 fill-current opacity-50 shrink-0"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="#2c3e50"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2" />
              <path d="M12 14m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
              <path d="M14 4l0 4l-6 0l0 -4" />
            </svg>
            <span className="block ml-2">Uložit záznam</span>
          </Button>

          {/* Save button end*/}
        </div>
        {/* Základní údaje end*/}
      </div>
    </form>
  );
}
