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
    const max = 200;
    const min = 40;
    el.style.height = `${Math.min(Math.max(el.scrollHeight, min), max)}px`;
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
    <div className="bg-gradient-to-t from-[#0b0b0f] via-[#0b0b0f]/98 to-transparent pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:pt-4">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 md:px-8 lg:px-10">
        {previewUrl && imageFile ? (
          <div className="mb-1.5 flex max-w-full items-center gap-2 pl-0.5 sm:mb-2">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/12 bg-black/50 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <p className="min-w-0 flex-1 truncate text-[12px] text-gray-400 sm:text-[13px]">
              <span className="text-gray-300">{imageFile.name}</span>
              <span className="text-gray-600"> · sends as chat message</span>
            </p>
            <button
              type="button"
              onClick={clearImage}
              disabled={disabled}
              className="shrink-0 rounded-full p-1.5 text-gray-500 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        <form
          className="group flex min-h-[44px] items-end gap-1 rounded-[1.35rem] border border-[#2f2f38] bg-[#1c1c22] px-1.5 py-1 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.45)] transition-[box-shadow,background-color,border-color] duration-200 focus-within:border-[#3f3f4c] focus-within:bg-[#202028] focus-within:shadow-[0_6px_28px_-4px_rgba(0,0,0,0.5)] sm:min-h-[46px] sm:gap-1.5 sm:rounded-[1.5rem] sm:px-2 sm:py-1.5"
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
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-white/[0.08] hover:text-gray-200 disabled:pointer-events-none disabled:opacity-40"
            aria-label="Attach Instagram screenshot"
            title="Attach screenshot (JPG, PNG)"
          >
            <ImagePlus className="h-[17px] w-[17px]" strokeWidth={1.75} />
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
            className="max-h-[200px] min-h-[40px] min-w-0 flex-1 resize-none bg-transparent py-2.5 pl-0.5 pr-1 text-[15px] leading-[1.35] text-white placeholder:text-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-55 sm:py-2.5 sm:text-[15px]"
          />
          <button
            type="submit"
            disabled={!canSend}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-transform duration-150 enabled:bg-gradient-to-br enabled:from-orange-500 enabled:to-pink-500 enabled:shadow-[0_2px_12px_-2px_rgba(249,115,22,0.45)] enabled:hover:brightness-110 enabled:active:scale-[0.96] disabled:pointer-events-none disabled:bg-[#2b2b32] disabled:text-gray-600"
            aria-label="Send message"
          >
            <SendHorizontal className="h-[17px] w-[17px]" strokeWidth={1.75} />
          </button>
        </form>
        <p className="mt-2 text-center text-[10px] leading-snug text-gray-500 sm:mt-2.5 sm:text-[11px]">
          HookLab suggests drafts—always review before you post.
        </p>
      </div>
    </div>
  );
});

export default ChatInput;
