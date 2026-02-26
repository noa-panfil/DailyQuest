"use client";

import { useState, useRef, useCallback } from "react";
import { updateGroupSettings } from "./actions";
import { useRouter } from "next/navigation";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";

export default function GroupSettingsModal({
    groupId,
    currentName,
    currentPicture,
    isAdmin
}: {
    groupId: number,
    currentName: string,
    currentPicture: string | null,
    isAdmin: boolean
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState(currentName);

    // Picture state
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentPicture);
    const [pictureFile, setPictureFile] = useState<File | null>(null);

    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Cropper state
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    if (!isAdmin) return null;

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixelsLatest: any) => {
        setCroppedAreaPixels(croppedAreaPixelsLatest);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setImageSrc(URL.createObjectURL(file));
        }
    };

    const confirmCrop = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        try {
            const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (croppedFile) {
                setPictureFile(croppedFile);
                setPreviewUrl(URL.createObjectURL(croppedFile));
                setImageSrc(null); // Leave crop mode
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        setError("");

        if (!name.trim()) {
            setError("Nom invalide.");
            setIsPending(false);
            return;
        }

        const formData = new FormData();
        formData.append("groupId", groupId.toString());
        formData.append("name", name);
        if (pictureFile) {
            formData.append("picture", pictureFile);
        }

        const res = await updateGroupSettings(formData);

        if (res?.error) {
            setError(res.error);
        } else if (res?.success) {
            router.refresh();
            setIsOpen(false);
        }

        setIsPending(false);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-all duration-200 shadow-md active:scale-95"
                title="Paramètres du groupe"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden">

                        {imageSrc ? (
                            <div className="flex flex-col h-[400px]">
                                <h2 className="text-xl font-bold text-slate-200 mb-4 z-10 shrink-0">Recadrer la photo</h2>
                                <div className="relative flex-1 bg-slate-950 rounded-xl overflow-hidden mb-4">
                                    <Cropper
                                        image={imageSrc}
                                        crop={crop}
                                        zoom={zoom}
                                        aspect={1}
                                        cropShape="round"
                                        showGrid={false}
                                        onCropChange={setCrop}
                                        onCropComplete={onCropComplete}
                                        onZoomChange={setZoom}
                                    />
                                </div>
                                <div className="flex gap-3 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setImageSrc(null)}
                                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="button"
                                        onClick={confirmCrop}
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition duration-200 shadow-lg shadow-indigo-600/30"
                                    >
                                        Valider
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-slate-200">Paramètres</h2>
                                    <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                    <div className="flex flex-col items-center justify-center">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            ref={fileInputRef}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="relative w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 hover:border-indigo-500 transition-colors flex items-center justify-center group overflow-hidden shadow-inner"
                                            title="Modifier la photo"
                                        >
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Group preview" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            )}

                                            {/* Editer un overlay */}
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                        </button>
                                        <p className="text-xs text-slate-500 mt-2">Cliquez pour modifier</p>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-bold text-slate-400">Nom du groupe</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-slate-950/50 border border-slate-700 p-3 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium text-center"
                                            required
                                            maxLength={50}
                                        />
                                    </div>

                                    {error && <p className="text-red-400 text-xs font-semibold px-1 text-center">{error}</p>}

                                    <button
                                        type="submit"
                                        disabled={isPending || (name === currentName && !pictureFile)}
                                        className="mt-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition duration-200 shadow-lg shadow-indigo-600/30 flex justify-center items-center disabled:opacity-50"
                                    >
                                        {isPending ? "Sauvegarde..." : "Enregistrer"}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
