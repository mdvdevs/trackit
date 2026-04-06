"use client";

import { useState, useTransition, useRef } from "react";
import { Camera, Loader2, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateUserProfile } from "@/lib/actions/user-actions";

interface ProfileEditorProps {
  initialName: string;
  initialEmail: string;
  initialImage: string | null;
}

export function ProfileEditor({ initialName, initialEmail, initialImage }: ProfileEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [image, setImage] = useState<string | null>(initialImage);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    startTransition(async () => {
      // #region agent log
      const imageSizeBytes = image ? new Blob([image]).size : 0;
      fetch('http://127.0.0.1:7554/ingest/b16d169d-d049-48b1-8399-b22e05b2c642',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7ee25c'},body:JSON.stringify({sessionId:'7ee25c',location:'profile-editor.tsx:handleSave',message:'before updateUserProfile',data:{imageSizeBytes,imageType:image?.substring(0,30),nameLen:name.length,emailLen:email.length},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
      await updateUserProfile({
        name,
        email,
        image: image || undefined,
      });
      setIsEditing(false);
    });
  };

  const handleCancel = () => {
    setName(initialName);
    setEmail(initialEmail);
    setImage(initialImage);
    setIsEditing(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result !== "string") return;

      const img = new Image();
      img.onload = () => {
        const MAX = 256;
        const scale = Math.min(MAX / img.width, MAX / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL("image/jpeg", 0.8);

        // #region agent log
        fetch('http://127.0.0.1:7554/ingest/b16d169d-d049-48b1-8399-b22e05b2c642',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7ee25c'},body:JSON.stringify({sessionId:'7ee25c',location:'profile-editor.tsx:handleImageChange:compressed',message:'post-fix compressed size',data:{compressedBytes:compressed.length,estimatedKB:(compressed.length/1024).toFixed(1),dims:`${canvas.width}x${canvas.height}`},timestamp:Date.now(),runId:'post-fix',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion

        setImage(compressed);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 rounded-full bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground overflow-hidden">
            {image ? (
              <img src={image} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              name.charAt(0) || "U"
            )}
          </div>
          <div className="overflow-hidden">
            <h2 className="font-semibold text-lg truncate">{name}</h2>
            <p className="text-sm text-muted-foreground truncate">{email}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="py-4 space-y-4 rounded-xl border bg-card p-4">
      <div className="flex flex-col items-center gap-3">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground overflow-hidden border-2 border-transparent group-hover:border-primary transition-colors">
            {image ? (
              <img src={image} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              name.charAt(0) || "U"
            )}
          </div>
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-6 w-6 text-white" />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
        <span className="text-xs text-muted-foreground">Tap to change photo</span>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} disabled={isPending} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Email</label>
          <Input value={email} type="email" onChange={(e) => setEmail(e.target.value)} disabled={isPending} />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={handleCancel} disabled={isPending}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button className="flex-1" onClick={handleSave} disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
          Save
        </Button>
      </div>
    </div>
  );
}
