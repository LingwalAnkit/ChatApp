import { useState } from 'react';

const RegisterForm = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    region: '',
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!formData.region.trim()) {
      newErrors.region = 'Region is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onRegister(formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-2xl font-bold text-center text-gray-800">
            Join Area Chat
          </h2>
          
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 
                ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter your username"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="region" className="block text-sm font-medium text-gray-700">
              Your Area/Region
            </label>
            <input
              id="region"
              name="region"
              type="text"
              value={formData.region}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400
                ${errors.region ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter your area or region (e.g., Downtown NYC, South Delhi)"
            />
            {errors.region && (
              <p className="text-red-500 text-sm mt-1">{errors.region}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition duration-200"
          >
            Join Chat
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;