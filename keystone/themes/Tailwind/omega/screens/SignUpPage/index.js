"use client";

import { useFormState } from "react-dom";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useRedirect } from "@keystone/utils/useRedirect";
import { createUser } from "../../data/auth";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../primitives/default/ui/card";

import { Button } from "../../primitives/default/ui/button";
import { Input } from "../../primitives/default/ui/input";
import { Label } from "../../primitives/default/ui/label";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../primitives/default/ui/alert";
import { cn } from "@keystone/utils/cn";

const placeholders = {
  name: "John Doe",
  email: "m@example.com",
  password: "supersecretpassword",
};

function SubmitButton({ error }) {
  const { pending } = useFormStatus();
  
  return (
    <Button
      variant="light"
      className={cn(
        "w-full text-md tracking-wide h-11 md:h-12 font-semibold text-white uppercase transition-all duration-200 ease-in-out bg-gradient-to-r from-green-600 to-green-700 [&:not(:disabled)]:hover:from-green-700 [&:not(:disabled)]:hover:to-green-800 dark:from-green-700 dark:to-green-800 [&:not(:disabled)]:dark:hover:from-green-800 [&:not(:disabled)]:dark:hover:to-green-900 dark:text-gray-100",
        {
          "opacity-50 dark:from-zinc-800 dark:to-zinc-600 from-zinc-400 to-zinc-600": pending,
        }
      )}
      type="submit"
      disabled={pending}
    >
      {pending ? "SIGNING UP..." : "SIGN UP"}
    </Button>
  );
}

export function SignUpPage({
  mutationName = "createUser",
  listKey = "User",
}) {
  const router = useRouter();
  const redirect = useRedirect();
  const [error, formAction] = useFormState(
    async (prevState, formData) => {
      const result = await createUser(prevState, formData, {
        mutationName,
        listKey,
      });
      
      if (result?.success) {
        router.push(redirect);
        return null;
      }
      
      return result;
    },
    null
  );

  return (
    <div
      className={`px-2 h-screen flex justify-center items-center bg-[#0f172a] heropattern-topography-zinc-500/10 dark:bg-background`}
    >
      <div className="flex flex-col gap-2 md:gap-4 basis-[450px] px-2">
        <form action={formAction}>
          <Card className="overflow-hidden shadow-sm dark:bg-zinc-950">
            <CardHeader>
              <CardTitle className="text-lg font-bold tracking-wide text-slate-600 dark:text-white">
                <div className="inline-block">
                  <span>SIGN UP</span>
                  <div className="h-1 mt-0.5 bg-gradient-to-r from-blue-700 to-blue-200 dark:from-blue-800 dark:to-blue-600"></div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name" className="text-sm capitalize">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder={placeholders.name}
                    autoComplete="name"
                    required
                    className="bg-muted"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email" className="text-sm capitalize">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={placeholders.email}
                    autoComplete="email"
                    required
                    className="bg-muted"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password" className="text-sm capitalize">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder={placeholders.password}
                    autoComplete="new-password"
                    required
                    className="bg-muted"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col justify-between">
              <SubmitButton error={error} />
            </CardFooter>
          </Card>
        </form>

        {error && (
          <Alert
            variant="destructive"
            className="mt-4 bg-red-100 dark:bg-red-900"
          >
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        <div className="text-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <AdminLink
              href="/signin"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Sign In
            </AdminLink>
          </span>
        </div>
      </div>
    </div>
  );
}
