import { redirect } from "next/navigation";

export default function ForgotPasswordPage() {
  redirect("/login?message=Password%20login%20has%20been%20replaced%20with%20passwordless%20sign-in.");
}
