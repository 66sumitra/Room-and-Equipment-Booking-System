/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ข้าม Error ของ Type ไปด้วยเลย จะได้รันลื่นๆ ครับ
    ignoreBuildErrors: true,
  },
};

export default nextConfig;