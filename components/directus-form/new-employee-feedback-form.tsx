import React, { useRef, useEffect, use } from "react";
import { useActionState } from "react";
import {employeeFeedback} from "@/actions";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  CardFooter,
  Checkbox,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import useSWR from "swr";
import { fetchFeedbackInformations } from "@/db/queries/feedback";
import Image from "next/image";
import { startsWith } from "lodash";
import { startTransition } from "react";



interface Props {
  nextStep: () => void;
  onBack: () => void;
  employyeeId?: string;
}

interface Feedback {
  id: string;
  name: string;
  image: string;
  category: string;
  votes: number;
}

const NewEmployeeFeedbackForm = ({ nextStep, onBack, employyeeId }: Props) => {
  const [state, action, isPending] = useActionState(
    employeeFeedback,
    null
  );
  const selectedFeedbacks = useRef<Feedback[]>([]);

  const { data: feedbacks = [], error: feedbacksError } = useSWR(
    "fetch-feedbacks", // Klíč, aby `useSWR` správně sledovalo cache
    fetchFeedbackInformations
  );
  

  useEffect(() => {
    if (state?.success) {
      toast.dismiss();
      toast.success("Data byla v pořádku uložena...", {
        autoClose: 2000,
        hideProgressBar: true,
        theme: "dark",
      });
      nextStep();
    }
    if (state?.error) {
      toast.dismiss();
      toast.error("Data se nepodařilo uložit...", {
        autoClose: 8000,
        hideProgressBar: true,
        theme: "dark",
      });
    }
  }, [state?.success, state?.error]);

  if (!feedbacks) {
    return <Spinner color="warning" label="Načítám formulář..." size="lg" />;
  }

  if (feedbacksError) {
    return (
      <div className="text-red-500">
        Chyba při načítání dat. Zkuste to znovu později.
      </div>
    );
  }

  const toggleFeedback = (feedback: Feedback, checked: boolean) => {
    if (checked) {
      selectedFeedbacks.current.push(feedback);
    } else {
      selectedFeedbacks.current = selectedFeedbacks.current.filter(
        (f) => f.id !== feedback.id
      );
    }
  };


const handleSubmit = () => {
  if (!employyeeId) {
    toast.error("ID zaměstnance není k dispozici!", { theme: "dark" });
    return;
  }

  if (selectedFeedbacks.current.length === 0) {
    toast.error("Vyberte alespoň jeden feedback!", { theme: "dark" });
    return;
  }

  startTransition(() => {
    selectedFeedbacks.current.forEach((feedback) => {
      action({
        id: employyeeId,
        feedback,
      });
    });
  });

  toast.info("Ukládám data...", {
    autoClose: 8000,
    hideProgressBar: false,
    theme: "dark",
  });
};

    const background = "--heroui-background";
    const linearGradientBg = startsWith(background, "--")
      ? `hsl(var(${background}))`
      : background;
  

  const style = {
    border: "solid 2px transparent",
    backgroundImage: `linear-gradient(${linearGradientBg}, ${linearGradientBg}), linear-gradient(to right, #4051a0, #9353D3)`,
    backgroundOrigin: "border-box",
    backgroundClip: "padding-box, border-box",
  };

  return (
    <div className="flex justify-center md:justify-center">
      <div className="relative">
        <div className="px-4 sm:px-6 py-2 w-full max-w-[96rem] mx-auto">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {feedbacks
    .sort((a: Feedback, b: Feedback) => {
      if (a.category === "FACEBOOK" && b.category !== "FACEBOOK") return -1;
      if (a.category !== "FACEBOOK" && b.category === "FACEBOOK") return 1;
      return 0;
    })
    .map((feedback: Feedback) => (
            <Card className="py-4 bg-gray-200 dark:bg-gray-800" key={feedback.id}>
              <CardHeader className="pb-0 pt-2 px-4 flex-col items-start ">
                <p className="text-tiny uppercase font-bold">{feedback.category}</p>
                {/* <small className="text-default-500">{feedback.name}</small> */}
                <h4 className="font-bold text-large">{feedback.name}</h4>
              </CardHeader>
              <CardBody className="overflow-visible py-2">
                <Image
                  alt="Card background"
                  className="object-cover rounded-xl"
                  src={ `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${feedback.image}?t=${new Date().getTime()}`}
                  width={340}
                  height={270}
                  // style={{ width: "128px", height: "128px" }}
             
                />
              </CardBody>
              <CardFooter className="flex justify-between items-center px-4 py-2">
                <Checkbox
                  defaultSelected={false}
                  radius="sm"
                  color="secondary"
                  onChange={(event) => {
                    toggleFeedback(feedback, event.target.checked);
                  }}
                >
                  Označit
                </Checkbox>
              </CardFooter>
            </Card>
          ))}
</div>
          <div className="mx-auto my-6 flex w-full items-center justify-center gap-x-4 lg:mx-0">
            <Button
              className="rounded-medium border-default-200 text-medium font-medium text-default-500 w-32"
              variant="bordered"
              onPress={onBack}
            >
              <Icon icon="solar:arrow-left-outline" width={24} />
              Zpět
            </Button>

            <Button
              className="text-medium font-medium"
              type="button"
              disabled={isPending}
              onPress={handleSubmit}
              style={style}
            >
              Pokračovat
            </Button>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default NewEmployeeFeedbackForm;