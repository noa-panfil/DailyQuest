"use client";

import { useState, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";
import { updateProfilePicture, removeProfilePicture } from "@/app/account/actions";

export default function ProfilePictureEditor({
    currentPicture,
    username
}: {
    currentPicture: string | null,
    username: string
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isPending, setIsPending] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixelsLatest: any) => {
        setCroppedAreaPixels(croppedAreaPixelsLatest);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setImageSrc(URL.createObjectURL(file));
            setIsModalOpen(true);
        }
    };

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        setIsPending(true);
        try {
            const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (croppedFile) {
                const formData = new FormData();
                formData.append("picture", croppedFile);
                const res = await updateProfilePicture(formData);
                if (res?.success) {
                    setIsModalOpen(false);
                    setImageSrc(null);
                }
            }
        } catch (e) {
            console.error(e);
        }
        setIsPending(false);
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />

            <div className="flex flex-col items-center gap-2">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="relative group cursor-pointer"
                    title="Changer ma photo de profil"
                >
                    <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-950 flex items-center justify-center text-4xl font-bold text-slate-300 uppercase z-10 shadow-lg overflow-hidden group-hover:border-indigo-500/50 transition-all">
                        {currentPicture ? (
                            <img src={`data:image/webp;base64,${currentPicture}`} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" alt={username} />
                        ) : (
                            <span>{username.slice(0, 2)}</span>
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                    </div>
                </button>

                {currentPicture && (
                    <button
                        onClick={async () => {
                            if (confirm("Voulez-vous vraiment supprimer votre photo de profil ?")) {
                                await removeProfilePicture();
                            }
                        }}
                        className="text-[10px] font-bold text-red-500/70 hover:text-red-400 uppercase tracking-widest transition-colors mb-4"
                    >
                        Supprimer la photo
                    </button>
                )}
            </div>

            {isModalOpen && imageSrc && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-[2.5rem] p-6 w-full max-w-sm shadow-2xl flex flex-col gap-6">
                        <h3 className="text-xl font-black text-white text-center">Recadrer ma photo</h3>

                        <div className="relative h-64 bg-slate-800 rounded-2xl overflow-hidden border border-slate-700">
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

                        {/* Zoom Slider */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Zoom</label>
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.1}
                                value={zoom}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleSave}
                                disabled={isPending}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl transition duration-200 shadow-lg shadow-indigo-600/30 text-sm uppercase tracking-widest disabled:opacity-50"
                            >
                                {isPending ? "Mise à jour..." : "Enregistrer la photo"}
                            </button>
                            <button
                                onClick={() => { setIsModalOpen(false); setImageSrc(null); }}
                                disabled={isPending}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-2xl transition duration-200 text-sm"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
