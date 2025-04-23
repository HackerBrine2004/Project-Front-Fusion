'use client'
import React from 'react';
import Particles from '@/components/Particles';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const SignupSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
});

const Signup = () => {

    const router = useRouter();
  // Initialize formik with proper syntax
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    onSubmit: async (values, { resetForm }) => {
      console.log(values);
      // Add your form submission logic here
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/user/add`,
          values
        );

        console.log(res.data)
        console.log(res.status)
        console.log(res.statusText)
        toast.success('User Registered Successfully!');

        router.push('/login');
        resetForm();

      } catch (error) {
        toast.error(error?.response?.data?.message);
        console.log(error);
        setSubmitting(false);
      }
    },
    //validationSchema: SignupSchema
  });

  const uploadFile = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return toast.error('Please select a file');
    }
    console.log(file);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', 'Front-Fusion');
    fd.append('cloud_name', 'dltu8whhd');

    axios.post('https://api.cloudinary.com/v1_1/dltu8whhd/image/upload', fd)
    .then((result) => {
      console.log(result.data.secure_url);
      formik.setFieldValue('avatar', result.data.secure_url);
      toast.success('File uploaded successfully!');
    }).catch((err) => {
      console.log(err);
      toast.error('File upload failed!');
    });
  }
  
  return (
    <div className='relative h-screen bg-black'>
      <div className="absolute z-[-9] top-0 left-0 w-full h-screen">
        <Particles
          particleColors={["#ffffff", "#ffffff"]}
          particleCount={20000}
          particleSpread={40}
          speed={0.06}
          particleBaseSize={60}
          moveParticlesOnHover={false}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      <div className="flex items-center justify-center h-full">
        <div className="bg-white border w-full max-w-md border-gray-200 rounded-xl shadow-2xs dark:bg-neutral-900 dark:border-neutral-700">
          <div className="p-4 sm:p-7">
            <div className="text-center">
              <h1 className="block text-2xl font-bold text-gray-800 dark:text-white">
                Sign up
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">
                Already have an account?
                <a
                  className="text-blue-600 decoration-2 hover:underline focus:outline-hidden focus:underline font-medium dark:text-blue-500"
                  href="http://localhost:3000/login"
                >
                  Log in here
                </a>
              </p>
            </div>
            <div className="mt-5">
              
              <form onSubmit={formik.handleSubmit}>

                <input type="file" onChange={uploadFile} />

                <div className="grid gap-y-4 z-10">
                  {/* Name Input */}
                  <div>
                    <label htmlFor="name" className="block text-sm mb-2 dark:text-white">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        onChange={formik.handleChange}
                        value={formik.values.name}
                        className="py-2.5 sm:py-3 px-4 block w-full border border-gray-300 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-600 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                        required
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-sm mb-2 dark:text-white">
                      Email address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        onChange={formik.handleChange}
                        value={formik.values.email}
                        className="py-2.5 sm:py-3 px-4 block w-full border border-gray-300 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-600 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label htmlFor="password" className="block text-sm mb-2 dark:text-white">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="password"
                        name="password"
                        onChange={formik.handleChange}
                        value={formik.values.password}
                        className="py-2.5 sm:py-3 px-4 block w-full border border-gray-300 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-600 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                        required
                      />
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm mb-2 dark:text-white">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        onChange={formik.handleChange}
                        value={formik.values.confirmPassword}
                        className="py-2.5 sm:py-3 px-4 block w-full border border-gray-300 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-600 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                        required
                      />
                    </div>
                  </div>

                </div>
                  <button
                    type="submit"
                    className="z-100 w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none mt-4"
                  >
                    Sign Up
                  </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;