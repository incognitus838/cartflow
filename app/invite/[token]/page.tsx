import { InviteAcceptPanel } from "@/components/auth/invite-accept-panel";
import { getSession } from "@/lib/auth";
import { getInviteByToken } from "@/lib/team/invites";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function InvitePage({ params }: PageProps) {
  const { token } = await params;
  const loaded = await getInviteByToken(token);
  if (!loaded) notFound();

  const session = await getSession();
  const { invite, state } = loaded;

  return (
    <main className="min-h-screen bg-slate-50">
      <InviteAcceptPanel
        token={token}
        state={state}
        invite={{
          email: invite.email,
          name: invite.name,
          accessPreset: invite.accessPreset,
          store: invite.business,
          invitedByName: invite.invitedBy.name,
        }}
        isLoggedIn={Boolean(session)}
        sessionEmail={session?.email}
      />
    </main>
  );
}