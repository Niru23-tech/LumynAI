import React, { useState, useEffect } from 'react';
import { User, JournalEntry, Role } from '../../types';
import { getUsers, getStudentJournal } from '../../services/api';

const StudentJournalsView: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getUsers(Role.STUDENT).then(setStudents);
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      setLoading(true);
      setError('');
      // NOTE: By default, RLS policy only allows students to see their own journals.
      // A counsellor would need specific permissions to view them. This call will likely fail
      // without adjusted RLS policies. This is a security measure.
      getStudentJournal(selectedStudent.id).then(entries => {
        setJournalEntries(entries);
        setLoading(false);
      }).catch(() => {
          setError('You do not have permission to view this student\'s journal entries.');
          setJournalEntries([]);
          setLoading(false);
      });
    } else {
      setJournalEntries([]);
      setError('');
    }
  }, [selectedStudent]);

  const handleSelectStudent = (studentId: string) => {
      const student = students.find(s => s.id === studentId);
      setSelectedStudent(student || null);
  }

  return (
    <div>
      <h2 className="mb-6 text-3xl font-bold text-gray-800 dark:text-white">Student Journals</h2>
      
      <div className="mb-6">
        <label htmlFor="student-select" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select a student:</label>
        <select 
            id="student-select" 
            onChange={e => handleSelectStudent(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full md:w-1/3 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          <option value="">-- View Student Journal --</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div>
        {loading ? (
            <p>Loading entries...</p>
        ) : error ? (
            <p className="text-center text-red-500 dark:text-red-400">{error}</p>
        ) : selectedStudent ? (
          journalEntries.length > 0 ? (
            <div className="space-y-4">
              {journalEntries.map(entry => (
                <div key={entry.id} className="p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{entry.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{entry.createdAt.toLocaleDateString()}</p>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">{entry.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">{selectedStudent.name} has no journal entries.</p>
          )
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">Please select a student to view their journal.</p>
        )}
      </div>
    </div>
  );
};

export default StudentJournalsView;