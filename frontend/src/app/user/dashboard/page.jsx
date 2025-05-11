'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  StarIcon 
} from '@heroicons/react/24/outline';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const Dashboard = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Complete Project Design', status: 'In Progress', priority: 'High', dueDate: '2025-05-15' },
    { id: 2, title: 'Review Code Changes', status: 'Pending', priority: 'Medium', dueDate: '2025-05-12' },
    { id: 3, title: 'Update Documentation', status: 'Completed', priority: 'Low', dueDate: '2025-05-10' },
  ]);

  const stats = [
    { title: 'Total Tasks', value: '12', icon: ChartBarIcon, color: 'bg-purple-500' },
    { title: 'In Progress', value: '5', icon: ClockIcon, color: 'bg-blue-500' },
    { title: 'Completed', value: '7', icon: CheckCircleIcon, color: 'bg-green-500' },
    { title: 'Priority', value: '3', icon: StarIcon, color: 'bg-yellow-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <motion.h1 
            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            Task Dashboard
          </motion.h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tasks List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6 border border-gray-700"
        >
          <h2 className="text-xl font-semibold mb-4">Recent Tasks</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="pb-3 text-left">Task</th>
                  <th className="pb-3 text-left">Status</th>
                  <th className="pb-3 text-left">Priority</th>
                  <th className="pb-3 text-left">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <motion.tr
                    key={task.id}
                    whileHover={{ scale: 1.01 }}
                    className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="py-4">{task.title}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        task.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                        task.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        task.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                        task.priority === 'Medium' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-4 text-gray-400">{task.dueDate}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
