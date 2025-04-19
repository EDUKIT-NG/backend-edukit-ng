import Joi from "joi";

const RegisterSchema = Joi.object({
  name: Joi.string().required().messages({ "any.required": "Name required" }),

  username: Joi.string().required().messages({
    "any.required": "Username required",
    "string.min": "Username must be at least 4 characters long",
    "string.max": "Username must be at most 10 characters long",
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
    .required()
    .valid("student", "school", "volunteer", "admin", "partner")
    .messages({
      "any.required": "Role required",
      "any.only":
        "Role must be one of 'student', 'school', 'volunteer', 'admin', 'partner'",
    }),

  phoneNumber: Joi.string().required().messages({
    "any.required": "Phone Number required",
  }),

  address: Joi.string().required().messages({
    "any.required": "Address required",
  }),

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
