
import React, { useState, useEffect, useMemo } from 'react';
import { Appointment, AppointmentStatus, User } from '../../types';
import { getStudentAppointments, getCounsellors, bookAppointment, submitAppointmentFeedback } from '../../services/api';
import { CheckCircleIcon, ClockIcon, XCircleIcon, BellIcon, StarIcon } from '../shared/icons/Icons';

interface AppointmentSectionProps {
  studentId: string;
}

const FeedbackModal: React.FC<{
  appointment: Appointment;
  onClose: () => void;
  onSubmit: () => void;
}> = ({ appointment, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating.');
      return;
    }
    setIsSubmitting(true);
    await submitAppointmentFeedback(appointment.id, rating, comment);
    setIsSubmitting(false);
    onSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-4 text-xl font-semibold">Feedback for {appointment.counsellorName}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Rating</label>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
                  <StarIcon className={`w-8 h-8 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <label htmlFor="comment" className="block mb-2 font-medium">Comments (optional)</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              placeholder="How was your session?"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AppointmentCard: React.FC<{ appointment: Appointment; onProvideFeedback: (app: Appointment) => void; }> = ({ appointment, onProvideFeedback }) => {
    const getStatusInfo = () => {
        switch (appointment.status) {
            case AppointmentStatus.CONFIRMED: return { icon: <CheckCircleIcon className="text-green-500" />, color: 'border-green-500', textColor: 'text-green-500' };
            case AppointmentStatus.PENDING: return { icon: <ClockIcon className="text-yellow-500" />, color: 'border-yellow-500', textColor: 'text-yellow-500' };
            case AppointmentStatus.REJECTED: return { icon: <XCircleIcon className="text-red-500" />, color: 'border-red-500', textColor: 'text-red-500' };
            case AppointmentStatus.COMPLETED: return { icon: <CheckCircleIcon className="text-blue-500" />, color: 'border-blue-500', textColor: 'text-blue-500' };
            default: return { icon: <ClockIcon className="text-gray-500" />, color: 'border-gray-500', textColor: 'text-gray-500' };
        }
    };
    const { icon, color, textColor } = getStatusInfo();
    const isPast = new Date() > appointment.dateTime;

    return (
        <div className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border-l-4 ${color} flex flex-col justify-between`}>
            <div>
              <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 dark:text-white">With {appointment.counsellorName}</h3>
                  <span className={`flex items-center text-sm font-medium ${textColor}`}>
                      {icon} <span className="ml-1.5">{appointment.status}</span>
                  </span>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {appointment.dateTime.toLocaleString()}
              </p>
              {appointment.reminder && appointment.status === AppointmentStatus.CONFIRMED && !isPast && (
                  <div className="flex items-center mt-3 p-2 text-xs text-blue-800 bg-blue-100 rounded-md dark:bg-blue-900 dark:text-blue-200">
                      <BellIcon className="w-4 h-4 mr-1.5" />
                      <span>Reminder: {appointment.reminder} before</span>
                  </div>
              )}
            </div>
            {appointment.status === AppointmentStatus.COMPLETED && (
                <div className="mt-4">
                    {appointment.feedback ? (
                        <div>
                            <p className="text-sm font-medium">Your Feedback:</p>
                            <div className="flex items-center">
                                {[...Array(appointment.feedback.rating)].map((_, i) => <StarIcon key={i} className="w-5 h-5 text-yellow-400" />)}
                                {[...Array(5 - appointment.feedback.rating)].map((_, i) => <StarIcon key={i} className="w-5 h-5 text-gray-300" />)}
                            </div>
                            <p className="mt-1 text-sm italic text-gray-600 dark:text-gray-400">"{appointment.feedback.comment}"</p>
                        </div>
                    ) : (
                        <button onClick={() => onProvideFeedback(appointment)} className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600">
                            Provide Feedback
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

const AppointmentSection: React.FC<AppointmentSectionProps> = ({ studentId }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [counsellors, setCounsellors] = useState<User[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedCounsellor, setSelectedCounsellor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedReminder, setSelectedReminder] = useState<'15 minutes' | '1 hour' | '1 day' | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackAppointment, setFeedbackAppointment] = useState<Appointment | null>(null);
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | 'All'>('All');

  const fetchAppointments = () => {
    getStudentAppointments(studentId).then(setAppointments);
  };

  useEffect(() => {
    fetchAppointments();
    getCounsellors().then(setCounsellors);
  }, [studentId]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCounsellor || !selectedDate) return;
    await bookAppointment(studentId, selectedCounsellor, new Date(selectedDate), selectedReminder);
    fetchAppointments();
    setIsBooking(false);
    setSelectedCounsellor('');
    setSelectedDate('');
    setSelectedReminder(null);
  };

  const handleOpenFeedbackModal = (app: Appointment) => {
    setFeedbackAppointment(app);
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmitted = () => {
    setShowFeedbackModal(false);
    setFeedbackAppointment(null);
    fetchAppointments();
  };

  const filteredAppointments = useMemo(() => {
    if (filterStatus === 'All') {
      return appointments; // API returns sorted by date already
    }
    return appointments.filter(app => app.status === filterStatus);
  }, [appointments, filterStatus]);
  
  const filterOptions: (AppointmentStatus | 'All')[] = ['All', AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING, AppointmentStatus.COMPLETED, AppointmentStatus.REJECTED];

  return (
    <div>
      {showFeedbackModal && feedbackAppointment && (
        <FeedbackModal
          appointment={feedbackAppointment}
          onClose={() => setShowFeedbackModal(false)}
          onSubmit={handleFeedbackSubmitted}
        />
      )}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">My Appointments</h2>
        <button onClick={() => setIsBooking(true)} className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
          Book New Appointment
        </button>
      </div>

      {isBooking && (
        <div className="p-6 mb-6 bg-white rounded-lg shadow-md dark:bg-gray-800 animate-fade-in-up">
          <h3 className="mb-4 text-xl font-semibold">New Appointment</h3>
          <form onSubmit={handleBooking} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block mb-1 text-sm font-medium dark:text-gray-300">Counsellor</label>
              <select value={selectedCounsellor} onChange={e => setSelectedCounsellor(e.target.value)} required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                <option value="">Select a counsellor</option>
                {counsellors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium dark:text-gray-300">Date & Time</label>
              <input type="datetime-local" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium dark:text-gray-300">Reminder</label>
              <select 
                value={selectedReminder || ''} 
                onChange={e => setSelectedReminder(e.target.value ? e.target.value as '15 minutes' | '1 hour' | '1 day' : null)} 
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">No reminder</option>
                <option value="15 minutes">15 minutes before</option>
                <option value="1 hour">1 hour before</option>
                <option value="1 day">1 day before</option>
              </select>
            </div>
            <div className="flex items-end space-x-2">
              <button type="submit" className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Confirm Booking</button>
              <button type="button" onClick={() => setIsBooking(false)} className="w-full px-4 py-2 font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {filterOptions.map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              filterStatus === status
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div>
        {filteredAppointments.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAppointments.map(app => <AppointmentCard key={app.id} appointment={app} onProvideFeedback={handleOpenFeedbackModal} />)}
            </div>
        ) : (
            <div className="py-12 text-center bg-white rounded-lg shadow-md dark:bg-gray-800">
                <p className="text-gray-500 dark:text-gray-400">
                    {filterStatus === 'All' ? 'You have no appointments yet.' : `You have no ${filterStatus.toLowerCase()} appointments.`}
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentSection;
