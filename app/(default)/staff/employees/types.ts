import type {SVGProps} from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface EmployeeCard {
  id: string;
  firstName: string;
  secondName: string;
  photo: string;
  email: string;
}