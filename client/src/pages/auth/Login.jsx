import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Briefcase, Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../../components/Input';
import Button from '../../components/Button';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '';

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await login(data.email, data.password);
      toast.success('Logged in successfully!');
      
      const role = response.data.user.role;
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate(`/${role}/dashboard`, { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="glass-card max-w-md w-full p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-xl bg-brand-600 text-white dark:bg-brand-500 mb-2">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-400">Enter your credentials to access your HireFlow account.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              error={errors.email}
              required
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Enter a valid email address'
                }
              })}
            />
          </div>

          <div className="relative">
            <span className="absolute right-3 top-8 z-10 cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </span>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              error={errors.password}
              required
              {...register('password', {
                required: 'Password is required'
              })}
            />
          </div>

          <Button type="submit" className="w-full py-2.5 shadow-md shadow-brand-500/10" loading={loading}>
            Sign In
          </Button>
        </form>

        <div className="text-center border-t border-slate-100 dark:border-slate-800 pt-4">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
