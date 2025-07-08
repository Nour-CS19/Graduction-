// src/utils/validationSchemas.js
import * as Yup from 'yup';

// Validation schema for Doctor
export const doctorValidationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot be longer than 50 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits')
    .required('Phone number is required'),
  specialty: Yup.string()
    .min(3, 'Specialty must be at least 3 characters')
    .required('Specialty is required'),
});

// Validation schema for Patient
export const patientValidationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot be longer than 50 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  age: Yup.number()
    .min(1, 'Age must be greater than 0')
    .required('Age is required'),
  gender: Yup.string().required('Gender is required'),
});

// Validation schema for Nurse
export const nurseValidationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot be longer than 50 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits')
    .required('Phone number is required'),
  department: Yup.string()
    .required('Department is required'),
});

// Validation schema for Lab
export const labValidationSchema = Yup.object({
  name: Yup.string()
    .min(3, 'Lab name must be at least 3 characters')
    .required('Lab name is required'),
  location: Yup.string()
    .min(5, 'Location must be at least 5 characters')
    .required('Location is required'),
});
