"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Lock, User, Briefcase, Phone } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    warName: "",
    rank: "",
    phone: "",
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "phone") {
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.length <= 11) {
        formattedValue = cleaned.replace(
          /(\d{0,2})(\d{0,1})(\d{0,4})(\d{0,4})/,
          (match, p1, p2, p3, p4) => {
            let result = "";
            if (p1) result += `(${p1}`;
            if (p2) result += `) ${p2}`;
            if (p3) result += ` ${p3}`;
            if (p4) result += `-${p4}`;
            return result;
          }
        );
      }
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!agreeToTerms) {
      setError("Você deve concordar com os termos de uso e política de privacidade");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Falha ao cadastrar");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError("Erro ao conectar ao servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Cadastro</CardTitle>
          <CardDescription>Crie sua conta para usar o sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="warName">Nome de Guerra</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="warName"
                  name="warName"
                  placeholder="Seu nome"
                  value={formData.warName}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rank">Posto/Graduação</Label>
              <Select
                value={formData.rank}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, rank: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o posto/graduação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Soldado">Soldado</SelectItem>
                  <SelectItem value="Cabo">Cabo</SelectItem>
                  <SelectItem value="3º Sargento">3º Sargento</SelectItem>
                  <SelectItem value="2º Sargento">2º Sargento</SelectItem>
                  <SelectItem value="1º Sargento">1º Sargento</SelectItem>
                  <SelectItem value="2º Tenente">2º Tenente</SelectItem>
                  <SelectItem value="1º Tenente">1º Tenente</SelectItem>
                </SelectContent>
              </Select>
            </div>



            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(11) 9 8888-8888"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10"
                  maxLength={16}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <PasswordInput
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded-md text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                />
                <label
                  htmlFor="agreeToTerms"
                  className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Concordo com os{" "}
                  <Link href="/terms-of-use" className="text-primary hover:underline">
                    Termos de Uso
                  </Link>{" "}
                  e{" "}
                  <Link href="/privacy-policy" className="text-primary hover:underline">
                    Política de Privacidade
                  </Link>
                </label>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Já tem conta? </span>
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Faça login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
