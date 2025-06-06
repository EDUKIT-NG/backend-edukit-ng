export const sanitizeUser = (user) => {
  const sanitizedUser = {
    _id: user._id.toString(),
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
  };

  switch (user.role) {
    case "student":
      sanitizedUser.isVerified = user.isVerified;
      sanitizedUser.grade = user.grade;
      break;
    case "school":
      sanitizedUser.isVerified = user.isVerified;
      break;
    case "sponsor":
      sanitizedUser.isVerified = user.isVerified;
      break;
    case "volunteer":
      sanitizedUser.isVerified = user.isVerified;
      break;
    case "donor":
      sanitizedUser.isVerified = user.isVerified;
      break;
    case "admin":
      sanitizedUser.isVerified = user.isVerified;
      sanitizedUser.isAdmin = user.isAdmin;
      break;
    default:
      break;
  }

  return sanitizedUser;
};
