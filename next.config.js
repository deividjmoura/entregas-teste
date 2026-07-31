/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ativa a minificação ultrarrápida usando o compilador SWC em Rust
  swcMinify: true,
  
  // Habilita compressão nativa baseada em Gzip/Brotli para entregar arquivos menores
  compress: true,
  
  // Otimizações de renderização do compilador
  compiler: {
    // Remove console.logs em produção para segurança de dados e performance
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  
  // Força o Next.js a usar builds limpos de CSS e remove avisos redundantes
  images: {
    unoptimized: process.env.NODE_ENV === "production" ? false : true,
  }
};

module.exports = nextConfig;
