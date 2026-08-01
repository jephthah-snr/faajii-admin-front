import * as yup from "yup";

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required("Enter email address")
    .email("Invalid email address"),
  password: yup.string().min(6, "Invalid password"),
});

export const addGiftSchema = yup.object().shape({
  name: yup.string().required("Enter product name"),
  description: yup.string().required("Enter product description"),
  amount: yup.string().required("Enter product price"),
  quantity: yup.string().required("Enter product stock"),
});

export const addPartyBundleSchema = yup.object().shape({
  name: yup.string().required("Enter bundle name"),
  description: yup.string().required("Enter bundle description"),
  amount: yup.string().required("Enter bundle price"),
});

export const createAdmin = yup.object().shape({
  firstName: yup.string().required("Enter first name"),
  lastName: yup.string().required("Enter last name"),
  adminRole: yup.string().required("Select an admin role"),
  phoneNumber: yup.string().required("Enter phone number"),
  email: yup.string().required("Enter email"),
});

export const createGuest = yup.object().shape({
  guestName: yup.string().required("Enter guest name"),
  phoneNumber: yup.string().required("Enter phone number"),
  email: yup
    .string()
    .required("Enter email address")
    .email("Invalid email address"),
});

export const verifyTransactionSchema = yup.object().shape({
  session_id: yup.string().required("Enter a valid session ID"),
});

export const orderStatusSchema = yup.object().shape({
  status: yup.string().required("Select a status"),

  note: yup.string().when("status", {
    is: (status: string) => ["Refunded", "Returned", "Failed"].includes(status),
    then: (schema) => schema.required("Note is required for this status"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export const addTeamMemberSchema = yup.object().shape({
  name: yup.string().required("Enter team member name"),
  email: yup
    .string()
    .required("Enter email address")
    .email("Invalid email address"),
  phoneNumber: yup.string().required("Enter phone number"),
  role: yup.string().required("Select a role"),
});

export const createRoleSchema = yup.object({
  name: yup.string().required("Enter role name"),
  description: yup.string().optional(),
  permissions: yup
    .array()
    .of(yup.string().required())
    .min(1, "Select at least one permission")
    .required("Select at least one permission"),
});
