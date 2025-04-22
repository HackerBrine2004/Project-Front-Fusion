'use client'
import { IconPencil, IconTrash } from '@tabler/icons-react'
import axios from 'axios'
import React, { useEffect } from 'react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const ManageUser = () => {

  const [userList, setUserList] = useState([]);

  const fetchUsers = async () => {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/getall`)
    console.table(res.data);
    setUserList(res.data);
  }

  useEffect(() => {
    fetchUsers()
  }, []);

  const deleteUser = async (id) => {
    const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/user/delete/${id}`);
    console.log(res.data);
    fetchUsers();
    toast.success("User deleted successfully")
  }

  return (
    <div>

      <div className='container mx-auto py-8'>
        <h1 className='text-center font-bold text-3xl mt-6'>Manage Users</h1>

        <table className='w-full mt-10 border border-gray-300'>
          <thead className='bg-gray-200'>
            <tr>
              <th className='p-2'>ID</th>
              <th className='p-2'>Name</th>
              <th className='p-2'>Email</th>
              <th className='p-2'>City</th>
              <th className='p-2'>Created</th>
              <th className='p-2' colSpan={2}></th>
            </tr>
          </thead>
          <tbody>
            {
              userList.map((user, index) => {
                return <tr key={index} className='border-b border-gray-300'>
                  <td className='p-2'>{user._id}</td>
                  <td className='p-2'>{user.name}</td>
                  <td className='p-2'>{user.email}</td>
                  <td className='p-2'>{user.city}</td>
                  <td className='p-2'>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className='p-2'>
                    <Link href={'/update-user/'+user._id} className='block w-fit text-black rounded p-2 bg-violet-500 '>
                    <IconPencil/>
                    </Link>
                  </td>
                  <td className='p-2'>
                    <button className='p-2 bg-red-500 text-white rounded' onClick={() => deleteUser(user._id)}>
                      <IconTrash />
                    </button>
                  </td>
                </tr>

              })
            }
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default ManageUser;