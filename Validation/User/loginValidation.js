import Joi from "joi";

const logInSchema = Joi.object({
  username: Joi.string().min(4).max(10),

  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),

  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
})
  .xor("username", "email")
  .messages({
    "any.required": "Username or email is required",
  });

export default logInSchema;
