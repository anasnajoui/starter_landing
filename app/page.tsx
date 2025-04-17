"use client";

import { useState } from 'react';
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
  Scale
} from 'lucide-react';

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

// Define error state type
interface FormErrors {
  companyName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  general?: string; // For API or other general errors
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [rawPhone, setRawPhone] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const validateForm = (data: { companyName: string, fullName: string, email: string, phone: string }): FormErrors => {
    const errors: FormErrors = {};
    if (!data.fullName) errors.fullName = "Nome e cognome è obbligatorio.";
    if (!data.email) {
        errors.email = "Email è obbligatoria.";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
        errors.email = "Formato email non valido.";
    }
    if (!data.phone) {
        errors.phone = "Numero di telefono è obbligatorio.";
    } else if (data.phone.length < 9 || data.phone.length > 10) {
        errors.phone = "Inserisci un numero di telefono valido (9-10 cifre).";
    }
    return errors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePhoneInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputDigits = event.target.value.replace(/\D/g, '');
    setRawPhone(inputDigits.slice(0, 10));
    if (formErrors.phone) {
        setFormErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setFormErrors({});

    const formData = new FormData(event.currentTarget);
    const companyName = formData.get("companyName") as string || "";
    const fullName = formData.get("fullName") as string || "";
    const email = formData.get("email") as string || "";

    const submissionData = {
      companyName,
      fullName,
      email,
      phone: rawPhone,
    };
    
    const errors = validateForm(submissionData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsLoading(false);
      return;
    }

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
    }
  };

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

  const senjaWidgetId = "6e0bac20-2338-4226-af21-a8def885d490";

  const comparisonData = [
    { icon: Brain, feature: "Risultati Reali", normal: false, madani: "In media: 1° cliente in 12 giorni" },
    { icon: UserCheck, feature: "Affiancamento 1° Cliente", normal: false, madani: true },
    { icon: PhoneCall, feature: "Calls Settimanali (Vendita, Offerta, Leads etc..)", normal: false, madani: true },
    { icon: Languages, feature: "Supporto in italiano", normal: false, madani: true },
    { icon: PackageSearch, feature: "Scripts, Ads, Tools +300 Risorse", normal: false, madani: true },
    { icon: Server, feature: "3 Highlevel Accounts", normal: true, madani: true },
    { icon: Scale, feature: "Prezzo", normal: "97€/mese", madani: "97€/mese" },
  ];

