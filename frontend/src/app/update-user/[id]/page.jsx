'use client'
import { useParams } from 'next/navigation'
import React, { useEffect } from 'react'
import axios from 'axios'
import { useState } from 'react'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const Updateuser = () => {
  
  const { id } = useParams();
  const [userData, setUserData] = useState (null);
    

  const fetchUserData = async () => {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/getbyid/${id}`);
    console.log(res.data);
    setUserData(res.data);
  }
  
  useEffect(() => {
    fetchUserData()
  }, []);

  if(userData === null) {
    return <p className='text-center my-6 text-gray-300 font-bold'>Loading... </p>
  }

  return (
    <div>
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
                  href="../examples/html/signup.html"
                >
                  Log in here
                </a>
              </p>
            </div>
            <div className="mt-5">
              
              <form onSubmit={formik.handleSubmit}>
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
    </div>
  )
}

export default Updateuser;