import Joi from "joi";

const RegisterSchema = Joi.object({
  name: Joi.string().required().messages({ "any.required": "Name required" }),

  ContactPerson: Joi.string().min(3).messages({
    "any.required": "Contact Person required.",
  }),

  email: Joi.string()
    .required()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .messages({
      "any.required": "Email required",
      "string.email": "Please provide a valid email address.",
    }),

  role: Joi.string()
    .valid("student", "school", "volunteer", "admin", "partner", "")
    .messages({
      "any.required": "Role required",
      "any.only":
        "Role must be one of 'student', 'school', 'volunteer', 'admin', 'partner'",
    }),

  phoneNumber: Joi.string().messages({}),

  address: Joi.string().messages({}),

  password: Joi.string()
    .required()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
      )
    )
    .messages({
      "any.required": "Password required",
      "string.pattern.base":
        "Password must be at least 8 characters long and include a capital letter, a number, and a special character.",
    }),

  confirmPassword: Joi.string().required().valid(Joi.ref("password")).messages({
    "any.required": "Kindly confirm your password",
    "any.only": "Password does not match",
  }),
});

export default RegisterSchema;
