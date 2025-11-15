import React, { useState, useEffect } from 'react';
import { Appointment, AppointmentStatus } from '../../types';
import { getCounsellorAppointments, updateAppointmentStatus } from '../../services/api';

interface AppointmentRequestsProps {
  counsellorId: string;
}

const AppointmentRequests: React.FC<AppointmentRequestsProps> = ({ counsellorId }) => {
  const [requests, setRequests] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
      const allAppointments = await getCounsellorAppointments(counsellorId);
      setRequests(allAppointments.filter(app => app.status === AppointmentStatus.PENDING));
    };
    fetchRequests();
  }, [counsellorId]);

  const handleUpdateStatus = async (appointmentId: string, status: AppointmentStatus) => {
    await updateAppointmentStatus(appointmentId, status);
    setRequests(requests.filter(req => req.id !== appointmentId));
  };

  return (
    <div>
      <h2 className="mb-6 text-3xl font-bold text-gray-800 dark:text-white">Appointment Requests</h2>
      {requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="flex flex-col items-start justify-between p-4 bg-white rounded-lg shadow-md md:flex-row md:items-center dark:bg-gray-800">
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">{req.studentName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{req.dateTime.toLocaleString()}</p>
              </div>
              <div className="flex mt-4 space-x-2 md:mt-0">
                <button
                  onClick={() => handleUpdateStatus(req.id, AppointmentStatus.CONFIRMED)}
                  className="px-3 py-1 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600"
                >
                  Confirm
                </button>
                <button
                  onClick={() => handleUpdateStatus(req.id, AppointmentStatus.REJECTED)}
                  className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">No pending appointment requests.</p>
      )}
    </div>
  );
};

export default AppointmentRequests;