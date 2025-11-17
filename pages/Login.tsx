import React, { useState, FormEvent, ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Role } from '../types';

// --- Icon Components ---
const iconProps = {
  className: "w-5 h-5",
};

const UserIcon: React.FC = () => (
  <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MailIcon: React.FC = () => (
  <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon: React.FC = () => (
  <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const GoogleIcon: React.FC = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C39.986,36.639,44,30.63,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

const FacebookIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v7.028C18.343 21.128 22 16.991 22 12z" />
    </svg>
);

const AppleIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M15.226 2.155c.699-1.048 1.83-1.803 2.933-1.892-1.23.06-2.628.62-3.535 1.892-.835 1.168-1.575 3.039-1.288 4.693 1.404.223 2.934-.68 3.824-1.893.89-1.213 1.13-2.735.066-2.8zm-2.484 5.344c-1.588-.046-3.13 1.03-3.904 2.155-1.572 2.264-1.126 5.862.977 7.74 1.026.92 2.203 1.58 3.535 1.518.22-.014 1.631-.223 3.32-1.788-2.228-1.42-2.33-3.645-2.33-3.75 0-2.204 1.63-3.418 3.348-4.328-1.76-1.594-3.562-1.69-4.946-1.547zM8.28 21.905c2.478 0 3.31-1.504 6.2-1.504 2.892 0 3.657 1.476 6.134 1.476 2.585 0 4.623-2.31 4.623-5.632 0-3.237-2.32-5.06-4.52-5.132-2.36-.073-3.882 1.4-6.2 1.4-2.317 0-3.62-1.4-6.02-1.4-2.26 0-4.39 2.01-4.39 5.348 0 3.53 2.14 5.544 4.545 5.544z" />
    </svg>
);

const SchoolIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
    </svg>
);

const AdminIcon: React.FC = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
);

const DirectorIcon: React.FC = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
);

const ProfessorIcon: React.FC = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);


