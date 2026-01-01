export default function WorkflowsPage() {
  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Workflows</h1>
          <p className="text-white/60 mt-1">Pro feature: otomasyon akışları (yakında)</p>
        </div>

        <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-6">
          <div className="text-sm font-semibold">Örnek Workflow</div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Step title="Prompt" desc="Konu + format seç" />
            <Step title="Generate" desc="Script + captions" />
            <Step title="Publish" desc="Accounts üzerinden paylaş" />
          </div>
          <p className="mt-4 text-sm text-white/60">
            Bunu gerçeklemek için ileride job-service + integration-service en kritik parçalar olacak.
          </p>
        </div>
      </div>
  );
}

function Step({ title, desc }: { title: string; desc: string }) {
  return (
      <div className="rounded-2xl bg-black/20 ring-1 ring-white/10 p-4">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-white/55 mt-1">{desc}</div>
      </div>
  );
}
