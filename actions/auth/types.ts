export type DirectusUserToUpload = {
  id?: string|undefined;
  first_name?: string|undefined;
  last_name?: string|undefined;
  email?: string|undefined;
  password?: string|undefined;
  title?: string|undefined;
  description?: string | null|undefined;
  avatar?: string | null|undefined;
};

export type DirectusUser = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    title: string;
    description: string | null;
    avatar: string | null;
  };