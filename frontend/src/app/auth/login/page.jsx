'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';

const loginFormValidation = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

const Register = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const loginForm = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        const result = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/authenticate`, values);
        console.log(result.data);
        toast.success('successfully!logged in!');
        localStorage.setItem('token', result.data.token);
        resetForm();
        router.push('/');
      } catch (err) {
        console.error(err);
        toast.error('Login failed!');
      } finally {
        setLoading(false);
      }
    },
    validationSchema: loginFormValidation,
  });

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white flex items-center justify-center">
      <div className="bg-[#1a1a1d] p-8 rounded-2xl shadow-xl w-full max-w-md border border-[#2a2a2e]">
        <h1 className="text-3xl font-bold mb-6 text-center">Create Account</h1>

        <form onSubmit={loginForm.handleSubmit} className="space-y-4">


          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={loginForm.values.email}
              onChange={loginForm.handleChange}
              className="w-full bg-transparent text-white p-2 border border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            {loginForm.errors.email && loginForm.touched.email ? (
              <div className="text-red-500 text-sm mt-1">{loginForm.errors.email}</div>
            ) : null}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={loginForm.values.password}
              onChange={loginForm.handleChange}
              className="w-full bg-transparent text-white p-2 border border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            {loginForm.errors.password && loginForm.touched.password ? (
              <div className="text-red-500 text-sm mt-1">{loginForm.errors.password}</div>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white px-6 py-2 rounded-lg transition-all ${loading ? 'bg-purple-600 opacity-50' : 'bg-purple-600 hover:bg-purple-700'
              }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>

          <p className="text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link href="/signin" className="text-purple-400 hover:text-purple-300">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;