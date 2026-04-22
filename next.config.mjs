/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pg'],
  typescript: { ignoreBuildErrors: false },
}
export default nextConfig
