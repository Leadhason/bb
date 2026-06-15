"use client";

import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Mail, Send, CheckCircle, Loader2, MessageSquare, HelpCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Breadcrumb } from "../../components/Breadcrumb";

export default function ContactPage() {
  const { showToast } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General Inquiry");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate sending message
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      showToast("Message sent successfully!", "success");
    }, 1500);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setSubject("General Inquiry");
    setMessage("");
    setSubmitted(false);
  };

  const subjects = [
    "General Inquiry",
    "Custom Beat Production",
    "License Upgrades",
    "Business Opportunities",
    "Support / Download Issue"
  ];

  return (
    <div className="w-full max-w-[900px] mx-auto pt-6 pb-16 animate-fadeIn flex flex-col gap-8">
      
      <Breadcrumb 
        items={[
          { label: "Storefront", href: "/" },
          { label: "Contact" }
        ]}
      />

      {/* Header */}
      <div className="border-b border-border-subtle pb-6">
        <h1 className="font-syne font-bold text-[28px] text-text-primary uppercase tracking-wider">
          Contact Us
        </h1>
        <p className="font-syne text-[13px] text-text-secondary mt-1">
          Have a question about beats, licensing, or custom inquiries? Get in touch.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-10 items-start">
        {/* Contact Form Area */}
        <div className="bg-bg-surface border border-border-default rounded-xl p-6 md:p-8 shadow-sm">
          {submitted ? (
            <div className="text-center py-12 flex flex-col items-center gap-4 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-success-bg flex items-center justify-center text-success-text">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h2 className="font-syne font-bold text-[18px] text-text-primary uppercase tracking-wider">
                Message Sent!
              </h2>
              <p className="text-[12px] text-text-secondary max-w-[340px] leading-relaxed">
                Thank you for reaching out. We will review your message and get back to you within 24 hours.
              </p>
              <button 
                onClick={resetForm}
                className="btn-secondary mt-4 h-9 px-5 text-[11px] uppercase font-syne font-medium"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="contact-name">Your Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name"
                    className="input h-10 bg-bg-elevated"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="contact-email">Email Address</label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="input h-10 bg-bg-elevated"
                  />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="contact-subject">Inquiry Subject</label>
                <div className="relative">
                  <select
                    id="contact-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="input h-10 bg-bg-elevated pr-8 appearance-none cursor-pointer text-[12px]"
                  >
                    {subjects.map((subj) => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-text-muted flex items-center justify-center text-[10px]">▼</span>
                </div>
              </div>

              <div>
                <label className="label" htmlFor="contact-message">Message Details</label>
                <textarea
                  id="contact-message"
                  required
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your project, request, or issue..."
                  className="input py-3 bg-bg-elevated min-h-[140px] resize-y"
                />
              </div>

              <div className="pt-3 border-t border-border-subtle mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary h-10 px-6 text-[12px] uppercase font-syne font-medium flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Sidebar Info Area */}
        <div className="flex flex-col gap-6">
          {/* Quick Help Link recovery */}
          <div className="bg-bg-surface border border-border-default rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-text-primary">
              <HelpCircle className="w-4.5 h-4.5 text-text-secondary" />
              <h3 className="font-syne font-semibold text-[13px] uppercase tracking-wider">Lost Download?</h3>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              If your email download link expired, you can easily recover your purchase automatically without sending a manual support email.
            </p>
            <Link 
              href="/resend-link"
              className="btn-secondary py-1.5 text-[11px] font-syne uppercase text-center flex items-center justify-center gap-1 mt-1"
            >
              Recover Links
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Social Channels */}
          <div className="bg-bg-surface border border-border-default rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-text-primary border-b border-border-subtle pb-2">
              <MessageSquare className="w-4.5 h-4.5 text-text-secondary" />
              <h3 className="font-syne font-semibold text-[13px] uppercase tracking-wider">Other Channels</h3>
            </div>
            
            <div className="flex flex-col gap-3">
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-between text-[12px] text-text-secondary hover:text-text-primary transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-text-muted group-hover:text-danger-text fill-current" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  YouTube channel
                </span>
                <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-100" />
              </a>

              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-between text-[12px] text-text-secondary hover:text-text-primary transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-text-muted group-hover:text-text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                  Instagram DM
                </span>
                <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-100" />
              </a>

              <div className="flex items-center gap-2 text-[12px] text-text-secondary pt-2 border-t border-border-subtle/50">
                <Mail className="w-4 h-4 text-text-muted" />
                <span>support@blingsbeats.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
