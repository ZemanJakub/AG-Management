import { Spinner } from "@heroui/react";

export default function LoadingEmployeeDetail() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full h-full flex items-center justify-center">
        <Spinner label="Načítám..." color="default" />
      </div>
    </div>
  );
}
