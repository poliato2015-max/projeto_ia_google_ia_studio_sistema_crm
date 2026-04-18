'use client';

import { useState, useMemo, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Loader2, 
  Mail, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  LayoutDashboard, 
  Check, 
  X,
  Eye,
  EyeOff,
  Users
} from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isExistingSession, setIsExistingSession] = useState(false);
  const router = useRouter();
  const supabase = getSupabase();

  // Check for existing session on mount
  useEffect(() => {
    let isMounted = true;
    const checkSession = async () => {
      if (!supabase) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && isMounted) {
          setIsExistingSession(true);
        }
      } catch (e) {}
    };
    checkSession();
    return () => { isMounted = false; };
  }, [supabase]);

  const passwordRules = useMemo(() => {
    return [
      { id: 'length', label: 'Exatamente 6 caracteres', valid: password.length === 6 },
      { id: 'upper', label: 'Uma letra maiúscula', valid: /[A-Z]/.test(password) },
      { id: 'lower', label: 'Uma letra minúscula', valid: /[a-z]/.test(password) },
      { id: 'number', label: 'Um número', valid: /[0-9]/.test(password) },
    ];
  }, [password]);

  const maskPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const isPasswordValid = passwordRules.every(rule => rule.valid);
  const passwordsMatch = password === confirmPassword;
  
  const isFullNameValid = useMemo(() => {
    const parts = fullName.trim().split(/\s+/);
    return parts.length >= 2 && parts.every(p => p.length >= 2) && fullName.length <= 30;
  }, [fullName]);

  const isPhoneValid = useMemo(() => {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 11 && digits[2] === '9';
  }, [phone]);

  const isEmailValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 50;
  }, [email]);

  const isFormValid = isSignUp 
    ? (isEmailValid && isPasswordValid && passwordsMatch && isFullNameValid && isPhoneValid) 
    : (isEmailValid && password.length > 0);

  const [fieldErrors, setFieldErrors] = useState<{email?: string; phone?: string; name?: string}>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      await handleSignUp();
    } else {
      await handleLogin();
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (!supabase) throw new Error('Serviço indisponível.');
      
      const { data, error: loginErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginErr) {
        // Translate common Supabase errors to Portuguese
        if (loginErr.message === 'Invalid login credentials') {
          throw new Error('Credenciais inválidas.');
        }
        if (loginErr.message === 'Email not confirmed') {
          throw new Error('E-mail ainda não confirmado. Verifique sua caixa de entrada.');
        }
        throw loginErr;
      }
      
      setSuccessMsg('Entrando...');
      setLoading(false);

      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Falha na autenticação.');
    }
  };

  const handleSignUp = async () => {
    if (!isPasswordValid || !passwordsMatch) {
      if (!passwordsMatch) setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    
    try {
      if (!supabase) throw new Error('Supabase offline.');
      setFieldErrors({});

      const { data, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: fullName,
            phone: phone
          }
        }
      });

      if (signUpErr) {
        if (signUpErr.message.toLowerCase().includes('already registered')) {
          setFieldErrors({ email: 'Este e-mail já está em uso.' });
          return;
        }
        if (signUpErr.message.toLowerCase().includes('email rate limit exceeded')) {
          throw new Error('Limite de envios de e-mail excedido. Aguarde alguns minutos e tente novamente.');
        }
        throw signUpErr;
      }

      // Check if user already exists but Supabase is hiding it (User Enumeration Protection)
      if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
        setFieldErrors({ email: 'Este e-mail já está em uso.' });
        return;
      }

      setSuccessMsg('Conta criada! Verifique seu e-mail (incluindo SPAM).');
      
      // Clear form after success
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFullName('');
      setPhone('');
      setFieldErrors({});
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      {/* Visual Side */}
      <div className="hidden lg:flex relative bg-surface-container-high overflow-hidden items-center justify-center p-20 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 space-y-8 max-w-md flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/40 mb-4"
          >
            <ShieldCheck size={40} className="text-white" />
          </motion.div>
          
          <h1 className="text-7xl font-black font-headline text-on-surface leading-[0.9] tracking-tighter">
            EXECUTIVE <br />
            <span className="text-primary">LENS</span>
          </h1>
          
          <p className="text-xl text-on-surface-variant font-medium leading-relaxed">
            A plataforma de CRM definitiva para líderes que buscam clareza, precisão e performance em tempo real.
          </p>
        </div>

        {/* Floating Accents */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute -right-20 -top-20 w-96 h-96 border-2 border-outline-variant/10 rounded-full"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute -left-20 -bottom-20 w-96 h-96 border-2 border-outline-variant/10 rounded-full"
        />
      </div>

      {/* Form Side */}
      <div className="flex items-center justify-center p-8 bg-surface">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
               <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <ShieldCheck size={24} className="text-white" />
              </div>
            </div>
            <h2 className="text-4xl font-black font-headline text-on-surface tracking-tight">
              {isSignUp ? 'Criar Conta' : 'Bem-vindo.'}
            </h2>
            <p className="text-on-surface-variant mt-2 font-medium italic serif">
              {isSignUp ? 'Cadastre-se para acessar o portal.' : 'Acesse o portal para gerenciar seu pipeline.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <AnimatePresence>
                {isSignUp && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
                        <Users size={18} />
                      </div>
                      <input
                        type="text"
                        placeholder="Nome e Sobrenome"
                        required
                        value={fullName}
                        onChange={(e) => {
                          const val = e.target.value
                            .replace(/[^a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]/g, '')
                            .replace(/\s+/g, ' ')
                            .slice(0, 30);
                          setFullName(val);
                        }}
                        className={cn(
                          "w-full bg-surface-container-low border-2 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium text-on-surface",
                          fullName && !isFullNameValid ? "border-error/50" : "border-outline-variant/30 focus:border-primary"
                        )}
                      />
                      {fullName && !isFullNameValid && (
                        <p className="text-[10px] text-error font-bold mt-1 ml-4 tracking-tight">
                          {fullName.length > 30 ? "Máximo 30 caracteres." : "Insira seu nome completo (apenas letras)."}
                        </p>
                      )}
                    </div>

                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
                         <div className="flex items-center justify-center w-[18px] h-[18px]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                         </div>
                      </div>
                      <input
                        type="tel"
                        placeholder="Telefone (DDD + 9 dígitos)"
                        required
                        value={phone}
                        onChange={(e) => setPhone(maskPhone(e.target.value))}
                        className={cn(
                          "w-full bg-surface-container-low border-2 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium text-on-surface",
                          phone && !isPhoneValid ? "border-error/50" : "border-outline-variant/30 focus:border-primary"
                        )}
                      />
                      {phone && !isPhoneValid && (
                        <p className="text-[10px] text-error font-bold mt-1 ml-4 tracking-tight">Formato: (XX) 9XXXX-XXXX</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="E-mail profissional"
                  required
                  value={email}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^a-zA-Z0-9-@.]/g, '').slice(0, 50);
                    setEmail(val);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                  }}
                  className={cn(
                    "w-full bg-surface-container-low border-2 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium text-on-surface",
                    fieldErrors.email ? "border-error" : "border-outline-variant/30 focus:border-primary"
                  )}
                />
                {fieldErrors.email && (
                  <p className="text-[10px] text-error font-bold mt-1 ml-4 tracking-tight">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={isSignUp ? "Crie uma senha forte" : "Senha"}
                    required
                    value={password}
                    maxLength={6}
                    onChange={(e) => setPassword(e.target.value.slice(0, 6))}
                    className="w-full bg-surface-container-low border-2 border-outline-variant/30 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-primary transition-all font-medium text-on-surface"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <AnimatePresence>
                  {isSignUp && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="relative group mt-2">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
                          <Lock size={18} />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Repetir senha"
                          required
                          value={confirmPassword}
                          maxLength={6}
                          onChange={(e) => setConfirmPassword(e.target.value.slice(0, 6))}
                          className={cn(
                            "w-full bg-surface-container-low border-2 rounded-2xl py-4 pl-12 pr-12 outline-none transition-all font-medium text-on-surface",
                            confirmPassword && !passwordsMatch ? "border-error/50" : "border-outline-variant/30 focus:border-primary"
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        {confirmPassword && !passwordsMatch && (
                          <p className="text-[10px] text-error font-bold mt-1 ml-4 tracking-tight">As senhas não coincidem.</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {!isSignUp && (
                  <button 
                    type="button"
                    className="text-xs font-bold text-primary hover:text-primary-dim transition-colors px-1"
                  >
                    Esqueceu sua senha?
                  </button>
                )}
              </div>

              {/* Password Requirements UI - Only show during Signup */}
              <AnimatePresence>
                {isSignUp && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/10 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Requisitos de Senha</p>
                      <div className="grid grid-cols-1 gap-1">
                        {passwordRules.map((rule) => (
                          <div key={rule.id} className="flex items-center gap-2 text-[11px] font-bold">
                            {rule.valid ? (
                              <Check size={12} className="text-success" />
                            ) : (
                              <X size={12} className="text-on-surface-variant/40" />
                            )}
                            <span className={rule.valid ? "text-on-surface" : "text-on-surface-variant/60"}>
                              {rule.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-error-container/20 border-2 border-error/20 rounded-2xl text-error text-[11px] font-bold flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-error" />
                  {error}
                </div>
              </motion.div>
            )}

            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-success/10 border-2 border-success/20 rounded-2xl text-success text-[11px] font-bold flex items-center gap-2"
              >
                <Check size={14} />
                {successMsg}
              </motion.div>
            )}

            {isExistingSession && (
              <button
                type="button"
                onClick={() => window.location.href = '/'}
                className="w-full bg-success text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-success-dim transition-all shadow-xl shadow-success/25"
              >
                IR PARA O CRM AGORA
                <ArrowRight size={16} />
              </button>
            )}

            {!isExistingSession && (
              <div className="flex flex-col gap-6 items-center">
                <button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-primary-dim transition-all shadow-xl shadow-primary/25 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                      {isSignUp ? 'CRIAR CONTA' : 'ACESSAR'}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
                
                <p className="text-sm font-bold text-on-surface">
                  {isSignUp ? 'Já tem um login?' : 'Não tem um login?'} 
                  <button 
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="ml-2 text-primary hover:text-primary-dim transition-colors"
                  >
                    {isSignUp ? 'Entre aqui' : 'Cadastre-se'}
                  </button>
                </p>
              </div>
            )}
          </form>

          <div className="pt-6 border-t border-outline-variant/20 flex justify-center items-center text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
            <span className="flex items-center gap-2">
              <LayoutDashboard size={12} className="text-primary" />
              PORTAL SEGURO
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
