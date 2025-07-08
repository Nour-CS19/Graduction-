export const validateAdminData = (data, isUpdate = false) => {
    const errors = {};
  
    if (!data.fname?.trim()) errors.fname = 'First name is required';
    if (!data.lname?.trim()) errors.lname = 'Last name is required';
    if (!data.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = 'Email is invalid';
    }
    if (!isUpdate && !data.password?.trim()) errors.password = 'Password is required';
    if (!data.phone?.trim()) errors.phone = 'Phone is required';
    if (!data.age) errors.age = 'Age is required';
    if (!data.gender?.trim()) errors.gender = 'Gender is required';
    if (!data.role?.trim()) errors.role = 'Role is required';
  
    return errors;
  };