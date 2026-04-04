"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  forwardRef,
} from "react";
import { ImagePlus, SendHorizontal, X } from "lucide-react";

const ACCEPT = "image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png";

const ChatInput = forwardRef(function ChatInput(
  {
    value,
    onChange,
    onSubmit,
    disabled,
    placeholder = "Describe your content idea…",
    attachmentResetKey = 0,
  },
  ref
) {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const setTextareaRef = useCallback(
    (el) => {
      textareaRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    },
    [ref]
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setImageFile(null);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    });
    return () => cancelAnimationFrame(id);
  }, [attachmentResetKey]);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const max = 180;
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const clearImage = useCallback(() => {
    setImageFile(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const onPickFile = useCallback((e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ok =
      /^image\/(jpeg|png)$/i.test(f.type) ||
      /\.(jpe?g|png)$/i.test(f.name);
    if (!ok) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
    setImageFile(f);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const can =
        !disabled && (value.trim().length > 0 || imageFile);
      if (can) void submitFromForm();
    }
  };

  const submitFromForm = async () => {
    const text = value.trim();
    const img = imageFile;
    if (disabled || (!text && !img)) return;
    try {
      await onSubmit({ text, image: img });
      clearImage();
      onChange("");
    } catch {
      /* parent shows error; keep image */
    }
  };

  const canSend =
    !disabled && (value.trim().length > 0 || imageFile);

  return (
    <div className="bg-gradient-to-t from-[#0b0b0f] via-[#0b0b0f]/98 to-transparent pb-[max(1rem,env(safe-area-inset-bottom))] pt-6">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8 lg:px-10">
        {previewUrl && imageFile ? (
          <div className="mb-3 flex items-start gap-3 rounded-xl border border-[#1f1f26]/80 bg-[#111116]/90 p-2.5 pr-3 shadow-[0_8px_28px_-12px_rgba(0,0,0,0.45)]">
            <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="truncate text-[13px] font-medium text-gray-200">
                {imageFile.name}
              </p>
              <p className="mt-0.5 text-[11px] text-gray-500">
                Profile screenshot · JPG or PNG
              </p>
            </div>
            <button
              type="button"
              onClick={clearImage}
              disabled={disabled}
              className="shrink-0 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        <form
          className="group flex items-end gap-2 overflow-hidden rounded-2xl border-0 bg-[#13131a]/82 p-2 pl-2.5 shadow-[0_12px_44px_-8px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.07)] backdrop-blur-2xl transition-[box-shadow,background-color] duration-300 focus-within:bg-[#15151d]/92 focus-within:shadow-[0_14px_52px_-6px_rgba(0,0,0,0.62),inset_0_1px_0_0_rgba(255,255,255,0.1),0_0_56px_-10px_rgba(249,115,22,0.16)] sm:gap-3 sm:p-2.5 sm:pl-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSend) void submitFromForm();
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            aria-hidden
            tabIndex={-1}
            onChange={onPickFile}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-gray-400 transition-all hover:border-orange-500/25 hover:bg-white/[0.06] hover:text-orange-300 disabled:pointer-events-none disabled:opacity-40"
            aria-label="Attach Instagram screenshot"
            title="Attach screenshot (JPG, PNG)"
          >
            <ImagePlus className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>

          <label htmlFor="hooklab-input" className="sr-only">
            Message
          </label>
          <textarea
            id="hooklab-input"
            ref={setTextareaRef}
            rows={1}
            value={value}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="max-h-[180px] min-h-[52px] flex-1 resize-none bg-transparent py-3.5 text-[15px] leading-relaxed text-white placeholder:text-gray-500/85 focus:outline-none disabled:cursor-not-allowed disabled:opacity-55"
          />
          <button
            type="submit"
            disabled={!canSend}
            className="mb-0.5 mr-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-orange-500 to-pink-500 text-white shadow-[0_6px_24px_-6px_rgba(249,115,22,0.45),inset_0_1px_0_0_rgba(255,255,255,0.22)] transition-all duration-200 hover:scale-[1.04] hover:brightness-[1.06] active:scale-[0.97] disabled:pointer-events-none disabled:scale-100 disabled:from-[#2a2a32] disabled:via-[#2a2a32] disabled:to-[#2a2a32] disabled:text-gray-500 disabled:shadow-none"
            aria-label="Send message"
          >
            <SendHorizontal className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
        </form>
        <p className="mt-3 text-center text-[11px] font-medium tracking-wide text-gray-500">
          HookLab suggests drafts—always review before you post.
        </p>
      </div>
    </div>
  );
});

export default ChatInput;
