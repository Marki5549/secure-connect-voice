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
  ShieldAlert,
  Shield,
  AlertTriangle,
  Check,
  X,
  Lock,
  MessageSquare,
  ChevronLeft,
  Send,
  Fingerprint,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

type Screen =
  | "login"
  | "home"
  | "incoming"
  | "active"
  | "mismatch"
  | "secured"
  | "chat"
  | "verify";

type Trust = "unverified" | "verified" | "danger";

type Contact = {
  name: string;
  number: string;
  trust: Trust;
  unread: number;
  fingerprint: string;
};

const contacts: Contact[] = [
  {
    name: "Anna Kovalenko",
    number: "+380 67 214 8890",
    trust: "verified",
    unread: 2,
    fingerprint: "8F3A 21D9 4C77 0E12 BB65 9A34 5D18 7C90",
  },
  {
    name: "Dmytro Shevchuk",
    number: "+380 50 118 4421",
    trust: "unverified",
    unread: 0,
    fingerprint: "1B44 90CE 22A7 6F30 D519 4E8B 7712 03AF",
  },
  {
    name: "Olena Marchenko",
    number: "+380 93 552 7710",
    trust: "danger",
    unread: 5,
    fingerprint: "77C1 0D23 9E48 A5B6 3F02 8811 6CD4 92E7",
  },
  {
    name: "Ivan Petrenko",
    number: "+380 68 907 3312",
    trust: "unverified",
    unread: 0,
    fingerprint: "5A29 B70F 1C64 88D3 E011 47A9 2B55 6E38",
  },
  {
    name: "Sofia Bondar",
    number: "+380 66 224 5588",
    trust: "verified",
    unread: 1,
    fingerprint: "C3E8 5512 7A0B 96F4 21D7 8834 0AB6 4F19",
  },
  {
    name: "Maksym Tkachenko",
    number: "+380 95 401 9923",
    trust: "unverified",
    unread: 0,
    fingerprint: "2D96 4417 F80A 3B25 7CE1 5090 D362 8A74",
  },
];

const MY_FINGERPRINT = "A94F 27C0 6B13 D85E 30A2 71FC 4499 0B6D";

