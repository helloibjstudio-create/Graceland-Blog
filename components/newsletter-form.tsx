"use client";

import { useState, type FormEvent } from "react";

type Props = {
  /** Unique id — a page can render more than one of these. */
  id: string;
  idleNote?: string;
};

export default function NewsletterForm({ id, idleNote = "" }: Props) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Front-end only — point this at your ESP (Mailchimp, Klaviyo, HubSpot…).
    setSent(true);
    setEmail("");
  }

  return (
    <form className="subscribe" onSubmit={onSubmit}>
      <label className="sr-only" htmlFor={id}>
        Email address
      </label>
      <input
        id={id}
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button className="btn btn-primary" type="submit">
        Subscribe
      </button>
      <p className={`form-note${sent ? " is-ok" : ""}`}>
        {sent ? "Thanks — check your inbox to confirm your subscription." : idleNote}
      </p>
    </form>
  );
}
