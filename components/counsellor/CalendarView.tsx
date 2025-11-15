import React, { useState, useEffect } from 'react';
import { Appointment, AppointmentStatus } from '../../types';
import { getCounsellorAppointments } from '../../services/api';

interface CalendarViewProps {
  counsellorId: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({ counsellorId }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchAppointments = async () => {
      const allAppointments = await getCounsellorAppointments(counsellorId);
      setAppointments(allAppointments.filter(app => app.status === AppointmentStatus.CONFIRMED));
    };
    fetchAppointments();
  }, [counsellorId]);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startOfMonth.getDay());
  const endDate = new Date(endOfMonth);
  endDate.setDate(endDate.getDate() + (6 - endOfMonth.getDay()));

  const calendarDays = [];
  let day = new Date(startDate);
  while (day <= endDate) {
    calendarDays.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };
  
  const getAppsForDay = (date: Date) => {
      return appointments.filter(app => {
        const appDate = app.dateTime;
        return appDate.getDate() === date.getDate() &&
               appDate.getMonth() === date.getMonth() &&
               appDate.getFullYear() === date.getFullYear();
      });
  }

  return (
    <div>
      <h2 className="mb-6 text-3xl font-bold text-gray-800 dark:text-white">My Calendar</h2>
      <div className="p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => changeMonth(-1)} className="px-3 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">&lt;</button>
          <h3 className="text-xl font-semibold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
          <button onClick={() => changeMonth(1)} className="px-3 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">&gt;</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {daysOfWeek.map(d => <div key={d} className="font-semibold text-sm text-gray-600 dark:text-gray-400">{d}</div>)}
          {calendarDays.map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const appointmentsOnDay = getAppsForDay(date);
            return (
              <div key={index} className={`p-2 border rounded-md h-28 flex flex-col ${isCurrentMonth ? '' : 'text-gray-400 bg-gray-50 dark:bg-gray-700/50'}`}>
                <span className="font-medium">{date.getDate()}</span>
                <div className="mt-1 space-y-1 overflow-y-auto text-xs text-left">
                    {appointmentsOnDay.map(app => (
                        <div key={app.id} className="p-1 text-white bg-indigo-500 rounded">
                           {app.dateTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} w/ {app.studentName.split(' ')[0]}
                        </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;