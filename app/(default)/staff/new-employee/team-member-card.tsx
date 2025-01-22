"use client";

import React from "react";
import {
  Avatar,
  Button,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { cn } from "@nextui-org/react";

export type TeamMember = {
  name: string;
  avatar: string;
  role: string;
  bio?: string;
  phone?: string;
  email?: string;
};

export type TeamMemberCardProps = React.HTMLAttributes<HTMLDivElement> &
  TeamMember;

const TeamMemberCard = React.forwardRef<HTMLDivElement, TeamMemberCardProps>(
  (
    { children, avatar, name, role, bio, phone, email, className, ...props },
    ref
  ) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    return (
      <>
        <div
          ref={ref}
          onClick={onOpen}
          className={cn(
            "flex flex-col items-center rounded-large bg-content1 px-4 py-6 text-center shadow-small dark:bg-gray-800 max-w-[300px] ",
            className
          )}
          {...props}
        >
          <Avatar
            className="h-20 w-20"
            src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${avatar}`}
          />
          <h3 className="mt-2 font-medium">{name || children}</h3>
          <span className="text-small text-default-500">{role}</span>
          <p className="mb-4 mt-2 text-default-600 hidden 3xl:block">{bio}</p>
          <div>
            {phone && (
              <div className="hidden 3xl:flex gap-2 items-center mt-2 text-default-500 text-xs ">
                <Icon icon="subway:call" width="16" height="16" />
                <a className="hover:cursor-pointer" href={`tel:${phone}`}>
                  {phone}
                </a>
              </div>
            )}
            {email && (
              <div className="hidden 3xl:flex gap-2 items-center mt-2 text-default-500 text-xs">
                <Icon icon="subway:at" width="16" height="16" />
                <a className="hover:cursor-pointer" href={`mailto:${email}`}>
                  {email}
                </a>
              </div>
            )}
          </div>
        </div>
        <Modal 
        classNames={{
          base: "bg-gray-200 dark:bg-gray-900",
        }}
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
      
        >
          <ModalContent
            
          >
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <Avatar
                    className="h-20 w-20 mr-4"
                    src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${avatar}`}
                  />
                  <div>
                    <h3 className="font-medium text-lg">{name}</h3>
                    <span className="text-small text-default-500">{role}</span>
                  </div>
                </ModalHeader>
                <ModalBody>
                  {bio && <p className="text-default-600 mb-4">{bio}</p>}
                  {phone && (
                    <div className="flex gap-2 items-center mt-2 text-default-500 text-sm">
                      <Icon icon="subway:call" width="16" height="16" />
                      <a className="hover:cursor-pointer" href={`tel:${phone}`}>
                        {phone}
                      </a>
                    </div>
                  )}
                  {email && (
                    <div className="flex gap-2 items-center mt-2 text-default-500 text-sm">
                      <Icon icon="subway:at" width="16" height="16" />
                      <a
                        className="hover:cursor-pointer"
                        href={`mailto:${email}`}
                      >
                        {email}
                      </a>
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Zavřít
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    );
  }
);

TeamMemberCard.displayName = "TeamMemberCard";

export default TeamMemberCard;
