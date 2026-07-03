import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  RefreshCw,
  LogOut,
  Phone,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  ShieldCheck,
  ShieldQuestion,
  Check,
  X,
  Lock,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

type Screen = "login" | "home" | "incoming" | "active" | "mismatch" | "secured";

const contacts = [
  { name: "Anna Kovalenko", number: "+380 67 214 8890" },
  { name: "Dmytro Shevchuk", number: "+380 50 118 4421" },
  { name: "Olena Marchenko", number: "+380 93 552 7710" },
  { name: "Ivan Petrenko", number: "+380 68 907 3312" },
  { name: "Sofia Bondar", number: "+380 66 224 5588" },
  { name: "Maksym Tkachenko", number: "+380 95 401 9923" },
];

function Index() {
  const [screen, setScreen] = useState<Screen>("login");

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-md flex-wrap items-center gap-1.5 px-3 py-2 text-[11px]">
          <span className="mr-1 text-muted-foreground">Preview:</span>
          {(
            [
              ["login", "Login"],
              ["home", "Home"],
              ["incoming", "Incoming"],
              ["active", "In call"],
              ["mismatch", "Mismatch"],
              ["secured", "Secured"],
            ] as [Screen, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setScreen(id)}
              className={`rounded-full px-2.5 py-1 transition ${
                screen === id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto min-h-[calc(100vh-40px)] max-w-md phone-shell">
        {screen === "login" && <LoginScreen onContinue={() => setScreen("home")} />}
        {screen === "home" && (
          <HomeScreen onLogout={() => setScreen("login")} onCall={() => setScreen("incoming")} />
        )}
        {screen === "incoming" && (
          <IncomingCallScreen
            onAccept={() => setScreen("active")}
            onDecline={() => setScreen("home")}
          />
        )}
        {screen === "active" && (
          <ActiveCallScreen
            onHangup={() => setScreen("home")}
            onVerified={() => setScreen("secured")}
          />
        )}
        {screen === "secured" && (
          <ActiveCallScreen secured onHangup={() => setScreen("home")} onVerified={() => {}} />
        )}
      </div>
    </div>
  );
}

function BrandMark({ size = 44 }: { size?: number }) {
  return (
    <img
      src="/scvp-logo.svg"
      alt="SCVP"
      className="rounded-2xl"
      style={{ width: size, height: size }}
    />
  );
}

function LoginScreen({ onContinue }: { onContinue: () => void }) {
  const [showPw, setShowPw] = useState(false);
  return (
    <div className="flex min-h-[calc(100vh-40px)] flex-col px-6 pb-10 pt-14">
      <div className="flex flex-col items-center gap-3">
        <BrandMark size={72} />
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">SCVP</h1>
          <p className="mt-1 text-xs text-muted-foreground">Secure Corporate Voice Platform</p>
        </div>
      </div>

      <form
        className="mt-10 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onContinue();
        }}
      >
        <Field label="URL" placeholder="https://scvp.company.com" />
        <Field label="Company identifier" placeholder="acme-corp" />
        <Field label="User Code" placeholder="1042" />

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Password</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              className="h-12 w-full rounded-xl border border-border bg-input px-4 pr-11 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground hover:text-foreground"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 h-12 w-full rounded-xl bg-primary font-medium text-primary-foreground shadow-glow transition hover:brightness-110 active:scale-[0.99]"
        >
          Continue
        </button>
      </form>

      <div className="mt-auto flex items-center justify-center gap-1.5 pt-8 text-[11px] text-muted-foreground">
        <Lock size={12} /> End-to-end encrypted · ZRTP
      </div>
    </div>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <input
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-border bg-input px-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
      />
    </div>
  );
}

function HomeScreen({ onLogout, onCall }: { onLogout: () => void; onCall: () => void }) {
  return (
    <div className="flex min-h-[calc(100vh-40px)] flex-col px-4 pb-6 pt-6">
      <div className="flex items-center gap-3">
        <BrandMark />
        <div className="leading-tight">
          <div className="text-sm font-semibold">SCVP</div>
          <div className="text-[11px] text-muted-foreground">Secure session active</div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-card p-4 shadow-card">
        <InfoRow label="Name" value="John Anderson" />
        <InfoRow label="Number" value="1042" />
        <InfoRow
          label="License"
          value={
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-medium text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> OK
            </span>
          }
        />
        <InfoRow label="Valid until" value="31 Dec 2026" />
        <InfoRow
          label="Connection"
          value={
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-medium text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> OK
            </span>
          }
        />
        <InfoRow label="Company" value="Acme Corporation" last />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button className="flex h-11 items-center justify-center gap-2 rounded-xl bg-secondary text-sm font-medium text-secondary-foreground transition hover:bg-accent">
          <RefreshCw size={16} /> Refresh
        </button>
        <button
          onClick={onLogout}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 text-sm font-medium text-destructive transition hover:bg-destructive/20"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="mt-6 flex items-center justify-between px-1">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Contacts
        </h2>
        <span className="text-[11px] text-muted-foreground">{contacts.length}</span>
      </div>

      <div className="mt-2 space-y-2 pb-4">
        {contacts.map((c) => (
          <div
            key={c.number}
            className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {c.name
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{c.name}</div>
                <div className="truncate font-mono text-[11px] text-muted-foreground">
                  {c.number}
                </div>
              </div>
            </div>
            <button
              onClick={onCall}
              className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:brightness-110 active:scale-95"
            >
              <Phone size={13} /> CALL
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  last,
}: {
  label: string;
  value: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-2.5 ${
        last ? "" : "border-b border-border/60"
      }`}
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function IncomingCallScreen({
  onAccept,
  onDecline,
}: {
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="flex min-h-[calc(100vh-40px)] flex-col items-center px-6 pb-10 pt-16">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">Incoming call</div>

      <div className="ring-pulse mt-10 rounded-full">
        <div className="grid h-32 w-32 place-items-center rounded-full bg-primary/15 text-3xl font-semibold text-primary ring-1 ring-primary/30">
          AK
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="text-2xl font-semibold">Anna Kovalenko</div>
        <div className="mt-1 font-mono text-sm text-muted-foreground">+380 67 214 8890</div>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] text-primary">
          <Lock size={11} /> ZRTP encrypted
        </div>
      </div>

      <div className="mt-auto grid w-full grid-cols-2 gap-6 pt-10">
        <button onClick={onDecline} className="flex flex-col items-center gap-2">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-destructive text-destructive-foreground shadow-card transition active:scale-95">
            <PhoneOff size={24} />
          </span>
          <span className="text-xs text-muted-foreground">Decline</span>
        </button>
        <button onClick={onAccept} className="flex flex-col items-center gap-2">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-success text-success-foreground shadow-glow transition active:scale-95">
            <PhoneCall size={24} />
          </span>
          <span className="text-xs text-muted-foreground">Accept</span>
        </button>
      </div>
    </div>
  );
}

function ActiveCallScreen({
  onHangup,
  onVerified,
  secured = false,
}: {
  onHangup: () => void;
  onVerified: () => void;
  secured?: boolean;
}) {
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);

  return (
    <div className="flex min-h-[calc(100vh-40px)] flex-col items-center px-6 pb-8 pt-10">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">
        {secured ? "Secure call" : "In call"}
      </div>

      <div className="mt-6 grid h-24 w-24 place-items-center rounded-full bg-primary/15 text-2xl font-semibold text-primary ring-1 ring-primary/30">
        AK
      </div>
      <div className="mt-4 text-center">
        <div className="text-xl font-semibold">Anna Kovalenko</div>
        <div className="mt-0.5 font-mono text-xs text-muted-foreground">+380 67 214 8890</div>
        <div className="mt-2 font-mono text-xs text-success">00:47</div>
      </div>

      <div className="mt-6 w-full rounded-2xl border border-border bg-card p-4 shadow-card">
        {secured ? (
          <div className="flex flex-col items-center gap-2 py-2 text-center">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-success/15 text-success">
              <ShieldCheck size={22} />
            </div>
            <div className="text-sm font-semibold text-success">Connection is secure</div>
            <div className="text-[11px] text-muted-foreground">
              SAS verified · end-to-end encrypted (ZRTP)
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
              <ShieldQuestion size={13} /> Verify SAS code
            </div>
            <div className="mt-3 text-center font-mono text-4xl font-bold tracking-[0.35em] text-primary">
              7K4Q
            </div>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
              Read the code aloud and confirm the other party sees the same four characters.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-destructive/40 bg-destructive/10 text-xs font-semibold text-destructive transition hover:bg-destructive/20">
                <X size={14} /> No match
              </button>
              <button
                onClick={onVerified}
                className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-success text-xs font-semibold text-success-foreground transition hover:brightness-110"
              >
                <Check size={14} /> Match
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-auto flex w-full items-center justify-around pt-8">
        <ControlBtn
          active={muted}
          onClick={() => setMuted((v) => !v)}
          label={muted ? "Unmute" : "Mute"}
          icon={muted ? <MicOff size={22} /> : <Mic size={22} />}
        />
        <button onClick={onHangup} className="flex flex-col items-center gap-2" aria-label="Hang up">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-destructive text-destructive-foreground shadow-card transition active:scale-95">
            <PhoneOff size={26} />
          </span>
          <span className="text-[11px] text-muted-foreground">Hang up</span>
        </button>
        <ControlBtn
          active={speaker}
          onClick={() => setSpeaker((v) => !v)}
          label="Speaker"
          icon={<Volume2 size={22} />}
        />
      </div>
    </div>
  );
}

function ControlBtn({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2">
      <span
        className={`grid h-14 w-14 place-items-center rounded-full border transition ${
          active
            ? "border-primary/50 bg-primary/20 text-primary"
            : "border-border bg-secondary text-secondary-foreground hover:bg-accent"
        }`}
      >
        {icon}
      </span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </button>
  );
}