const trustMeta: Record<Trust, { label: string; dot: string; text: string; bg: string }> = {
  unverified: {
    label: "Not verified",
    dot: "bg-muted-foreground",
    text: "text-muted-foreground",
    bg: "bg-muted-foreground/15",
  },
  verified: {
    label: "Verified",
    dot: "bg-success",
    text: "text-success",
    bg: "bg-success/15",
  },
  danger: {
    label: "Unsafe",
    dot: "bg-destructive",
    text: "text-destructive",
    bg: "bg-destructive/15",
  },
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

type CallState = "active" | "mismatch" | "secured";

function fmtDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function Index() {
  const [screen, setScreen] = useState<Screen>("login");
  const [peer, setPeer] = useState<Contact>(contacts[0]);
  const [call, setCall] = useState<{ contact: Contact; state: CallState } | null>(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!call) {
      setSeconds(0);
      return;
    }
    const t = setInterval(() => setSeconds((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, [call]);

  const onCallScreen = screen === "active" || screen === "mismatch" || screen === "secured";
  const startCall = (contact: Contact, state: CallState = "active") => {
    setCall({ contact, state });
    setScreen(state);
  };
  const endCall = () => {
    setCall(null);
    setScreen("home");
  };
  const setCallState = (state: CallState) => {
    setCall((c) => (c ? { ...c, state } : c));
    setScreen(state);
  };

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
              ["chat", "Chat"],
              ["verify", "Verify"],
            ] as [Screen, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => {
                if (id === "active" || id === "mismatch" || id === "secured") {
                  startCall(call?.contact ?? peer, id);
                } else {
                  setScreen(id);
                }
              }}
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

      {call && !onCallScreen && (
        <OngoingCallBar
          contact={call.contact}
          state={call.state}
          duration={fmtDuration(seconds)}
          onReturn={() => setScreen(call.state)}
          onHangup={endCall}
        />
      )}

      <div className="mx-auto min-h-[calc(100vh-40px)] max-w-md phone-shell">
        {screen === "login" && <LoginScreen onContinue={() => setScreen("home")} />}
        {screen === "home" && (
          <HomeScreen
            onLogout={() => {
              setCall(null);
              setScreen("login");
            }}
            onCall={() => setScreen("incoming")}
            onChat={(c) => {
              setPeer(c);
              setScreen("chat");
            }}
          />
        )}
        {screen === "chat" && (
          <ChatScreen
            contact={peer}
            onBack={() => setScreen("home")}
            onCall={() => startCall(peer)}
            onVerify={() => setScreen("verify")}
          />
        )}
        {screen === "verify" && (
          <VerifyScreen contact={peer} onBack={() => setScreen("chat")} />
        )}
        {screen === "incoming" && (
          <IncomingCallScreen
            onAccept={() => startCall(peer)}
            onDecline={() => setScreen("home")}
          />
        )}
        {onCallScreen && (
          <ActiveCallScreen
            contact={call?.contact ?? peer}
            duration={fmtDuration(seconds)}
            secured={screen === "secured"}
            sasMismatch={screen === "mismatch"}
            onHangup={endCall}
            onVerified={() => setCallState("secured")}
            onMismatch={() => setCallState("mismatch")}
            onMinimize={() => setScreen("home")}
          />
        )}
      </div>
    </div>
  );
}

function OngoingCallBar({
  contact,
  state,
  duration,
  onReturn,
  onHangup,
}: {
  contact: Contact;
  state: CallState;
  duration: string;
  onReturn: () => void;
  onHangup: () => void;
}) {
  const tone =
    state === "secured"
      ? { bg: "bg-success/15", text: "text-success", icon: <ShieldCheck size={14} />, label: "Secure call" }
      : state === "mismatch"
        ? {
            bg: "bg-destructive/15",
            text: "text-destructive",
            icon: <AlertTriangle size={14} />,
            label: "Unverified SAS",
          }
        : {
            bg: "bg-primary/15",
            text: "text-primary",
            icon: <ShieldQuestion size={14} />,
            label: "Call in progress",
          };

  return (
    <div className="sticky top-[41px] z-30 mx-auto max-w-md px-3 pt-2">
      <div className={`flex items-center gap-3 rounded-xl border border-border ${tone.bg} px-3 py-2 shadow-card`}>
        <button onClick={onReturn} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-background/40 ${tone.text}`}>
            {tone.icon}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-semibold">{contact.name}</span>
            <span className={`block text-[10px] ${tone.text}`}>
              {tone.label} · {duration}
            </span>
          </span>
          <span className="ml-auto shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Tap to return
          </span>
        </button>
        <button
          onClick={onHangup}
          aria-label="Hang up"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-destructive text-destructive-foreground transition active:scale-95"
        >
          <PhoneOff size={15} />
        </button>
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

function HomeScreen({
  onLogout,
  onCall,
  onChat,
}: {
  onLogout: () => void;
  onCall: () => void;
  onChat: (c: Contact) => void;
}) {
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
        {contacts.map((c) => {
          const t = trustMeta[c.trust];
          return (
            <div
              key={c.number}
              className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative shrink-0">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    {initials(c.name)}
                  </div>
                  <span
                    title={t.label}
                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${t.dot}`}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-medium">{c.name}</span>
                    {c.unread > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                        <MessageSquare size={9} /> {c.unread}
                      </span>
                    )}
                  </div>
                  <div className={`truncate text-[11px] ${t.text}`}>{t.label}</div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  onClick={() => onChat(c)}
                  aria-label={`Chat with ${c.name}`}
                  className="relative grid h-8 w-8 place-items-center rounded-full bg-secondary text-secondary-foreground transition hover:bg-accent active:scale-95"
                >
                  <MessageSquare size={15} />
                  {c.unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-primary" />
                  )}
                </button>
                <button
                  onClick={onCall}
                  className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:brightness-110 active:scale-95"
                >
                  <Phone size={13} /> CALL
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const demoMessages = [
  { me: false, text: "Hi, are you available for a secure call today?", time: "09:41" },
  { me: true, text: "Yes, give me ten minutes.", time: "09:42" },
  { me: false, text: "Perfect. I'll send the briefing beforehand.", time: "09:42" },
  { me: true, text: "Received. Let's verify fingerprints first.", time: "09:44" },
];

