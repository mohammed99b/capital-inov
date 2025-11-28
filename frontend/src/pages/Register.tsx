import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, login, getMe } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { HardHat } from 'lucide-react';
import { parseApiErrors, ApiErrors } from '../utils/apiErrors';

export default function Register() {
  const [formData, setFormData] = useState({
    company_name: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  
  const [errors, setErrors] = useState<ApiErrors>({ global: null, fields: {} });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    // Clear specific field error on change
    if (errors.fields[e.target.id]) {
        setErrors(prev => ({
            ...prev,
            fields: { ...prev.fields, [e.target.id]: '' }
        }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ global: null, fields: {} });

    if (formData.password !== formData.confirm_password) {
      setErrors({ global: null, fields: { confirm_password: "Les mots de passe ne correspondent pas." } });
      return;
    }

    setLoading(true);

    try {
      // 1. Register
      await register({
        company_name: formData.company_name,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password
      });

      // 2. Auto Login
      const tokens = await login({ username: formData.email, password: formData.password });
      setTokens(tokens.access, tokens.refresh);

      const user = await getMe();
      setUser(user);

      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setErrors(parseApiErrors(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
            <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <HardHat className="h-8 w-8 text-white" />
            </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Créer un compte
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Démarrez la gestion de votre entreprise BTP
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              id="company_name"
              type="text"
              label="Nom de l'entreprise"
              value={formData.company_name}
              onChange={handleChange}
              required
              placeholder="Ma Société BTP"
              error={errors.fields.company_name}
            />

            <div className="flex gap-4">
                <Input
                id="first_name"
                type="text"
                label="Prénom"
                value={formData.first_name}
                onChange={handleChange}
                required
                error={errors.fields.first_name}
                />
                <Input
                id="last_name"
                type="text"
                label="Nom"
                value={formData.last_name}
                onChange={handleChange}
                required
                error={errors.fields.last_name}
                />
            </div>

            <Input
              id="email"
              type="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="admin@exemple.com"
              error={errors.fields.email}
            />

            <Input
              id="password"
              type="password"
              label="Mot de passe"
              value={formData.password}
              onChange={handleChange}
              required
              error={errors.fields.password}
            />

            <Input
              id="confirm_password"
              type="password"
              label="Confirmer le mot de passe"
              value={formData.confirm_password}
              onChange={handleChange}
              required
              error={errors.fields.confirm_password}
            />

            {errors.global && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{errors.global}</h3>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" className="w-full" isLoading={loading}>
                S'inscrire
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Déjà un compte ?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
