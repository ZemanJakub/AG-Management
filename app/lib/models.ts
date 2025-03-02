// přidat pozice zařazení do modelu
export interface DocumentProps {
    id: string;
    holderId?: string;
    folderId?: string;
    name: string;
    type?: string;
    status: string;
    url?: string;
    date_created: string;
    validFrom?: string;
    validTo?: string;
    created_by?: string;
    updated_by?: string;
    date_updated?: string;
    documentId?: string;
    onDocumentChange?: ()=>void;
    documentType?: string;
    contractType?: string;
  }

export interface SingleChatMessage {
    id: string,
    status: string,
    date_created: string,
    text: string,
    image: string
    file: string,
    author: string,
    recipient: string,
}
export interface ChatUser {
    id: string,
    firstName: string,
    secondName: string,
    distinction: string,
    photo: string,
}

export interface WeBSocketMessage {
    date_created: string;
    id: number;
    text: string;
    user: string;
  }

export interface ContractInformations {
    id: string,
    status: string,
    date_created: number | null,
    date_updated: number | null,
    user_created: string | null,
    user_updated: string | null,
    declaration: string,
    employeeId: string,
    contractStart: Date,
    contractEnd: Date,
    contractLimit: number,
    company: string,
    contractPay: string,
    contractType: string,
}

export interface InterviewInformations {
    id: string,
    employeeID: string,
    otherDPP: string,
    otherDPPValue: string,
    shifts: string,
    shiftsValue: number,
    healthStatus:string,
    smoker: string,
    practice: string,
    execution: string,
    valueOfExecution: string,
    dateOfEmployment: Date|null,
    recruitment: string,
    comment: string,
}

export interface BasicEmployeeCard {
    id: string,
    firstName: string,
    secondName: string,
    distinction: string,
    dateOfBirth: Date|null,
    }

export interface EmployeePersonalInformations {
    firstName: string,
    secondName: string,
    distinction: string,
    email: string|null,
    dateOfBirth: Date|null,
    phone: string,
    acount: string,
    adress: string,
    state: string,
    pid: string,
    insurance: string,
    criminalRecord: Date | null,
    healtCheck: Date | null,
    certificate: string,
    photo: string,
    dateOfEmployment: Date | null,




    folderId: string,
    status: string,
}

export interface HolderInformations {
    kalhoty: string,
    triko: string,
    softschell: string,
    zimnibunda: string,
    mikina: string,
    boty: string,
    employeeID: string,
    id: string,
}


export interface Employee {
    otherDPP: string,
    otherDPPValue: string,
    shifts: string,
    shiftsValue: number,
    healthStatus:string,
    smoker: string,
    practice: string,
    execution: string,
    valueOfExecution: string,  
    firstName: string,
    secondName: string,
    distinction: string,
    email: string|null,
    dateOfBirth: Date|null,
    dateOfEmployment: Date|null,
    recruitment: string,
    phone: string,
    acount: string,
    adress: string,
    state: string,
    pid: string,
    insurance: string,
    criminalRecord: Date | null,
    healtCheck: Date | null,
    certificate: string,
    photo: string,
    kalhoty: string,
    triko: string,
    softschell: string,
    zimnibunda: string,
    mikina: string,
    boty: string,
    comment: string,
} 

export interface EmployeeToDisplay {
    id: string
    date_created: string
    otherDPP: string,
    otherDPPValue: string,
    shifts: string,
    shiftsValue: number,
    healthStatus:string,
    smoker: string,
    practice: string,
    execution: string,
    valueOfExecution: string,
    firstName: string,
    secondName: string,
    distinction: string,
    email: string|null,
    dateOfBirth: string|null,
    dateOfEmployment: string|null,
    recruitment: string,
    phone: string,
    acount: string,
    adress: string,
    state: string,
    pid: string,
    insurance: string,
    criminalRecord: string | null,
    healtCheck: string | null,
    certificate: string,
    photo: string,
    kalhoty: string,
    triko: string,
    softschell: string,
    zimnibunda: string,
    mikina: string,
    boty: string,
    comment: string,
    folderId: string,
    status: string,
  }

 export interface SubscriptionToSave {
    endpoint: string;
    p256dh: string;
    auth: string;
    userId:string;
    date?:Date;
    id?:string;
  }

  export interface UserData  {
    id: string | null,
    first_name: string | null,
    last_name: string | null,
    email: string | null,
    avatar: string | null
  }

  export interface DataForSession {
      id: string | null;
      avatar: string | null;
      first_name: string | null;
      last_name: string | null;
      email: string | null;
      access_token: string | null;
      refresh_token: string | null;
      expires: number | null;
      expires_at: number | null;
      expiresAt: number | null;
  }

 export type NotificationData = {
    id: string;
    userId: string;
    title: string;
    message: string;
    status: string;
    date_created: string;
    url?:string;
  };