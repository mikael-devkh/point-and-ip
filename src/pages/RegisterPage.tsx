import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createUserWithEmailAndPassword } from "firebase/auth";
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

const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Informe o e-mail.")
    .email("Informe um e-mail válido."),
  password: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres."),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const getErrorMessage = (error: unknown) => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "Este e-mail já está cadastrado.";
      case "auth/invalid-email":
        return "E-mail inválido.";
      case "auth/weak-password":
        return "A senha é muito fraca. Utilize ao menos 6 caracteres.";
      default:
        return "Não foi possível criar a conta. Tente novamente.";
    }
  }
  return "Não foi possível criar a conta. Tente novamente.";
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { user, loadingAuth } = useAuth();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (!loadingAuth && user) {
      navigate("/");
    }
  }, [loadingAuth, navigate, user]);

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      toast.success("Conta criada com sucesso!");
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
      <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center">
        <Card className="w-full shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-bold text-foreground">
              Criar nova conta
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Cadastre um acesso para utilizar o ecossistema WT Tecnologia.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
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
                          autoComplete="new-password"
                          placeholder="Defina uma senha segura"
                          className="bg-secondary text-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Criar conta
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span>
              Já possui acesso?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Fazer login
              </Link>
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
