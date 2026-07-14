"use client";

interface ImageLightboxProps {
  src: string | null;
  onClose: () => void;
}

/**
 * Overlay simples que amplia a foto ao clicar numa miniatura.
 * Fecha clicando fora da imagem, no X, ou com Esc.
 */
export function ImageLightbox({ src, onClose }: ImageLightboxProps) {
  if (!src) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
    >
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <img
          src={src}
          alt="Foto ampliada"
          className="max-h-[80vh] max-w-[90vw] rounded-lg border border-panel-border object-contain"
        />
        <button
          onClick={onClose}
          className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-critical text-sm font-bold text-white hover:brightness-110"
          title="Fechar"
        >
          ×
        </button>
      </div>
    </div>
  );
}
