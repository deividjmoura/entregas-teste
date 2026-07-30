/**
 * Redimensiona e comprime a foto no próprio navegador antes de enviar,
 * impedindo sobrecarga no banco de dados. Adicionado tratamento estrito
 * de limpeza de memória e fallback de largura proporcional.
 */
export function resizeImageToBase64(file: File, maxWidth = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Fallback de segurança para garantir cálculo proporcional estável
        const larguraAlvo = img.width > 0 ? img.width : 800;
        const scale = Math.min(1, maxWidth / larguraAlvo);
        
        const canvas = document.createElement("canvas");
        canvas.width = larguraAlvo * scale;
        canvas.height = (img.height > 0 ? img.height : 600) * scale;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas não suportado neste navegador"));
          return;
        }
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const base64Result = canvas.toDataURL("image/jpeg", quality);
        
        // Limpeza explícita de referências da memória
        canvas.width = 0;
        canvas.height = 0;
        
        resolve(base64Result);
      };
      img.onerror = () => reject(new Error("Não foi possível carregar a imagem"));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo"));
    reader.readAsDataURL(file);
  });
}
