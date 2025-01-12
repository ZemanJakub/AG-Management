"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import AccountImage from "@/public/images/user-avatar-80.png";
import { DataForSession } from "@/app/lib/models";
import { updateProfile } from "@/actions";
import Form from "next/form";
import { Button } from "@nextui-org/react";
import DoubleCheckIcon from "@/components/my-icons/double-check-icon";
import CrossIcon from "@/components/my-icons/cross-icon";
import UpdatePhoto from "@/components/employees/update-photo";
import UpdateAvatar from "@/components/users/update-avatar";
import { toast } from "react-toastify";
import { logout } from "@/actions/auth/actions";
import { redirect } from "next/navigation";

export default function AccountPanel({
  userData,
}: {
  userData: DataForSession;
}) {
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [newPasswordCheck, setNewPasswordCheck] = useState<string>("");
  const [newAvatar, setNewAvatar] = useState<string>("");

  const firstName = userData.first_name || "";
  const lastName = userData.last_name || "";
  const email = userData.email?.toString() || "";
  const userId = userData.id?.toString() || "";
  const avatar = userData.avatar || "699729d7-e5fb-48e8-930c-6510fc06eb03";

  const [state, updateProfileAction] = useActionState(updateProfile, undefined);

  useEffect(() => {
    toast.dismiss();
    if (state?.success) {
      toast.success("Údaje byly úspěšně uloženy.", {
        autoClose: 2000,
        hideProgressBar: false,
        theme: "dark",
      });
      logout();
      redirect("/signin");
    }
    if(state?.success === false){
      toast.error("Něco se pokazilo. Zkuste to prosím znovu.", {
        autoClose: 2000,
        hideProgressBar: false,
        theme: "dark",
      });
    }
  }, [state]);

  // Funkce pro validaci hesla
  const validatePassword = (password: string) => {
    return {
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      isNotEmpty: !!password,
    };
  };

  const passwordValidation = validatePassword(newPassword);

  const validateButton = (
    oldPassword: string,
    newPassword: string,
    newPasswordCheck: string
  ): boolean => {
    if (!oldPassword.trim()) {
      return false;
    }
    if (newPassword === "" && newPasswordCheck === "" && oldPassword.trim()) {
      return true;
    }

    if (
      newPassword.trim() &&
      newPasswordCheck.trim() &&
      newPassword === newPasswordCheck &&
      passwordValidation.hasUpperCase &&
      passwordValidation.hasLowerCase &&
      passwordValidation.hasNumber &&
      oldPassword.trim()
    ) {
      return true;
    }
    return false;
  };

  return (
    <div className="">
      <h2 className=" p-6 text-2xl text-gray-800 dark:text-gray-100 font-bold mb-1">
        Můj účet
      </h2>
      <div className="px-6 space-y-6 flex items-center sm:items-center md:items-start justify-center sm:justify-center md:justify-start mb-4">
        <UpdateAvatar
          photo={avatar}
          setUpdatedAvatarAction={(newAvatar: string) =>
            setNewAvatar(newAvatar)
          }
        />
      </div>
      <Form className="grow" action={updateProfileAction}>
        <div className="p-6 space-y-6">
          {/* Picture */}
          {/* Basic Information */}
          <section>
            <h2 className="text-xl leading-snug text-gray-800 dark:text-gray-100 font-bold mb-1">
              Základní informace
            </h2>
            <div className="sm:flex sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-5">
              <div className="sm:w-1/2">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="first_name"
                >
                  Jméno
                </label>
                <input
                  name="first_name"
                  id="first_name"
                  className="form-input w-full"
                  type="text"
                  defaultValue={firstName}
                />
              </div>
              <div className="sm:w-1/2">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="last_name"
                >
                  Příjmení
                </label>
                <input
                  name="last_name"
                  id="last_name"
                  className="form-input w-full"
                  type="text"
                  defaultValue={lastName}
                />
              </div>
            </div>
          </section>
          {/* Email */}
          <section>
            <h2 className="text-xl leading-snug text-gray-800 dark:text-gray-100 font-bold mb-1">
              Email
            </h2>
            <div className="sm:flex sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-5">
              <div className="sm:w-1/2">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  name="newemail"
                  id="email"
                  className="form-input w-full"
                  type="email"
                  defaultValue={email}
                />
              </div>
            </div>
          </section>
          {/* Password */}
          <section>
            <h2 className="text-xl leading-snug text-gray-800 dark:text-gray-100 font-bold mb-1">
              Heslo
            </h2>
            <div className="text-sm">
              Změna hesla je trvalá a nevratná operace. Heslo by mělo obsahovat
              velká a malá písmena, číslice a mít alespoň 4 znaky.
            </div>

            <div className="sm:flex sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-5">
              <div className="sm:w-1/2">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="newpassword"
                >
                  Nové heslo
                </label>
                <input
                  name="newpassword"
                  id="newpassword"
                  className="form-input w-full"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="sm:w-1/2">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="newpasswordcheck"
                >
                  Zadejte znovu nové heslo
                </label>
                <input
                  id="newpasswordcheck"
                  className="form-input w-full"
                  type="password"
                  value={newPasswordCheck}
                  onChange={(e) => setNewPasswordCheck(e.target.value)}
                />
              </div>
            </div>
            {newPassword.trim() && (
              <ul className="list-disc mt-2 text-sm">
                <li
                  className={`flex items-center ${
                    passwordValidation.hasUpperCase
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {passwordValidation.hasUpperCase ? (
                    <DoubleCheckIcon />
                  ) : (
                    <CrossIcon />
                  )}
                  Velká písmena
                </li>
                <li
                  className={`flex items-center ${
                    passwordValidation.hasLowerCase
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {passwordValidation.hasLowerCase ? (
                    <DoubleCheckIcon />
                  ) : (
                    <CrossIcon />
                  )}
                  Malá písmena
                </li>
                <li
                  className={`flex items-center ${
                    passwordValidation.hasNumber
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {passwordValidation.hasNumber ? (
                    <DoubleCheckIcon />
                  ) : (
                    <CrossIcon />
                  )}
                  Číslice
                </li>
                <li
                  className={`flex items-center ${
                    newPasswordCheck === newPassword
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {newPasswordCheck === newPassword ? (
                    <DoubleCheckIcon />
                  ) : (
                    <CrossIcon />
                  )}
                  {newPasswordCheck !== newPassword
                    ? "Zadaná hesla nejsou shodná"
                    : "Zadaná hesla jsou shodná"}
                </li>
              </ul>
            )}
          </section>
        </div>
        {/* Panel footer */}
        <footer>
          <div className="flex flex-col px-6 py-5 border-t border-gray-200 dark:border-gray-700/60">
            {/* Input a tlačítko */}
            <div className="text-sm pb-5">
              Pro autorizaci změn je nutné zadat aktuální heslo k účtu.
            </div>
            <div className="flex flex-col sm:flex-col md:flex-row md:justify-between md:items-center">
              {/* Input pole */}
              <div className="md:w-1/2 mb-4 md:mb-0">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="oldpassword"
                >
                  Aktuální heslo
                </label>
                <input
                  id="oldpassword"
                  name="oldpassword"
                  className="form-input w-full"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>
              {/* Tlačítko */}
              <div className="self-end">
                {validateButton(oldPassword, newPassword, newPasswordCheck) ? (
                  <Button
                    color="secondary"
                    type="submit"
                    onPress={() => {
                      toast.info("Ukládám údaje.", {
                        autoClose: 10000,
                        hideProgressBar: false,
                        theme: "dark",
                      });
                    }}
                  >
                    Uložit změny
                  </Button>
                ) : (
                  <Button color="default" disabled type="button">
                    Uložit změny
                  </Button>
                )}
              </div>
            </div>
          </div>
        </footer>

        <input type="hidden" name="id" value={userId} />
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="avatar" value={newAvatar} />
      </Form>
    </div>
  );
}
