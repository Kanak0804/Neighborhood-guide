"use client";

import Navigation from '@/components/Navigation';
import { useParams } from 'next/navigation';
import { Shield, FileText, Cookie } from 'lucide-react';

export default function LegalPage() {
  const params = useParams();
  const slug = params.slug as string;

  const getPageInfo = () => {
    switch (slug) {
      case 'privacy':
        return { title: 'Privacy Policy', icon: Shield, desc: 'How we handle and protect your data.' };
      case 'terms':
        return { title: 'Terms of Service', icon: FileText, desc: 'The rules and guidelines for using Localite.' };
      case 'cookies':
        return { title: 'Cookie Policy', icon: Cookie, desc: 'Information about how we use cookies.' };
      default:
        return { title: 'Legal Information', icon: FileText, desc: 'Important legal information.' };
    }
  };

  const getPageContent = () => {
    switch (slug) {
      case 'privacy':
        return [
          { title: "1. Information Collection", content: "We collect personal information that you voluntarily provide to us when expressing an interest in obtaining information about us or our products and services. The personal information that we collect depends on the context of your interactions with us and the Website, the choices you make and the products and features you use." },
          { title: "2. How We Use Your Data", content: "We process your information for purposes based on legitimate business interests, the fulfillment of our contract with you, compliance with our legal obligations, and/or your consent. We use personal information collected via our Website for a variety of business purposes described below." },
          { title: "3. Data Sharing & Disclosure", content: "We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We may process or share your data that we hold based on the following legal basis: Consent, Legitimate Interests, Performance of a Contract, and Legal Obligations." }
        ];
      case 'terms':
        return [
          { title: "1. Agreement to Terms", content: "By accessing our website, you agree to be bound by these Terms of Service and agree that you are responsible for the agreement with any applicable local laws. If you disagree with any of these terms, you are prohibited from accessing this site." },
          { title: "2. Use License", content: "Permission is granted to temporarily download one copy of the materials (information or software) on Localite's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not modify or copy the materials." },
          { title: "3. Disclaimer", content: "The materials on Localite's website are provided on an 'as is' basis. Localite makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability." }
        ];
      case 'cookies':
        return [
          { title: "1. What Are Cookies", content: "Cookies are small text files that are placed on your computer or mobile device when you browse websites. Our cookies help us make our website work as you'd expect, remember your settings, and improve the speed and security of the site." },
          { title: "2. How We Use Cookies", content: "We use cookies for a variety of reasons detailed below. Unfortunately, in most cases, there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site. We recommend that you leave on all cookies." },
          { title: "3. Disabling Cookies", content: "You can prevent the setting of cookies by adjusting the settings on your browser. Be aware that disabling cookies will affect the functionality of this and many other websites that you visit. Disabling cookies will usually result in also disabling certain functionality and features of the this site." }
        ];
      default:
        return [
          { title: "1. General Information", content: "This is a placeholder for legal information regarding the use of this application. Please contact support for more details." }
        ];
    }
  };

  const info = getPageInfo();
  const Icon = info.icon;
  const content = getPageContent();

  return (
    <main className="min-h-screen bg-background">

      
      {/* Premium Header */}
      <div className="w-full bg-gray-50 dark:bg-[#111] border-b border-gray-200 dark:border-white/5 pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-16 h-16 mx-auto bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(255,111,97,0.2)]">
            <Icon className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-sora font-bold mb-4 text-foreground">{info.title}</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 font-inter">{info.desc}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-gray-600 dark:text-gray-300">
          <p className="text-sm font-medium text-accent uppercase tracking-wider">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <hr className="my-8 border-gray-200 dark:border-white/10" />
          
          <div className="space-y-10">
            {content.map((section, index) => (
              <section key={index}>
                <h2 className="text-xl md:text-2xl font-sora font-bold text-foreground mb-3">{section.title}</h2>
                <p className="font-inter leading-relaxed text-base">
                  {section.content}
                </p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
