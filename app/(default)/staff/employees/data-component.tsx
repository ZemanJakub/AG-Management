"use client";
import React, { useMemo } from 'react'
import HrTable from './hrtable';
import { fetchAllBasicEmployeeData } from '@/queries/employees';
import useSWR from 'swr';
import { MyFormData } from '@/components/directus-form/components/types';
import dynamic from 'next/dynamic';




interface DataComponentProps {
    employeeInitData: Record<string, any>[];
    formStructure: any;
  }
const DataComponent = ({ employeeInitData, formStructure }: DataComponentProps) => {


    const { data: employeeData, error: employeeError, mutate } = useSWR(
        employeeInitData ? "/api/employees" : null, 
        fetchAllBasicEmployeeData,
        { fallbackData: employeeInitData }
      );


      const otherData: Record<string, any>[] = useMemo(() => {
        if (!employeeData) return [];
        return employeeData.map((item: any) => {
          const { id, firstName, secondName, photo, email, ...rest } = item;
          const improvedPhoto = `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${photo}`;
          return {
            ...rest,
            employeeCard: {
              id: id,
              firstName: firstName,
              secondName: secondName,
              photo: improvedPhoto,
              email: email,
            },
          };
        });
      }, [employeeData]);
 

  const formData = formStructure[0] as MyFormData;
  const excludedKeys = ["firstName", "secondName", "photo", "email","phone"];

  const filteredElements = formData.elements.filter(
    (element) => !excludedKeys.includes(element.key)
  );

  const sortedElements = filteredElements.sort((a, b) => a.order - b.order);

  const columns = sortedElements.map((element: any) => {
    return {
      name: element.label,
      uid: element.key,
      info: element.info ?? null,
      sortDirection: element.sortDirection ?? null,
    };
  });
  columns.unshift({
    name: "Záznam vytvořen",
    uid: "date_created",
    info: null,
    sortDirection: null,
  });
  columns.unshift({
    name: "Telefon",
    uid: "phone",
    info: null,
    sortDirection: null,
  });
  columns.unshift({
    name: "Zaměstnanec",
    uid: "employeeCard",
    info: "Informace o zaměstnanci",
    sortDirection: "descent",
  });

  columns.push({
    name: "Actions",
    uid: "actions",
    info: null,
    sortDirection: null,
  });
  const records=10; 
  const HrTableNoSSR = dynamic(() => import('./hrtable'), { ssr: false });
  return (
    <div className="px-4 sm:px-6 lg:px-8 xl:px-16 2xl:px-32 py-8 mx-auto">
      {/* Předáme mutate jako prop do HrTable */}
      <HrTableNoSSR employeesData={otherData} columns={columns} records={10} mutate={mutate} />

    </div>
  );
};

export default DataComponent