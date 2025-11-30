import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/Input";
import { Label } from "@/Components/ui/Label";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const [formData, setFormData] = useState({
    otp_code: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (!email) {
    toast.error('No email provided for password reset. Please try again.');
    navigate('/forgot-password');
    return null;
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validatePassword = (password) => {
    const passwordErrors = [];
    
    if (password.length < 8) {
      passwordErrors.push('at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      passwordErrors.push('one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      passwordErrors.push('one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      passwordErrors.push('one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;/`~]/.test(password)) {
      passwordErrors.push('one special character');
    }
    
    return passwordErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate password strength
    const passwordValidation = validatePassword(formData.new_password);
    if (passwordValidation.length > 0) {
      newErrors.new_password = `Password must contain ${passwordValidation.join(', ')}`;
    }

    if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('api/auth/reset-password/', {
        email,
        otp_code: formData.otp_code,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password
      });
      toast.success(response.data.message);
      navigate('/login');
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await axios.post('api/auth/forgot-password/', { email });
      toast.success(response.data.message);
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error(error.response?.data?.error || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-20 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 hover:bg-card/70 text-muted-foreground border border-border/50 shadow-lg backdrop-blur-md transition-all duration-200"
      >
        <span className="text-xl leading-none">←</span>
        <span className="text-sm font-medium tracking-wide uppercase opacity-90">Go back</span>
      </button>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
      <div className="w-full max-w-md p-8 space-y-6 bg-card/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 relative z-10 animate-fade-in">
        <div className="text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-primary/20 rounded-full border border-primary/30">
            <span className="text-primary text-sm font-semibold">Password Reset</span>
          </div>
          <h1 className="text-4xl font-extrabold text-foreground mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Reset Password
          </h1>
          <p className="text-muted-foreground">
            Enter the code sent to <span className="font-medium text-primary">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="otp_code" className="text-foreground font-medium">Reset Code</Label>
            <Input
              id="otp_code"
              name="otp_code"
              type="text"
              placeholder="000000"
              maxLength="6"
              required
              value={formData.otp_code}
              onChange={(e) => setFormData({...formData, otp_code: e.target.value.replace(/\D/g, '').slice(0, 6)})}
              disabled={loading}
              className="bg-input border-border/50 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary/20 transition-all duration-300 text-center tracking-widest"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new_password" className="text-foreground font-medium">New Password</Label>
            <Input
              id="new_password"
              name="new_password"
              type="password"
              placeholder="Enter new password"
              required
              value={formData.new_password}
              onChange={handleInputChange}
              disabled={loading}
              className={`bg-input border-border/50 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary/20 transition-all duration-300 ${errors.new_password ? 'border-red-500' : ''}`}
            />
            {errors.new_password && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 mt-1">
                <p className="text-xs text-red-600 dark:text-red-400">{errors.new_password}</p>
              </div>
            )}
            <div className="bg-muted/50 border border-border/30 rounded-lg p-3 mt-2">
              <p className="text-xs font-semibold text-foreground mb-2">Password must contain:</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li className={`flex items-center gap-2 ${formData.new_password.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}`}>
                  <span>{formData.new_password.length >= 8 ? '✓' : '○'}</span>
                  At least 8 characters
                </li>
                <li className={`flex items-center gap-2 ${/[A-Z]/.test(formData.new_password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                  <span>{/[A-Z]/.test(formData.new_password) ? '✓' : '○'}</span>
                  One uppercase letter (A-Z)
                </li>
                <li className={`flex items-center gap-2 ${/[a-z]/.test(formData.new_password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                  <span>{/[a-z]/.test(formData.new_password) ? '✓' : '○'}</span>
                  One lowercase letter (a-z)
                </li>
                <li className={`flex items-center gap-2 ${/[0-9]/.test(formData.new_password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                  <span>{/[0-9]/.test(formData.new_password) ? '✓' : '○'}</span>
                  One number (0-9)
                </li>
                <li className={`flex items-center gap-2 ${/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;/`~]/.test(formData.new_password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                  <span>{/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;/`~]/.test(formData.new_password) ? '✓' : '○'}</span>
                  One special character (!@#$%^&*)
                </li>
              </ul>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password" className="text-foreground font-medium">Confirm Password</Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              placeholder="Confirm new password"
              required
              value={formData.confirm_password}
              onChange={handleInputChange}
              disabled={loading}
              className={`bg-input border-border/50 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary/20 transition-all duration-300 ${errors.confirm_password ? 'border-red-500' : ''}`}
            />
            {errors.confirm_password && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 mt-1">
                <p className="text-xs text-red-600 dark:text-red-400">{errors.confirm_password}</p>
              </div>
            )}
          </div>
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-foreground shadow-lg shadow-primary/50 hover:shadow-xl hover:shadow-primary/60 transition-all duration-300" 
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Didn't receive the code?</p>
          <Button
            variant="link"
            onClick={handleResendOtp}
            disabled={loading}
            className="text-primary hover:text-primary/80 transition-colors duration-200"
          >
            Resend Code
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link to="/login" className="font-medium text-primary hover:text-primary/80 hover:underline transition-colors duration-200">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
