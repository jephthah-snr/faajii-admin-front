export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  PhoneNumber: string;
  avatar: string | null;
  fullName: string;
  permission: "super" | "admin" | "finance" | "support";
}
