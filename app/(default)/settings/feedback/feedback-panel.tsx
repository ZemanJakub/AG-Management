"use client";
import { sendFeedback } from "@/actions";
import { DataForSession } from "@/app/lib/models";
import { Button } from "@nextui-org/react";
import Form from "next/form";
import { useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";
export default function FeedbackPanel({
  userData,
}: {
  userData: DataForSession;
}) {
  const [state, sendFeedbackAction, isPending] = useActionState(sendFeedback, undefined);
  const [evaluationState, setEvaluationState] = useState(3);
  const [feedbackState, setFeedbackState] = useState("");
  
  const eveluationHandler = (value: number) => {
    return () => {
      setEvaluationState(value);
    };
  };
  useEffect(() => {
    toast.dismiss();
    if (state?.success) {
      toast.success("Údaje byly úspěšně uloženy.", {
        autoClose: 2000,
        hideProgressBar: false,
        theme: "dark",
      });
      setFeedbackState("");
      setEvaluationState(3);
    }
    if (state?.success === false) {
      toast.error("Něco se pokazilo. Zkuste to prosím znovu.", {
        autoClose: 2000,
        hideProgressBar: false,
        theme: "dark",
      });
    }
  }, [state]);


  return (
    <Form className="grow" action={sendFeedbackAction}>
      <div className="grow">
        {/* Panel body */}
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-4">
              Zpětná vazba
            </h2>
            <div className="text-sm">
              Na uživatelské zkušenosti nám velmi záleží, dejte nám prosím
              zpětnou vazbu!
            </div>
          </div>

          {/* Rate */}
          <section>
            <h3 className="text-xl leading-snug text-gray-800 dark:text-gray-100 font-bold mb-6">
              Jak se Vám líbí naše aplikace?
            </h3>
            <div className="w-full max-w-xl">
              <div className="relative">
                <div
                  className="absolute left-0 top-1/2 -mt-px w-full h-0.5 bg-gray-200 dark:bg-gray-700/60"
                  aria-hidden="true"
                ></div>
                <ul className="relative flex justify-between w-full">
                  <li className="flex">
                    <button
                      type="button"
                      className={`w-3 h-3 rounded-full ${
                        evaluationState === 1
                          ? "bg-violet-500 border-2 border-violet-500"
                          : "bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500"
                      }`}
                      onClick={eveluationHandler(1)}
                    >
                      <span className="sr-only">1</span>
                    </button>
                  </li>
                  <li className="flex">
                    <button
                      type="button"
                      className={`w-3 h-3 rounded-full ${
                        evaluationState === 2
                          ? "bg-violet-500 border-2 border-violet-500"
                          : "bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500"
                      }`}
                      onClick={eveluationHandler(2)}
                    >
                      <span className="sr-only">2</span>
                    </button>
                  </li>
                  <li className="flex">
                    <button
                      type="button"
                      className={`w-3 h-3 rounded-full ${
                        evaluationState === 3
                          ? "bg-violet-500 border-2 border-violet-500"
                          : "bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500"
                      }`}
                      onClick={eveluationHandler(3)}
                    >
                      <span className="sr-only">3</span>
                    </button>
                  </li>
                  <li className="flex">
                    <button
                      type="button"
                      className={`w-3 h-3 rounded-full ${
                        evaluationState === 4
                          ? "bg-violet-500 border-2 border-violet-500"
                          : "bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500"
                      }`}
                      onClick={eveluationHandler(4)}
                    >
                      <span className="sr-only">4</span>
                    </button>
                  </li>
                  <li className="flex">
                    <button
                      type="button"
                      className={`w-3 h-3 rounded-full ${
                        evaluationState === 5
                          ? "bg-violet-500 border-2 border-violet-500"
                          : "bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500"
                      }`}
                      onClick={eveluationHandler(5)}
                    >
                      <span className="sr-only">5</span>
                    </button>
                  </li>
                </ul>
              </div>
              <div className="w-full flex justify-between text-sm text-gray-500 dark:text-gray-400 italic mt-3">
                <div>Nelíbí</div>
                <div>Velmi se mi líbí</div>
              </div>
            </div>
          </section>

          {/* Tell us in words */}
          <section>
            <h3 className="text-xl leading-snug text-gray-800 dark:text-gray-100 font-bold mb-5">
              Máte nějaké návrhy na zlepšení?
            </h3>
            {/* Form */}
            <label className="sr-only" htmlFor="feedback">
              Leave a feedback
            </label>
            <textarea
              id="feedback"
              name="feedback"
              className="form-textarea w-full focus:border-gray-300"
              rows={4}
              placeholder="Chtěl/a bych zlepšit…"
              value={feedbackState}
              onChange={(e) => setFeedbackState(e.target.value)}
            ></textarea>
          </section>
        </div>

        {/* Panel footer */}
        <footer>
          <div className="flex flex-col px-6 py-5 border-t border-gray-200 dark:border-gray-700/60">
            <div className="flex self-end">
            <Button
                // className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
                color="default"
                onPress={() => {
                  setFeedbackState("");
                  setEvaluationState(3);
                }}
              >
                Zrušit
              </Button>
              <Button
                isLoading={isPending}
                color="secondary"
                // className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white ml-3"
                className="ml-3"
                type="submit"
                onPress={
                  () => {
                  toast.info("Ukládám údaje.", {
                    autoClose: 10000,
                    hideProgressBar: false,
                    theme: "dark",
                  });
                  // setIsPending(true);
                }}
              >
                Odeslat
              </Button>
            </div>
          </div>
        </footer>
      </div>
      <input type="hidden" name="evaluation" value={evaluationState} />
      <input
        type="hidden"
        name="first_name"
        value={userData?.first_name ?? ""}
      />
      <input type="hidden" name="last_name" value={userData?.last_name ?? ""} />
    </Form>
  );
}