function ChatScreen({
  contact,
  onBack,
  onCall,
  onVerify,
}: {
  contact: Contact;
  onBack: () => void;
  onCall: () => void;
  onVerify: () => void;
}) {
  const t = trustMeta[contact.trust];
  const [draft, setDraft] = useState("");

  return (
    <div className="flex min-h-[calc(100vh-40px)] flex-col">
      <div className="sticky top-[40px] z-30 flex items-center gap-3 border-b border-border bg-background/85 px-3 py-2.5 backdrop-blur">
        <button
          onClick={onBack}
          aria-label="Back"
          className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="relative shrink-0">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            {initials(contact.name)}
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${t.dot}`}
          />
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-sm font-semibold">{contact.name}</div>
          <div className={`flex items-center gap-1 text-[11px] ${t.text}`}>
            {contact.trust === "verified" ? (
              <ShieldCheck size={11} />
            ) : contact.trust === "danger" ? (
              <ShieldAlert size={11} />
            ) : (
              <Shield size={11} />
            )}
            {t.label}
          </div>
        </div>
        <button
          onClick={onVerify}
          aria-label="Verify contact"
          className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-secondary-foreground transition hover:bg-accent"
        >
          <Fingerprint size={17} />
        </button>
        <button
          onClick={onCall}
          aria-label="Call"
          className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground transition hover:brightness-110"
        >
          <Phone size={16} />
        </button>
      </div>

      {contact.trust !== "verified" && (
        <button
          onClick={onVerify}
          className={`mx-3 mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-[11px] ${
            contact.trust === "danger"
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-border bg-card text-muted-foreground"
          }`}
        >
          {contact.trust === "danger" ? <AlertTriangle size={14} /> : <Shield size={14} />}
          <span className="flex-1">
            {contact.trust === "danger"
              ? "Fingerprint changed — this conversation may be unsafe. Verify now."
              : "This contact is not verified yet. Compare fingerprints to secure the chat."}
          </span>
        </button>
      )}

      <div className="flex-1 space-y-2.5 px-3 py-4">
        <div className="mx-auto w-fit rounded-full bg-secondary px-3 py-1 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Lock size={9} /> Messages are end-to-end encrypted
          </span>
        </div>
        {demoMessages.map((m, i) => (
          <div key={i} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-card ${
                m.me
                  ? "rounded-br-md bg-primary text-primary-foreground"
                  : "rounded-bl-md border border-border bg-card text-card-foreground"
              }`}
            >
              <div>{m.text}</div>
              <div
                className={`mt-1 text-right font-mono text-[10px] ${
                  m.me ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}
              >
                {m.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 flex items-center gap-2 border-t border-border bg-background/85 px-3 py-2.5 backdrop-blur">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Secure message"
          className="h-11 flex-1 rounded-full border border-border bg-input px-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
        />
        <button
          onClick={() => setDraft("")}
          aria-label="Send"
          className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground transition hover:brightness-110 active:scale-95"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

function VerifyScreen({ contact, onBack }: { contact: Contact; onBack: () => void }) {
  const [state, setState] = useState<Trust>(contact.trust);
  const t = trustMeta[state];

  return (
    <div className="flex min-h-[calc(100vh-40px)] flex-col px-4 pb-8 pt-3">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          aria-label="Back"
          className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-sm font-semibold">Verify contact</div>
      </div>

      <div className="mt-6 flex flex-col items-center text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/15 text-primary">
          <Fingerprint size={30} />
        </div>
        <div className="mt-3 text-lg font-semibold">{contact.name}</div>
        <span
          className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${t.bg} ${t.text}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} /> {t.label}
        </span>
      </div>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground">
        Compare both fingerprints over a trusted channel — read them aloud during a secure call.
        They must match exactly.
      </p>

      <FingerprintCard title="Your fingerprint" value={MY_FINGERPRINT} />
      <FingerprintCard title={`${contact.name}'s fingerprint`} value={contact.fingerprint} />

      <div className="mt-auto space-y-2 pt-8">
        <button
          onClick={() => setState("verified")}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-success text-sm font-semibold text-success-foreground transition hover:brightness-110 active:scale-[0.99]"
        >
          <ShieldCheck size={17} /> Verify
        </button>
        <button
          onClick={() => setState("danger")}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 text-sm font-semibold text-destructive transition hover:bg-destructive/20"
        >
          <X size={16} /> Fingerprints don't match
        </button>
      </div>
    </div>
  );
}

function FingerprintCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="mt-2 select-all font-mono text-sm leading-relaxed tracking-wide text-foreground">
        {value}
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
  onMismatch,
  secured = false,
  sasMismatch = false,
}: {
  onHangup: () => void;
  onVerified: () => void;
  onMismatch?: () => void;
  secured?: boolean;
  sasMismatch?: boolean;
}) {
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);

  return (
    <div className="flex min-h-[calc(100vh-40px)] flex-col items-center px-6 pb-8 pt-10">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">
        {secured ? "Secure call" : sasMismatch ? "Warning" : "In call"}
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
        ) : sasMismatch ? (
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-destructive/15 text-destructive">
              <AlertTriangle size={22} />
            </div>
            <div className="text-sm font-semibold text-destructive">SAS mismatch detected</div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              The short authentication strings do not match. A third party may be intercepting this call.
            </p>
            <button
              onClick={onHangup}
              className="mt-1 flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-destructive text-xs font-semibold text-destructive-foreground transition hover:brightness-110"
            >
              <PhoneOff size={14} /> End call immediately
            </button>
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
              <button
                onClick={onMismatch}
                className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-destructive/40 bg-destructive/10 text-xs font-semibold text-destructive transition hover:bg-destructive/20"
              >
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
