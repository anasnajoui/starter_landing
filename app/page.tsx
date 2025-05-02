"use client";

import React from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Script from 'next/script';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Check,
  X,
  Users,
  MessageCircle,
  HelpCircle,
  PencilLine,
  Star,
  Brain,
  UserCheck,
  PhoneCall,
  Languages,
  PackageSearch,
  Server,
  Scale,
  Link,
  Gift,
  LifeBuoy,
  ThumbsUp,
  XCircle,
  Lock,
  Clock,
  RefreshCw,
  Bot,
  Copy,
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Helper function to format phone number (no changes)
const formatPhoneNumber = (digits: string): string => {
  const cleaned = digits.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
  if (match) {
    return !match[2]
      ? match[1]
      : `${match[1]} ${match[2]}${match[3] ? ` ${match[3]}` : ''}`;
  }
  return digits;
};

// Helper function to format time (MM:SS)
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

// Define error state type
interface FormData {
  companyName: string;
  fullName: string;
  email: string;
  rawPhone: string;
  sector: string;
  socialLink: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  sector?: string; // Add errors for new fields if needed
  general?: string;
}

// Define sector options
const sectorOptions = [
  { value: "ecommerce", label: "E-commerce" },
  { value: "servizi_locali", label: "Servizi Locali" },
  { value: "saas", label: "SaaS" },
  { value: "info_prodotti", label: "Info Prodotti / Corsi" },
  { value: "altro", label: "Altro" },
];

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [activationMessageVisible, setActivationMessageVisible] = useState(false);
  const initialTime = 10 * 60; // 10 minutes
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [selectedBonus, setSelectedBonus] = useState<string | undefined>(undefined);
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    fullName: '',
    email: '',
    rawPhone: '',
    sector: '',
    socialLink: '',
  });

  const validateStep = (currentStep: number): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!formData.fullName) {
        errors.fullName = "Nome e cognome è obbligatorio.";
        isValid = false;
      }
      if (!formData.email) {
        errors.email = "Email è obbligatoria.";
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = "Formato email non valido.";
        isValid = false;
      }
      if (!formData.rawPhone) {
        errors.phone = "Numero di telefono è obbligatorio.";
        isValid = false;
      } else if (formData.rawPhone.length < 9 || formData.rawPhone.length > 10) {
        errors.phone = "Inserisci un numero di telefono valido (9-10 cifre).";
        isValid = false;
      }
    } else if (currentStep === 2) {
      // Add validation for step 2 if needed (e.g., sector if required)
      // if (!formData.sector) {
      //   errors.sector = "Settore è obbligatorio.";
      //   isValid = false;
      // }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePhoneInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputDigits = event.target.value.replace(/\D/g, '');
    const newRawPhone = inputDigits.slice(0, 10);
    setFormData(prev => ({ ...prev, rawPhone: newRawPhone }));
    if (formErrors.phone) {
        setFormErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  const handleSelectChange = (value: string) => {
      setFormData(prev => ({ ...prev, sector: value }));
      if (formErrors.sector) {
         setFormErrors(prev => ({ ...prev, sector: undefined }));
      }
  };

  const handleNextStep = () => {
    if (validateStep(1)) {
      setStep(2);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateStep(2)) {
        return;
    }

    setIsLoading(true);
    setActivationMessageVisible(true);
    setFormErrors({});

    await new Promise(resolve => setTimeout(resolve, 1000));

    const submissionData = {
        companyName: formData.companyName,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.rawPhone,
        sector: formData.sector,
        socialLink: formData.socialLink,
    };

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (!response.ok) {
        setFormErrors({ general: result.error || 'Si è verificato un errore sconosciuto.' });
        throw new Error(result.error || 'Si è verificato un errore sconosciuto.');
      }

      if (result.purchase_url) {
        window.location.href = result.purchase_url;
      } else {
         setFormErrors({ general: 'URL di acquisto non ricevuto.' });
        throw new Error('URL di acquisto non ricevuto.');
      }

    } catch (err: unknown) {
      console.error('Form submission error:', err);
      let message = 'Impossibile elaborare la richiesta.';
      if (err instanceof Error) {
          message = err.message;
      }
      setFormErrors({ general: message });
      setIsLoading(false);
      setActivationMessageVisible(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
      setIsFormOpen(open);
      if (!open) {
          setStep(1);
          setFormErrors({});
      }
  }

  const logos = [
    { src: "https://i.imgur.com/RlRWSDd.png", alt: "Madani Agency Logo" },
    { src: "https://www.acquisition.com/hubfs/Acquisition.com-Logo-Primary-Vertical-Sambucus.png", alt: "Acquisition Logo", featured: true },
    { src: "https://blog.logomyway.com/wp-content/uploads/2021/11/meta-logo.png", alt: "Meta Logo" },
    { src: "https://www.amst.com/template/images/google-partner.png", alt: "Google Partner Logo" },
  ];

  const avatarUrls = [
      "https://assets.circle.so/0fiywop5o9gj2h3knrk3u73qpdsd",
      "https://assets-v2.circle.so/mwoolbvcozg1e5akmp7othir8gl5",
      "https://assets.circle.so/xiw1ube8vm86dv5t88ftu75t0d60",
      "https://assets.circle.so/xfhes0y1e4uabhuuc7b23cipa1l2"
  ];

  // --- Data for the Ghost Watcher Comparison Table ---
  const ghostWatcherFeaturesData = [
    { name: "Risultati Reali" },
    { name: "Corso Avanzato" },
    { name: "Affiancamento " },
    { name: "Calls Settimanali" },
    { name: "Scripts, Ads, Tools AI +300 Risorse" },
    { name: "3 Account Highlevel" },
  ];
  
  const competitorPlansData = [
    {
      name: "Highlevel Starter",
      logo: "/highlevel.png", // Using highlevel.png as requested placeholder
      price: "97",
      features: [false, false, false, false, false, true], // Corresponds to ghostWatcherFeaturesData order
    },
    {
      name: "Corso Tipico Agenzia",
      logo: "/highlevel.png", // Using highlevel.png as requested placeholder
      price: "2000",
      features: [true, true, false, true, false, false],
    },
  ];
  // --- End Data for Ghost Watcher Comparison Table ---

  const senjaWidgetId = "6e0bac20-2338-4226-af21-a8def885d490";

  const comparisonData = [
    { icon: Brain, feature: "Risultati Reali", normal: false, madani: "In media: 1° cliente in 12 giorni", tipico: true },
    { icon: UserCheck, feature: "Affiancamento 1° Cliente", normal: false, madani: true, tipico: false },
    { icon: PhoneCall, feature: "Calls Settimanali (Vendita, Offerta, Leads etc..)", normal: false, madani: true, tipico: true },
    { icon: PackageSearch, feature: "Scripts, Ads, Tools AI +300 Risorse", normal: false, madani: true, tipico: false },
    { icon: Server, feature: "3 Highlevel Accounts", normal: true, madani: true, tipico: false },
    { icon: Scale, feature: "Prezzo", normal: "97€/mese", madani: "97€/mese", tipico: "2000€" },
  ];

  // Timer useEffect Hook
  useEffect(() => {
    if (step !== 2) return; // Only run timer in step 2

    // Exit early if timer is already 0
    if (timeLeft <= 0) return;

    // Set interval to decrease timer by 1 second
    const timerInterval = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    // Clear interval on component unmount or step change
    return () => clearInterval(timerInterval);
  }, [timeLeft, step]); // Rerun effect if timeLeft or step changes

  return (
    <Dialog open={isFormOpen} onOpenChange={handleOpenChange}>
      <Script src={`https://widget.senja.io/widget/${senjaWidgetId}/platform.js`} strategy="lazyOnload" />

      <main className="container mx-auto py-12 px-4 max-w-4xl space-y-16">
        <section className="relative w-full max-w-4xl mx-auto aspect-video overflow-hidden rounded-lg shadow-lg">
            <iframe 
                className="absolute top-0 left-0 w-full h-full border-0"
                src="https://www.loom.com/embed/4b23e5a114a94c8fa7ee81f1797b3c26?sid=3e78c2c6-b21f-4e92-9c7d-e3ac79d6f42e&autoplay=1&mute=1&playsinline=1"
                allowFullScreen
                allow="autoplay; fullscreen"
                // @ts-expect-error - playsinline is not standard but needed for iOS
                playsInline 
            >
            </iframe>
        </section>

        <section className="flex flex-col sm:flex-row items-center justify-center gap-4 -mt-8">
            <div className="flex -space-x-3 overflow-hidden">
                 {/* Use actual avatar URLs */}
                 {avatarUrls.map((url, index) => (
                    <Image 
                        key={index}
                        className="inline-block h-9 w-9 rounded-full ring-2 ring-white"
                        src={url}
                        alt={`User ${index + 1}`}
                        width={36}
                        height={36}
                    />
                 ))}
            </div>
            <div className="flex flex-col items-center">
                <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">+100 Studenti di Successo</p>
            </div>
        </section>

        <section className="text-center space-y-4">
           <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
           Hai cliccato per attivare il tuo HighLevel. 
            <br />
            Ma con Madani, ottieni molto di più.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Immagina se pagando solo Shopify
ricevessi anche un corso completo, affiancamento e chiamate settimanali.
Con Madani, succede davvero.
          </p>
           <div className="flex flex-col items-center justify-center gap-4 pt-4">
             <button 
               onClick={() => setIsFormOpen(true)} 
               className="btn-gradient-animated"
             >
                 <Image 
                     src="/academylogo.png"
                     alt="Logo"
                     width={20}
                     height={20}
                     className="mr-2 h-5 w-5 filter brightness-0 invert"
                 />
                 Inizia Ora Gratis con Madani Starter
             </button>
              <p className="text-sm text-muted-foreground italic">
                In media i membri Madani Starter trovano il primo cliente in 12 giorni.
              </p>
           </div>
        </section>

                {/* --- Re-introduce Logo Scroller Section --- */}
                <section className="space-y-4 py-8">
             <h2 className="text-center text-lg font-semibold text-muted-foreground">Collaborazione con</h2>
            <div className="relative w-full overflow-hidden before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-1/6 before:bg-gradient-to-r before:from-background before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-1/6 after:bg-gradient-to-l after:from-background after:to-transparent">
                <div className="flex animate-scroll">
                    {/* Duplicate logos for smooth infinite scroll */}
                    {[...logos, ...logos].map((logo, index) => (
                         <div key={index} className="flex-shrink-0 flex items-center justify-center px-8 py-4" style={{ width: '200px' }}> {/* Adjust width as needed */} 
                            <Image 
                                src={logo.src} 
                                alt={logo.alt} 
                                width={logo.featured ? 120 : 100} 
                                height={logo.featured ? 45 : 40} 
                                className={cn(
                                    "object-contain transition-all hover:opacity-100 hover:scale-105", 
                                    logo.featured ? "opacity-100" : "opacity-70"
                                )}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Comparison Section - Ghost Watcher Style */}
        <section className="py-16 bg-slate-100 dark:bg-transparent"> {/* Light background for the section */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-slate-900 dark:text-gray-100">Il software lo avresti preso comunque. <br /> Con Madani, ottieni gratis tutto il resto.</h2>
            
              {/* Grid Container with overall shadow/rounding */}
              <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
                {/* Grid Definition */}
                <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr] lg:grid-cols-[2.5fr_1.5fr_1fr_1fr]" > {/* Adjusted column fractions */} 

                  {/* Header Row - Applying background for grid lines effect */} 
                  <div className="p-5 bg-slate-50 border-b border-r border-slate-200"></div> {/* Empty Top Left */}
                  
                  {/* Madani Header (Highlighted Card Style) */}
                  <div className="bg-white p-5 border-b border-slate-200 text-center relative">
                     {/* Badge */}
                     <Image 
                       src="/academylogo.png" 
                       alt="Madani Logo"
                       width={36} 
                       height={36} 
                       className="mx-auto mb-2 mt-2"
                     />
                     <h3 className="font-semibold text-lg text-slate-900">Madani Starter</h3>
                  </div>

                  {/* HighLevel Header */}
                  <div className="bg-slate-50 p-5 border-b border-l border-slate-200 text-center">
                     <Image 
                       src="/highlevel.png" 
                       alt="HighLevel Logo" 
                       width={90} 
                       height={25} 
                       className="object-contain opacity-90 mx-auto mb-1"
                     />
                     <span className="text-sm text-slate-500 block mt-1">HighLevel Starter</span> 
                  </div>

                  {/* Tipico Corso Header */}
                  <div className="bg-slate-50 p-5 border-b border-l border-slate-200 text-center flex items-center justify-center">
                     <span className="text-sm text-slate-500 block mt-1">Tipico Corso Online</span> 
                  </div>

                  {/* --- Feature Rows Start --- */} 
                  {comparisonData.slice(0, -1).map((item, index) => (
                    <React.Fragment key={item.feature}>
                      {/* Feature Name Column */}
                      <div className="p-5 bg-slate-50 flex items-center gap-3 border-r border-b border-slate-200">
                        <item.icon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-slate-700">{item.feature}</span>
                      </div>
                      {/* Madani Value (Card Style) */}
                      <div className="p-5 bg-white flex justify-center items-center border-b border-slate-200">
                        {typeof item.madani === 'boolean' ? (
                           item.madani ? <Check className="h-6 w-6 text-green-500" /> : <X className="h-6 w-6 text-red-500" />
                        ) : (
                           <span className="text-sm font-semibold text-slate-700 text-center">{item.madani}</span>
                        )}
                      </div>
                      {/* HighLevel Value */}
                      <div className="p-5 bg-slate-50 flex justify-center items-center border-b border-l border-slate-200">
                        {typeof item.normal === 'boolean' ? (
                           item.normal ? <Check className="h-6 w-6 text-green-500" /> : <X className="h-6 w-6 text-red-500" />
                        ) : (
                           <span className="text-sm font-semibold text-slate-700">{item.normal}</span>
                        )}
                      </div>
                      {/* Tipico Corso Value */}
                      <div className="p-5 bg-slate-50 flex justify-center items-center border-b border-l border-slate-200">
                        {typeof item.tipico === 'boolean' ? (
                           item.tipico ? <Check className="h-6 w-6 text-green-500" /> : <X className="h-6 w-6 text-red-500" />
                        ) : (
                           <span className="text-sm font-semibold text-slate-700">{item.tipico}</span>
                        )}
                      </div>
                    </React.Fragment>
                  ))}
                  {/* --- Feature Rows End --- */} 

                  {/* --- Price Row Start --- */} 
                  {/* Feature Name Column (Price) */} 
                  <div className="p-5 bg-slate-50 flex items-center gap-3 border-r border-slate-200">
                    <Scale className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-700">Prezzo</span>
                  </div>
                  {/* Madani Price & Button (Card Style) */}
                  <div className="bg-white p-5 rounded-bl-xl flex flex-col justify-center items-center text-center">
                     <span className="text-3xl font-bold text-slate-900 mb-1">{comparisonData.find(i => i.feature === 'Prezzo')?.madani}</span>
                     <span className="text-xs text-slate-500 mb-3">10 giorni gratis</span>
                     {/* Ghost Watcher style button */}
                     <Button 
                       className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-5 py-2 text-sm shadow hover:shadow-md transition-all duration-200" 
                       onClick={() => setIsFormOpen(true)}
                     >
                       Inizia Ora Gratis
                     </Button>
                     <span className="text-xs text-slate-400 mt-2">Annulla quando vuoi</span>
                  </div>
                  {/* HighLevel Price */}
                  <div className="p-5 bg-slate-50 flex justify-center items-center border-l border-slate-200">
                     <span className="text-lg font-semibold text-slate-700">{comparisonData.find(i => i.feature === 'Prezzo')?.normal}</span>
                  </div>
                  {/* Tipico Corso Price */}
                  <div className="p-5 bg-slate-50 rounded-br-xl flex justify-center items-center border-l border-slate-200">
                     <span className="text-lg font-semibold text-slate-700">{comparisonData.find(i => i.feature === 'Prezzo')?.tipico}</span>
                  </div>
                   {/* --- Price Row End --- */} 
                </div>
              </div>
            </div>
        </section>

        <section className="space-y-8">
           {/* Container for Senja Widget */}
           <div className="senja-widget-container p-4 sm:p-6 bg-white rounded-lg shadow-md">
                <div 
                    className="senja-embed" 
                    data-id={senjaWidgetId} 
                    data-mode="shadow" 
                    data-lazyload="false"
                ></div>
           </div>
        </section>

        <section className="space-y-6">
           <h2 className="text-2xl md:text-3xl font-semibold text-center"> 
              <Users className="inline-block h-7 w-7 mr-2 text-primary"/> Per Chi È Pensata
           </h2>
           <p className="text-center text-lg">Questa trial è per te se:</p>
           <ul className="space-y-3 list-inside max-w-xl mx-auto">
             {[ 
               "Stai seguendo il corso gratuito ma vuoi agire",
               "Hai bisogno di un sistema funzionante, non di altri video",
               "Vuoi iniziare a cercare clienti da subito",
               "Vuoi testare il nostro ecosistema prima di diventare Licensee"
             ].map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <span>{item}</span>
                </li>
             ))}
           </ul>
        </section>

        <section className="space-y-6">
           <h2 className="text-2xl md:text-3xl font-semibold text-center">
              <HelpCircle className="inline-block h-7 w-7 mr-2 text-primary" /> Domande Frequenti (FAQ)
           </h2>
            <Accordion type="single" collapsible className="w-full max-w-2xl mx-auto">
                <AccordionItem value="item-1">
                    <AccordionTrigger>Posso disdire se non fa per me?</AccordionTrigger>
                    <AccordionContent>
                     Certo. Hai pieno controllo. Se entro i 10 giorni non vuoi continuare, nessun vincolo.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>Posso davvero usarlo per cercare clienti?</AccordionTrigger>
                    <AccordionContent>
                     Sì. È progettato per essere operativo da subito. Non è un ambiente di test, è reale.
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-3">
                    <AccordionTrigger>Cosa succede dopo i 10 giorni?</AccordionTrigger>
                    <AccordionContent>
                      Se ti trovi bene, continui e diventi un vero Licensee. Se no, puoi semplicemente fermarti.
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-4">
                    <AccordionTrigger>Il subaccount è come GHL normale?</AccordionTrigger>
                    <AccordionContent>
                     Sì, ma è già pronto. Non devi settare nulla: hai tutto configurato come agenzia.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </section>

        {/* Final CTA Section */}
        <section className="text-center space-y-6 p-8 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg shadow-xl">
           <h2 className="text-3xl md:text-4xl font-bold">Non Aspettare di Essere Esperto.</h2>
           {/* Improved paragraph spacing */}
           <p className="text-lg md:text-xl leading-relaxed"> 
               Cosa succede se la attivi oggi?
               <br />
               Forse tra 10 giorni hai il tuo primo cliente. O forse no.
               <br />
               <span className="font-semibold">Ma almeno non sei rimasto a guardare un corso.</span>
           </p>
           {/* Highlighted trial info */}
           <p className="text-lg sm:text-xl font-semibold inline-block bg-black/10 px-4 py-2 rounded-md border border-white/20"> 
               🎯 Starter Trial: 10 Giorni Gratis → poi 97€/mese → Subaccount attivo da subito
           </p>
            {/* Adjusted Button */}
            <button 
              onClick={() => setIsFormOpen(true)} 
              className="btn-gradient-animated mt-4"
            >
                <Image 
                    src="/academylogo.png"
                    alt="Logo"
                    width={20}
                    height={20}
                    className="mr-2 h-5 w-5 filter brightness-0 invert"
                />
              👉 COMPILA IL FORM ORA E AVVIA LA TUA AGENZIA
            </button>
        </section>

        {/* Ghost Watcher Comparison Table Section - Headers Above Blue Box */}
        <section className="py-16">
            <div className="max-w-3xl mx-auto px-4">
                <div className="relative pt-6 pb-16">
                    {/* Ghost Watcher Card - Floating on top with clean borders */}
                    <div className="absolute left-0 top-0 w-[32%] bg-purple-50 rounded-xl 
                        shadow-[0_0_25px_rgba(130,80,230,0.4),0_0_15px_rgba(118,74,212,0.3)] 
                        z-10 overflow-hidden">
                        {/* Card Header */}
                        <div className="p-6 flex items-center gap-3">
                            <div className="bg-slate-900 w-8 h-8 rounded-md flex items-center justify-center">
                                <Image src="/academylogo.png" alt="Ghost Watcher" width={20} height={20} className="brightness-0 invert" />
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg">Madani Starter</h3>
                        </div>
                        
                        {/* Features */}
                        {ghostWatcherFeaturesData.map((feature) => (
                            <div key={feature.name} className="px-6 py-4 flex items-center gap-3">
                                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                                <span className="text-slate-800 font-medium">{feature.name}</span>
                            </div>
                        ))}
                        
                        {/* Price */}
                        <div className="px-6 py-5 flex items-center justify-center">
                            <div>
                                <span className="text-slate-500 text-sm">EUR</span>
                                <span className="text-3xl font-bold text-slate-900 mx-1">97</span>
                                <span className="text-slate-500 text-sm">/mese</span>
                            </div>
                        </div>
                        
                        {/* Button */}
                        <div className="px-6 pb-6 pt-2">
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-3"
                                onClick={() => setIsFormOpen(true)}
                            >
                                Get now
                            </Button>
                        </div>
                    </div>
                    
                    {/* Competitor Headers - Outside the blue box */}
                    <div className="ml-[28%] w-[72%] mb-4 grid grid-cols-2">
                        {competitorPlansData.slice(0, 2).map((plan, index) => (
                            <div key={`header-${plan.name}`} className="px-5 py-3 flex items-center justify-center">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <div className="w-5 h-5 flex items-center justify-center opacity-70">
                                        <Image src="/highlevel.png" alt={plan.name} width={18} height={18} className="opacity-70" />
                                    </div>
                                    <span className="text-sm">{plan.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Competitor Table Content - Blue rounded box with only features and prices */}
                    <div className="ml-[28%] w-[72%] bg-slate-50 rounded-xl overflow-hidden">
                        <div className="grid grid-cols-2">
                            {/* Feature rows */}
                            {ghostWatcherFeaturesData.map((feature, featureIndex) => (
                                <React.Fragment key={`feature-row-${feature.name}`}>
                                    {competitorPlansData.slice(0, 2).map((plan, planIndex) => (
                                        <div 
                                            key={`${plan.name}-${feature.name}`} 
                                            className={`py-4 flex items-center justify-center ${featureIndex < ghostWatcherFeaturesData.length - 1 ? 'border-b border-white/10' : ''}`}
                                        >
                                            {plan.features[featureIndex] ? (
                                                <Check className="h-6 w-6 text-green-500" />
                                            ) : (
                                                <X className="h-6 w-6 text-red-500" />
                                            )}
                                        </div>
                                    ))}
                                </React.Fragment>
                            ))}
                            
                            {/* Price row */}
                            {competitorPlansData.slice(0, 2).map((plan, index) => (
                                <div key={`price-${plan.name}`} className="py-5 flex items-center justify-center">
                                    <div>
                                        <span className="text-slate-500 text-sm">EUR</span>
                                        <span className="text-xl font-bold text-slate-800 mx-1">{plan.price}</span>
                                        <span className="text-slate-500 text-sm">/mese</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>

      </main>

      <DialogContent className="sm:max-w-[600px] bg-gray-900 text-gray-100 border-gray-700 p-0">
         <div className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[85vh]">
            {step === 1 && (
              <>
                <DialogHeader>
                  <DialogTitle>🎯 Hai già visto cosa puoi fare. Ora attiva il sistema.</DialogTitle>
                  <DialogDescription>
                    In 2 minuti attivi l'unico sistema pronto all'uso per trovare clienti — con corso, affiancamento, subaccount incluso.
Nessun rischio. Nessun vincolo. Nessuna scusa.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
            <div className="space-y-2">
                    <Label htmlFor="companyName">Nome dell&apos;agenzia <span className="text-xs text-muted-foreground">(facoltativo)</span></Label>
              <Input
                id="companyName"
                name="companyName"
                placeholder="es. Meta Platforms, Inc."
                      value={formData.companyName}
                      onChange={handleInputChange}
                      // Note: No error styling needed as it's optional
              />
            </div>
            <div className="space-y-2">
                    <Label htmlFor="fullName">Nome e Cognome*</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="es. Mark Zuck"
                required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={cn(formErrors.fullName && "border-red-500")}
              />
                    {formErrors.fullName && <p className="text-sm text-red-600 mt-1">{formErrors.fullName}</p>}
            </div>
            <div className="space-y-2">
                    <Label htmlFor="email">Email*</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="es. zuck@meta.com"
                required
                      value={formData.email}
                      onChange={handleInputChange}
                      className={cn(formErrors.email && "border-red-500")}
              />
                    {formErrors.email && <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>}
            </div>
            <div className="space-y-2">
                    <Label htmlFor="phone">Numero di telefono*</Label>
              <div className="flex items-center space-x-2">
                 <span className="text-sm text-gray-500">+39</span>
                 <Input
                   id="phone"
                   name="phone"
                   type="tel"
                        inputMode="numeric"
                        placeholder="123 456 7890"
                   required
                        value={formatPhoneNumber(formData.rawPhone)}
                        onChange={handlePhoneInput}
                        className={cn("flex-1", formErrors.phone && "border-red-500")}
                 />
              </div>
                    {formErrors.phone && <p className="text-sm text-red-600 mt-1">{formErrors.phone}</p>}
                  </div>
                </div>
                <DialogFooter>
                  <button 
                    type="button"
                    className="btn-gradient-animated w-full"
                    onClick={handleNextStep}
                  >
                    👉 Prosegui – Prepara il mio Sistema
                  </button>
                </DialogFooter>
              </>
            )}

            {step === 2 && (
              <>
                <DialogHeader> 
                  <p className="text-xs text-green-400 font-semibold mb-1 text-center">🟢 Step 2 di 2 — Attivazione finale</p>
                  <DialogTitle className="text-gray-50 text-center text-xl sm:text-2xl">🎯 L'offerta del secolo</DialogTitle>
                  <p className="text-sm text-yellow-300 font-semibold mt-1 text-center">
                    <span className="pulse-indicator mr-1.5"></span> 3 persone stanno attivando ora
                  </p>
                </DialogHeader>

                 <div className="my-4 sm:my-6 space-y-3 px-4 py-4 border-y border-gray-700">
                    <div className="flex items-start gap-3 text-xs sm:text-sm">
                      <LifeBuoy className="h-4 sm:h-5 w-4 sm:h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Affiancamento reale (non solo community)</span>
                    </div>
                    <div className="flex items-start gap-3 text-xs sm:text-sm">
                      <Server className="h-4 sm:h-5 w-4 sm:h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Subaccount HighLevel già configurato</span>
                    </div>
                     <div className="flex items-start gap-3 text-xs sm:text-sm">
                       <ThumbsUp className="h-4 sm:h-5 w-4 sm:h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                       <span className="text-gray-300"><span className="font-semibold text-gray-200">Paghi solo il software</span> che avresti preso comunque</span>
                     </div>
                     <div className="flex items-start gap-3 text-xs sm:text-sm">
                       <XCircle className="h-4 sm:h-5 w-4 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" />
                       <span className="text-gray-300"><span className="font-semibold text-gray-200">Nessun vincolo.</span> Annulli quando vuoi</span>
                     </div>
                 </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                   {formErrors.general && (
                     <div className="p-3 text-sm text-red-200 rounded-lg bg-red-900/30 border border-red-500/50" role="alert">
                       <span className="font-medium">Errore:</span> {formErrors.general}
                     </div>
                  )}
                  <DialogFooter className="mt-4 flex flex-col items-center gap-4">
                      <div className="w-full flex flex-col items-center gap-4"> 
                          <div className="w-full text-center bg-gray-700/50 border border-gray-600/80 rounded-lg p-3 sm:p-4 shadow-lg"> 
                             <p className="text-xs sm:text-sm font-medium text-gray-200 mb-4"> 
                               <span className="font-bold text-yellow-300">⏳ Scegli ora il tuo bonus personale</span> – scade tra 
                               <span className="font-bold text-yellow-300 bg-yellow-900/40 px-2 py-0.5 rounded mx-1 sm:mx-1.5">{formatTime(timeLeft)}</span>
                             </p>
                           <RadioGroup 
                               value={selectedBonus}
                               onValueChange={setSelectedBonus}
                               className="space-y-2.5 items-start flex flex-col pl-4 sm:pl-6"
                           >
                             <div className="flex items-center space-x-3"> 
                               <UserCheck className="h-4 w-4 text-blue-400 flex-shrink-0" />
                               <RadioGroupItem value="bonus_call" id="bonus_call" className="text-orange-500 border-gray-500 h-4 w-4" />
                               <Label htmlFor="bonus_call" className="text-xs sm:text-sm text-gray-300 font-normal cursor-pointer">Chiamata di affiancamento avanzato</Label>
                             </div>
                             <div className="flex items-center space-x-3"> 
                               <Bot className="h-4 w-4 text-purple-400 flex-shrink-0" />
                               <RadioGroupItem value="bonus_ai_voice" id="bonus_ai_voice" className="text-orange-500 border-gray-500 h-4 w-4" />
                               <Label htmlFor="bonus_ai_voice" className="text-xs sm:text-sm text-gray-300 font-normal cursor-pointer">Come usare l'AI Voice per prenotare appuntamenti</Label>
                             </div>
                             <div className="flex items-center space-x-3"> 
                               <Copy className="h-4 w-4 text-green-400 flex-shrink-0" />
                               <RadioGroupItem value="bonus_ads" id="bonus_ads" className="text-orange-500 border-gray-500 h-4 w-4" />
                               <Label htmlFor="bonus_ads" className="text-xs sm:text-sm text-gray-300 font-normal cursor-pointer">+300 ads rubate da Meta (e te le regalo)</Label>
                             </div>
                           </RadioGroup>
                          </div>

                          <div className="w-full text-center">
                              {activationMessageVisible ? (
                                  <div className="flex items-center justify-center text-base sm:text-lg font-semibold text-blue-300 h-[48px] sm:h-[52px]">
                                      <RefreshCw className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                      Stiamo attivando il tuo subaccount...
            </div>
                              ) : (
                                  <>
                                      <Button
                                          type="submit"
                                          className="w-full bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-500 text-sm sm:text-base font-semibold py-2 sm:py-2.5"
                                          size="lg"
                                          disabled={isLoading || !selectedBonus}
                                          title="🎯 Subaccount operativo in meno di 5 minuti"
                                      >
                                          🚀 Attiva ora a 0€ → 10 giorni + bonus incluso
            </Button>
                                      <p className="text-xs  font-semibold text-gray-500 mt-1.5">poi 97€ al mese</p>
                                  </>
                              )}
                          </div>

                          <div className="text-center w-full mt-0 space-y-1.5"> 
                              <p className="text-xs text-red-400/80"> 
                                🔒 Questo bonus non sarà più disponibile dopo questa sessione.
                              </p>
                              <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs text-gray-400/80 pt-1">
                                  <span className="flex items-center gap-1"><Lock className="h-3 w-3"/> Pagamento sicuro Stripe</span>
                                  <span>|</span>
                                  <span className="flex items-center gap-1"><XCircle className="h-3 w-3"/> Annulla quando vuoi</span>
                              </div>
                          </div>
                       </div> 
                    </DialogFooter>
        </form>
              </>
            )}
    </div>
      </DialogContent>
    </Dialog>
  );
}
