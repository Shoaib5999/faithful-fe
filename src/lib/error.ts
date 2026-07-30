export const getErrorMessage = (error: any) =>
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong";