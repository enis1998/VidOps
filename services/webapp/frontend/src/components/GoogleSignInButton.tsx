import { useEffect, useRef, useState } from "react";

declare global {
    interface Window {
        google?: any;
    }
}

type Props = {
    clientId: string;
    onCredential: (idToken: string) => Promise<void>;
};

export default function GoogleSignInButton({ clientId, onCredential }: Props) {
    const divRef = useRef<HTMLDivElement | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const t = setInterval(() => {
            if (window.google?.accounts?.id) {
                setReady(true);
                clearInterval(t);
            }
        }, 50);

        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        if (!ready || !divRef.current) return;

        window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (resp: any) => {
                const idToken = resp?.credential;
                if (typeof idToken === "string" && idToken.length > 0) {
                    await onCredential(idToken);
                }
            },
        });

        // Stackposts benzeri: butonu card içinde render ediyoruz
        window.google.accounts.id.renderButton(divRef.current, {
            theme: "outline",
            size: "large",
            shape: "pill",
            width: 320,
            text: "continue_with",
        });

        // OneTap istersen sonra açarız:
        // window.google.accounts.id.prompt();

    }, [ready, clientId, onCredential]);

    return <div ref={divRef} />;
}
