"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils"; // Import cn utility for conditional classes

// Helper function to format digits with spaces (e.g., 1234567890 -> 123 456 7890)
const formatPhoneNumber = (digits: string): string => {
  const cleaned = digits.replace(/\D/g, ''); // Ensure only digits
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
  if (match) {
    return !match[2]
      ? match[1]
      : `${match[1]} ${match[2]}${match[3] ? ` ${match[3]}` : ''}`;
  }
  return digits; // Fallback
};

// Define error state type
interface FormErrors {
  companyName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  general?: string;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  // Rename error state to formErrors and initialize as empty object
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [rawPhone, setRawPhone] = useState(''); // State for raw phone digits

  // Validation function
  const validateForm = (data: { companyName: string, fullName: string, email: string, phone: string }): FormErrors => {
    const errors: FormErrors = {};
    if (!data.companyName) errors.companyName = "Nome azienda è obbligatorio.";
    if (!data.fullName) errors.fullName = "Nome e cognome è obbligatorio.";
    if (!data.email) {
        errors.email = "Email è obbligatoria.";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
        errors.email = "Formato email non valido.";
    }
    if (!data.phone) {
        errors.phone = "Numero di telefono è obbligatorio.";
    } else if (data.phone.length < 9 || data.phone.length > 10) { // Keep 9-10 digit check
        errors.phone = "Inserisci un numero di telefono valido (9-10 cifre).";
    }
    return errors;
  };

  // Clear error on input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Modify phone input handler to clear phone error
  const handlePhoneInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputDigits = event.target.value.replace(/\D/g, '');
    setRawPhone(inputDigits.slice(0, 10));
    // Clear phone error when user types
    if (formErrors.phone) {
        setFormErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setFormErrors({}); // Clear previous errors on new submission

    const formData = new FormData(event.currentTarget);
    // Use helper function to ensure correct type, accessing by name
    const companyName = formData.get("companyName") as string || "";
    const fullName = formData.get("fullName") as string || "";
    const email = formData.get("email") as string || "";

    const submissionData = {
      companyName,
      fullName,
      email,
      phone: rawPhone, // Use raw phone digits from state
    };

    // ** Validate the form **
    const errors = validateForm(submissionData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsLoading(false);
      return; // Stop submission if validation fails
    }

    // Proceed with API call if validation passes
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData), // Send validated data
      });

      const result = await response.json();

      if (!response.ok) {
        // Display API error generically or specifically if possible
        setFormErrors({ general: result.error || 'Si è verificato un errore sconosciuto.' });
        throw new Error(result.error || 'Si è verificato un errore sconosciuto.');
      }

      if (result.purchase_url) {
        window.location.href = result.purchase_url;
      } else {
         setFormErrors({ general: 'URL di acquisto non ricevuto.' });
        throw new Error('URL di acquisto non ricevuto.');
      }

    } catch (err: any) {
      console.error('Form submission error:', err);
      // Set a general error if API call fails
      if (!formErrors.general) { // Avoid overwriting specific API error
        setFormErrors({ general: err.message || 'Impossibile elaborare la richiesta.' });
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Prova Gratuita</CardTitle>
          <CardDescription>
            Inserisci i tuoi dati per attivare la prova gratuita.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} noValidate> {/* Add noValidate to prevent default HTML5 validation */} 
          <CardContent className="space-y-4">
            {/* Display general errors (optional, for API errors) */}
            {formErrors.general && (
                 <div className="p-3 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                   <span className="font-medium">Errore:</span> {formErrors.general}
                 </div>
            )}

            {/* Company Name Field */}
            <div className="space-y-2">
              <Label htmlFor="companyName">Nome Azienda*</Label>
              <Input
                id="companyName"
                name="companyName"
                placeholder="es. Meta Platforms, Inc."
                required
                className={cn(formErrors.companyName && "border-red-500")} // Conditional red border
                onChange={handleInputChange} // Clear error on change
              />
              {formErrors.companyName && <p className="text-sm text-red-600 mt-1">{formErrors.companyName}</p>} {/* Inline error */}
            </div>

            {/* Full Name Field */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome e Cognome*</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="es. Mark Zuck"
                required
                className={cn(formErrors.fullName && "border-red-500")}
                onChange={handleInputChange}
              />
              {formErrors.fullName && <p className="text-sm text-red-600 mt-1">{formErrors.fullName}</p>}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">La tua Email*</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="es. zuck@meta.com"
                required
                className={cn(formErrors.email && "border-red-500")}
                onChange={handleInputChange}
              />
              {formErrors.email && <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>}
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone">Il tuo Numero*</Label>
              <div className="flex items-center space-x-2">
                 <span className="text-sm text-gray-500">+39</span>
                 <Input
                   id="phone"
                   name="phone"
                   type="tel"
                   inputMode="numeric"
                   placeholder="123 456 7890"
                   required
                   className={cn("flex-1", formErrors.phone && "border-red-500")} // Apply to the input itself
                   value={formatPhoneNumber(rawPhone)}
                   onChange={handlePhoneInput} // Use specific handler for phone
                 />
              </div>
              {formErrors.phone && <p className="text-sm text-red-600 mt-1">{formErrors.phone}</p>} {/* Error below the input group */}
            </div>
          </CardContent>
          <CardFooter className="pt-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Elaborazione...' : 'Attiva ora la prova gratuita'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
