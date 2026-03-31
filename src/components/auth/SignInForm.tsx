import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/useAuthStore";

export default function SignInForm() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const getRedirectPath = (roles: { name: string }[] | undefined) => {
    if (!roles || roles.length === 0) return "/";
    
    const roleName = roles[0].name.toLowerCase();
    
    switch (roleName) {
      case "admin": return "/admin/dashboard";
      case "siswa": return "/siswa/dashboard";
      case "pembimbing": return "/pembimbing/dashboard";
      case "koordinator": return "/koordinator/dashboard";
      case "hubin": return "/hubin/dashboard";
      default: return "/";
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email dan kata sandi wajib diisi.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login(email, password, isChecked);
      
      setAuth(response.user);
      
      const redirectPath = getRedirectPath(response.user.roles);
      navigate(redirectPath);

    } catch (err: unknown) {
      const axiosError = err as { response?: { status: number } };
      if (axiosError.response?.status === 401) {
        setError("Email atau password salah.");
      } else {
        setError("Terjadi kesalahan pada server. Silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Selamat Datang
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Masukkan email dan kata sandi Anda untuk masuk ke sistem.
            </p>
          </div>
          <div>
            <form onSubmit={handleLogin}>
              <div className="space-y-6">
                
                {error && (
                  <div className="p-3 text-sm text-error-500 bg-red-50 border border-red-200 rounded-lg dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">
                    {error}
                  </div>
                )}

                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input 
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="Masukkan alamat email" 
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  /> 
                </div>
                <div>
                  <Label>
                    Kata Sandi <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="current-password"
                      placeholder="Masukkan kata sandi"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Ingat saya
                    </span>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400"
                  >
                    Lupa kata sandi?
                  </Link>
                </div>
                <div>
                  <Button className="w-full bg-brand-500 hover:bg-brand-600 text-white" size="sm" disabled={isLoading}>
                    {isLoading ? "Memproses..." : "Masuk ke Sistem"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}