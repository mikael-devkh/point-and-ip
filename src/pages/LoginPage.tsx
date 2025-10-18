import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { toast } from "sonner";
import { auth } from "@/firebase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Informe o e-mail.")
    .email("Informe um e-mail válido."),
  password: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const getErrorMessage = (error: unknown) => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-email":
        return "E-mail inválido.";
      case "auth/user-disabled":
        return "Usuário desativado. Procure um administrador.";
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "E-mail ou senha inválidos.";
      default:
        return "Não foi possível realizar o login. Tente novamente.";
    }
  }
  return "Não foi possível realizar o login. Tente novamente.";
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, loadingAuth } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (!loadingAuth && user) {
      navigate("/");
    }
  }, [loadingAuth, navigate, user]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      const loggedUser = userCredential.user;

      if (!loggedUser.emailVerified) {
        await signOut(auth);
        toast.error(
          "Seu e-mail ainda não foi verificado. Confira sua caixa de entrada antes de acessar."
        );
        return;
      }

      toast.success("Login realizado com sucesso!");
      navigate("/");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (loadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-primary">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-primary px-4 py-12">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center justify-center">
        <Card className="w-full shadow-xl animate-in fade-in-50 slide-in-from-bottom-4">
          <CardHeader className="space-y-4 text-center">
            <img src="/wt-logo.svg" alt="WT Tecnologia" className="mx-auto h-16 w-auto" />
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-foreground">Acesse sua conta</CardTitle>
              <CardDescription className="text-muted-foreground">
                Entre com suas credenciais corporativas para utilizar o ecossistema WT Tecnologia.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          autoComplete="email"
                          placeholder="nome@empresa.com"
                          className="bg-secondary text-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="current-password"
                          placeholder="••••••••"
                          className="bg-secondary text-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Entrar
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 text-sm text-muted-foreground">
            <Button variant="link" asChild className="text-primary">
              <Link to="#">Esqueci minha senha</Link>
            </Button>
            <div>
              Ainda não possui acesso?
              <Button variant="link" asChild className="text-primary">
                <Link to="/register">Criar conta</Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