  return (
    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
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
             <Button size="lg" onClick={() => setIsFormOpen(true)} className="px-50">
                <Image 
                    src="/academylogo.png"
                    alt="Logo"
                    width={20}
                    height={20}
                    className="mr-2 h-5 w-5 filter brightness-0 invert"
                />
                Attiva Ora lo Starter
             </Button>
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
                                    logo.featured ? "opacity-100" : "opacity-70 grayscale hover:grayscale-0"
                                )}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-center">HighLevel Starter vs Madani Starter</h2>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                   <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="h-20"></TableHead>
                      <TableHead className="text-center align-middle p-4 border-l bg-muted rounded-t-md">
                         <Image 
                           src="/starterlogo.jpg"
                           alt="Madani Starter Logo"
                           width={100} 
                           height={40}
                           className="mx-auto object-contain"
                       />
                      </TableHead>
                      <TableHead className="text-center align-middle p-4 border-l">
                         <Image 
                           src="/highlevel.png"
                           alt="HighLevel Logo"
                           width={100} 
                           height={30}
                           className="mx-auto object-contain"
                       />
                      </TableHead>
                   </TableRow>
                  <TableRow>
                      <TableHead className="py-3">Caratteristica</TableHead>
                      <TableHead className="text-center py-3 border-l bg-muted text-primary font-semibold">Madani Starter</TableHead>
                      <TableHead className="text-center py-3 border-l">HighLevel Starter</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {comparisonData.map((item, index, arr) => (
                        <TableRow key={item.feature}>
                             <TableCell className="font-medium py-3">
                                 <div className="flex items-center gap-2">
                                     <item.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" /> 
                                     <span>{item.feature}</span>
                                 </div>
                             </TableCell>
                              <TableCell className={cn(
                                  "text-center py-3 border-l bg-muted",
                                  index === arr.length - 1 && "rounded-b-md"
                              )}>
                                  {typeof item.madani === 'boolean' ? (
                                      item.madani ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-500 mx-auto" />
                                  ) : (
                                      <span className="text-primary font-bold">{item.madani}</span>
                                  )}
                              </TableCell>
                              <TableCell className="text-center py-3 border-l">
                                 {typeof item.normal === 'boolean' ? (
                                     item.normal ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-500 mx-auto" />
                                 ) : (
                                     <span>{item.normal}</span>
                                 )}
                              </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-center text-lg font-semibold pt-4">
               💥 Il costo è lo stesso. Il valore, no.
            </p>
            <p className="text-center text-base text-muted-foreground -mt-2"> 
            🏆 Il software lo avresti preso comunque. Con Madani, ottieni gratis tutto il resto.
             </p>
        </section>

        <section className="space-y-8">
           <h2 className="text-2xl md:text-3xl font-semibold text-center"> 
              <MessageCircle className="inline-block h-7 w-7 mr-2 text-primary"/> I Nostri Studenti:
           </h2>
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

        <section className="text-center space-y-6 p-8 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg">
           <h2 className="text-3xl md:text-4xl font-bold">Non Aspettare di Essere Esperto.</h2>
           <p className="text-lg md:text-xl">
               Cosa succede se la attivi oggi?
               <br />
               Forse tra 10 giorni hai il tuo primo cliente.
               <br />
               O forse no.
               <br />
               Ma almeno non sei rimasto a guardare un corso.
           </p>
           <p className="text-xl font-semibold">
               🎯 Starter Trial: 97$ → 10 giorni → Subaccount attivo da subito
           </p>
            <Button size="lg" variant="secondary" onClick={() => setIsFormOpen(true)} className="px-50">
                <Image 
                    src="/academylogo.png"
                    alt="Logo"
                    width={20}
                    height={20}
                    className="mr-2 h-5 w-5 filter brightness-0"
                />
              👉 COMPILA IL FORM ORA E AVVIA LA TUA AGENZIA
            </Button>
        </section>



      </main>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            <PencilLine className="inline-block h-5 w-5 mr-2 relative -top-0.5" /> 
            Attiva Ora la Tua Starter Trial
          </DialogTitle>
          <DialogDescription>
            Compila il modulo per attivare la trial. Dopo aver inviato il form, riceverai via email l&apos;accesso al subaccount, la guida iniziale e il link per iniziare il mini-affiancamento.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
             {formErrors.general && (
               <div className="p-3 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                 <span className="font-medium">Errore:</span> {formErrors.general}
               </div>
             )}
            <div className="space-y-2">
               <Label htmlFor="companyName">Nome Azienda <span className="text-xs text-muted-foreground">(facoltativo)</span></Label>
              <Input
                id="companyName"
                name="companyName"
                placeholder="es. Meta Platforms, Inc."
                 className={cn(formErrors.companyName && "border-red-500")}
                 onChange={handleInputChange}
              />
               {formErrors.companyName && <p className="text-sm text-red-600 mt-1">{formErrors.companyName}</p>}
            </div>
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
                   className={cn("flex-1", formErrors.phone && "border-red-500")}
                   value={formatPhoneNumber(rawPhone)}
                   onChange={handlePhoneInput}
                 />
              </div>
               {formErrors.phone && <p className="text-sm text-red-600 mt-1">{formErrors.phone}</p>}
            </div>
            <DialogFooter className="pt-6">
                 <div className="flex flex-col items-center w-full gap-2">
                     <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                        {isLoading ? 'Elaborazione...' : '👉 ATTIVA ORA IL TUO SISTEMA'}
            </Button>
                     <p className="text-xs text-center text-muted-foreground">
                        🎁 10 giorni accesso completo → 97$ → cancellabile
                     </p>
                 </div>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
