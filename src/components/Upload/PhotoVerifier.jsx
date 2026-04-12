import { useEffect, useState } from "react";
import { useGameStore } from "../../store/useGameStore";

export default function PhotoVerifier() {
  const isVerifyingPhoto = useGameStore((state) => state.isVerifyingPhoto);
  const submitPhotoVerification = useGameStore((state) => state.submitPhotoVerification);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState("idle");

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return undefined;
    }

    const nextPreviewUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(nextPreviewUrl);

    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [selectedFile]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedFile) {
      setStatusTone("error");
      setStatusMessage("Choose a photo before verifying the location.");
      return;
    }

    setStatusTone("loading");
    setStatusMessage("Submitting photo for verification...");

    const response = await submitPhotoVerification(selectedFile);

    if (response?.success) {
      setStatusTone("success");
      setStatusMessage(response.message || "Location verified.");
      setSelectedFile(null);
      return;
    }

    setStatusTone("error");
    setStatusMessage(response?.message || "Verification failed. Try another photo.");
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-4 shadow-xl shadow-black/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">Verification</p>
          <h3 className="mt-1 text-lg font-semibold text-white">Verify Location</h3>
          <p className="mt-1 text-sm text-slate-400">Upload or take a photo to confirm you reached the current target.</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
          Mobile camera ready
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <label className="block rounded-[1.5rem] border border-dashed border-white/15 bg-white/5 p-4 text-sm text-slate-300 transition hover:border-cyan-300/40 hover:bg-cyan-300/5">
          <span className="mb-2 block font-medium text-white">Photo upload</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-cyan-300"
          />
        </label>

        {previewUrl ? (
          <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900">
            <img src={previewUrl} alt="Preview of the selected upload" className="h-56 w-full object-cover" />
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isVerifyingPhoto}
          className="inline-flex w-full items-center justify-center rounded-[1.5rem] bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {isVerifyingPhoto ? "Verifying..." : "Verify Location"}
        </button>

        {statusMessage ? (
          <p
            className={`rounded-2xl border px-4 py-3 text-sm ${
              statusTone === "success"
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                : statusTone === "error"
                  ? "border-rose-400/20 bg-rose-400/10 text-rose-200"
                  : "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
            }`}
          >
            {statusMessage}
          </p>
        ) : null}
      </form>
    </section>
  );
}
