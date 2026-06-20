import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentAuthCard, { AuthInput } from '../components/StudentAuthCard';
import API from '../../api';

const StudentLogin = () => {
  const navigate = useNavigate();
  const [indexNumber, setIndexNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await API.post('/student/login', {
        indexno: indexNumber,
        password: password
      });

      const data = response.data;
      // Axios responses don't have `ok` (that's a Fetch API property).
      // Check status and payload instead.
      if (response.status !== 200 || !data || !data.student) {
        setError(data?.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Success - store student data and redirect
      localStorage.setItem('student', JSON.stringify(data.student));
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.message || 'Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <StudentAuthCard
      title="Student Login"
      subtitle="Access your progress, paper history, and profile from one place."
      onSubmit={handleSubmit}
      submitLabel={loading ? 'Logging in...' : 'Login'}
      footer={
        <>
          <span className="text-slate-200">Use your index number and the password sent to your registered email.</span>
        </>
      }
      error={error}
      isLoading={loading}
    >
      <AuthInput
        label="Index Number (Username)"
        value={indexNumber}
        onChange={setIndexNumber}
        placeholder="e.g. STU-2026-001"
        disabled={loading}
      />
      <AuthInput
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="Enter your password"
        disabled={loading}
      />
    </StudentAuthCard>
  );
};

export default StudentLogin;