// --- Button Component ---
interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, type = 'button', className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full py-3 px-4 text-white font-semibold bg-brand-primary rounded-md shadow-sm hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:-translate-y-px ${className}`}
    >
      {children}
    </button>
  );
};

// --- InputField Component ---
interface InputFieldProps {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({ id, label, type, placeholder, value, onChange, icon }) => {
  return (
    <div>
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className={`w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-brand-secondary dark:focus:border-brand-secondary ${icon ? 'pl-10' : ''}`}
        />
      </div>
    </div>
  );
};

// --- Logo Component ---
const Logo: React.FC = () => (
    <div className="flex items-center justify-center mb-4 text-center">
        <SchoolIcon className="w-8 h-8 sm:w-10 sm:h-10 text-brand-primary" />
        <span className="ml-2 sm:ml-3 text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Smart Ekele</span>
    </div>
);


// --- AuthForm Component ---
const AuthForm: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { login, loginWithCredentials } = useAuth();
  const navigate = useNavigate();

  const handleToggleMode = () => {
    setIsSignUp(prev => !prev);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      console.log('Signing up with:', { fullName, email, password, confirmPassword });
      // Sign-up logic would go here
      alert("La fonctionnalité d'inscription n'est pas encore implémentée.");
    } else {
      const success = loginWithCredentials(email, password);
      if (!success) {
        alert('Email ou mot de passe incorrect. Assurez-vous d\'utiliser "password123" pour la démo.');
      }
      // Successful login will trigger a redirect via the AuthContext and AppRoutes logic
    }
  };
  
  const handleDemoLogin = async (role: Role, event: React.MouseEvent<HTMLButtonElement>) => {
    const userCredentials = {
        [Role.SCHOOL_DIRECTOR]: { email: 'directeur@demo.com', pass: 'password123' },
        [Role.TEACHER]: { email: 'professeur@demo.com', pass: 'password123' },
    };

    setEmail(userCredentials[role].email);
    setPassword(userCredentials[role].pass);
    
    const button = event.currentTarget;
    const originalText = button.textContent;
    button.disabled = true;
    button.innerHTML = '<span class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block"></span>&nbsp;Connexion...';
    
    setTimeout(() => {
        const success = loginWithCredentials(userCredentials[role].email, userCredentials[role].pass);
        if (success) {
            button.textContent = '✅ Connecté !';
            // Redirect is handled by AppRoutes
        } else {
            button.disabled = false;
            button.textContent = originalText;
            alert('Erreur lors de la connexion de démo.');
        }
    }, 1000);
  };

  return (
    <div className="w-full animate-fade-in-up">
      <Logo />
      <h1 className="mb-2 text-xl sm:text-2xl font-bold text-gray-800 dark:text-white text-center">{isSignUp ? 'Créer votre compte' : 'Connexion à votre espace'}</h1>
      <p className="mb-6 sm:mb-8 text-md font-light text-gray-500 dark:text-gray-300 text-center">
        {isSignUp ? 'Rejoignez la communauté Smart Ekele.' : 'Heureux de vous revoir !'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div 
          className="transition-all duration-500 overflow-hidden" 
          style={{ maxHeight: isSignUp ? '100px' : '0' }}
        >
          {isSignUp && (
            <InputField
              id="fullName"
              label="Nom complet"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              icon={<UserIcon />}
            />
          )}
        </div>
        
        <InputField
          id="email"
          label="Email"
          type="email"
          placeholder="vous@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<MailIcon />}
        />
        
        <InputField
          id="password"
          label="Mot de passe"
          type="password"
          placeholder="Entrez votre mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<LockIcon />}
        />
        
        <div 
          className="transition-all duration-500 overflow-hidden" 
          style={{ maxHeight: isSignUp ? '100px' : '0' }}
        >
           {isSignUp && (
            <InputField
              id="confirmPassword"
              label="Confirmer le mot de passe"
              type="password"
              placeholder="Confirmez votre mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<LockIcon />}
            />
           )}
        </div>

        {!isSignUp && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input type="checkbox" id="remember" className="w-4 h-4 text-brand-primary bg-gray-100 border-gray-300 rounded focus:ring-brand-secondary dark:focus:ring-brand-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600 dark:text-gray-300">Se souvenir de moi</label>
            </div>
            <a href="#" className="text-sm font-medium text-brand-primary hover:underline dark:text-brand-secondary">Mot de passe oublié?</a>
          </div>
        )}
        
        <Button type="submit">
          {isSignUp ? 'S\'inscrire' : 'Se connecter'}
        </Button>
      </form>
      
      <div className="mt-6 sm:mt-8 text-center text-sm text-gray-600 dark:text-gray-300">
        {isSignUp ? 'Vous avez déjà un compte?' : "Vous n'avez pas de compte?"}
        <button onClick={handleToggleMode} className="font-semibold text-brand-primary hover:underline ml-1">
          {isSignUp ? 'Se connecter' : 'S\'inscrire'}
        </button>
      </div>
      
      {!isSignUp && (
        <div className="mt-4 sm:mt-6">
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-2">Pour la démo, cliquez sur un rôle :</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={(e) => handleDemoLogin(Role.SCHOOL_DIRECTOR, e)} type="button" className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-center text-gray-700 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 focus:ring-2 focus:outline-none focus:ring-gray-300 dark:text-gray-200 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-600 transition-all duration-200 transform hover:-translate-y-px">
                <DirectorIcon />
                <span>DIRECTEUR</span>
            </button>
            <button onClick={(e) => handleDemoLogin(Role.TEACHER, e)} type="button" className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-center text-gray-700 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 focus:ring-2 focus:outline-none focus:ring-gray-300 dark:text-gray-200 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-600 transition-all duration-200 transform hover:-translate-y-px">
                <ProfessorIcon />
                <span>PROFESSEUR</span>
            </button>
          </div>
        </div>
      )}

      <div className="my-4 sm:my-6 flex items-center">
        <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        <span className="mx-4 flex-shrink text-sm text-gray-500 dark:text-gray-400">Ou continuer avec</span>
        <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
      </div>

      <div className="space-y-4">
        <button className="w-full flex items-center justify-center py-2.5 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 transition-all duration-200 transform hover:-translate-y-px">
          <GoogleIcon />
          <span className="ml-3">Continuer avec Google</span>
        </button>
        <button className="w-full flex items-center justify-center py-2.5 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 transition-all duration-200 transform hover:-translate-y-px">
          <FacebookIcon />
          <span className="ml-3">Continuer avec Facebook</span>
        </button>
        <button className="w-full flex items-center justify-center py-2.5 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 transition-all duration-200 transform hover:-translate-y-px">
          <AppleIcon />
          <span className="ml-3">Continuer avec Apple</span>
        </button>
      </div>
    </div>
  );
};

// --- Illustration Component ---
const Illustration = () => (
  <div className="hidden lg:flex lg:flex-col items-center justify-center bg-gradient-to-br from-blue-800 to-blue-900 text-white p-12 rounded-r-2xl">
    <div className="w-full max-w-md text-center">
      <SchoolIcon className="w-32 h-32 mx-auto mb-6" />
      <h1 className="text-4xl font-bold mb-4">Bienvenue sur Smart Ekele</h1>
      <p className="text-lg opacity-80">
        La plateforme tout-en-un pour une gestion scolaire simplifiée et efficace. Connectez parents, professeurs et administration.
      </p>
    </div>
  </div>
);

// --- Main Page Component ---
const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="flex flex-col m-2 sm:m-6 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl md:flex-row md:space-y-0 w-full max-w-4xl overflow-hidden">
        <div className="flex flex-col justify-center p-6 sm:p-8 md:p-14 w-full lg:w-1/2">
            <AuthForm />
        </div>
        <Illustration />
      </div>
    </div>
  );
};

export default Login;